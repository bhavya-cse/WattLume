import json
import math
import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from backend.models import Appliance, HourlyReading, DailyAggregate, TariffSetting, AnomalyLog, SimulationConfig

# Default standard realistic appliances
DEFAULT_APPLIANCES = [
    {
        "name": "Inverter Air Conditioner (1.5 Ton)",
        "category": "Cooling",
        "icon": "AirVent",
        "power_watts": 1450.0,
        "standby_watts": 4.5,
        "default_duty_cycle": 0.45,
        "room": "Master Bedroom",
        "is_active": True,
    },
    {
        "name": "Double-Door Refrigerator",
        "category": "Kitchen",
        "icon": "Refrigerator",
        "power_watts": 160.0,
        "standby_watts": 2.0,
        "default_duty_cycle": 0.40,
        "room": "Kitchen",
        "is_active": True,
    },
    {
        "name": "BLDC Ceiling Fan",
        "category": "Cooling",
        "icon": "Fan",
        "power_watts": 35.0,
        "standby_watts": 1.0,
        "default_duty_cycle": 0.65,
        "room": "Living Room",
        "is_active": True,
    },
    {
        "name": "Smart 4K Television (55-inch)",
        "category": "Entertainment",
        "icon": "Tv",
        "power_watts": 110.0,
        "standby_watts": 3.0,
        "default_duty_cycle": 0.25,
        "room": "Living Room",
        "is_active": True,
    },
    {
        "name": "Front-Load Washing Machine",
        "category": "Utility",
        "icon": "Shirt",
        "power_watts": 520.0,
        "standby_watts": 1.5,
        "default_duty_cycle": 0.10,
        "room": "Utility Balcony",
        "is_active": True,
    },
    {
        "name": "Smart LED Lighting System",
        "category": "Lighting",
        "icon": "Lightbulb",
        "power_watts": 65.0,
        "standby_watts": 1.0,
        "default_duty_cycle": 0.35,
        "room": "Entire Home",
        "is_active": True,
    },
    {
        "name": "Ergonomic Workstation & Laptop",
        "category": "Computing",
        "icon": "Laptop",
        "power_watts": 95.0,
        "standby_watts": 2.5,
        "default_duty_cycle": 0.40,
        "room": "Study / Home Office",
        "is_active": True,
    },
    {
        "name": "Storage Water Heater (Geyser 25L)",
        "category": "Heating",
        "icon": "Flame",
        "power_watts": 2000.0,
        "standby_watts": 1.0,
        "default_duty_cycle": 0.12,
        "room": "Master Bathroom",
        "is_active": True,
    },
    {
        "name": "Convection Microwave Oven",
        "category": "Kitchen",
        "icon": "Microwave",
        "power_watts": 1200.0,
        "standby_watts": 2.0,
        "default_duty_cycle": 0.05,
        "room": "Kitchen",
        "is_active": True,
    }
]

def calculate_appliance_hourly_factor(appliance_name: str, hour: int, is_weekend: bool) -> float:
    """
    Returns the duty cycle / probability factor (0.0 to 1.0) for a given appliance
    based on realistic diurnal human activity patterns.
    """
    name = appliance_name.lower()

    if "air conditioner" in name:
        # High cooling in hot afternoon (13-17) and night sleeping hours (22-06)
        if 22 <= hour or hour <= 6:
            return 0.75 + random.uniform(-0.1, 0.1)
        elif 13 <= hour <= 17:
            return 0.65 + random.uniform(-0.1, 0.1)
        elif 7 <= hour <= 12:
            return 0.20 if is_weekend else 0.05
        else:
            return 0.35

    elif "refrigerator" in name:
        # Thermostat compressor cycles periodically 24/7 with slight daytime increase
        base = 0.38
        if 8 <= hour <= 21:
            base += 0.08  # door opened more frequently
        return min(0.65, max(0.25, base + random.uniform(-0.05, 0.05)))

    elif "fan" in name:
        # Runs heavily at night and warm afternoon
        if 22 <= hour or hour <= 7:
            return 0.90
        elif 12 <= hour <= 18:
            return 0.70
        else:
            return 0.30

    elif "television" in name:
        # Prime entertainment 19:00 - 23:00, afternoon on weekends
        if 19 <= hour <= 23:
            return 0.85
        elif 13 <= hour <= 17 and is_weekend:
            return 0.60
        else:
            return 0.05

    elif "washing machine" in name:
        # Typically morning runs, especially weekend mornings
        if 8 <= hour <= 11:
            return 0.65 if is_weekend else 0.20
        return 0.0

    elif "light" in name:
        # Early morning and evening
        if 18 <= hour <= 23:
            return 0.85
        elif 6 <= hour <= 8:
            return 0.50
        else:
            return 0.05

    elif "workstation" in name or "laptop" in name:
        # Standard work hours 09:00 - 18:00
        if 9 <= hour <= 18:
            return 0.25 if is_weekend else 0.85
        elif 19 <= hour <= 22:
            return 0.30
        else:
            return 0.02

    elif "water heater" in name or "geyser" in name:
        # Bathing spikes 06:30 - 09:00 and 19:30 - 21:00
        if 6 <= hour <= 9:
            return 0.70
        elif 19 <= hour <= 21:
            return 0.35
        else:
            return 0.0

    elif "microwave" in name:
        if hour in (8, 13, 20, 21):
            return 0.35
        return 0.0

    return 0.20

