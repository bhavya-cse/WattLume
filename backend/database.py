import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

# Load local Neon settings for development.
# Render will provide DATABASE_URL through its environment variables.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local", override=False)
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Use psycopg 3 with SQLAlchemy for PostgreSQL.
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgres://", "postgresql+psycopg://", 1
        )
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://", "postgresql+psycopg://", 1
        )

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

else:
    # Preserve the existing local SQLite database.
    DB_DIR = Path(__file__).resolve().parent
    DATABASE_PATH = Path(
        os.getenv("WATTLUME_DB_PATH", str(DB_DIR / "wattlume.db"))
    ).resolve()

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    engine = create_engine(
        f"sqlite:///{DATABASE_PATH}",
        connect_args={
            "check_same_thread": False,
            "timeout": 30,
        },
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.close()


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
