# Legacy Analysis — Business Knowledge Base

Documents in this folder are **business reference material** reverse-engineered from the legacy Smart School ERP. They are **not** implementation specifications.

## Database contract (read first)

**The database schema is frozen.** The legacy database is the contract.

The new ERP **must** preserve: same tables, same inserts, same updates, same delete behavior, same business flow, and same database ownership.

Do **not** redesign the database, add business tables, replace tables with configuration tables, or move business state off the existing data model. Configuration belongs only at the **application layer**.

Full rules and per-feature checklist: **[database-contract.md](./database-contract.md)**

## How to use

When implementing a module:

1. Read **[database-contract.md](./database-contract.md)** and the relevant module document below.
2. Extract business rules, validations, workflows, DB behavior, and dependencies.
3. Preserve business behavior in the new React + Django stack **with identical legacy table read/write semantics**.
4. Do **not** copy legacy UI, controllers, code structure, or DB access patterns.

## Document index

| Document | Scope |
|----------|--------|
| [database-contract.md](./database-contract.md) | **Frozen schema rules** — tables, CRUD semantics, what not to do |
| [navigation-and-sitemap.md](./navigation-and-sitemap.md) | Admin/student/public portals, permissions, routes, tables, CRUD, dependencies |

## Related technical docs

Schema and domain mapping live under `docs/database/` (frozen schema, model mapping, dependency reports).