def calculate_cost(kwh: float, tariff: TariffSetting) -> float:
    """Calculate billing cost in INR based on tariff settings."""
    if not tariff:
        return kwh * 7.0

    if tariff.model_type == "flat":
        energy_cost = kwh * tariff.flat_rate
    else:
        # Slab based
        try:
            slabs = json.loads(tariff.slabs_json)
        except Exception:
            slabs = [{"up_to": 100, "rate": 4.5}, {"up_to": 300, "rate": 7.0}, {"up_to": None, "rate": 9.5}]

        remaining_kwh = kwh
        energy_cost = 0.0
        previous_limit = 0.0

        for tier in slabs:
            up_to = tier.get("up_to")
            rate = tier.get("rate", 7.0)

            if up_to is not None:
                tier_capacity = up_to - previous_limit
                consume_in_tier = min(remaining_kwh, tier_capacity)
                if consume_in_tier > 0:
                    energy_cost += consume_in_tier * rate
                    remaining_kwh -= consume_in_tier
                previous_limit = up_to
                if remaining_kwh <= 0:
                    break
            else:
                # Top bracket
                if remaining_kwh > 0:
                    energy_cost += remaining_kwh * rate
                    remaining_kwh = 0
                break

    # Add tax
    tax = energy_cost * (tariff.tax_rate_percent / 100.0)
    # Pro-rated fixed charge per hour or per day is handled at monthly level, but for raw unit cost:
    return energy_cost + tax

