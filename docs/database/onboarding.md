# Developer Onboarding

Simple three-step setup for a new School ERP database. No production automation in this phase.

## Prerequisites

- MySQL database (local or Docker)
- Python 3.12 + backend dependencies

## Step 1 — Apply frozen schema

Creates all **280 business tables** (structure only).

```bash
mysql -u USER -p DATABASE < backend/seeds/schema.sql
```

Docker example:

```bash
docker compose -f docker-compose.dev.yml exec -T mysql \
  mysql -u school_erp -pschool_erp school_erp < backend/seeds/schema.sql
```

## Step 2 — Load basic product seed

Loads reusable ERP metadata (roles, permissions, sidebar, languages, currencies, etc.).

**Does not** include school-specific data (`sch_settings`, `staff`, students, fees, etc.).

```bash
mysql -u USER -p DATABASE < backend/seeds/basic_seed.sql
```

## Step 3 — Initialize the school

Creates:

- `sch_settings` (id=1)
- one academic session (Indian format, e.g. `2026-27`)
- Super Admin `staff` + `staff_roles` (role id 7)

```bash
cd backend
python manage.py initial_setup \
  --school-name "Demo Public School" \
  --school-email office@demo.com \
  --admin-email admin@demo.com \
  --admin-password "Admin@123"
```

All options have dev-friendly defaults. Run without flags for a quick demo setup.

If `sch_settings` already exists, the command exits safely.

## Check status

```bash
python manage.py check_onboarding
```

Or HTTP:

- `GET /health/` — process alive
- `GET /health/ready/` — DB + schema + seed + school initialization

## Regenerate SQL from legacy dump

When `docs/db_current.sql` changes:

```bash
cd backend
python scripts/extract_onboarding_sql.py
```

Outputs:

- `backend/seeds/schema.sql`
- `backend/seeds/basic_seed.sql`

## Default demo values

| Item | Default |
|------|---------|
| School | Demo Public School |
| Admin email | admin@demo.com |
| Password | Admin@123 |
| Language | English |
| Currency | INR |
| Session | Current Indian academic year (April–March) |

## Docker quick path

```bash
docker compose -f docker-compose.dev.yml up -d mysql
docker compose -f docker-compose.dev.yml exec -T mysql mysql -u school_erp -pschool_erp school_erp < backend/seeds/schema.sql
docker compose -f docker-compose.dev.yml exec -T mysql mysql -u school_erp -pschool_erp school_erp < backend/seeds/basic_seed.sql
docker compose -f docker-compose.dev.yml run --rm backend python manage.py initial_setup
docker compose -f docker-compose.dev.yml up backend frontend
```

On startup, the backend prints onboarding guidance if any step is missing.
