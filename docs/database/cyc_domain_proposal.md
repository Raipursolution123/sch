# cyc_* Domain Proposal

**Status:** Analysis only — **do not create app yet**  
**Source:** `docs/database/cyc_domain_analysis.json`  
**Table count:** 35 `cyc_*` tables

---

## Summary

`cyc_*` tables are **school-specific custom extensions** layered on top of the core ERP. They have:

- **No declared foreign keys** to other tables (all `foreign_keys: []` in schema)
- **Integer ID columns** referencing core entities by convention (`class_id`, `staff_id`, `session_id`, etc.)
- **Mixed functional areas** under one prefix

---

## Functional Clusters

| Cluster | Tables | Row count (sample) |
|---------|--------|-------------------|
| **Finance / ledger** | `cyc_entries`, `cyc_entryitems`, `cyc_entrytypes`, `cyc_ledgers`, `cyc_fee_head_ledger` | 2,343 / 4,686 / 4 / 117 |
| **Leads / CRM** | `cyc_leads`, `cyc_leads_counsellor`, `cyc_leads_followup`, `cyc_leads_followup_status` | 4 / 4 / 14 / 6 |
| **Scholarships** | `cyc_scheme_and_scholarship*`, `cyc_student_addon_fee` | 5+ tables |
| **PTM** | `cyc_ptm`, `cyc_ptm_schedule`, `cyc_ptm_attendance`, `cy_ptm_time_slot` | mostly empty |
| **Transport** | `cyc_vehicle_*`, `cy_vehicle_ticket`, `cyc_fuel_refill` | mostly empty |
| **Hostel** | `cyc_hostel_room_bed` | 9 rows |
| **Exam grouping** | `cyc_advance_exam_group`, `cyc_groups` | 6 / 38 |
| **Staff / coordination** | `cyc_additional_section_teacher`, `cyc_class_coordinator` | 1 / 10 |
| **Biometric** | `cyc_biometric_events` | 0 |
| **Campaign** | `cyc_campaign`, `cyc_campaign_time` | 2 / 36 |
| **Misc** | `cyc_holiday`, `cyc_logs`, `cyc_tags` | — |

---

## Logical Dependencies (by column convention, not FK)

| cyc table | Implied dependency |
|-----------|-------------------|
| `cyc_entries` / `cyc_entryitems` | `sessions`, fee types, students |
| `cyc_ledgers` | finance / fees domain |
| `cyc_leads*` | admissions / CRM |
| `cyc_additional_section_teacher` | `classes`, `sections`, `staff`, `sessions` |
| `cyc_advance_exam_group` | examinations |
| `cyc_scheme_and_scholarship_student` | students, fees |

---

## Proposed Domain

| Field | Recommendation |
|-------|----------------|
| **Proposed app name** | `cyc_extensions` (or `school_extensions`) |
| **When to create** | After core domains mapped: students, staff, fees, academics, examinations |
| **Grouping** | Single bounded-context app with submodules: `ledger/`, `leads/`, `scholarships/`, `ptm/` |
| **managed** | `False` for all existing tables |

### Rationale

- Tables share `cyc_` prefix but span multiple business areas — splitting into 5+ apps would be excessive.
- No FK constraints means Django models use `IntegerField` + services for joins until core apps exist.
- 35 tables is manageable as one extension app with internal module organization.

### Prerequisites before implementation

1. `students`, `staff`, `fees`, `academics`, `sessions` models mapped
2. Manual review of `cyc_entries` / `cyc_ledgers` business logic with domain expert
3. Your approval of app name and scope

---

## Do NOT

- Create `cyc` app in this phase
- Merge `cyc_*` into students/fees without business review
- Add foreign keys or alter schema
