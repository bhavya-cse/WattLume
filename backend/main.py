import os
import io
import csv
import calendar
import json
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, case, text
from sqlalchemy.orm import Session

from backend.database import engine, Base, get_db, SessionLocal
from backend.models import (
    Appliance, HourlyReading, DailyAggregate, TariffSetting, HistoricalReading,
    AnomalyLog, SimulationConfig
)
from backend.schemas import (
    ApplianceCreate, ApplianceUpdate, ApplianceResponse,
    LiveTelemetry, TariffConfig, KPICardData, SimulationStateUpdate
)
from backend.simulator import (
    initialize_database_seeds, get_current_live_telemetry, DEFAULT_APPLIANCES
)
from backend.billing import (
    get_or_create_tariff, compute_bill_for_kwh, get_billing_intelligence
)
from backend.anomaly_detection import detect_recent_anomalies
from backend.recommendations import generate_smart_insights_and_recommendations
from backend.analytics import get_analytics_dataset

# Initialize database schema
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize seeds on startup if not already seeded
    db = SessionLocal()
    try:
        initialize_database_seeds(db, force_reset=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title="WattLume API",
    description="Smart Energy Consumption Monitoring & Intelligence Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "WattLume Energy Intelligence Platform",        "timestamp": datetime.utcnow().isoformat(),
        "simulation_mode": "active"
    }

@app.get("/api/live")
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    database_status = "connected"

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db.rollback()
        database_status = "disconnected"

    return {
        "status": "healthy" if database_status == "connected" else "degraded",
        "service": "WattLume API",
        "timestamp": datetime.utcnow().isoformat(),
        "simulation_mode": "active",
        "database": database_status,
    }


@app.get("/api/live")
def get_live(db: Session = Depends(get_db)):
    """Returns real-time electrical telemetry (W, kW, V, A, PF, Hz, today kWh)."""
    return get_current_live_telemetry(db)

@app.get("/api/overview")
def get_overview(db: Session = Depends(get_db)):
    """Overview dashboard KPIs, quick charts, live readings and recent alert items."""
    live = get_current_live_telemetry(db)
    tariff = get_or_create_tariff(db)
    now = datetime.utcnow()

    # Today's date and Yesterday's date
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    today_record = db.query(DailyAggregate).filter(DailyAggregate.date == today_str).first()
    yesterday_record = db.query(DailyAggregate).filter(DailyAggregate.date == yesterday_str).first()

    today_kwh = live["today_energy_kwh"]
    yesterday_kwh = yesterday_record.total_energy_kwh if yesterday_record else 12.8
    today_vs_yesterday_pct = round(((today_kwh - yesterday_kwh) / max(1.0, yesterday_kwh)) * 100.0, 1)

    # Billing intelligence
    billing_data = get_billing_intelligence(db)

    # Insights & Efficiency Score
    insights = generate_smart_insights_and_recommendations(db)
    eff = insights["efficiency_score"]

    kpis = {
        "current_power_w": live["current_power_watts"],
        "current_power_kw": live["current_power_kw"],
        "today_kwh": today_kwh,
        "yesterday_kwh": yesterday_kwh,
        "today_vs_yesterday_pct": today_vs_yesterday_pct,
        "estimated_monthly_bill_inr": billing_data["forecasted_bill_inr"],
        "last_month_bill_inr": billing_data["previous_month_bill_inr"],
        "monthly_bill_diff_pct": billing_data["bill_diff_pct"],
        "efficiency_score": eff["overall_score"],
        "efficiency_score_change": 3,
        "efficiency_label": eff["rating_label"]
    }

    # Hourly chart data for today
    replay_time = datetime.strptime(
        live["simulated_time"], "%Y-%m-%d %H:%M:%S"
    )
    today_analytics = get_analytics_dataset(
        db, "today", as_of=replay_time
    )
    # Top appliances breakdown
    appliances_analytics = today_analytics["appliances"]

    # Recent alerts
    anomalies = detect_recent_anomalies(db)[:3]

    return {
        "kpis": kpis,
        "live": live,
        "hourly_chart": today_analytics["chart_data"],
        "appliance_breakdown": appliances_analytics,
        "recent_anomalies": anomalies,
        "currency_symbol": tariff.currency_symbol,
        "simulation_info": {
            "mode": "Simulated Realistic Electricity Profile",
            "is_hardware_connected": False,
            "sample_rate": "1 Hz (real-time telemetry)"
        }
    }

@app.get("/api/analytics")
def get_analytics(
    range: str = Query("7d", pattern="^(today|7d|30d|12m)$"),
    db: Session = Depends(get_db)
):
    """Returns in-depth analytics dataset based on the requested time range."""
    return get_analytics_dataset(db, range)

@app.get("/api/appliances")
def list_appliances(db: Session = Depends(get_db)):
    """Lists all simulated appliances with their active status, power and estimated consumption."""
    analytics = get_analytics_dataset(db, "7d")
    return analytics["appliances"]

