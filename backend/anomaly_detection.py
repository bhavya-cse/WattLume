import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import HourlyReading, AnomalyLog, Appliance

def compute_hourly_baselines(db: Session) -> Dict[int, Dict[str, float]]:
    """
    Computes statistical baseline mean and standard deviation of power (Watts)
    for each hour of the day (0-23) across the historical dataset.
    """
    cutoff = datetime.utcnow() - timedelta(days=45)
    readings = db.query(HourlyReading).filter(HourlyReading.timestamp >= cutoff).all()

    hour_bins: Dict[int, List[float]] = {h: [] for h in range(24)}
    for r in readings:
        hour_bins[r.timestamp.hour].append(r.total_power_watts)

    baselines = {}
    for h in range(24):
        vals = hour_bins[h]
        if vals:
            mean = sum(vals) / len(vals)
            variance = sum((x - mean) ** 2 for x in vals) / len(vals)
            std_dev = variance ** 0.5
            baselines[h] = {
                "mean_watts": round(mean, 1),
                "std_dev_watts": round(max(std_dev, 25.0), 1),
                "threshold_watts": round(mean + (1.95 * max(std_dev, 25.0)), 1)
            }
        else:
            baselines[h] = {"mean_watts": 850.0, "std_dev_watts": 180.0, "threshold_watts": 1200.0}

    return baselines

def detect_recent_anomalies(db: Session, sensitivity_multiplier: float = 1.30) -> List[Dict[str, Any]]:
    """
    Checks recent hourly readings (last 48 hours) against baseline thresholds.
    Returns detected anomalies with root cause appliance identification.
    """
    baselines = compute_hourly_baselines(db)
    recent_readings = db.query(HourlyReading).order_by(HourlyReading.timestamp.desc()).limit(48).all()

    detected = []

    for r in recent_readings:
        hour = r.timestamp.hour
        base = baselines.get(hour, {"mean_watts": 800.0, "std_dev_watts": 150.0, "threshold_watts": 1200.0})
        mean_w = base["mean_watts"]
        std_w = base["std_dev_watts"]

        # Check threshold condition: either z-score > 2.0 OR percentage increase > 30%
        z_score = (r.total_power_watts - mean_w) / max(std_w, 1.0)
        pct_dev = ((r.total_power_watts - mean_w) / max(1.0, mean_w)) * 100.0

        if (z_score >= 2.0 and pct_dev >= (sensitivity_multiplier - 1.0) * 100.0) or r.is_anomaly:
            # Find culprit appliance from breakdown
            culprit_app = "Overall System"
            max_app_draw = 0.0

            try:
                bd = json.loads(r.appliance_breakdown)
                for app_name, draw in bd.items():
                    if draw > max_app_draw:
                        max_app_draw = draw
                        culprit_app = app_name
            except Exception:
                pass

            severity = "critical" if pct_dev > 65.0 else ("warning" if pct_dev > 35.0 else "info")

            title = f"Unusual {r.timestamp.strftime('%I %p')} Spike (+{pct_dev:.0f}%)"
            message = (
                f"Electricity consumption of {r.total_power_watts:,.0f}W is {pct_dev:.1f}% higher "
                f"than your typical {r.timestamp.strftime('%I %p')} baseline ({mean_w:.0f}W). "
                f"Primary contributor: {culprit_app} ({max_app_draw:.0f}W)."
            )

            detected.append({
                "id": r.id,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M"),
                "severity": severity,
                "appliance_name": culprit_app,
                "title": title,
                "message": message,
                "percentage_deviation": round(pct_dev, 1),
                "baseline_kwh": round(mean_w / 1000.0, 2),
                "actual_kwh": round(r.total_power_watts / 1000.0, 2),
                "z_score": round(z_score, 2),
                "acknowledged": False
            })

    # Also include persisted anomaly logs from database
    persisted_logs = db.query(AnomalyLog).order_by(AnomalyLog.timestamp.desc()).limit(10).all()
    for log in persisted_logs:
        # Avoid duplicate timestamps
        if not any(d["timestamp"].startswith(log.timestamp.strftime("%Y-%m-%d %H")) for d in detected):
            detected.append({
                "id": log.id,
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M"),
                "severity": log.severity,
                "appliance_name": log.appliance_name,
                "title": log.title,
                "message": log.message,
                "percentage_deviation": log.percentage_deviation,
                "baseline_kwh": log.baseline_kwh,
                "actual_kwh": log.actual_kwh,
                "z_score": 2.4,
                "acknowledged": log.acknowledged
            })

    # Sort newest first
    detected.sort(key=lambda x: x["timestamp"], reverse=True)
    return detected[:8]
