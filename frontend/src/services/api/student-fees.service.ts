import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  StudentFeeLine,
  StudentFeeLineStatus,
  StudentFeePayment,
  StudentFeeSummary,
} from '@app-types/students/student-fees';
import { studentsService } from './students.service';
import { feeAssignmentsService } from './fee-assignments.service';
import { sessionsService } from './sessions.service';

interface PaymentRecord {
  id: number;
  student_id: number;
  feetype_id: number;
  amount: number;
  date: string;
  payment_mode: string;
  description: string | null;
}

// TODO: Remove mock store when GET /api/v1/students/{id}/fees/ is available
const mockPayments: PaymentRecord[] = [
  {
    id: 1,
    student_id: 1,
    feetype_id: 1,
    amount: 10000,
    date: '2025-04-10',
    payment_mode: 'Cash',
    description: 'Partial tuition payment',
  },
  {
    id: 2,
    student_id: 1,
    feetype_id: 2,
    amount: 12000,
    date: '2025-04-12',
    payment_mode: 'UPI',
    description: 'Transport fee — full',
  },
  {
    id: 3,
    student_id: 2,
    feetype_id: 1,
    amount: 25000,
    date: '2025-05-01',
    payment_mode: 'Bank Transfer',
    description: 'Tuition fee — full',
  },
  {
    id: 4,
    student_id: 2,
    feetype_id: 4,
    amount: 1500,
    date: '2025-08-20',
    payment_mode: 'Cash',
    description: 'Examination fee',
  },
];

const USE_MOCK = false;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveStatus(amount: number, paid: number, dueDate: string | null): StudentFeeLineStatus {
  const balance = amount - paid;
  if (balance <= 0) return 'paid';
  if (paid > 0) return 'partial';
  if (dueDate && dueDate < todayIso()) return 'overdue';
  return 'pending';
}

function sumPaidForLine(studentId: number, feetypeId: number): number {
  return mockPayments
    .filter((p) => p.student_id === studentId && p.feetype_id === feetypeId)
    .reduce((sum, p) => sum + p.amount, 0);
}

async function buildSummary(studentId: number): Promise<StudentFeeSummary> {
  const student = await studentsService.getById(studentId);
  const [assignments, sessions] = await Promise.all([
    feeAssignmentsService.list(),
    sessionsService.list(),
  ]);

  const activeSession = sessions.results.find((s) => s.is_active === 'yes') ?? sessions.results[0];
  const classAssignments = assignments.filter(
    (a) =>
      a.is_active === 'yes' &&
      a.class_id === student.class_id &&
      (!activeSession || a.session_id === activeSession.id),
  );

  const lines: StudentFeeLine[] = [];
  for (const assignment of classAssignments) {
    for (const line of assignment.lines) {
      const amountPaid = sumPaidForLine(studentId, line.feetype_id);
      const balance = Math.max(0, line.amount - amountPaid);
      lines.push({
        id: `${assignment.id}-${line.id}`,
        feetype_id: line.feetype_id,
        feetype_code: line.feetype_code,
        feetype_name: line.feetype_name,
        fee_group_name: assignment.fee_group_name,
        amount: line.amount,
        amount_paid: amountPaid,
        balance,
        due_date: line.due_date,
        status: resolveStatus(line.amount, amountPaid, line.due_date),
      });
    }
  }

  const studentPayments = mockPayments
    .filter((p) => p.student_id === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const payments: StudentFeePayment[] = studentPayments.map((p) => {
    const feeLine = lines.find((l) => l.feetype_id === p.feetype_id);
    return {
      id: p.id,
      date: p.date,
      amount: p.amount,
      payment_mode: p.payment_mode,
      description: p.description,
      feetype_name: feeLine?.feetype_name ?? null,
    };
  });

  const totalDue = lines.reduce((sum, l) => sum + l.amount, 0);
  const totalPaid = lines.reduce((sum, l) => sum + l.amount_paid, 0);

  return {
    student_id: studentId,
    session_name: activeSession?.session ?? '—',
    class_name: student.class_name ?? '—',
    section_name: student.section_name,
    total_due: totalDue,
    total_paid: totalPaid,
    total_balance: Math.max(0, totalDue - totalPaid),
    lines,
    payments,
  };
}

export const studentFeesService = {
  getForStudent: async (studentId: number): Promise<StudentFeeSummary> => {
    if (USE_MOCK) {
      try {
        return delay(await buildSummary(studentId));
      } catch {
        throw new Error('Could not load student fees');
      }
    }
    // TODO: Wire when backend exposes GET /api/v1/students/{id}/fees/
    const { data } = await apiClient.get<ApiSuccessResponse<StudentFeeSummary>>(
      API_ENDPOINTS.students.fees(studentId),
    );
    return data.data;
  },
  payFee: async (
    studentId: number,
    payload: {
      amount: number;
      feetype_id: number;
      payment_mode?: string;
      description?: string;
      date?: string;
    },
  ): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.students.fees(studentId), payload);
  },
  revertFee: async (studentId: number, feetypeId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.students.fees(studentId)}?feetype_id=${feetypeId}`);
  },
  deletePayment: async (studentId: number, paymentId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.students.fees(studentId)}?payment_id=${paymentId}`);
  },
};
