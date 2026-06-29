import { Outlet } from 'react-router-dom';

/** Route group for /settings/* — sub-pages are linked from the main sidebar only. */
export function SettingsLayout() {
  return <Outlet />;
}
