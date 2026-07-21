import { Outlet } from 'react-router-dom';

/** Route group for /front-office/* — sub-pages are linked from the main sidebar only. */
export function FrontOfficeLayout() {
  return <Outlet />;
}
