import { useTheme } from '@hooks/useTheme';

/** Applies persisted theme preference on mount (no UI). */
export function ThemeInit() {
  useTheme();
  return null;
}
