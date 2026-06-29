import { Outlet } from 'react-router-dom';

/** Route group for /examinations/* — sub-pages are linked from the main sidebar only. */
export function ExaminationsLayout() {
  return <Outlet />;
}
