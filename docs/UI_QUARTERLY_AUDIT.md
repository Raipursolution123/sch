# Quarterly UI audit

Run about once per quarter (or after a large module wave). Goal: catch DESIGN.md
drift and AI-slop tells before they spread. This is a governance ritual — not a
feature phase.

## Setup

1. Pick 3–5 high-traffic surfaces (e.g. Dashboard, Students list, Fee collect,
   Attendance mark grid, Settings general).
2. Open `frontend/DESIGN.md` and this checklist.
3. Prefer skill `/improve-ui` for evidence-gated findings (read-only →
   `design-plans/`). Use `/baseline-ui <file>` for quick violation lists.
4. Record date, auditor, surfaces, and outcomes in the log at the bottom.

## Anti-pattern scan (ERP-adapted)

Flag if present on an app/Workbench page:

| Tell | Pass criteria |
| --- | --- |
| Purple / multicolor gradient hero or CTA | Absent |
| Raw `gray-*` / `slate-*` / `zinc-*` classes | Absent (semantic tokens only) |
| Card-in-card nesting | Single containment layer |
| Thick coloured side-stripe cards | Hairline borders only |
| Gradient clipped headlines | Solid ink / display weight |
| Inter used as display | `font-display` (Space Grotesk) on titles/KPIs |
| Invented KPI / proof stats | Metrics from real API fields only |
| Hallmark landing macros (Marquee, Letter, Manifesto) | Not on app pages |
| `window.confirm` | Replaced by `ConfirmDialog` |
| Icon button without `aria-label` | Labeled |

## Eight-state spot check

For one primary control per surface (submit, row action, or filter):

Default · Hover · Focus-visible · Active · Disabled · Loading · Error · Success

Note gaps; prefer fixing via shared primitives over page-local CSS.

## Token drift

- [ ] New colours introduced outside `tokens.css` / DESIGN.md?
- [ ] New radii / shadows that fight `rounded-panel` / hairline language?
- [ ] Dark mode broken on touched surfaces?

## Output

1. Up to **three** supported findings (improve-ui style).
2. Optional plans under `design-plans/`.
3. If systemic: amend `DESIGN.md` deliberately, then log in `.hallmark/log.json`.

## Audit log

| Date | Auditor | Surfaces | Findings | Follow-up |
| --- | --- | --- | --- | --- |
| 2026-07-25 | Phase 13 bootstrap | — | Governance artifacts added; first full audit TBD | Schedule next quarter |
