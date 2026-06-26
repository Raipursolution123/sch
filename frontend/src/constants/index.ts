export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    logout: '/auth/logout/',
    me: '/auth/me/',
    tokenRefresh: '/auth/token/refresh/',
  },
  health: '/health/',
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  notFound: '*',
} as const;

export const STORAGE_KEYS = {
  accessToken: 'school_erp_access_token',
  refreshToken: 'school_erp_refresh_token',
} as const;
