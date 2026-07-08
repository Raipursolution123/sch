import type {
  AttentionItem,
  DashboardActivity,
  DashboardOverview,
  FeeOverview,
  KpiMetric,
  UpcomingExam,
} from '@app-types/dashboard/dashboard';
import type { Exam } from '@app-types/examinations/exam';
import type { FeeAssignment } from '@app-types/fees/fee-assignment';
import type { StaffListItem } from '@app-types/staff/staff';
import type { StudentListItem } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { examsService } from '@services/api/exams.service';
import { feeAssignmentsService } from '@services/api/fee-assignments.service';
import { staffService } from '@services/api/staff.service';
import { studentsService } from '@services/api/students.service';
import { formatDate } from '@utils/format';

// TODO: Wire GET /api/v1/dashboard/overview/ when backend exposes a dedicated overview endpoint.
// TODO: Wire attendance KPI + weekly chart when attendance reporting API is available.
// TODO: Wire school-wide fee collection summary when aggregate fees endpoint is available.
// TODO: Wire exam paper schedules when GET /api/v1/examinations/schedules/ is available.

const ACTIVITY_LIMIT = 6;
const UPCOMING_EXAM_LIMIT = 3;
const RECENT_STUDENTS_PAGE_SIZE = 25;

function filterBySession<T extends { session_id: number }>(items: T[], sessionId?: number): T[] {
  if (sessionId == null) return items;
  return items.filter((item) => item.session_id === sessionId);
}

function countOverdueFeeLines(assignments: FeeAssignment[]): number {
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;

  for (const assignment of assignments) {
    for (const line of assignment.lines) {
      if (line.due_date && line.due_date < today) count++;
    }
  }

  return count;
}

function buildKpis(studentCount: number, staffCount: number): DashboardOverview['kpis'] {
  const students: KpiMetric = {
    label: 'Total Students',
    value: studentCount.toLocaleString(),
  };

  const staff: KpiMetric = {
    label: 'Staff Members',
    value: staffCount.toLocaleString(),
  };

  const fees: KpiMetric = {
    label: 'Fees Collected',
    value: '—',
  };

  const attendance: KpiMetric = {
    label: 'Attendance Rate',
    value: '—',
  };

  return { students, staff, fees, attendance };
}

function buildFeeOverview(): FeeOverview {
  return {
    collected: 0,
    pending: 0,
    overdue: 0,
    collectionRate: 0,
  };
}

function buildAttentionItems(
  feeAssignments: FeeAssignment[],
  exams: Exam[],
  staffResults: StaffListItem[],
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const overdueLines = countOverdueFeeLines(feeAssignments);

  if (overdueLines > 0) {
    items.push({
      id: 'overdue-fees',
      severity: 'danger',
      title: `${overdueLines} fee line item${overdueLines === 1 ? '' : 's'} overdue`,
      href: ROUTES.fees.assign,
    });
  }

  const unpublishedExams = exams.filter((exam) => !exam.is_published && exam.is_active === 'yes');
  if (unpublishedExams.length > 0) {
    items.push({
      id: 'unpublished-exams',
      severity: 'warning',
      title: `${unpublishedExams.length} exam${unpublishedExams.length === 1 ? '' : 's'} awaiting publication`,
      href: ROUTES.examinations.exams,
    });
  }

  const inactiveStaff = staffResults.filter((staff) => staff.is_active === 'no');
  if (inactiveStaff.length > 0) {
    items.push({
      id: 'inactive-staff',
      severity: 'info',
      title: `${inactiveStaff.length} inactive staff record${inactiveStaff.length === 1 ? '' : 's'}`,
      href: ROUTES.staff.root,
    });
  }

  return items;
}

function buildRecentActivity(
  students: StudentListItem[],
  feeAssignments: FeeAssignment[],
  exams: Exam[],
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];

  for (const student of students) {
    const classLabel =
      student.class_name != null
        ? `${student.class_name}${student.section_name ? `-${student.section_name}` : ''}`
        : null;

    activities.push({
      id: `student-${student.id}`,
      title: 'New admission',
      description: classLabel
        ? `${student.full_name} admitted to ${classLabel}`
        : `${student.full_name} admitted`,
      timestamp: student.created_at,
      category: 'student',
    });
  }

  for (const assignment of feeAssignments) {
    activities.push({
      id: `fee-${assignment.id}`,
      title: 'Fee assignment created',
      description: `${assignment.class_name} — ${assignment.fee_group_name}`,
      timestamp: assignment.created_at,
      category: 'fee',
    });
  }

  for (const exam of exams) {
    activities.push({
      id: `exam-${exam.id}`,
      title: exam.is_published ? 'Exam published' : 'Exam created',
      description: exam.name,
      timestamp: exam.updated_at ?? exam.created_at,
      category: 'exam',
    });
  }

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, ACTIVITY_LIMIT);
}

function formatExamTime(dateFrom: string | null, dateTo: string | null): string {
  if (!dateFrom) return 'Time TBD';
  if (!dateTo || dateFrom === dateTo) return 'All day';
  return `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;
}

function buildUpcomingExams(exams: Exam[]): UpcomingExam[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return exams
    .filter((exam) => {
      if (!exam.date_from || exam.is_active !== 'yes') return false;
      const examDate = new Date(exam.date_from);
      examDate.setHours(0, 0, 0, 0);
      return examDate >= today;
    })
    .sort((a, b) => {
      const aTime = a.date_from ? new Date(a.date_from).getTime() : 0;
      const bTime = b.date_from ? new Date(b.date_from).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, UPCOMING_EXAM_LIMIT)
    .map((exam) => ({
      id: exam.id,
      exam: exam.name,
      subject: exam.exam_group_name,
      date: exam.date_from!,
      time: formatExamTime(exam.date_from, exam.date_to),
      room: 'TBD',
    }));
}

export const dashboardService = {
  async getOverview(sessionId?: number): Promise<DashboardOverview> {
    const [studentsPage, staffPage, examsPage, feeAssignments] = await Promise.all([
      studentsService.listPaginated(1, RECENT_STUDENTS_PAGE_SIZE),
      staffService.list(1),
      examsService.list(),
      feeAssignmentsService.list(),
    ]);

    const sessionFeeAssignments = filterBySession(feeAssignments, sessionId);
    const sessionExams = filterBySession(examsPage.results, sessionId);

    return {
      kpis: buildKpis(studentsPage.count, staffPage.count),
      weeklyAttendance: [],
      feeOverview: buildFeeOverview(),
      attentionItems: buildAttentionItems(sessionFeeAssignments, sessionExams, staffPage.results),
      recentActivity: buildRecentActivity(
        studentsPage.results,
        sessionFeeAssignments,
        sessionExams,
      ),
      upcomingExams: buildUpcomingExams(sessionExams),
    };
  },
};
