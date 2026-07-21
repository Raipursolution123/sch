import { Outlet } from 'react-router-dom';

/** Route group for /homework/* — sub-pages are linked from the main sidebar only. */
export function HomeworkLayout() {
  return <Outlet />;
}
