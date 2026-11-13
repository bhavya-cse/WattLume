
import csv
import json
from datetime import datetime

from backend.database import Base, engine, SessionLocal
from backend.models import HistoricalReading

CSV_PATH = "backend/data/HomeC_augmented.csv"
BATCH_SIZE = 2000

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Clear only this dedicated historical-data table on re-import.
    db.query(HistoricalReading).delete()
    db.commit()

    batch = []
    count = 0

    with open(CSV_PATH, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
            breakdown_columns = [
                "Dishwasher", "Home office", "Fridge", "Wine cellar",
                "Garage door", "Barn", "Well", "Microwave",
                "Living room", "Furnace", "Kitchen",
                "Car charger [kW]", "Water heater [kW]",
                "Air conditioning [kW]", "Home Theater [kW]",
                "Outdoor lights [kW]", "microwave [kW]",
                "Laundry [kW]", "Pool Pump [kW]"
            ]

            breakdown = {
                name: float(row[name] or 0)
                for name in breakdown_columns
            }

            batch.append(
                HistoricalReading(
                    timestamp=datetime.strptime(
                        row["time"], "%Y-%m-%d %H:%M:%S"
                    ),
                    consumption_kw=float(row["use_HO"] or 0),
                    solar_generation_kw=float(row["gen_Sol"] or 0),
                    appliance_breakdown=json.dumps(breakdown)
                )
            )

            if len(batch) >= BATCH_SIZE:
                db.bulk_save_objects(batch)
                db.commit()
                count += len(batch)
                batch.clear()
                print(f"Imported {count} records")

    if batch:
        db.bulk_save_objects(batch)
        db.commit()
        count += len(batch)

    print(f"Import complete: {count} historical readings")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
