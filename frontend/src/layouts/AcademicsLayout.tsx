import { Outlet } from 'react-router-dom';

/** Route group for /academics/* — sub-pages are linked from the main sidebar only. */
export function AcademicsLayout() {
  return <Outlet />;
}
