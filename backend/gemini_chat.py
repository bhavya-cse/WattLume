"""Gemini-powered, data-grounded chat assistant for WattLume."""

import json
import logging
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Literal

from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.analytics import get_analytics_dataset
from backend.billing import (
    get_billing_intelligence,
    get_or_create_tariff,
    compute_bill_for_kwh,
)
from backend.recommendations import generate_smart_insights_and_recommendations
from backend.anomaly_detection import detect_recent_anomalies
from backend.simulator import get_current_live_telemetry
from backend.models import HistoricalReading

load_dotenv(Path(__file__).resolve().parent / ".env")
logger = logging.getLogger(__name__)


class ChatHistoryItem(BaseModel):
    role: Literal["user", "model"]
    text: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatHistoryItem] = Field(default_factory=list, max_length=12)
    active_view: str = Field(default="overview", max_length=40)


def _build_energy_snapshot(db: Session) -> dict:
    """Read the same database-backed services used by WattLume's dashboard."""
    live = get_current_live_telemetry(db)
    replay_time = datetime.strptime(
        live["simulated_time"], "%Y-%m-%d %H:%M:%S"
    )

    analytics_7d = get_analytics_dataset(db, "7d", as_of=replay_time)
    analytics_today = get_analytics_dataset(db, "today", as_of=replay_time)

    today_start = replay_time.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    yesterday_start = today_start - timedelta(days=1)

    yesterday_query = db.query(
        func.sum(HistoricalReading.consumption_kw),
        func.count(HistoricalReading.timestamp),
    ).filter(
        HistoricalReading.timestamp >= yesterday_start,
        HistoricalReading.timestamp < today_start,
    ).first()

    yesterday_sample_sum = yesterday_query[0] or 0.0
    yesterday_sample_count = yesterday_query[1] or 0
    yesterday_available = yesterday_sample_count > 0

    first_reading_time = (
        db.query(HistoricalReading.timestamp)
        .order_by(HistoricalReading.timestamp.asc())
        .limit(1)
        .scalar()
    )

    # Match the exact recent-period window used by analytics.
    appliance_start = (
        max(first_reading_time, replay_time - timedelta(days=14))
        if first_reading_time else replay_time
    )
    appliance_period_days = (
        max(1, (replay_time.date() - appliance_start.date()).days + 1)
        if first_reading_time else 0
    )
    appliance_coverage = db.query(
        func.count(HistoricalReading.timestamp),
        func.min(HistoricalReading.timestamp),
        func.max(HistoricalReading.timestamp),
    ).filter(
        HistoricalReading.timestamp >= appliance_start,
        HistoricalReading.timestamp <= replay_time,
    ).first()

    appliance_sample_count = appliance_coverage[0] or 0
    appliance_first_sample = appliance_coverage[1]
    appliance_last_sample = appliance_coverage[2]
    appliance_coverage_hours = max(
        0.0, (replay_time - appliance_start).total_seconds() / 3600
    )

    # Require at least 24 hours and substantial one-minute sample coverage
    # before describing appliance shares as a meaningful ranking.
    appliance_ranking_reliable = (
        appliance_coverage_hours >= 24
        and appliance_sample_count >= 1200
    )

    today_coverage = db.query(
        func.count(HistoricalReading.timestamp),
        func.min(HistoricalReading.timestamp),
        func.max(HistoricalReading.timestamp),
    ).filter(
        HistoricalReading.timestamp >= today_start,
        HistoricalReading.timestamp <= replay_time,
    ).first()

    today_sample_count = today_coverage[0] or 0
    today_first_sample = today_coverage[1]
    today_last_sample = today_coverage[2]
    today_elapsed_hours = max(
        0.0, (replay_time - today_start).total_seconds() / 3600
    )

    # Report variable energy cost only. Exclude the monthly fixed charge.
    tariff = get_or_create_tariff(db)

    def energy_only_cost(kwh):
        if kwh is None:
            return None
        bill_parts = compute_bill_for_kwh(float(kwh), tariff)
        energy_charge = float(bill_parts.get("energy_charge") or 0.0)
        tax_rate = float(bill_parts.get("tax_rate_percent") or 0.0)
        return round(energy_charge * (1 + tax_rate / 100), 2)

    today_energy = analytics_today.get("total_energy_kwh")
    seven_day_energy = analytics_7d.get("total_energy_kwh")

    billing = get_billing_intelligence(db)
    insights = generate_smart_insights_and_recommendations(db)
    anomalies = detect_recent_anomalies(db)[:5]

    efficiency = insights.get("efficiency_score", {})
    appliance_rows = analytics_7d.get("appliances", [])
    appliance_rows = appliance_rows[:8] if isinstance(appliance_rows, list) else []

    # Do not expose misleading appliance rankings from an insufficient sample.
    if not appliance_ranking_reliable:
        appliance_rows = []

    return {
        "replay_timestamp": live.get("simulated_time"),
        "live": {
            "current_power_watts": live.get("current_power_watts"),
            "current_power_kw": live.get("current_power_kw"),
            "voltage_v": live.get("voltage_v"),
            "current_a": live.get("current_a"),
            "power_factor": live.get("power_factor"),
            "simulated_time": live.get("simulated_time"),
        },
        "today": {
            "date": replay_time.strftime("%Y-%m-%d"),
            "total_energy_kwh": today_energy,
            "energy_cost_estimate_inr": energy_only_cost(today_energy),
            "cost_basis": "estimated variable energy charge including energy tax; excludes monthly fixed charge",
            "sample_count": today_sample_count,
            "coverage_start": today_first_sample.isoformat() if today_first_sample else None,
            "coverage_end": today_last_sample.isoformat() if today_last_sample else None,
            "elapsed_hours": round(today_elapsed_hours, 2),
            "is_partial_day": today_elapsed_hours < 24,
            "peak_demand_watts": analytics_today.get("peak_demand_watts"),
            "peak_ratio_pct": analytics_today.get("peak_ratio_pct"),
        },
        "yesterday": {
            "date": yesterday_start.strftime("%Y-%m-%d"),
            "data_available": yesterday_available,
            "total_energy_kwh": (
                round(float(yesterday_sample_sum) / 60.0, 3)
                if yesterday_available else None
            ),
            "sample_count": yesterday_sample_count,
        },
        "last_7_days": {
            "total_energy_kwh": seven_day_energy,
            "energy_cost_estimate_inr": energy_only_cost(seven_day_energy),
            "cost_basis": "estimated variable energy charge including energy tax; excludes monthly fixed charge",
            "peak_demand_watts": analytics_7d.get("peak_demand_watts"),
            "peak_ratio_pct": analytics_7d.get("peak_ratio_pct"),
            "carbon_footprint_kg": analytics_7d.get("carbon_footprint_kg"),
        },
        "appliances_recent_period": appliance_rows,
        "appliance_average_period_days": appliance_period_days,
        "appliance_period_start": appliance_start.isoformat() if first_reading_time else None,
        "appliance_period_end": replay_time.isoformat(),
        "appliance_sample_count": appliance_sample_count,
        "appliance_coverage_hours": round(appliance_coverage_hours, 2),
        "appliance_first_sample": appliance_first_sample.isoformat() if appliance_first_sample else None,
        "appliance_last_sample": appliance_last_sample.isoformat() if appliance_last_sample else None,
        "appliance_ranking_reliable": appliance_ranking_reliable,
        "billing": {
            "currency_symbol": billing.get("currency_symbol", "₹"),
            "month_to_date_kwh": billing.get("month_to_date_kwh"),
            "month_to_date_bill_inr": billing.get("month_to_date_bill_inr"),
            "forecasted_month_kwh": billing.get("forecasted_month_kwh"),
            "forecasted_bill_inr": billing.get("forecasted_bill_inr"),
            "previous_month_bill_inr": billing.get("previous_month_bill_inr"),
            "bill_diff_pct": billing.get("bill_diff_pct"),
            "days_remaining": billing.get("days_remaining"),
            "tariff_model": billing.get("tariff_model"),
            "flat_rate": billing.get("flat_rate"),
        },
        "efficiency": {
            "score": efficiency.get("overall_score"),
            "rating_label": efficiency.get("rating_label"),
            "factors": efficiency.get("factors", []),
        },
        # Recommendations can contain appliance percentages from a different
        # measurement window, so withhold them until replay-period data is reliable.
        "recommendations": (
            insights.get("recommendations", [])[:5]
            if appliance_ranking_reliable else []
        ),
        "total_potential_savings_inr": (
            insights.get("total_potential_savings_inr")
            if appliance_ranking_reliable else None
        ),
        "recent_anomalies": (
    anomalies if appliance_ranking_reliable else []
),
    }