def initialize_database_seeds(db: Session, force_reset: bool = False):
    """Seed initial appliances, tariff, historical hourly readings (60 days), and anomalies."""
    existing_appliances = db.query(Appliance).count()
    if existing_appliances > 0 and not force_reset:
        return

    if force_reset:
        db.query(HourlyReading).delete()
        db.query(DailyAggregate).delete()
        db.query(AnomalyLog).delete()
        db.query(Appliance).delete()
        db.query(TariffSetting).delete()
        db.query(SimulationConfig).delete()
        db.commit()

    # 1. Create Default Appliances
    created_appliances = []
    for app_data in DEFAULT_APPLIANCES:
        app = Appliance(**app_data)
        db.add(app)
        created_appliances.append(app)
    db.commit()

    # 2. Create Default Tariff
    tariff = TariffSetting(
        model_type="slab",
        flat_rate=7.50,
        fixed_charge_monthly=120.0,
        tax_rate_percent=5.0,
        slabs_json=json.dumps([
            {"up_to": 100, "rate": 4.5},
            {"up_to": 300, "rate": 7.0},
            {"up_to": None, "rate": 9.5}
        ]),
        currency_symbol="₹",
        currency_code="INR"
    )
    db.add(tariff)

    # 3. Create Simulation Config
    config = SimulationConfig(
        speed_multiplier=1.0,
        is_paused=False,
        anomaly_sensitivity=1.3
    )
    db.add(config)
    db.commit()

    # 4. Generate 60 days of historical hourly data
    now = datetime.utcnow()
    start_time = now - timedelta(days=60)
    current_time = start_time.replace(minute=0, second=0, microsecond=0)

    readings_to_add = []
    daily_sums = {}

    anomaly_timestamps = {
        (now - timedelta(days=4, hours=15)).strftime("%Y-%m-%d %H:00"): ("AC Compressor Relay Locked", "Air Conditioner", 1850.0),
        (now - timedelta(days=12, hours=3)).strftime("%Y-%m-%d %H:00"): ("Abnormal Midnight Base Load Spike", "Entire Home", 2200.0),
        (now - timedelta(days=22, hours=18)).strftime("%Y-%m-%d %H:00"): ("Geyser Thermostat Stuck ON", "Storage Water Heater (Geyser 25L)", 2100.0),
    }

    while current_time <= now:
        hour = current_time.hour
        is_weekend = current_time.weekday() >= 5
        date_str = current_time.strftime("%Y-%m-%d")
        dt_str = current_time.strftime("%Y-%m-%d %H:00")

        total_watts = 0.0
        breakdown = {}

        is_injected_anomaly = dt_str in anomaly_timestamps

        for app in created_appliances:
            if not app.is_active:
                breakdown[app.name] = app.standby_watts
                total_watts += app.standby_watts
                continue

            duty = calculate_appliance_hourly_factor(app.name, hour, is_weekend)

            # Check if this appliance is an injected anomaly
            if is_injected_anomaly and anomaly_timestamps[dt_str][1] in (app.name, "Entire Home"):
                draw = anomaly_timestamps[dt_str][2]
            else:
                if random.random() < duty:
                    # Running with +/- 6% variability
                    draw = app.power_watts * random.uniform(0.94, 1.06)
                else:
                    # Vampire standby
                    draw = app.standby_watts * random.uniform(0.9, 1.1)

            breakdown[app.name] = round(draw, 1)
            total_watts += draw

        # Base voltage with gentle fluctuation
        voltage = round(230.0 + random.gauss(0, 2.2), 1)
        # Realistic power factor between 0.91 and 0.98
        power_factor = round(min(0.98, max(0.90, 0.94 + random.gauss(0, 0.015))), 3)
        # Current in Amperes: I = P / (V * PF)
        current = round(total_watts / (voltage * power_factor), 2)
        # Energy in kWh: E = P(W) * 1h / 1000
        energy_kwh = round(total_watts / 1000.0, 4)

        is_anomaly = is_injected_anomaly
        anomaly_msg = anomaly_timestamps[dt_str][0] if is_injected_anomaly else None

        reading = HourlyReading(
            timestamp=current_time,
            total_power_watts=round(total_watts, 1),
            voltage_v=voltage,
            current_a=current,
            power_factor=power_factor,
            energy_kwh=energy_kwh,
            appliance_breakdown=json.dumps(breakdown),
            is_anomaly=is_anomaly,
            anomaly_reason=anomaly_msg
        )
        readings_to_add.append(reading)

        # Track daily aggregation
        if date_str not in daily_sums:
            daily_sums[date_str] = {
                "total_kwh": 0.0,
                "peak_watts": 0.0,
                "off_peak_kwh": 0.0,
                "peak_kwh": 0.0,
                "breakdown": {}
            }

        daily_sums[date_str]["total_kwh"] += energy_kwh
        daily_sums[date_str]["peak_watts"] = max(daily_sums[date_str]["peak_watts"], total_watts)

        # Peak hours defined as 18:00 - 22:00
        if 18 <= hour <= 22:
            daily_sums[date_str]["peak_kwh"] += energy_kwh
        else:
            daily_sums[date_str]["off_peak_kwh"] += energy_kwh

        for k, v in breakdown.items():
            daily_sums[date_str]["breakdown"][k] = daily_sums[date_str]["breakdown"].get(k, 0.0) + (v / 1000.0)

        current_time += timedelta(hours=1)

    # Bulk insert hourly readings in chunks for high performance
    db.bulk_save_objects(readings_to_add)
    db.commit()

    # Insert daily aggregates
    daily_objects = []
    for d_str, stats in daily_sums.items():
        kwh = round(stats["total_kwh"], 2)
        cost = round(calculate_cost(kwh, tariff), 2)
        # Efficiency score: typical residential target is 8 - 14 kWh/day.
        # Score 95 if < 10 kWh, down to 60 if > 25 kWh
        if kwh < 9.0:
            score = 94 + random.randint(0, 5)
        elif kwh < 14.0:
            score = 85 + random.randint(-4, 6)
        elif kwh < 20.0:
            score = 75 + random.randint(-5, 5)
        else:
            score = 62 + random.randint(-6, 4)

        # format breakdown
        cleaned_breakdown = {k: round(v, 2) for k, v in stats["breakdown"].items()}

        daily_obj = DailyAggregate(
            date=d_str,
            total_energy_kwh=kwh,
            peak_power_watts=round(stats["peak_watts"], 1),
            off_peak_energy_kwh=round(stats["off_peak_kwh"], 2),
            peak_energy_kwh=round(stats["peak_kwh"], 2),
            estimated_cost_inr=cost,
            efficiency_score=min(99, max(50, score)),
            appliance_breakdown=json.dumps(cleaned_breakdown)
        )
        daily_objects.append(daily_obj)

    db.bulk_save_objects(daily_objects)
    db.commit()

    # Seed Anomaly logs for the injected events
    anomaly_events = [
        AnomalyLog(
            timestamp=now - timedelta(days=4, hours=15),
            severity="critical",
            appliance_name="Inverter Air Conditioner (1.5 Ton)",
            title="Sustained Excessive Cooling Load Detected",
            message="Air conditioner compressor ran continuously at 1,850W for 4+ hours, exceeding the expected evening baseline by 62%. Possible open window or thermostat fault.",
            percentage_deviation=62.4,
            baseline_kwh=1.14,
            actual_kwh=1.85,
            acknowledged=False
        ),
        AnomalyLog(
            timestamp=now - timedelta(days=12, hours=3),
            severity="warning",
            appliance_name="Entire Home",
            title="Unusual Midnight Basal Consumption Surge",
            message="Nighttime standby load spiked to 2.2 kW at 03:00 AM (typical expectation < 0.45 kW). 388% deviation from historical median.",
            percentage_deviation=388.0,
            baseline_kwh=0.45,
            actual_kwh=2.20,
            acknowledged=True
        ),
        AnomalyLog(
            timestamp=now - timedelta(days=22, hours=18),
            severity="alert",
            appliance_name="Storage Water Heater (Geyser 25L)",
            title="Prolonged Geyser Heating During Peak Tariff Hours",
            message="Geyser drew 2.1 kW during peak evening hours (18:00-19:00). High tariff period increased hourly cost by ₹19.80.",
            percentage_deviation=84.5,
            baseline_kwh=1.10,
            actual_kwh=2.10,
            acknowledged=True
        )
    ]
    db.add_all(anomaly_events)
    db.commit()

