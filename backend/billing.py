import json
import calendar
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models import TariffSetting, DailyAggregate

def get_or_create_tariff(db: Session) -> TariffSetting:
    tariff = db.query(TariffSetting).first()
    if not tariff:
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
        db.commit()
        db.refresh(tariff)
    return tariff

def compute_bill_for_kwh(kwh: float, tariff: TariffSetting) -> dict:
    """Computes exact billing components for a given kWh consumption."""
    slab_breakdown = []
    energy_charge = 0.0

    if tariff.model_type == "flat":
        energy_charge = kwh * tariff.flat_rate
        slab_breakdown.append({
            "tier_label": f"All units @ {tariff.currency_symbol}{tariff.flat_rate:.2f}",
            "units_kwh": round(kwh, 2),
            "rate_per_kwh": tariff.flat_rate,
            "cost": round(energy_charge, 2)
        })
    else:
        try:
            slabs = json.loads(tariff.slabs_json)
        except Exception:
            slabs = [{"up_to": 100, "rate": 4.5}, {"up_to": 300, "rate": 7.0}, {"up_to": None, "rate": 9.5}]

        remaining = kwh
        prev_limit = 0.0

        for i, slab in enumerate(slabs):
            up_to = slab.get("up_to")
            rate = slab.get("rate", 7.0)

            if up_to is not None:
                tier_cap = up_to - prev_limit
                units = min(remaining, tier_cap)
                cost = units * rate
                energy_charge += cost
                remaining -= units

                label = f"Slab {i+1}: {int(prev_limit)+1}-{int(up_to)} kWh"
                slab_breakdown.append({
                    "tier_label": label,
                    "units_kwh": round(units, 2),
                    "rate_per_kwh": rate,
                    "cost": round(cost, 2)
                })
                prev_limit = up_to
                if remaining <= 0:
                    break
            else:
                if remaining > 0:
                    cost = remaining * rate
                    energy_charge += cost
                    label = f"Slab {i+1}: Above {int(prev_limit)} kWh"
                    slab_breakdown.append({
                        "tier_label": label,
                        "units_kwh": round(remaining, 2),
                        "rate_per_kwh": rate,
                        "cost": round(cost, 2)
                    })
                    remaining = 0
                break

    fixed_charge = tariff.fixed_charge_monthly
    tax_amount = (energy_charge + fixed_charge) * (tariff.tax_rate_percent / 100.0)
    total_bill = energy_charge + fixed_charge + tax_amount

    return {
        "consumption_kwh": round(kwh, 2),
        "energy_charge": round(energy_charge, 2),
        "fixed_charge": round(fixed_charge, 2),
        "tax_rate_percent": tariff.tax_rate_percent,
        "tax_amount": round(tax_amount, 2),
        "total_bill": round(total_bill, 2),
        "slab_breakdown": slab_breakdown,
        "average_cost_per_kwh": round(total_bill / max(1.0, kwh), 2)
    }

def get_billing_intelligence(db: Session) -> dict:
    """Comprehensive billing intelligence with forecasting, trends, and comparisons."""
    tariff = get_or_create_tariff(db)
    now = datetime.utcnow()
    current_year = now.year
    current_month = now.month
    days_in_month = calendar.monthrange(current_year, current_month)[1]
    current_day = now.day

    # Query current month daily aggregates
    month_prefix = f"{current_year:04d}-{current_month:02d}"
    current_month_records = db.query(DailyAggregate).filter(
        DailyAggregate.date.startswith(month_prefix)
    ).order_by(DailyAggregate.date.asc()).all()

    month_to_date_kwh = sum(r.total_energy_kwh for r in current_month_records)
    recorded_days = len(current_month_records)

    if recorded_days > 0:
        avg_daily_kwh = month_to_date_kwh / recorded_days
    else:
        avg_daily_kwh = 11.5

    remaining_days = max(0, days_in_month - current_day)
    forecasted_month_kwh = month_to_date_kwh + (avg_daily_kwh * remaining_days)

    current_bill_info = compute_bill_for_kwh(month_to_date_kwh, tariff)
    forecast_bill_info = compute_bill_for_kwh(forecasted_month_kwh, tariff)

    # Previous Month comparison
    first_day_cur = datetime(current_year, current_month, 1)
    prev_month_date = first_day_cur - timedelta(days=1)
    prev_month_prefix = f"{prev_month_date.year:04d}-{prev_month_date.month:02d}"

    prev_month_records = db.query(DailyAggregate).filter(
        DailyAggregate.date.startswith(prev_month_prefix)
    ).all()

    prev_month_kwh = sum(r.total_energy_kwh for r in prev_month_records) or (month_to_date_kwh * 1.08)
    prev_month_bill = compute_bill_for_kwh(prev_month_kwh, tariff)

    bill_diff_amount = forecast_bill_info["total_bill"] - prev_month_bill["total_bill"]
    bill_diff_pct = (bill_diff_amount / max(1.0, prev_month_bill["total_bill"])) * 100.0

    # Daily expenditure history for current month
    daily_trend = []
    cumulative_kwh = 0.0
    for r in current_month_records:
        cumulative_kwh += r.total_energy_kwh
        daily_bill = compute_bill_for_kwh(r.total_energy_kwh, tariff)
        daily_trend.append({
            "date": r.date,
            "day": int(r.date.split("-")[2]),
            "kwh": round(r.total_energy_kwh, 2),
            "cost_inr": round(daily_bill["energy_charge"], 2),
            "cumulative_kwh": round(cumulative_kwh, 2)
        })

    # Projected trajectory for remaining days
    projected_trend = []
    running_kwh = cumulative_kwh
    for d in range(current_day + 1, days_in_month + 1):
        running_kwh += avg_daily_kwh
        projected_trend.append({
            "day": d,
            "projected_kwh": round(running_kwh, 2),
            "projected_cost_inr": round(compute_bill_for_kwh(running_kwh, tariff)["total_bill"], 2)
        })

    return {
        "currency_symbol": tariff.currency_symbol,
        "currency_code": tariff.currency_code,
        "billing_period": f"{first_day_cur.strftime('%b 1')} - {calendar.month_name[current_month]} {days_in_month}, {current_year}",
        "days_elapsed": current_day,
        "days_remaining": remaining_days,
        "days_in_month": days_in_month,
        "month_to_date_kwh": round(month_to_date_kwh, 2),
        "month_to_date_bill_inr": current_bill_info["total_bill"],
        "forecasted_month_kwh": round(forecasted_month_kwh, 2),
        "forecasted_bill_inr": forecast_bill_info["total_bill"],
        "average_daily_cost_inr": round(current_bill_info["total_bill"] / max(1, current_day), 2),
        "average_cost_per_kwh": forecast_bill_info["average_cost_per_kwh"],
        "previous_month_kwh": round(prev_month_kwh, 2),
        "previous_month_bill_inr": prev_month_bill["total_bill"],
        "bill_diff_amount": round(bill_diff_amount, 2),
        "bill_diff_pct": round(bill_diff_pct, 1),
        "tariff_model": tariff.model_type,
        "flat_rate": tariff.flat_rate,
        "fixed_charge": tariff.fixed_charge_monthly,
        "tax_rate_percent": tariff.tax_rate_percent,
        "slab_breakdown": forecast_bill_info["slab_breakdown"],
        "daily_trend": daily_trend,
        "projected_trend": projected_trend
    }
