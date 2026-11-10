from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ApplianceBase(BaseModel):
    name: str
    category: str = "General"
    icon: str = "Zap"
    power_watts: float
    standby_watts: float = 2.0
    default_duty_cycle: float = 0.5
    is_active: bool = True
    room: str = "Living Room"

class ApplianceCreate(ApplianceBase):
    pass

class ApplianceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    power_watts: Optional[float] = None
    standby_watts: Optional[float] = None
    default_duty_cycle: Optional[float] = None
    is_active: Optional[bool] = None
    room: Optional[str] = None

class ApplianceResponse(ApplianceBase):
    id: int
    daily_energy_kwh: float = 0.0
    daily_cost_inr: float = 0.0
    monthly_cost_inr: float = 0.0
    percentage_share: float = 0.0

    class Config:
        from_attributes = True

class LiveTelemetry(BaseModel):
    current_power_watts: float
    current_power_kw: float
    voltage_v: float
    current_a: float
    power_factor: float
    frequency_hz: float = 50.0
    today_energy_kwh: float
    simulated_time: str
    is_live: bool = True
    status: str = "Optimal"
    appliances_active_count: int
    total_appliances_count: int

class TariffTier(BaseModel):
    up_to: Optional[float] = None  # None indicates infinity/remaining
    rate: float

class TariffConfig(BaseModel):
    model_type: str = "slab"  # "slab" or "flat"
    flat_rate: float = 7.50
    fixed_charge_monthly: float = 120.0
    tax_rate_percent: float = 5.0
    slabs: List[TariffTier] = [
        TariffTier(up_to=100, rate=4.5),
        TariffTier(up_to=300, rate=7.0),
        TariffTier(up_to=None, rate=9.5),
    ]
    currency_symbol: str = "₹"
    currency_code: str = "INR"

class KPICardData(BaseModel):
    current_power_kw: float
    today_kwh: float
    yesterday_kwh: float
    today_vs_yesterday_pct: float
    estimated_monthly_bill_inr: float
    last_month_bill_inr: float
    monthly_bill_diff_pct: float
    efficiency_score: int
    efficiency_score_change: int
    efficiency_label: str

class AnomalyItem(BaseModel):
    id: int
    timestamp: str
    severity: str
    appliance_name: Optional[str]
    title: str
    message: str
    percentage_deviation: float
    baseline_kwh: float
    actual_kwh: float
    acknowledged: bool

class RecommendationItem(BaseModel):
    id: str
    category: str
    title: str
    description: str
    impact: str
    potential_savings_inr: float
    confidence_pct: int
    appliance: Optional[str] = None
    action_label: str

class SimulationStateUpdate(BaseModel):
    speed_multiplier: Optional[float] = None
    is_paused: Optional[bool] = None
    anomaly_sensitivity: Optional[float] = None
