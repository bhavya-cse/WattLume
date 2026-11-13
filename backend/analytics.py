
import json
import calendar
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Any

from sqlalchemy.orm import Session

from backend.models import Appliance, HistoricalReading
from backend.billing import compute_bill_for_kwh, get_or_create_tariff


# Match existing WattLume appliances to actual dataset columns.
APPLIANCE_MAPPING = {
    "Inverter Air Conditioner (1.5 Ton)": "Air conditioning [kW]",
    "Double-Door Refrigerator": "Fridge",
    "Smart 4K Television (55-inch)": "Home Theater [kW]",
    "Front-Load Washing Machine": "Laundry [kW]",
    "Smart LED Lighting System": "Outdoor lights [kW]",
    "Ergonomic Workstation & Laptop": "Home office",
    "Storage Water Heater (Geyser 25L)": "Water heater [kW]",
    "Convection Microwave Oven": "microwave [kW]",
}


def _load_readings(db, start, end):
    return (
        db.query(HistoricalReading)
        .filter(
            HistoricalReading.timestamp >= start,
            HistoricalReading.timestamp <= end
        )
        .order_by(HistoricalReading.timestamp.asc())
        .all()
    )


def _read_breakdown(reading):
    try:
        return json.loads(reading.appliance_breakdown or "{}")
    except (TypeError, ValueError):
        return {}


def _sample_energy(reading):
    # Dataset readings are one-minute samples in kW.
    return max(0.0, reading.consumption_kw) / 60.0


