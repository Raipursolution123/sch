export interface KpiMetric {
  label: string;
  value: string;
  /** Omitted when no historical comparison API is available. */
  changePercent?: number;
  changeLabel?: string;
  sparkline?: number[];
}

export interface WeeklyAttendancePoint {
  label: string;
  rate: number;
}

export interface FeeOverview {
  collected: number;
  pending: number;
  overdue: number;
  collectionRate: number;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'student' | 'staff' | 'fee' | 'attendance' | 'exam' | 'settings';
}

export interface UpcomingExam {
  id: number;
  exam: string;
  subject: string;
  date: string;
  time: string;
  room: string;
}

export interface AttentionItem {
  id: string;
  severity: 'danger' | 'warning' | 'info';
  title: string;
  description?: string;
  href?: string;
}

export interface DashboardOverview {
  kpis: {
    students: KpiMetric;
    staff: KpiMetric;
    fees: KpiMetric;
    attendance: KpiMetric;
  };
  weeklyAttendance: WeeklyAttendancePoint[];
  feeOverview: FeeOverview;
  attentionItems: AttentionItem[];
  recentActivity: DashboardActivity[];
  upcomingExams: UpcomingExam[];
}
