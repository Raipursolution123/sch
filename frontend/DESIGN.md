# Design — School ERP

A locked design system for the School ERP application. Every page redesign
reads this file before emitting code. Do not regenerate per page — extend or
amend this file when the system needs to grow.

## Genre

modern-minimal (enterprise / operational instrument panel)

## Macrostructure family

- Marketing / public pages: restrained modern-minimal (no hero enrichment)
- App pages: Workbench — function first, no decorative enrichment
- Dashboard: Stat-Led — lead metric + worded qualifier + supporting panels
- Content / settings: Long-document rhythm within Workbench chrome

Pages within a family share the family's shape; they vary only in component
archetypes (filter bars, tables, dialogs), not theme.

## Theme

Cobalt — cool engineered paper, one electric cobalt signal accent.

| Token | Light (OKLCH) | Role |
| --- | --- | --- |
| `--paper` | `98.5% 0.004 250` | Elevated surface / cards |
| `--paper-2` | `96.5% 0.005 252` | App canvas |
| `--paper-3` | `94% 0.006 254` | Muted / secondary fill |
| `--rule` | `91% 0.008 255` | Hairline borders |
| `--ink` | `24% 0.02 258` | Primary text |
| `--ink-2` | `34% 0.018 257` | Body / secondary text |
| `--mute` | `56% 0.013 255` | Captions / meta |
| `--primary` | `58% 0.2 256` | Accent (≤5% of viewport) |
| `--graphite` | `24% 0.018 260` | One dark band per major view |

Dark mode inverts paper/ink bands; accent lightens slightly for contrast.
Source of truth: `src/assets/styles/tokens.css`.

## Typography

- Display: Space Grotesk, weight 500, roman — page titles, KPIs, section heads
- Body: Inter, weight 400/500
- Mono: JetBrains Mono — labels, IDs, timestamps, keyboard hints
- Display tracking: `-0.03em`
- Label tracking: `0.06em` (uppercase mono labels)
- Tabular nums on all numeric columns and KPIs
- No italic headers

## Spacing

4-point named scale in `tokens.css` (`--space-3xs` … `--space-2xl`).
Pages use named tokens or Tailwind spacing aliases (`p-md`, `gap-lg`), not
arbitrary pixel values.

## Radius

Tight technical radii: controls `6px` (`--radius-sm`), panels `10px`
(`--radius-panel`). Prefer hairline borders over drop shadows.

## Motion

- Easing: `--motion-ease` = `cubic-bezier(0.16, 1, 0.3, 1)`
- Durations: 150ms / 220ms / 500ms
- Animate only `transform` and `opacity`
- Default: static. Optional: KPI number tick, section fade-rise on dashboard
- Reduced motion: opacity-only ≤150ms, no transforms

## Microinteractions stance

- Silent success (no celebratory toasts)
- Errors adjacent to the action; AlertDialog for destructive actions
- Skeleton loaders for tables/lists; spinner only inside buttons
- Hover tooltip delay 800ms · focus tooltip 0ms
- Focus rings instant, never animated

## CTA voice

- Primary: solid cobalt fill, 6px radius, sentence-case label
- Secondary: outline / ghost on paper, hairline border
- Links in dense data: mono uppercase with underline-on-hover (dashboard)

## Per-page allowances

- Marketing pages MAY use light enrichment (typography-led only preferred)
- App pages MUST NOT use hero enrichment — function carries the page
- Dashboard MAY use Stat-Led hero + one graphite attention band
- Content pages: typography only

## What pages MUST share

- Wordmark / school name treatment in the shell
- Accent colour and placement (≤5% per viewport)
- Display + body + mono fonts
- Button shape, radius, padding rhythm
- Section heading rhythm (display title + muted description)
- Hairline panel language (no shadow-card default)

## What pages MAY differ on

- Macrostructure within page-type family
- Widget composition on dashboard
- Filter / table density per workflow pack

## Agent governance

- Prefer project skill `baseline-ui` (`.cursor/skills/baseline-ui`) on polish passes —
  ERP-adapted; allows DESIGN.md tracking tokens
- Prefer project skill `improve-ui` for read-only audits → `design-plans/`
- Prefer Hallmark philosophy for hierarchy, honest metrics, empty states
- Do NOT import Hallmark landing macrostructures (Marquee, Letter, Manifesto)
- Do NOT invent KPIs or proof stats
- UI PRs: `docs/UI_PR_CHECKLIST.md` · Quarterly: `docs/UI_QUARTERLY_AUDIT.md`
- Cursor rule: `.cursor/rules/school-erp-ui.mdc` (frontend globs)

## Exports

See `tokens.css` (portable) and `src/assets/styles/tokens.css` (runtime).
