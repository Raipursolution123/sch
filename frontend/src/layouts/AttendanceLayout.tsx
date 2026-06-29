import { Outlet } from 'react-router-dom';

/** Route group for /attendance/* — sub-pages are linked from the main sidebar only. */
export function AttendanceLayout() {
  return <Outlet />;
}