@app.post("/api/appliances")
def create_appliance(app_in: ApplianceCreate, db: Session = Depends(get_db)):
    """Create a new simulated appliance."""
    app = Appliance(**app_in.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"message": "Appliance created successfully", "appliance_id": app.id}

@app.put("/api/appliances/{app_id}")
def update_appliance(app_id: int, app_in: ApplianceUpdate, db: Session = Depends(get_db)):
    """Update appliance parameters."""
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appliance not found")

    update_data = app_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(app, field, val)

    db.commit()
    db.refresh(app)
    return {"message": "Appliance updated successfully", "appliance": app.name}

@app.patch("/api/appliances/{app_id}/toggle")
def toggle_appliance(app_id: int, db: Session = Depends(get_db)):
    """
    Toggles the simulated ON/OFF status of an appliance.
    This immediately alters live system power draw and calculations!
    """
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appliance not found")

    app.is_active = not app.is_active
    db.commit()
    db.refresh(app)

    live = get_current_live_telemetry(db)

    return {
        "message": f"Turned {app.name} {'ON' if app.is_active else 'OFF'}",
        "appliance_id": app.id,
        "is_active": app.is_active,
        "new_total_power_w": live["current_power_watts"],
        "new_total_power_kw": live["current_power_kw"]
    }

@app.delete("/api/appliances/{app_id}")
def delete_appliance(app_id: int, db: Session = Depends(get_db)):
    """Delete an appliance from the system."""
    app = db.query(Appliance).filter(Appliance.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appliance not found")

    db.delete(app)
    db.commit()
    return {"message": f"Appliance '{app.name}' removed successfully"}

@app.get("/api/insights")
def get_insights(db: Session = Depends(get_db)):
    """Smart intelligence endpoint: anomalies, bill forecast, recommendations, efficiency score."""
    anomalies = detect_recent_anomalies(db)
    insights = generate_smart_insights_and_recommendations(db)
    billing = get_billing_intelligence(db)

    return {
        "anomalies": anomalies,
        "anomalies_count": len(anomalies),
        "recommendations": insights["recommendations"],
        "total_potential_savings_inr": insights["total_potential_savings_inr"],
        "efficiency_score": insights["efficiency_score"],
        "bill_forecast": {
            "forecasted_bill_inr": billing["forecasted_bill_inr"],
            "month_to_date_bill_inr": billing["month_to_date_bill_inr"],
            "days_remaining": billing["days_remaining"],
            "previous_month_bill_inr": billing["previous_month_bill_inr"],
            "diff_pct": billing["bill_diff_pct"]
        }
    }

@app.post("/api/insights/anomalies/{anomaly_id}/acknowledge")
def acknowledge_anomaly(anomaly_id: int, db: Session = Depends(get_db)):
    """Acknowledge an anomaly alert."""
    log = db.query(AnomalyLog).filter(AnomalyLog.id == anomaly_id).first()
    if log:
        log.acknowledged = True
        db.commit()
    return {"message": "Alert marked as acknowledged", "id": anomaly_id}

@app.get("/api/billing")
def get_billing(db: Session = Depends(get_db)):
    """Full electricity bill management & forecasting endpoint."""
    return get_billing_intelligence(db)

@app.post("/api/billing/tariff")
def update_tariff(tariff_in: TariffConfig, db: Session = Depends(get_db)):
    """Update electricity tariff settings (slab vs flat, slab thresholds, rates, fixed charges)."""
    tariff = get_or_create_tariff(db)
    tariff.model_type = tariff_in.model_type
    tariff.flat_rate = tariff_in.flat_rate
    tariff.fixed_charge_monthly = tariff_in.fixed_charge_monthly
    tariff.tax_rate_percent = tariff_in.tax_rate_percent
    tariff.slabs_json = json.dumps([s.model_dump() for s in tariff_in.slabs])
    tariff.currency_symbol = tariff_in.currency_symbol
    tariff.currency_code = tariff_in.currency_code
    tariff.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(tariff)

    # Return updated billing intelligence immediately
    return {
        "message": "Tariff settings updated successfully",
        "billing": get_billing_intelligence(db)
    }

@app.get("/api/reports")
def get_reports(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|appliances|cost)$"),
    db: Session = Depends(get_db)
):
    """Generates structured report datasets for inspection and export."""
    now = datetime.utcnow()
    tariff = get_or_create_tariff(db)

    if period == "daily":
        start_date = (now - timedelta(days=14)).strftime("%Y-%m-%d")
        records = db.query(DailyAggregate).filter(DailyAggregate.date >= start_date).order_by(DailyAggregate.date.desc()).all()
        rows = [
            {
                "date": r.date,
                "consumption_kwh": r.total_energy_kwh,
                "peak_power_watts": r.peak_power_watts,
                "peak_kwh": r.peak_energy_kwh,
                "off_peak_kwh": r.off_peak_energy_kwh,
                "cost_inr": r.estimated_cost_inr,
                "efficiency_score": r.efficiency_score
            }
            for r in records
        ]
        title = "Daily Energy Consumption Audit Report"
        description = "Granular daily metrics including peak demand, off-peak shift, and cost breakdown."

    elif period == "weekly":
        # Group daily aggregates into 7-day calendar weeks
        records = db.query(DailyAggregate).order_by(DailyAggregate.date.desc()).limit(28).all()
        rows = []
        for i in range(0, len(records), 7):
            chunk = records[i:i+7]
            if not chunk:
                continue
            wk_kwh = sum(c.total_energy_kwh for c in chunk)
            wk_cost = sum(c.estimated_cost_inr for c in chunk)
            wk_peak = max(c.peak_power_watts for c in chunk)
            avg_eff = int(sum(c.efficiency_score for c in chunk) / len(chunk))
            rows.append({
                "period": f"{chunk[-1].date} to {chunk[0].date}",
                "consumption_kwh": round(wk_kwh, 2),
                "cost_inr": round(wk_cost, 2),
                "peak_power_watts": round(wk_peak, 1),
                "avg_daily_kwh": round(wk_kwh / len(chunk), 2),
                "efficiency_score": avg_eff
            })
        title = "Weekly Performance & Efficiency Report"
        description = "Weekly rolling consumption totals and aggregate efficiency trends."

    elif period == "monthly":
        # Aggregate historical readings inside SQLite instead of loading
        # hundreds of thousands of full ORM objects into Python.
        month_expr = func.strftime(
            "%Y-%m", HistoricalReading.timestamp
        )

        monthly_rows = (
            db.query(
                month_expr.label("month_key"),
                (
                    func.sum(
                        case(
                            (
                                HistoricalReading.consumption_kw > 0,
                                HistoricalReading.consumption_kw
                            ),
                            else_=0.0
                        )
                    ) / 60.0
                ).label("total_kwh")
            )
            .group_by(month_expr)
            .order_by(month_expr)
            .all()
        )

        rows = []

        for index, item in enumerate(monthly_rows):
            year, month = map(int, item.month_key.split("-"))
            energy = round(float(item.total_kwh or 0.0), 2)
            bill = compute_bill_for_kwh(energy, tariff)

            month_label = f"{calendar.month_abbr[month]} '{str(year)[2:]}"
            if index == len(monthly_rows) - 1:
                month_label += " (partial)"

            rows.append({
                "month": month_label,
                "total_kwh": energy,
                "fixed_charge": bill["fixed_charge"],
                "energy_charge": bill["energy_charge"],
                "tax_inr": bill["tax_amount"],
                "total_bill_inr": bill["total_bill"]
            })

        title = "Monthly Energy & Expenditure Summary Report"
        description = "Historical monthly consumption and estimated bills using the configured tariff. The final month represents a partial billing period."

    elif period == "appliances":
        analytics = get_analytics_dataset(db, "7d")
        rows = analytics["appliances"]
        title = "Appliance-Wise Energy Apportionment Report"
        description = "Breakdown of individual appliance power ratings, active duty cycles, and monthly cost allocations."

    else: # cost
        billing = get_billing_intelligence(db)
        rows = billing["daily_trend"]
        title = "Cost Analysis & Tariff Expenditure Report"
        description = f"Detailed daily cumulative cost buildup under active {billing['tariff_model'].upper()} tariff."

    return {
        "period": period,
        "title": title,
        "description": description,
        "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "currency_symbol": tariff.currency_symbol,
        "data": rows
    }

