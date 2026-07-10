export { API_ENDPOINTS } from './api-endpoints';
export { ROUTES, LEGACY_SETTINGS_SESSIONS } from './routes';
export { ADMIN_NAV, NAV_SECTION_LABELS } from './navigation';
export type {
  NavItem,
  NavSection,
  NavPermissionKey,
  RoutePageMeta,
  AppRouteHandle,
} from '@app-types/navigation';

export const STORAGE_KEYS = {
  accessToken: 'school_erp_access_token',
  refreshToken: 'school_erp_refresh_token',
} as const;