def get_current_live_telemetry(db: Session) -> dict:
    """
    Computes real-time live telemetry reflecting current active appliance states,
    voltage, current, power factor, and today's accumulated energy.
    """
    appliances = db.query(Appliance).all()
    now = datetime.utcnow()
    hour = now.hour
    is_weekend = now.weekday() >= 5

    total_power_w = 0.0
    active_count = 0
    breakdown = {}

    for app in appliances:
        if app.is_active:
            active_count += 1
            duty = calculate_appliance_hourly_factor(app.name, hour, is_weekend)
            # If user has toggled active, apply probability factor or running draw
            if random.random() < max(0.2, duty):
                draw = app.power_watts * random.uniform(0.95, 1.05)
            else:
                draw = app.standby_watts * random.uniform(0.9, 1.1)
        else:
            draw = 0.0  # switched off completely

        total_power_w += draw
        breakdown[app.name] = round(draw, 1)

    voltage = round(230.0 + random.gauss(0, 1.8), 1)
    power_factor = round(min(0.99, max(0.91, 0.95 + random.gauss(0, 0.01))), 3)
    current = round(total_power_w / max(1.0, (voltage * power_factor)), 2)

    today_str = now.strftime("%Y-%m-%d")
    today_agg = db.query(DailyAggregate).filter(DailyAggregate.date == today_str).first()
    today_kwh = today_agg.total_energy_kwh if today_agg else round(total_power_w * (now.hour + now.minute/60.0) / 1000.0, 2)

    return {
        "current_power_watts": round(total_power_w, 1),
        "current_power_kw": round(total_power_w / 1000.0, 3),
        "voltage_v": voltage,
        "current_a": current,
        "power_factor": power_factor,
        "frequency_hz": 50.0 + round(random.uniform(-0.04, 0.04), 2),
        "today_energy_kwh": round(today_kwh, 2),
        "simulated_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "is_live": True,
        "status": "Optimal" if total_power_w < 3500 else "High Load",
        "appliances_active_count": active_count,
        "total_appliances_count": len(appliances),
        "breakdown": breakdown
    }
