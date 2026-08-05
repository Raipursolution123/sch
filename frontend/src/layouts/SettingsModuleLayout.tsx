import {
  ModuleSubNavLayout,
  type ModuleNavGroup,
  type ModuleNavItem,
} from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

/** Grouped settings sub-nav — General / Academic / Communication / System / Security. */
export const SETTINGS_MODULE_NAV: ModuleNavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'General', path: ROUTES.settings.general },
      { label: 'Languages', path: ROUTES.settings.languages },
      { label: 'Currency', path: ROUTES.settings.currency },
      { label: 'Payment methods', path: ROUTES.settings.paymentMethods },
      { label: 'Print header', path: ROUTES.settings.printHeaderFooter },
    ],
  },
  {
    label: 'Academic',
    items: [
      { label: 'Online admission', path: ROUTES.settings.onlineAdmission },
      { label: 'System fields', path: ROUTES.settings.systemFields },
      { label: 'Custom fields', path: ROUTES.settings.customFields },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Notifications', path: ROUTES.settings.notifications },
      { label: 'SMS', path: ROUTES.settings.sms },
      { label: 'Email', path: ROUTES.settings.email },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Modules', path: ROUTES.settings.modules },
      { label: 'Sidebar menu', path: ROUTES.settings.sidebarMenu },
      { label: 'Backup', path: ROUTES.settings.backup },
      { label: 'File types', path: ROUTES.settings.fileTypes },
      { label: 'Captcha', path: ROUTES.settings.captcha },
    ],
  },
  {
    label: 'Security',
    items: [
      { label: 'Roles', path: ROUTES.settings.roles },
      { label: 'Users', path: ROUTES.settings.users },
    ],
  },
];

/** Flat list for callers that need every settings path. */
export const SETTINGS_MODULE_NAV_FLAT: ModuleNavItem[] = SETTINGS_MODULE_NAV.flatMap(
  (group) => group.items,
);

export function SettingsModuleLayout() {
  return <ModuleSubNavLayout title="Settings" nav={SETTINGS_MODULE_NAV} />;
}