def get_analytics_dataset(
    db: Session,
    time_range: str = "7d",
    as_of: datetime = None
) -> Dict[str, Any]:

    tariff = get_or_create_tariff(db)

    first_reading = (
        db.query(HistoricalReading)
        .order_by(HistoricalReading.timestamp.asc())
        .first()
    )

    last_reading = (
        db.query(HistoricalReading)
        .order_by(HistoricalReading.timestamp.desc())
        .first()
    )

    if first_reading is None or last_reading is None:
        raise RuntimeError("Historical dataset is empty.")

    first_timestamp = first_reading.timestamp
    now = as_of or last_reading.timestamp

    chart_data = []
    total_energy_kwh = 0.0
    peak_demand_watts = 0.0
    peak_hours_kwh = 0.0
    off_peak_hours_kwh = 0.0

    unit_cost = (
        tariff.flat_rate
        if tariff.model_type == "flat"
        else 7.5
    )

    # ---------------------------------------------------------
    # TODAY: Full-day hourly chart, elapsed-only KPI
    # ---------------------------------------------------------
    if time_range == "today":

        today_start = now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        # Readings available up to the current replay time.
        # These are used for KPIs and must not include future data.
        readings = _load_readings(db, today_start, now)

        # Full available simulated day for the chart.
        chart_end = (
            today_start + timedelta(days=1) - timedelta(seconds=1)
        )

        chart_readings = _load_readings(
            db, today_start, chart_end
        )

        # Separate hourly buckets for chart and KPI calculations.
        chart_hourly = defaultdict(list)
        kpi_hourly = defaultdict(list)

        for reading in chart_readings:
            chart_hourly[reading.timestamp.hour].append(reading)

        for reading in readings:
            kpi_hourly[reading.timestamp.hour].append(reading)

        # Historical hourly baseline from the preceding 30 days.
        baseline_start = max(
            first_timestamp,
            today_start - timedelta(days=30)
        )

        baseline_readings = _load_readings(
            db,
            baseline_start,
            today_start - timedelta(seconds=1)
        )

        baseline_bins = defaultdict(list)

        for reading in baseline_readings:
            baseline_bins[reading.timestamp.hour].append(
                reading.consumption_kw * 1000.0
            )

        for hour in range(24):

            # Full-day historical readings for the chart.
            chart_samples = chart_hourly.get(hour, [])

            # Only elapsed readings for KPI calculations.
            kpi_samples = kpi_hourly.get(hour, [])

            if chart_samples:

                power_values = [
                    max(0.0, r.consumption_kw) * 1000.0
                    for r in chart_samples
                ]

                actual_watts = (
                    sum(power_values) / len(power_values)
                )

                energy = sum(
                    _sample_energy(r)
                    for r in chart_samples
                )

            else:
                actual_watts = None
                energy = None

            # KPI calculations use elapsed readings only.
            kpi_energy = sum(
                _sample_energy(r)
                for r in kpi_samples
            )

            if kpi_samples:

                kpi_peak_watts = max(
                    max(0.0, r.consumption_kw) * 1000.0
                    for r in kpi_samples
                )

                peak_demand_watts = max(
                    peak_demand_watts,
                    kpi_peak_watts
                )

            total_energy_kwh += kpi_energy

            if 18 <= hour <= 22:
                peak_hours_kwh += kpi_energy
            else:
                off_peak_hours_kwh += kpi_energy

            baseline_values = baseline_bins.get(hour, [])

            baseline_watts = (
                sum(baseline_values) / len(baseline_values)
                if baseline_values else 0.0
            )

            chart_data.append({
                "time": f"{hour:02d}:00",
                "hour": hour,
                "power_watts": (
                    round(actual_watts, 1)
                    if actual_watts is not None else None
                ),
                "baseline_watts": round(baseline_watts, 1),
                "energy_kwh": (
                    round(energy, 4)
                    if energy is not None else None
                ),
                "cost_inr": (
                    round(energy * unit_cost, 2)
                    if energy is not None else None
                ),
                "is_anomaly": False
            })

    # ---------------------------------------------------------
    # 7 DAYS: Actual daily consumption
    # ---------------------------------------------------------
    elif time_range == "7d":

        start_date = max(
            first_timestamp.date(),
            now.date() - timedelta(days=6)
        )

        start = datetime.combine(start_date, datetime.min.time())
        readings = _load_readings(db, start, now)

        daily = defaultdict(list)

        for reading in readings:
            daily[reading.timestamp.date()].append(reading)

        for offset in range(7):
            day = start_date + timedelta(days=offset)
            samples = daily.get(day, [])

            energy = sum(_sample_energy(r) for r in samples)

            peak_energy = sum(
                _sample_energy(r)
                for r in samples
                if 18 <= r.timestamp.hour <= 22
            )

            off_peak_energy = energy - peak_energy

            peak_watts = max(
                (
                    max(0.0, r.consumption_kw) * 1000.0
                    for r in samples
                ),
                default=0.0
            )

            total_energy_kwh += energy
            peak_hours_kwh += peak_energy
            off_peak_hours_kwh += off_peak_energy
            peak_demand_watts = max(
                peak_demand_watts, peak_watts
            )

            chart_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "day_name": day.strftime("%a"),
                "total_kwh": round(energy, 3),
                "peak_kwh": round(peak_energy, 3),
                "off_peak_kwh": round(off_peak_energy, 3),
                "cost_inr": round(energy * unit_cost, 2),
                "peak_power_watts": round(peak_watts, 1),
                "efficiency_score": None
            })

    # ---------------------------------------------------------
    # 30 DAYS: Actual daily consumption + rolling average
    # ---------------------------------------------------------
    elif time_range == "30d":

        start_date = max(
            first_timestamp.date(),
            now.date() - timedelta(days=29)
        )

        start = datetime.combine(start_date, datetime.min.time())
        readings = _load_readings(db, start, now)

        daily = defaultdict(list)

        for reading in readings:
            daily[reading.timestamp.date()].append(reading)

        daily_values = []

        for offset in range((now.date() - start_date).days + 1):
            day = start_date + timedelta(days=offset)
            samples = daily.get(day, [])

            energy = sum(_sample_energy(r) for r in samples)

            peak_energy = sum(
                _sample_energy(r)
                for r in samples
                if 18 <= r.timestamp.hour <= 22
            )

            daily_values.append((day, samples, energy, peak_energy))

        energy_history = [
            item[2] for item in daily_values
        ]

        for index, (day, samples, energy, peak_energy) in enumerate(
            daily_values
        ):
            peak_watts = max(
                (
                    max(0.0, r.consumption_kw) * 1000.0
                    for r in samples
                ),
                default=0.0
            )

            rolling_window = energy_history[
                max(0, index - 6):index + 1
            ]

            rolling_average = (
                sum(rolling_window) / len(rolling_window)
            )

            off_peak_energy = energy - peak_energy

            total_energy_kwh += energy
            peak_hours_kwh += peak_energy
            off_peak_hours_kwh += off_peak_energy
            peak_demand_watts = max(
                peak_demand_watts, peak_watts
            )

            chart_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "label": day.strftime("%d %b"),
                "total_kwh": round(energy, 3),
                "rolling_avg_kwh": round(rolling_average, 3),
                "cost_inr": round(energy * unit_cost, 2),
                "efficiency_score": None
            })

    # ---------------------------------------------------------
    # 12 MONTHS: Actual available historical months only
    # ---------------------------------------------------------
    elif time_range == "12m":

        start_date = first_timestamp.date()

        start = datetime.combine(start_date, datetime.min.time())
        readings = _load_readings(db, start, now)

        monthly = defaultdict(float)

        for reading in readings:
            month_key = reading.timestamp.strftime("%Y-%m")
            energy = _sample_energy(reading)

            monthly[month_key] += energy

            peak_demand_watts = max(
                peak_demand_watts,
                max(0.0, reading.consumption_kw) * 1000.0
            )

            if 18 <= reading.timestamp.hour <= 22:
                peak_hours_kwh += energy
            else:
                off_peak_hours_kwh += energy

        for month_key in sorted(monthly):
            year, month = map(int, month_key.split("-"))
            month_name = calendar.month_abbr[month]

            energy = monthly[month_key]
            bill_info = compute_bill_for_kwh(energy, tariff)

            total_energy_kwh += energy

            chart_data.append({
                "month_str": month_key,
                "month_label": (
                    f"{month_name} '{str(year)[2:]}"
                ),
                "total_kwh": round(energy, 2),
                "prev_year_kwh": None,
                "cost_inr": bill_info["total_bill"],
                "avg_cost_per_kwh": (
                    bill_info["average_cost_per_kwh"]
                )
            })

    else:
        raise ValueError(
            "Unsupported analytics range. Use today, 7d, 30d or 12m."
        )

    # ---------------------------------------------------------
    # APPLIANCE BREAKDOWN: Actual readings from the last 14 days
    # ---------------------------------------------------------
    appliance_start = max(
        first_timestamp,
        now - timedelta(days=14)
    )

    appliance_readings = _load_readings(
        db, appliance_start, now
    )

    appliance_energy = defaultdict(float)

    for reading in appliance_readings:
        breakdown = _read_breakdown(reading)

        for app_name, dataset_column in APPLIANCE_MAPPING.items():
            value = breakdown.get(dataset_column)

            if value is not None:
                try:
                    appliance_energy[app_name] += (
                        max(0.0, float(value)) / 60.0
                    )
                except (TypeError, ValueError):
                    pass

    appliances = db.query(Appliance).all()

    elapsed_days = max(
        1,
        (now.date() - appliance_start.date()).days + 1
    )

    total_app_kwh = sum(appliance_energy.values())

    appliance_list_summary = []

    for app in appliances:
        kwh = appliance_energy.get(app.name, 0.0)

        daily_kwh = kwh / elapsed_days
        daily_cost = daily_kwh * unit_cost
        monthly_cost = daily_cost * 30.0

        percentage = (
            (kwh / total_app_kwh) * 100.0
            if total_app_kwh > 0 else 0.0
        )

        appliance_list_summary.append({
            "id": app.id,
            "name": app.name,
            "category": app.category,
            "icon": app.icon,
            "power_watts": app.power_watts,
            "is_active": app.is_active,
            "room": app.room or "",
            "measurement_available": app.name in APPLIANCE_MAPPING,
            "daily_energy_kwh": round(daily_kwh, 3),
            "daily_cost_inr": round(daily_cost, 2),
            "monthly_cost_inr": round(monthly_cost, 2),
            "percentage_share": round(percentage, 1)
        })

    appliance_list_summary.sort(
        key=lambda item: item["percentage_share"],
        reverse=True
    )

    # Environmental impact based on actual KPI energy consumption.
    carbon_kg = round(total_energy_kwh * 0.82, 1)
    trees_needed = round(carbon_kg / 21.77, 1)

    period_bill = compute_bill_for_kwh(
        total_energy_kwh, tariff
    )

    return {
        "range": time_range,
        "chart_data": chart_data,
        "total_energy_kwh": round(total_energy_kwh, 2),
        "peak_demand_watts": round(peak_demand_watts, 1),
        "peak_hours_kwh": round(peak_hours_kwh, 2),
        "off_peak_hours_kwh": round(off_peak_hours_kwh, 2),
        "peak_ratio_pct": round(
            (peak_hours_kwh / max(1.0, total_energy_kwh)) * 100.0,
            1
        ),
        "total_cost_inr": period_bill["total_bill"],
        "currency_symbol": tariff.currency_symbol,
        "carbon_footprint_kg": carbon_kg,
        "trees_equivalent": trees_needed,
        "appliances": appliance_list_summary
    }
