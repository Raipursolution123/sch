from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
SEEDS_DIR = BACKEND_ROOT / "seeds"
SCHEMA_SQL = SEEDS_DIR / "schema.sql"
BASIC_SEED_SQL = SEEDS_DIR / "basic_seed.sql"

EXPECTED_BUSINESS_TABLES = 280
