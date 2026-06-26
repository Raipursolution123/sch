export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'School ERP',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
