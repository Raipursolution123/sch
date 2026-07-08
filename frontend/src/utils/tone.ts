import { cn } from '@utils/cn';

/** Semantic color tones used across dashboard and admin UI. */
export type SoftTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'violet'
  | 'teal'
  | 'brown';

export const softToneIconBg: Record<SoftTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
  violet: 'bg-violet-100 text-violet-700',
  teal: 'bg-teal-100 text-teal-700',
  brown: 'bg-amber-100 text-amber-800',
};

export const softToneIconBgHover: Record<SoftTone, string> = {
  primary: 'group-hover:bg-primary/15',
  success: 'group-hover:bg-success/15',
  warning: 'group-hover:bg-warning/15',
  danger: 'group-hover:bg-destructive/15',
  neutral: 'group-hover:bg-muted/80',
  violet: 'group-hover:bg-violet-200',
  teal: 'group-hover:bg-teal-200',
  brown: 'group-hover:bg-amber-200',
};

export const softToneAccentBar: Record<SoftTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground/40',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  brown: 'bg-amber-700',
};

export function toneIconClasses(tone: SoftTone, hover = false): string {
  return cn(softToneIconBg[tone], hover && softToneIconBgHover[tone]);
}
