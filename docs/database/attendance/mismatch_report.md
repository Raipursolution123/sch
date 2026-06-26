# Attendance Domain — Mismatch Report

Comparison of common assumptions vs `db_current` introspection.

---

## Schema mismatches (assumptions vs reality)

| Assumption | db_current reality | Resolution |
|------------|-------------------|------------|
| Table `attendance_type` | **`attendence_type`** (legacy spelling) | Exact table name preserved |
| Boolean `is_active` | `varchar(255)` default `'no'` | `CharField(max_length=255, default='no')` |
| Unified timestamps | `created_at` timestamp, `updated_at` **date** | Separate field types |
| Attendance domain includes student rows | **`student_attendences*`** in students app | Excluded; only lookup table in attendance app |
| Staff uses same type table | **`staff_attendance_type`** separate table | Staff domain; different schema |
| Single attendance app for all tables | 1 core + 4 student fact + 2 staff tables | Split by domain ownership |

---

## Legacy naming

| Item | Notes |
|------|-------|
| `attendence` / `attendence_type` | Consistent misspelling across student tables (`biometric_attendence`, `attendence_type_id`) |
| `student_attendences` | Plural misspelling preserved in students app |

---

## Non-standard types

| Table | Column | MySQL type | Django field |
|-------|--------|------------|--------------|
| `attendence_type` | `is_active` | `varchar(255)` | `CharField` |
| `attendence_type` | `created_at` | `timestamp ON UPDATE CURRENT_TIMESTAMP` | `DateTimeField` |
| `attendence_type` | `updated_at` | `date` nullable | `DateField` |

---

## Nullable quirks

| Column | Nullable | Default | Notes |
|--------|----------|---------|-------|
| `type` | Yes | NULL | Display label optional |
| `key_value` | No | — | Machine key required |
| `is_active` | Yes | `'no'` | Varchar flag |
| `created_at` | No | `CURRENT_TIMESTAMP` | Auto-updates on row change |
| `updated_at` | Yes | NULL | Date-only companion field |

---

## Unusual constraints

| Item | Notes |
|------|-------|
| No FKs on `attendence_type` | Leaf lookup table; consumers reference it |
| No unique on `key_value` | Duplicates possible at DB level — validate in services |
| 6 seed rows | Present, `AUTO_INCREMENT=7` |

---

## Django ORM vs DB

| Item | ORM | Database | Impact |
|------|-----|----------|--------|
| Student `attendence_type_id` | `IntegerField` (interim) | FK to `attendence_type` | No migration impact (`managed=False`) |
| `created_at` default | Not set in ORM | DB `DEFAULT CURRENT_TIMESTAMP` | Inserts rely on DB default |

---

## Actions taken

- [x] `attendence_type` mapped with exact schema
- [x] `managed=False`, no migrations
- [x] Student/staff attendance tables documented as excluded
- [ ] Optional `ForeignKey` from students → attendance (deferred)
