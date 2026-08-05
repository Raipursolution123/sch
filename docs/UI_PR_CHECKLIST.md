# UI PR checklist

Use for pull requests that change `school/frontend` visuals, layout, or shared UI
primitives. Paste into the PR body or tick here before request for review.

## Design contract

- [ ] Change matches `frontend/DESIGN.md` (Cobalt, Workbench / Stat-Led family)
- [ ] No new theme, accent, or display font outside the contract
- [ ] `.hallmark/log.json` updated if this is a deliberate design-system pass

## Tokens & anti-slop

- [ ] No raw Tailwind greys (`gray-*`, `slate-*`, `zinc-*`, `neutral-*`)
- [ ] No purple / multicolor gradients, glow affordances, or card-in-card nesting
- [ ] Hairline borders preferred; no new default shadow-card language
- [ ] Accent usage still ≤ ~5% of the viewport

## Components & states

- [ ] Reused existing primitives / workflow packs where possible
- [ ] Interactive controls cover the eight states (via variants or documented gaps)
- [ ] Destructive flows use `ConfirmDialog` (not `window.confirm`)
- [ ] Empty states have one clear next action

## Accessibility

- [ ] Icon-only buttons have `aria-label`
- [ ] Form fields use visible labels (`FormField` / stable `id`)
- [ ] Focus-visible rings remain intact (`outline: none` only with replacement)

## Verification

- [ ] `npm run typecheck` (from `frontend/`)
- [ ] Spot-check light + dark if the surface uses theme tokens
- [ ] Optional: `/baseline-ui` polish pass; `/improve-ui` audit for larger refactors
