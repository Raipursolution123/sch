import { Outlet } from 'react-router-dom';

/** Route group for /hostel/* — sub-pages are linked from the main sidebar only. */
export function HostelLayout() {
  return <Outlet />;
}
