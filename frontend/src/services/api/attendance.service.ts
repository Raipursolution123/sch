import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AttendanceReportFilters,
  AttendanceReportRow,
  AttendanceReportSummary,
  AttendanceRoster,
  AttendanceType,
  MarkAttendancePayload,
} from '@app-types/attendance/attendance';
import { classesService } from './classes.service';
import { sectionsService } from './sections.service';
import { studentsService } from './students.service';

interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  section_id: number;
  date: string;
  attendence_type_id: number;
  remark: string;
}

// TODO: Remove when backend exposes attendance type endpoints
const MOCK_ATTENDANCE_TYPES: AttendanceType[] = [
  { id: 1, key: 'present', label: 'Present', is_active: 'yes' },
  { id: 2, key: 'absent', label: 'Absent', is_active: 'yes' },
  { id: 3, key: 'late', label: 'Late', is_active: 'yes' },
  { id: 4, key: 'half_day', label: 'Half Day', is_active: 'yes' },
  { id: 5, key: 'holiday', label: 'Holiday', is_active: 'yes' },
];

// TODO: Remove mock store when attendance APIs are available
let mockRecords: AttendanceRecord[] = [
  {
    id: 1,
    student_id: 1,
    class_id: 4,
    section_id: 1,
    date: '2026-06-27',
    attendence_type_id: 1,
    remark: '',
  },
  {
    id: 2,
    student_id: 2,
    class_id: 4,
    section_id: 1,
    date: '2026-06-27',
    attendence_type_id: 1,
    remark: '',
  },
  {
    id: 3,
    student_id: 3,
    class_id: 4,
    section_id: 2,
    date: '2026-06-27',
    attendence_type_id: 2,
    remark: 'Sick leave',
  },
];
let nextRecordId = 4;

const USE_MOCK = true;
const DEFAULT_TYPE_ID = 1;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function getTypeById(id: number): AttendanceType | undefined {
  return MOCK_ATTENDANCE_TYPES.find((t) => t.id === id);
}

export const attendanceService = {
  listTypes: async (): Promise<AttendanceType[]> => {
    if (USE_MOCK) return delay([...MOCK_ATTENDANCE_TYPES]);
    // TODO: Wire when backend exposes GET /api/v1/attendance/types/
    const { data } = await apiClient.get<ApiSuccessResponse<AttendanceType[]>>(
      API_ENDPOINTS.attendance.types,
    );
    return data.data;
  },

  getRoster: async (
    classId: number,
    sectionId: number,
    date: string,
  ): Promise<AttendanceRoster> => {
    if (USE_MOCK) {
      const [classes, sections, students] = await Promise.all([
        classesService.list(),
        sectionsService.list(),
        studentsService.list(),
      ]);
      const schoolClass = classes.find((c) => c.id === classId);
      const section = sections.find((s) => s.id === sectionId);
      if (!schoolClass || !section) throw new Error('Class or section not found');

      const rosterStudents = students
        .filter(
          (s) =>
            s.is_active === 'yes' && s.class_id === classId && s.section_id === sectionId,
        )
        .sort((a, b) => (a.roll_no ?? 999) - (b.roll_no ?? 999));

      const saved = mockRecords.filter(
        (r) => r.class_id === classId && r.section_id === sectionId && r.date === date,
      );

      const entries = rosterStudents.map((student) => {
        const record = saved.find((r) => r.student_id === student.id);
        const typeId = record?.attendence_type_id ?? DEFAULT_TYPE_ID;
        const type = getTypeById(typeId) ?? MOCK_ATTENDANCE_TYPES[0];
        return {
          student_id: student.id,
          admission_no: student.admission_no,
          full_name: student.full_name,
          roll_no: student.roll_no,
          attendence_type_id: type.id,
          status_key: type.key,
          status_label: type.label,
          remark: record?.remark ?? '',
        };
      });

      return delay({
        class_id: classId,
        class_name: schoolClass.class_name,
        section_id: sectionId,
        section_name: section.section_name,
        date,
        entries,
      });
    }
    // TODO: Wire when backend exposes GET /api/v1/attendance/roster/
    const { data } = await apiClient.get<ApiSuccessResponse<AttendanceRoster>>(
      API_ENDPOINTS.attendance.roster,
      { params: { class_id: classId, section_id: sectionId, date } },
    );
    return data.data;
  },

  saveMark: async (payload: MarkAttendancePayload): Promise<AttendanceRoster> => {
    if (USE_MOCK) {
      mockRecords = mockRecords.filter(
        (r) =>
          !(
            r.class_id === payload.class_id &&
            r.section_id === payload.section_id &&
            r.date === payload.date
          ),
      );

      const newRecords: AttendanceRecord[] = payload.entries.map((entry) => ({
        id: nextRecordId++,
        student_id: entry.student_id,
        class_id: payload.class_id,
        section_id: payload.section_id,
        date: payload.date,
        attendence_type_id: entry.attendence_type_id,
        remark: entry.remark?.trim() ?? '',
      }));
      mockRecords = [...mockRecords, ...newRecords];

      return delay(
        await attendanceService.getRoster(payload.class_id, payload.section_id, payload.date),
      );
    }
    // TODO: Wire when backend exposes POST /api/v1/attendance/mark/
    const { data } = await apiClient.post<ApiSuccessResponse<AttendanceRoster>>(
      API_ENDPOINTS.attendance.mark,
      payload,
    );
    return data.data;
  },

  getReport: async (filters: AttendanceReportFilters): Promise<AttendanceReportSummary> => {
    if (USE_MOCK) {
      const [classes, sections, students] = await Promise.all([
        classesService.list(),
        sectionsService.list(),
        studentsService.list(),
      ]);

      const rows: AttendanceReportRow[] = mockRecords
        .filter((r) => r.date >= filters.from_date && r.date <= filters.to_date)
        .filter((r) => (filters.class_id ? r.class_id === filters.class_id : true))
        .filter((r) => (filters.section_id ? r.section_id === filters.section_id : true))
        .map((record) => {
          const student = students.find((s) => s.id === record.student_id);
          const schoolClass = classes.find((c) => c.id === record.class_id);
          const section = sections.find((s) => s.id === record.section_id);
          const type = getTypeById(record.attendence_type_id) ?? MOCK_ATTENDANCE_TYPES[0];
          return {
            id: record.id,
            student_id: record.student_id,
            student_name: student?.full_name ?? 'Unknown',
            roll_no: student?.roll_no ?? null,
            class_name: schoolClass?.class_name ?? '—',
            section_name: section?.section_name ?? '—',
            date: record.date,
            status_key: type.key,
            status_label: type.label,
            remark: record.remark,
          };
        })
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            a.class_name.localeCompare(b.class_name) ||
            (a.roll_no ?? 999) - (b.roll_no ?? 999),
        );

      const summary = {
        present: 0,
        absent: 0,
        late: 0,
        half_day: 0,
        holiday: 0,
      };
      for (const row of rows) {
        summary[row.status_key] += 1;
      }

      return delay({
        total_records: rows.length,
        ...summary,
        rows,
      });
    }
    // TODO: Wire when backend exposes GET /api/v1/attendance/report/
    const { data } = await apiClient.get<ApiSuccessResponse<AttendanceReportSummary>>(
      API_ENDPOINTS.attendance.report,
      { params: filters },
    );
    return data.data;
  },
};
