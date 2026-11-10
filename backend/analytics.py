import json
import calendar
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models import HourlyReading, DailyAggregate, Appliance, TariffSetting
from backend.billing import compute_bill_for_kwh, get_or_create_tariff

def get_analytics_dataset(db: Session, time_range: str = "7d") -> Dict[str, Any]:
    """
    Returns structured analytics for the selected range ('today', '7d', '30d', '12m')
    along with appliance breakdown and environmental impact metrics.
    """
    tariff = get_or_create_tariff(db)
    now = datetime.utcnow()

    chart_data = []
    total_energy_kwh = 0.0
    peak_demand_watts = 0.0
    peak_hours_kwh = 0.0
    off_peak_hours_kwh = 0.0

    if time_range == "today":
        # Today's 24 hours
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_readings = db.query(HourlyReading).filter(
            HourlyReading.timestamp >= today_start
        ).order_by(HourlyReading.timestamp.asc()).all()

        # Also get baseline hourly averages from last 30 days
        baseline_cutoff = now - timedelta(days=30)
        past_readings = db.query(HourlyReading).filter(
            HourlyReading.timestamp >= baseline_cutoff,
            HourlyReading.timestamp < today_start
        ).all()

        hourly_bins: Dict[int, List[float]] = {h: [] for h in range(24)}
        for pr in past_readings:
            hourly_bins[pr.timestamp.hour].append(pr.total_power_watts)

        hourly_baselines = {
            h: (sum(vals) / len(vals)) if vals else 850.0
            for h, vals in hourly_bins.items()
        }

        reading_map = {r.timestamp.hour: r for r in today_readings}

        for h in range(24):
            hour_label = f"{h:02d}:00"
            r = reading_map.get(h)
            base_w = round(hourly_baselines.get(h, 800.0), 1)

            if r:
                act_w = round(r.total_power_watts, 1)
                kwh = r.energy_kwh
                is_anomaly = r.is_anomaly
                total_energy_kwh += kwh
                peak_demand_watts = max(peak_demand_watts, act_w)
                if 18 <= h <= 22:
                    peak_hours_kwh += kwh
                else:
                    off_peak_hours_kwh += kwh
            else:
                # Projected remaining hours of today
                act_w = base_w
                kwh = round(base_w / 1000.0, 3)
                is_anomaly = False

            chart_data.append({
                "time": hour_label,
                "hour": h,
                "power_watts": act_w,
                "baseline_watts": base_w,
                "energy_kwh": kwh,
                "cost_inr": round(kwh * tariff.flat_rate, 2),
                "is_anomaly": is_anomaly
            })

    elif time_range == "7d":
        start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        records = db.query(DailyAggregate).filter(
            DailyAggregate.date >= start_date
        ).order_by(DailyAggregate.date.asc()).limit(7).all()

        for r in records:
            dt = datetime.strptime(r.date, "%Y-%m-%d")
            total_energy_kwh += r.total_energy_kwh
            peak_demand_watts = max(peak_demand_watts, r.peak_power_watts)
            peak_hours_kwh += r.peak_energy_kwh
            off_peak_hours_kwh += r.off_peak_energy_kwh

            chart_data.append({
                "date": r.date,
                "day_name": dt.strftime("%a"),
                "total_kwh": r.total_energy_kwh,
                "peak_kwh": r.peak_energy_kwh,
                "off_peak_kwh": r.off_peak_energy_kwh,
                "cost_inr": r.estimated_cost_inr,
                "peak_power_watts": r.peak_power_watts,
                "efficiency_score": r.efficiency_score
            })

    elif time_range == "30d":
        start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        records = db.query(DailyAggregate).filter(
            DailyAggregate.date >= start_date
        ).order_by(DailyAggregate.date.asc()).limit(30).all()

        # Compute 7-day rolling average
        kwh_history = [r.total_energy_kwh for r in records]

        for i, r in enumerate(records):
            dt = datetime.strptime(r.date, "%Y-%m-%d")
            total_energy_kwh += r.total_energy_kwh
            peak_demand_watts = max(peak_demand_watts, r.peak_power_watts)
            peak_hours_kwh += r.peak_energy_kwh
            off_peak_hours_kwh += r.off_peak_energy_kwh

            # 7-day window average
            window = kwh_history[max(0, i-6):i+1]
            rolling_avg = sum(window) / len(window)

            chart_data.append({
                "date": r.date,
                "label": dt.strftime("%d %b"),
                "total_kwh": r.total_energy_kwh,
                "rolling_avg_kwh": round(rolling_avg, 2),
                "cost_inr": r.estimated_cost_inr,
                "efficiency_score": r.efficiency_score
            })

    elif time_range == "12m":
        # Group by months across past 12 months
        # For our 60-day seed, we aggregate actual recorded months and extrapolate realistic seasonal historical months
        current_year = now.year
        months_data = []

        # Seasonal factors for India: Summer (Apr-Jul) high AC, Winter (Dec-Jan) mild + geysers, Monsoon (Aug-Sep)
        seasonal_factors = {
            1: 0.88, 2: 0.92, 3: 1.10, 4: 1.35, 5: 1.45, 6: 1.40,
            7: 1.25, 8: 1.15, 9: 1.05, 10: 0.95, 11: 0.85, 12: 0.82
        }

        base_monthly_kwh = 380.0

        for m_offset in range(11, -1, -1):
            target_date = now - timedelta(days=m_offset * 30.5)
            y = target_date.year
            m = target_date.month
            m_str = f"{y:04d}-{m:02d}"
            m_name = calendar.month_abbr[m]

            actual_records = db.query(DailyAggregate).filter(
                DailyAggregate.date.startswith(m_str)
            ).all()

            if actual_records:
                m_kwh = sum(r.total_energy_kwh for r in actual_records)
                # If partial month, normalize to full month
                days_in_m = calendar.monthrange(y, m)[1]
                if len(actual_records) < days_in_m:
                    m_kwh = (m_kwh / len(actual_records)) * days_in_m
            else:
                m_kwh = base_monthly_kwh * seasonal_factors.get(m, 1.0)

            m_kwh = round(m_kwh, 1)
            prev_year_kwh = round(m_kwh * 1.06, 1)
            bill_info = compute_bill_for_kwh(m_kwh, tariff)

            total_energy_kwh += m_kwh
            months_data.append({
                "month_str": m_str,
                "month_label": f"{m_name} '{str(y)[2:]}",
                "total_kwh": m_kwh,
                "prev_year_kwh": prev_year_kwh,
                "cost_inr": bill_info["total_bill"],
                "avg_cost_per_kwh": bill_info["average_cost_per_kwh"]
            })

        chart_data = months_data

    # Appliance Breakdown Computation
    appliances = db.query(Appliance).all()
    recent_aggregates = db.query(DailyAggregate).order_by(DailyAggregate.date.desc()).limit(14).all()

    appliance_kwh_sums: Dict[str, float] = {}
    for da in recent_aggregates:
        try:
            bd = json.loads(da.appliance_breakdown)
            for name, kwh in bd.items():
                appliance_kwh_sums[name] = appliance_kwh_sums.get(name, 0.0) + kwh
        except Exception:
            pass

    total_app_kwh = sum(appliance_kwh_sums.values()) or 1.0
    unit_cost = tariff.flat_rate if tariff.model_type == "flat" else 7.5

    appliance_list_summary = []
    for app in appliances:
        kwh = appliance_kwh_sums.get(app.name, (app.power_watts * 0.4 * 14 * 24) / 1000.0)
        daily_kwh = kwh / max(1, len(recent_aggregates))
        pct = (kwh / total_app_kwh) * 100.0
        daily_cost = daily_kwh * unit_cost
        monthly_cost = daily_cost * 30.0

        appliance_list_summary.append({
            "id": app.id,
            "name": app.name,
            "category": app.category,
            "icon": app.icon,
            "power_watts": app.power_watts,
            "is_active": app.is_active,
            "room": app.room,
            "daily_energy_kwh": round(daily_kwh, 2),
            "daily_cost_inr": round(daily_cost, 2),
            "monthly_cost_inr": round(monthly_cost, 2),
            "percentage_share": round(pct, 1)
        })

    # Sort appliances by consumption share descending
    appliance_list_summary.sort(key=lambda x: x["percentage_share"], reverse=True)

    # Environmental footprint (Central Electricity Authority / CEA India factor: ~0.82 kg CO2 / kWh)
    carbon_kg = round(total_energy_kwh * 0.82, 1)
    trees_needed = round(carbon_kg / 21.77, 1) # ~21.77 kg CO2 sequestered per tree per year

    # Bill computation for the period
    period_bill = compute_bill_for_kwh(total_energy_kwh, tariff)

    return {
        "range": time_range,
        "chart_data": chart_data,
        "total_energy_kwh": round(total_energy_kwh, 2),
        "peak_demand_watts": round(peak_demand_watts, 1),
        "peak_hours_kwh": round(peak_hours_kwh, 2),
        "off_peak_hours_kwh": round(off_peak_hours_kwh, 2),
        "peak_ratio_pct": round((peak_hours_kwh / max(1.0, total_energy_kwh)) * 100.0, 1),
        "total_cost_inr": period_bill["total_bill"],
        "currency_symbol": tariff.currency_symbol,
        "carbon_footprint_kg": carbon_kg,
        "trees_equivalent": trees_needed,
        "appliances": appliance_list_summary
    }