def generate_energy_assistant_reply(db: Session, request: ChatRequest) -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="WattLume AI is not configured yet. Add GEMINI_API_KEY to backend/.env and restart the backend.",
        )

    try:
        from google import genai
        from google.genai import types

        snapshot = _build_energy_snapshot(db)
        snapshot_text = json.dumps(snapshot, ensure_ascii=False, default=str)
        system_instruction = f"""You are WattLume's Energy Assistant, a friendly and practical home-energy analyst.
Answer clearly and concisely. Use Indian English and ₹ for money where relevant.
You are embedded in the WattLume energy dashboard. The current dashboard section is: {request.active_view}.

LIVE WATTLUME DATA (source of truth for user-specific claims):
{snapshot_text}

Rules:
- Use the supplied WattLume data for questions about this household. Never invent readings, dates, bills, appliance rankings, savings, or trends.
- If a field is null or missing, say the dashboard does not currently provide that value.
- The replay_timestamp is the authoritative simulated date and time. Use it for all references to today and yesterday, not the computer's current calendar date.
- Today's energy must come from today.total_energy_kwh. Do not substitute a value from another date or another period.
- Today's figures are cumulative only through replay_timestamp. If today.is_partial_day is true, describe usage as "so far", never as a complete-day total.
- Use today.energy_cost_estimate_inr for today's energy cost. It is an estimated variable energy charge including energy tax, and excludes the monthly fixed charge. Never present it as the full electricity bill.
- Use last_7_days.energy_cost_estimate_inr for the 7-day variable energy-cost estimate. Do not use a billing total as a replay-period cost.
- Yesterday's energy is available only when yesterday.data_available is true. If false, explicitly say the historical dataset has no readings for that previous date. Never use a fallback or a daily aggregate from a different date.
- For today-versus-yesterday comparisons, compare only the supplied today and yesterday totals. If yesterday is unavailable, explain that a reliable comparison cannot be made.
- Appliance percentages and daily_energy_kwh values come from the recent appliance period, not necessarily the last 7 days. State appliance_average_period_days when describing the averaging window.
- Only describe an appliance as the highest-consuming or rank appliances when appliance_ranking_reliable is true. If false, clearly say there is insufficient replay-period data to identify the highest-consuming appliance.
- When appliance_ranking_reliable is false, appliances_recent_period and recommendations are intentionally withheld. Do not infer or guess an appliance ranking from rated power, current power, previous chat messages, general knowledge, or other fields.
- Never use a recommendation's appliance name or percentage as proof of measured appliance consumption. Recommendations may use a different measurement window from the replay-period appliance breakdown.
- Appliance rankings are based on the measured recent-period sample, not appliance rated power or current power alone.
- Energy is measured in kWh; instantaneous power is measured in W or kW. Do not confuse power with energy.
- Distinguish measured/current values from estimates and forecasts. Clearly label forecasts as estimates.
- The billing section is based on the billing service's calendar-month calculations, not necessarily the historical replay date. Do not use it to answer replay-date or replay-period questions; explain the different time basis if relevant.
- For savings suggestions, explain the practical action. Only quote a savings amount when it exists in the supplied recommendations; otherwise describe savings qualitatively.
- You may also provide general energy-saving advice, but label it as general advice rather than a finding from this household's data.
- Do not claim that physical smart meters or appliances are connected. WattLume currently reports simulated telemetry when the data says so.
- Do not change tariffs, switch appliances, reset simulations, or perform actions. You are read-only.
- If asked something unrelated to energy or WattLume, politely steer the conversation back.
- Keep most answers under 140 words. Use short bullets when helpful.
- When appliance_ranking_reliable is false, do not identify any appliance as a major energy contributor, cause of energy spikes, or high-consuming device based on alerts, anomalies, recommendations, rated wattage, or previous conversation context. Clearly distinguish general alerts from verified appliance energy measurements.
"""

        contents = []
        for item in request.history[-10:]:
            contents.append(
                types.Content(
                    role=item.role,
                    parts=[types.Part.from_text(text=item.text)],
                )
            )
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=request.message)],
            )
        )

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.35,
                max_output_tokens=700,
            ),
        )
        answer = (response.text or "").strip()
        if not answer:
            raise RuntimeError("Gemini returned an empty response")
        return answer
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("WattLume Gemini request failed")
        raise HTTPException(
            status_code=502,
            detail="The energy assistant could not reach Gemini right now. Please try again in a moment.",
        ) from exc
