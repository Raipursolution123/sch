# Fees Domain — Mismatch Report

Comparison of common ERP assumptions vs `db_current` introspection.

---

## Schema mismatches (assumptions vs reality)

| Assumption | db_current reality | Resolution |
|------------|-------------------|------------|
| Table `fee_types` | **`feetype`** (singular, no underscore) | Model `Feetype`, `db_table='feetype'` |
| Table `fee_masters` | **`feemasters`** (no underscore) | Model `Feemasters` |
| Boolean `is_active` | `varchar(10)` default `'no'` on most tables | `CharField` |
| `fees_reminder.is_active` | `int(11)` default `0` | `IntegerField` |
| `fee_receipt_no.payment` FK | `int(11)` **no FK constraint** | `IntegerField()` — logical receipt counter |
| `fee_session_groups.class_id` | int, **no DB FK** to `classes` | `IntegerField` — logical class scope |
| `fee_groups_feetype.class_id` | int, **no DB FK** | `IntegerField` — legacy denormalization |
| `fee_groups_feetype.parent_id` | int, **no FK** | Self-reference not enforced in DB |
| `feetype.feecategory_id` | int, **no FK** | `IntegerField` — category table not in fees phase |
| Unified timestamps | `created_at` timestamp; `feemasters.updated_at` is **date** | Separate field types |
| Amount types | mix of `decimal(10,2)` and `float(10,2)` | `DecimalField` vs `FloatField` per column |

---

## Legacy naming

| Item | Notes |
|------|-------|
| `feetype` | Not `fee_type` or `feetypes` |
| `feemasters` | Not `fee_masters` |
| `student_fees_deposite` | Misspelling in students app (deposit) |
| `fee_groups_feetype` | Junction naming — links group + session group + feetype |

---

## Non-standard types

| Table | Column | MySQL type | Django field |
|-------|--------|------------|--------------|
| `fee_groups_feetype` | `amount` | `decimal(10,2)` | `DecimalField(max_digits=10, decimal_places=2)` |
| `fees_discounts` | `amount` | `decimal(10,2)` | `DecimalField` |
| `fee_groups_feetype` | `fine_percentage`, `fine_amount` | `float(10,2)` | `FloatField` |
| `feemasters` | `amount` | `float(10,2)` | `FloatField` |

---

## Nullable / default quirks

| Table | Column | Notes |
|-------|--------|-------|
| `fee_groups` | `created_at` | `ON UPDATE CURRENT_TIMESTAMP` |
| `fee_groups_feetype` | `fine_type` | NOT NULL default `'none'` |
| `fee_groups_feetype` | `collection_type` | NOT NULL int, no default in DB |
| `fees_reminder` | `is_active` | int flag, not varchar |
| `feetype` | `code` | NOT NULL |
| `feemasters` | `feetype_id` | NOT NULL (required link) |

---

## Varchar boolean flags

| Table | Column | Type | Default |
|-------|--------|------|---------|
| `fee_groups` | `is_active` | varchar(10) | `'no'` |
| `fee_session_groups` | `is_active` | varchar(10) | `'no'` |
| `fee_groups_feetype` | `is_active` | varchar(10) | `'no'` |
| `feemasters` | `is_active` | varchar(255) | `'no'` |
| `fees_discounts` | `is_active` | varchar(10) | `'no'` |
| `feetype` | `is_active` | varchar(255) | `'no'` |

---

## Unusual constraints

| Item | Notes |
|------|-------|
| `fee_groups_feetype` | 4 DB FKs — hub table for fee structure |
| `fee_receipt_no` | 2 columns only; `payment` is last receipt number, not a payment row FK |
| `feemasters` | 0 rows in db_current — legacy per-class fee master (superseded by fee_groups flow) |
| CASCADE deletes | FKs on `fee_groups_feetype` use `ON DELETE CASCADE` to parent fee tables |

---

## Domain boundary

| Table | Classifier | Approved placement |
|-------|------------|-------------------|
| `student_fees*` | student prefix | **students** (transaction data) |
| `offline_fees_payments`, `gateway_*` | fee prefix | **fees extension** (not this phase) |
| `transport_feemaster` | transport | **transport** app |

---

## Actions taken

- [x] 8 core fee tables mapped with exact schema
- [x] `managed=False`, no migrations
- [x] Cross-app FK enhancement candidates documented separately
- [ ] Payment gateway / offline payment tables (future phase)
- [ ] Optional `ForeignKey` wiring (deferred)
