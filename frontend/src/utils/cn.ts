/**
 * Shared utility functions.
 * Add helpers here as the project grows.
 */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
