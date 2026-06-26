# Fees Domain — Analysis

**Source:** `db_current` introspection  
**Inventory:** [fees_domain_inventory.json](./fees_domain_inventory.json)  
**Tables in `apps.fees`:** 8

---

## Table inventory

| Table | PK | Rows | Cols | FKs | Depends On |
|-------|-----|------|------|-----|------------|
| `fee_groups` | `id` | 11 | 6 | 0 | — |
| `feetype` | `id` | 4 | 9 | 0 | — |
| `fee_session_groups` | `id` | 35 | 6 | 2 | `fee_groups`, `sessions` |
| `fee_groups_feetype` | `id` | 65 | 15 | 4 | `fee_session_groups`, `fee_groups`, `feetype`, `sessions` |
| `feemasters` | `id` | 0 | 9 | 3 | `sessions`, `feetype`, `classes` |
| `fees_discounts` | `id` | 1 | 10 | 1 | `sessions` |
| `fees_reminder` | `id` | 4 | 6 | 0 | — |
| `fee_receipt_no` | `id` | 0 | 2 | 0 | — |

---

## ER relationship diagram

```mermaid
erDiagram
    fee_groups ||--o{ fee_session_groups : "fee_groups_id"
    fee_groups ||--o{ fee_groups_feetype : "fee_groups_id"
    fee_session_groups ||--o{ fee_groups_feetype : "fee_session_group_id"
    feetype ||--o{ fee_groups_feetype : "feetype_id"
    feetype ||--o{ feemasters : "feetype_id"

    sessions ||--o{ fee_session_groups : "session_id"
    sessions ||--o{ fee_groups_feetype : "session_id"
    sessions ||--o{ feemasters : "session_id"
    sessions ||--o{ fees_discounts : "session_id"
    classes ||--o{ feemasters : "class_id"

    fee_session_groups ||--o{ student_fees_master : "fee_session_group_id"
    fee_groups_feetype ||--o{ student_fees_deposite : "fee_groups_feetype_id"
    fee_groups_feetype ||--o{ student_fees_processing : "fee_groups_feetype_id"
    feemasters ||--o{ student_fees : "feemaster_id"
    fees_discounts ||--o{ student_fees_discounts : "fees_discount_id"

    student_session ||--o{ student_fees_master : "student_session_id"
    student_session ||--o{ student_fees : "student_session_id"
    student_session ||--o{ student_fees_discounts : "student_session_id"

    fee_groups {
        int id PK
        varchar name
        varchar is_active
    }

    feetype {
        int id PK
        varchar type
        varchar code
        int feecategory_id
    }

    fee_session_groups {
        int id PK
        int fee_groups_id FK
        int session_id FK
        int class_id
    }

    fee_groups_feetype {
        int id PK
        int fee_session_group_id FK
        int fee_groups_id FK
        int feetype_id FK
        int session_id FK
        decimal amount
    }

    feemasters {
        int id PK
        int session_id FK
        int feetype_id FK
        int class_id FK
        float amount
    }

    fees_discounts {
        int id PK
        int session_id FK
        varchar name
        decimal amount
    }

    fees_reminder {
        int id PK
        varchar reminder_type
        int day
    }

    fee_receipt_no {
        int id PK
        int payment
    }
```

**Legend:** Solid lines = DB-enforced FKs. `class_id` on `fee_session_groups` / `fee_groups_feetype` and student tables are logical links (no DB FK). Student fee tables live in **students** app.

---

## Dependency graph

```
feetype, fee_groups (roots)
    └──► fee_session_groups (+ sessions from academics)
            └──► fee_groups_feetype (+ feetype, fee_groups, sessions)
                    └──► student_fees_deposite / student_fees_processing (students)

feemasters (+ sessions, classes, feetype) ──► student_fees (students)
fees_discounts (+ sessions) ──► student_fees_discounts (students)
fee_session_groups ──► student_fees_master (students)

fees_reminder, fee_receipt_no — standalone configuration
```

---

## Excluded tables

See [model_mapping_plan.md](./model_mapping_plan.md) — `student_fees*`, `offline_fees_payments`, `gateway_*`, accounting tables deferred.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [model_mapping_plan.md](./model_mapping_plan.md) | Table → model mapping |
| [mismatch_report.md](./mismatch_report.md) | Legacy types and naming |
| [cross_app_fk_enhancement_report.md](../cross_app_fk_enhancement_report.md) | Future ForeignKey wiring |
