# Students Domain — Mismatch Report

Comparison of initial assumptions vs `db_current` introspection.

---

## Schema mismatches (corrected)

| Assumption | db_current reality | Resolution |
|------------|-------------------|------------|
| Single `Student` model with UUID PK | `students.id` int auto_increment | `Students` with `AutoField` |
| Normalized parent as FK | `parent_id` int, no FK constraint | `IntegerField` |
| `category_id` as FK | `varchar(100)` on `students` | `CharField(max_length=100)` |
| `is_active` boolean | `varchar(255)` default `'yes'` | `CharField` |
| Unified timestamps | `created_at` timestamp, `updated_at` **date** | Separate field types |
| `student_session` optional alumni flag | `is_alumni` int **NOT NULL** | `IntegerField()` no default in ORM |
| Table `student_attendance` | **`student_attendences`** (legacy spelling) | Exact table name preserved |
| Online admissions in students app | Separate **`admissions`** domain (approved) | Excluded from `apps.students` |

---

## No mismatches found (verified)

| Table | Columns verified against `DESCRIBE` / `SHOW CREATE TABLE` |
|-------|----------------------------------------------------------|
| `students` | 62 columns — full match in `models/students.py` |
| `student_session` | 22 columns — full match in `models/student_session.py` |
| `disable_reason` | 3 columns — full match |

---

## Django ORM vs DB constraints

| Item | ORM | Database | Impact |
|------|-----|----------|--------|
| `student_session` FKs | `IntegerField` (interim) | FK to sessions, classes, sections, vehicle_routes, route_pickup_point, hostel_rooms | No migration impact (`managed=False`). Add `ForeignKey` when cross-app models exist. |
| `students` FKs | None declared | No FK constraints on `students` | Correct — mirrors DB |
| `dis_reason` | `IntegerField` | No FK to `disable_reason` | Legacy int reference — not enforced in DB |

---

## Domain boundary mismatches

| Table | Auto-classifier | Approved domain |
|-------|----------------|-----------------|
| `student_attendences*` | students | students (data) + attendance types in `attendance` app |
| `student_fees*` | students / fees | **Split:** fee processing tables may move to `fees` app after review |
| `online_admissions*` | unclassified | **admissions** (excluded from students app) |

**Recommendation:** Keep `student_fees*` in `students` for now (student-centric fee rows); `fees_master` / gateway tables belong in `fees` app when mapped.

---

## Auth linkage mismatch (cross-domain)

| Field | Meaning |
|-------|---------|
| `users.user_id` | For `role=student`, equals `students.id` (3,641/3,641) |
| `student_session.default_login` | int flag — likely marks active login session for multi-session students |

No schema change required — document in services layer.

---

## Actions taken

- [x] Core models use exact names and types
- [x] `managed=False` on all student models
- [x] No migrations generated
- [ ] Remaining 18 tables — generate from inventory (next step)
- [ ] Resolve `student_fees*` app ownership with your approval
