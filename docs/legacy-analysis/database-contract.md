# Database Contract (Frozen Schema)

**Status:** NON-NEGOTIABLE — applies to every module, API, and feature.

The legacy database is the **contract**. The new ERP is a new application layer on top of the **same** data model. Future data migration depends on identical read/write behavior with the legacy ERP.

---

## MUST preserve

| Area | Requirement |
|------|-------------|
| **Tables** | Use existing tables only. Same names (`db_table`), columns, types, nullability, defaults, indexes, and FK relationships as `db_current`. |
| **Inserts** | New records must match legacy insert semantics (required fields, defaults, side effects, related rows). |
| **Updates** | Field updates must follow legacy rules (what can change, when, and what cascades). |
| **Deletes** | Soft delete, hard delete, and cascade behavior must match legacy (including “cannot delete when referenced”). |
| **Business flow** | Workflows (e.g. fee collection → receipt → ledger post, promotion → `student_session`) must produce the same DB outcomes. |
| **Ownership** | Business data lives in legacy tables; the new stack does not take ownership away from the existing schema. |

---

## MUST NOT do

- **Redesign the database** — no new normalized schema, no “clean” replacements for legacy tables.
- **Introduce new business tables** — no parallel stores for entities already modeled (e.g. a new `app_students` table).
- **Replace tables with configuration tables** — do not move business state into JSON/config tables that did not exist in legacy.
- **Move business logic off the data model** — aggregates, statuses, and relationships stay where legacy stores them.
- **Change `managed` models to create migrations** against legacy tables — models remain `managed = False`; see [schema freeze report](../database/schema_freeze_report.md).

---

## Where configuration belongs

**Application layer only:**

- UI defaults, feature flags, API validation messages
- React routes, nav, theme
- Django settings, env vars, caching
- Service-layer orchestration **that still reads/writes legacy tables correctly**

RBAC, session context, and “active academic year” are resolved in the app but **persist using existing tables** (`roles`, `sessions`, `sch_settings`, etc.).

---

## Implementation checklist (every feature)

Before merging any feature that touches data:

1. **Tables** — List every legacy table read or written; confirm models exist with correct `db_table`.
2. **Writes** — Compare insert/update/delete paths to legacy analysis docs (or legacy behavior when documented).
3. **Side effects** — Receipt numbers, balances, session links, audit rows: same as legacy.
4. **No new tables** — If tempted to add a table, use an existing one or app-layer state only.
5. **Migration safety** — Would a row written by the new ERP be valid if read by legacy PHP? If no, fix before ship.

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [schema_freeze_report.md](../database/schema_freeze_report.md) | 280 tables, 100% Django mapping, freeze status |
| [database-first-architecture.md](../database-first-architecture.md) | `db_current` → models → API → frontend |
| [domain_mapping.md](../database/domain_mapping.md) | Table → Django app assignment |
| [navigation-and-sitemap.md](./navigation-and-sitemap.md) | Screens → permission keys → **primary tables** |

---

## Summary

```
Legacy DB = contract
New ERP   = new UI + new API + new code structure
            SAME tables, SAME writes, SAME business outcomes
```

When in doubt: **preserve legacy DB behavior; modernize only the application layer.**
