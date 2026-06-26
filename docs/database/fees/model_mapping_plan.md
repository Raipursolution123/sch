# Fees Domain — Model Mapping Plan

**App:** `apps.fees`  
**Status:** Complete (8/8 tables mapped)  
**All models:** `managed = False`

| Table | Model class | Model file | Rows | Status |
|-------|-------------|------------|------|--------|
| `fee_groups` | `FeeGroups` | `models/fee_groups.py` | 11 | Mapped |
| `feetype` | `Feetype` | `models/feetype.py` | 4 | Mapped |
| `fee_session_groups` | `FeeSessionGroups` | `models/fee_session_groups.py` | 35 | Mapped |
| `fee_groups_feetype` | `FeeGroupsFeetype` | `models/fee_groups_feetype.py` | 65 | Mapped |
| `feemasters` | `Feemasters` | `models/feemasters.py` | 0 | Mapped |
| `fees_discounts` | `FeesDiscounts` | `models/fees_discounts.py` | 1 | Mapped |
| `fees_reminder` | `FeesReminder` | `models/fees_reminder.py` | 4 | Mapped |
| `fee_receipt_no` | `FeeReceiptNo` | `models/fee_receipt_no.py` | 0 | Mapped |

## Dependency order (within fees app)

```
fee_groups ──┬──► fee_session_groups ──► fee_groups_feetype ◄── feetype
             │                              ▲
             └──────────────────────────────┘
feemasters ◄── feetype (+ sessions, classes via academics)
fees_discounts (+ sessions via academics)
fees_reminder, fee_receipt_no — standalone config
```

## Excluded (future phases / other apps)

| Table | Placement | Notes |
|-------|-----------|-------|
| `student_fees*` | students | Student fee transaction data |
| `offline_fees_payments` | fees extension | Payment records |
| `gateway_ins*` | fees extension | Payment gateway |
| `payment_settings` | fees extension | Gateway config |
| `expense_*`, `income*` | fees extension | Accounting |
| `transport_feemaster` | transport | Transport fee master |

## Cross-domain references

### Fees → academics (DB FK enforced)

| Fees table | Column | Target |
|------------|--------|--------|
| `fee_session_groups` | `session_id` | `sessions` |
| `fee_groups_feetype` | `session_id` | `sessions` |
| `feemasters` | `session_id`, `class_id` | `sessions`, `classes` |
| `fees_discounts` | `session_id` | `sessions` |

### Students → fees (DB FK enforced)

| Students table | Column | Fees target |
|----------------|--------|-------------|
| `student_fees` | `feemaster_id` | `feemasters` |
| `student_fees_master` | `fee_session_group_id` | `fee_session_groups` |
| `student_fees_deposite` | `fee_groups_feetype_id` | `fee_groups_feetype` |
| `student_fees_processing` | `fee_groups_feetype_id` | `fee_groups_feetype` |
| `student_fees_discounts` | `fees_discount_id` | `fees_discounts` |

FK columns use `IntegerField` + `db_index` until cross-app `ForeignKey` wiring is approved. See [cross_app_fk_enhancement_report.md](../cross_app_fk_enhancement_report.md).

## Regeneration

```bash
cd backend
python scripts/introspect_fees_domain.py
python scripts/generate_fees_models.py
```
