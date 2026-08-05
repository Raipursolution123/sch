import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { ModuleListPack } from '@workflow-packs';

const REPORT_LINKS: Array<{ label: string; description: string; path: string }> = [
  {
    label: 'Students',
    description: 'Enrollment and demographic summaries by session and class.',
    path: ROUTES.reports.students,
  },
  {
    label: 'Attendance',
    description: 'Present, absent, and late trends for a date range.',
    path: ROUTES.reports.attendance,
  },
  {
    label: 'Fees',
    description: 'Outstanding balances and payment collections.',
    path: ROUTES.reports.fees,
  },
  {
    label: 'Examinations',
    description: 'Marks and result summaries for published exams.',
    path: ROUTES.reports.examinations,
  },
  {
    label: 'Finance',
    description: 'Income and expense overview for the selected period.',
    path: ROUTES.reports.finance,
  },
  {
    label: 'HR / Staff',
    description: 'Staff headcount and department breakdowns.',
    path: ROUTES.reports.hr,
  },
  {
    label: 'Transport & Hostel',
    description: 'Vehicle and boarding occupancy snapshots.',
    path: ROUTES.reports.transport,
  },
  {
    label: 'Library',
    description: 'Issues, returns, and overdue books.',
    path: ROUTES.reports.library,
  },
  {
    label: 'Inventory',
    description: 'Stock levels and issue activity.',
    path: ROUTES.reports.inventory,
  },
  {
    label: 'Homework',
    description: 'Assignment completion across classes.',
    path: ROUTES.reports.homework,
  },
  {
    label: 'Alumni',
    description: 'Alumni directory and event participation.',
    path: ROUTES.reports.alumni,
  },
];

export function ReportsHubPage() {
  return (
    <ModuleListPack
      title="Reports"
      description="School-wide report hub. Open a domain report, set filters, then print or export CSV."
      isEmpty={false}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_LINKS.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="block rounded-panel border border-border bg-card p-4 transition-colors hover:bg-muted"
            >
              <p className="font-display text-base font-medium tracking-display text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </ModuleListPack>
  );
}
