import { Outlet } from 'react-router-dom';

/** Route group for /fees/* — sub-pages are linked from the main sidebar only. */
export function FeesLayout() {
  return <Outlet />;
}
