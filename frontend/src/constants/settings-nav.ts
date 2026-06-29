import { ROUTES } from './routes';

export interface SettingsNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Settings links in the main sidebar. */
export const SETTINGS_NAV: SettingsNavItem[] = [
  { label: 'Academic Session', path: ROUTES.settings.sessions },
  { label: 'General Settings', path: ROUTES.settings.general },
  { label: 'Languages', path: ROUTES.settings.languages },
  { label: 'Currency', path: ROUTES.settings.currency },
  { label: 'Notification', disabled: true },
  { label: 'SMS', disabled: true },
  { label: 'Email', disabled: true },
];
