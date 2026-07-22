import { ROUTES } from './routes';

export interface SettingsNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Settings links in the main sidebar. */
export const SETTINGS_NAV: SettingsNavItem[] = [
  { label: 'Academic Session', path: ROUTES.academics.sessions },
  { label: 'General Settings', path: ROUTES.settings.general },
  { label: 'Languages', path: ROUTES.settings.languages },
  { label: 'Currency', path: ROUTES.settings.currency },
  { label: 'Notification Settings', path: ROUTES.settings.notifications },
  { label: 'SMS Settings', path: ROUTES.settings.sms },
  { label: 'Email Settings', path: ROUTES.settings.email },
  { label: 'Print Header/Footer', path: ROUTES.settings.printHeaderFooter },
  { label: 'Payment Methods', path: ROUTES.settings.paymentMethods },
  { label: 'Roles & Permissions', path: ROUTES.settings.roles },
];