@app.get("/api/reports/export-csv")
def export_reports_csv(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|appliances|cost)$"),
    db: Session = Depends(get_db)
):
    """Generates a downloadable CSV report."""
    rep = get_reports(period, db)
    data = rep["data"]

    output = io.StringIO()
    if data:
        fieldnames = list(data[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
    else:
        output.write("No data available for export.\n")

    output.seek(0)
    filename = f"wattlume_{period}_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/simulation/control")
def update_simulation_control(cfg: SimulationStateUpdate, db: Session = Depends(get_db)):
    """Adjust simulation speed multiplier (1x, 2x, 5x, 10x) or pause/resume."""
    sim = db.query(SimulationConfig).first()
    if not sim:
        sim = SimulationConfig()
        db.add(sim)

    if cfg.speed_multiplier is not None:
        sim.speed_multiplier = cfg.speed_multiplier
    if cfg.is_paused is not None:
        sim.is_paused = cfg.is_paused
    if cfg.anomaly_sensitivity is not None:
        sim.anomaly_sensitivity = cfg.anomaly_sensitivity

    db.commit()
    db.refresh(sim)

    return {
        "message": "Simulation configuration updated",
        "speed_multiplier": sim.speed_multiplier,
        "is_paused": sim.is_paused,
        "anomaly_sensitivity": sim.anomaly_sensitivity
    }

@app.post("/api/simulation/reset")
def reset_simulation(db: Session = Depends(get_db)):
    """Resets database and re-seeds fresh 60 days of realistic simulated energy data."""
    initialize_database_seeds(db, force_reset=True)
    return {
        "message": "Simulation database successfully reset and re-seeded with 60 days of historical data."
    }

# Mount static frontend build if available
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import FileResponse

    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

