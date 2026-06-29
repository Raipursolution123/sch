import type { DashboardOverview } from '@app-types/dashboard/dashboard';
import { formatAmount } from '@utils/format';

// TODO: Remove mock data when GET /api/v1/dashboard/overview/ is available
const USE_MOCK = true;

const MOCK_OVERVIEW: DashboardOverview = {
  kpis: {
    students: {
      label: 'Total Students',
      value: '248',
      changePercent: 4.2,
      changeLabel: 'vs last term',
      sparkline: [210, 218, 225, 231, 238, 242, 248],
    },
    staff: {
      label: 'Staff Members',
      value: '42',
      changePercent: 2.4,
      changeLabel: 'vs last term',
    },
    fees: {
      label: 'Fees Collected',
      value: formatAmount(1245000),
      changePercent: 8.6,
      changeLabel: 'vs last month',
    },
    attendance: {
      label: 'Attendance Rate',
      value: '94.2%',
      changePercent: 1.1,
      changeLabel: 'vs last week',
      sparkline: [91, 92, 93, 92, 94, 95, 94],
    },
  },
  weeklyAttendance: [
    { label: 'Mon', rate: 92 },
    { label: 'Tue', rate: 94 },
    { label: 'Wed', rate: 93 },
    { label: 'Thu', rate: 95 },
    { label: 'Fri', rate: 94 },
    { label: 'Sat', rate: 88 },
  ],
  feeOverview: {
    collected: 1245000,
    pending: 385000,
    overdue: 62000,
    collectionRate: 73.6,
  },
  recentActivity: [
    {
      id: '1',
      title: 'New admission',
      description: 'Riya Verma enrolled in Class 5-A',
      timestamp: '2025-09-04T09:15:00Z',
      category: 'student',
    },
    {
      id: '2',
      title: 'Fee payment received',
      description: '₹12,500 collected from Aarav Sharma',
      timestamp: '2025-09-04T08:40:00Z',
      category: 'fee',
    },
    {
      id: '3',
      title: 'Attendance marked',
      description: 'Class 8-B morning attendance submitted',
      timestamp: '2025-09-04T08:05:00Z',
      category: 'attendance',
    },
    {
      id: '4',
      title: 'Exam schedule updated',
      description: 'Mid Term Mathematics paper rescheduled',
      timestamp: '2025-09-03T16:20:00Z',
      category: 'exam',
    },
    {
      id: '5',
      title: 'Staff profile updated',
      description: 'Ms. Priya Nair designation changed',
      timestamp: '2025-09-03T14:00:00Z',
      category: 'staff',
    },
  ],
  upcomingExams: [
    {
      id: 1,
      exam: 'Mid Term Examination',
      subject: 'English',
      date: '2025-09-05',
      time: '09:00 – 12:00',
      room: '101',
    },
    {
      id: 2,
      exam: 'Mid Term Examination',
      subject: 'Mathematics',
      date: '2025-09-06',
      time: '09:00 – 12:00',
      room: '102',
    },
    {
      id: 3,
      exam: 'Mid Term Examination',
      subject: 'Science',
      date: '2025-09-07',
      time: '09:00 – 12:00',
      room: '103',
    },
  ],
};

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    if (USE_MOCK) return delay({ ...MOCK_OVERVIEW });

    // TODO: Wire when backend exposes dashboard overview endpoint
    throw new Error('Dashboard API not yet available');
  },
};
