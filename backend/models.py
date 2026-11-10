from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from backend.database import Base

class Appliance(Base):
    __tablename__ = "appliances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="General")  # Cooling, Heating, Entertainment, Kitchen, Lighting, Computing
    icon = Column(String(50), default="Zap")          # Lucide icon name
    power_watts = Column(Float, nullable=False)       # Typical running wattage
    standby_watts = Column(Float, default=2.0)        # Vampire standby wattage
    default_duty_cycle = Column(Float, default=0.5)   # 0.0 to 1.0 fraction of active time
    is_active = Column(Boolean, default=True)         # Simulated ON/OFF state switch
    room = Column(String(50), default="Living Room")
    created_at = Column(DateTime, default=datetime.utcnow)

class HourlyReading(Base):
    __tablename__ = "hourly_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    total_power_watts = Column(Float, nullable=False)
    voltage_v = Column(Float, default=230.0)
    current_a = Column(Float, nullable=False)
    power_factor = Column(Float, default=0.95)
    energy_kwh = Column(Float, nullable=False)        # Power * 1 hr / 1000
    appliance_breakdown = Column(Text, default="{}")  # JSON string of appliance_name -> power_w
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String(255), nullable=True)

class DailyAggregate(Base):
    __tablename__ = "daily_aggregates"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False) # YYYY-MM-DD
    total_energy_kwh = Column(Float, nullable=False)
    peak_power_watts = Column(Float, nullable=False)
    off_peak_energy_kwh = Column(Float, default=0.0)
    peak_energy_kwh = Column(Float, default=0.0)
    estimated_cost_inr = Column(Float, nullable=False)
    efficiency_score = Column(Integer, default=85)
    appliance_breakdown = Column(Text, default="{}")

class TariffSetting(Base):
    __tablename__ = "tariff_settings"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(20), default="slab")   # "slab" or "flat"
    flat_rate = Column(Float, default=7.50)           # INR per kWh
    fixed_charge_monthly = Column(Float, default=120.0)# INR fixed per month
    tax_rate_percent = Column(Float, default=5.0)     # Tax/duty percentage
    slabs_json = Column(Text, default='[{"up_to": 100, "rate": 4.5}, {"up_to": 300, "rate": 7.0}, {"up_to": null, "rate": 9.5}]')
    currency_symbol = Column(String(10), default="₹")
    currency_code = Column(String(10), default="INR")
    updated_at = Column(DateTime, default=datetime.utcnow)

class AnomalyLog(Base):
    __tablename__ = "anomaly_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String(20), default="warning")   # info, warning, alert, critical
    appliance_name = Column(String(100), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    percentage_deviation = Column(Float, nullable=False)
    baseline_kwh = Column(Float, nullable=False)
    actual_kwh = Column(Float, nullable=False)
    acknowledged = Column(Boolean, default=False)

class SimulationConfig(Base):
    __tablename__ = "simulation_config"

    id = Column(Integer, primary_key=True, index=True)
    speed_multiplier = Column(Float, default=1.0)
    is_paused = Column(Boolean, default=False)
    anomaly_sensitivity = Column(Float, default=1.3)   # 1.3 = 30% above baseline
    last_tick_time = Column(DateTime, default=datetime.utcnow)
