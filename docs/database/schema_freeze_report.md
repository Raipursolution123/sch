# Schema Freeze Report

**Generated:** 2026-06-25 14:28 UTC
**Status:** SCHEMA FROZEN — development phase may begin

## Executive summary

- **db_current tables:** 280
- **Django models with `db_table`:** 280
- **Coverage:** 280/280 (100.0%)
- **Unmapped tables:** 0
- **Cross-domain FK edges:** 140
- **Django apps registered:** 22 (`LOCAL_APPS` in `config/settings/base.py`)

## Freeze confirmations

- [PASS] All db_current tables assigned to exactly one domain
- [PASS] Every assigned table has a Django model
- [PASS] No orphan models outside assignment
- [PASS] All models use `managed = False`
- [PASS] All models use exact `db_table` names
- [PASS] No schema modifications planned
- [PASS] No migrations for legacy tables
- [PASS] Frozen domains unchanged (accounts, students, academics, staff, attendance, fees, examinations)

## Domain coverage

| Domain | Tables | Mapped | App |
|--------|--------|--------|-----|
| accounts | 11 | 11 | `accounts` |
| students | 21 | 21 | `students` |
| academics | 22 | 22 | `academics` |
| staff | 16 | 16 | `staff` |
| attendance | 1 | 1 | `attendance` |
| fees | 16 | 16 | `fees` |
| examinations | 45 | 45 | `examinations` |
| library | 3 | 3 | `library` |
| transport | 6 | 6 | `transport` |
| hostel | 2 | 2 | `hostel` |
| admissions | 4 | 4 | `admissions` |
| lms | 14 | 14 | `lms` |
| settings | 18 | 18 | `settings` |
| communications | 21 | 21 | `communications` |
| cms | 9 | 9 | `cms` |
| inventory | 6 | 6 | `inventory` |
| front_office | 7 | 7 | `front_office` |
| documents | 4 | 4 | `documents` |
| shared | 7 | 7 | `shared` |
| alumni | 2 | 2 | `alumni` |
| hr | 2 | 2 | `staff` |
| cyc_extensions | 35 | 35 | `cyc_extensions` |
| system | 8 | 8 | `system` |

## Frozen domain policy

The following domains are **frozen**. No model renames, field renames, type changes, or `db_table` changes without explicit approval:

- accounts, students, academics, staff, attendance, fees, examinations

## Development gate

With 100% schema coverage confirmed, the project may proceed to:

1. Cross-app FK enhancements (ORM-only, per `cross_app_fk_enhancement_report.md`)
2. API layer (DRF viewsets/routers per domain)
3. Service layer (business logic)
4. Serializers and validation
5. Frontend modules

**Database remains source of truth.** No new tables or schema changes without a formal migration project.

## Regenerate

```bash
backend/.venv/Scripts/python.exe backend/scripts/update_schema_completion_tracker.py
backend/.venv/Scripts/python.exe backend/scripts/generate_final_schema_reports.py
backend/.venv/Scripts/python.exe backend/manage.py check
```