/**
 * Enterprise ERP design rules — Wise-inspired visual DNA, productivity-first.
 * Priority: Usability → Speed → Consistency → Scalability → Visual polish.
 */
export const DESIGN_PRIORITY = [
  'usability',
  'speed',
  'consistency',
  'scalability',
  'visualPolish',
] as const;

/** One primary green CTA per view (Save, Collect, Mark, etc.). */
export const PRIMARY_CTA_POLICY =
  'Use primary green for the single main action per screen. Do not use primary as success/status.';

/** Success states use semantic success tokens, not brand primary. */
export const SUCCESS_COLOR_POLICY =
  'Status success = success token. Brand green = primary CTA only.';

export const MOTION_MS = {
  fast: 150,
  base: 200,
  slow: 250,
} as const;

/** Current design system version — bump on breaking primitive changes. */
export const DESIGN_SYSTEM_VERSION = '0.6.0';

/** Patterns banned in feature code — enforced by ds:audit and code review. */
export const DESIGN_SYSTEM_BAN_LIST = [
  'Raw hex/rgb/hsl colors in feature components (use tokens.css / Tailwind theme)',
  'One-off HTML <table> in list screens (use DataTable)',
  'Custom modal/dialog engines (use Radix/shadcn Dialog or Drawer)',
  'Custom tooltip/popover engines (use Radix/shadcn)',
  'Primary green for success/status chips (use semantic success token)',
  'Motion longer than 250ms for UI transitions',
  'Unthemed third-party widgets without token wrapper',
] as const;

/** Checklist for proposing a new shared component (RFC). */
export const CONTRIBUTION_RFC_CHECKLIST = [
  'Maps to existing design tokens (no new raw colors)',
  'Supports compact and comfortable density where applicable',
  'Keyboard accessible with visible focus ring',
  'AA contrast for text and interactive states',
  'Documented in DESIGN_SYSTEM_CHANGELOG.md',
  'At least one pilot module migrated before general availability',
] as const;
