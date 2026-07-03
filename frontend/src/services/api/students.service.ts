import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  StudentDetail,
  StudentListItem,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '@app-types/students/student';
import { formatStudentName, suggestAdmissionNumber } from '@utils/student';
import { classesService } from './classes.service';
import { sectionsService } from './sections.service';

interface StudentRecord {
  id: number;
  admission_no: string;
  roll_no: number | null;
  firstname: string;
  middlename: string | null;
  lastname: string | null;
  gender: string | null;
  mobileno: string | null;
  email: string | null;
  dob: string | null;
  is_active: StudentListItem['is_active'];
  class_id: number | null;
  section_id: number | null;
  admission_date: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  current_address: string | null;
  permanent_address: string | null;
  blood_group: string | null;
  religion: string | null;
  category_id: string | null;
  rte: string | null;
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/students/ is available
let mockStudents: StudentRecord[] = [
  {
    id: 1,
    admission_no: 'ADM-2024-001',
    roll_no: 1,
    firstname: 'Aarav',
    middlename: null,
    lastname: 'Sharma',
    gender: 'Male',
    mobileno: '9876543210',
    email: 'aarav.sharma@example.com',
    dob: '2014-05-12',
    is_active: 'yes',
    class_id: 4,
    section_id: 1,
    admission_date: '2024-04-01',
    father_name: 'Rajesh Sharma',
    mother_name: 'Priya Sharma',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '9876543210',
    current_address: '12 MG Road, Raipur',
    permanent_address: '12 MG Road, Raipur',
    blood_group: 'B+',
    religion: 'Hindu',
    category_id: 'General',
    rte: 'No',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    admission_no: 'ADM-2024-002',
    roll_no: 2,
    firstname: 'Ananya',
    middlename: 'K',
    lastname: 'Patel',
    gender: 'Female',
    mobileno: '9876501234',
    email: null,
    dob: '2014-08-20',
    is_active: 'yes',
    class_id: 4,
    section_id: 1,
    admission_date: '2024-04-01',
    father_name: 'Kiran Patel',
    mother_name: 'Meera Patel',
    guardian_name: 'Kiran Patel',
    guardian_phone: '9876501234',
    current_address: '45 Station Road, Raipur',
    permanent_address: '45 Station Road, Raipur',
    blood_group: 'O+',
    religion: 'Hindu',
    category_id: 'OBC',
    rte: 'No',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    admission_no: 'ADM-2024-003',
    roll_no: 5,
    firstname: 'Rohan',
    middlename: null,
    lastname: 'Verma',
    gender: 'Male',
    mobileno: '9812345678',
    email: 'rohan.verma@example.com',
    dob: '2013-11-03',
    is_active: 'yes',
    class_id: 4,
    section_id: 2,
    admission_date: '2024-04-01',
    father_name: 'Sunil Verma',
    mother_name: 'Anjali Verma',
    guardian_name: 'Sunil Verma',
    guardian_phone: '9812345678',
    current_address: '78 Civil Lines, Raipur',
    permanent_address: '78 Civil Lines, Raipur',
    blood_group: 'A+',
    religion: 'Hindu',
    category_id: 'General',
    rte: 'No',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    admission_no: 'ADM-2024-004',
    roll_no: 12,
    firstname: 'Isha',
    middlename: null,
    lastname: 'Das',
    gender: 'Female',
    mobileno: '9900112233',
    email: null,
    dob: '2012-02-14',
    is_active: 'yes',
    class_id: 5,
    section_id: 1,
    admission_date: '2023-04-01',
    father_name: 'Amit Das',
    mother_name: 'Sunita Das',
    guardian_name: 'Amit Das',
    guardian_phone: '9900112233',
    current_address: '22 Lake View, Raipur',
    permanent_address: '22 Lake View, Raipur',
    blood_group: 'AB+',
    religion: 'Hindu',
    category_id: 'SC',
    rte: 'Yes',
    created_at: '2023-04-01T00:00:00Z',
    updated_at: '2024-06-15',
  },
  {
    id: 5,
    admission_no: 'ADM-2023-089',
    roll_no: null,
    firstname: 'Kabir',
    middlename: null,
    lastname: 'Singh',
    gender: 'Male',
    mobileno: '9988776655',
    email: null,
    dob: '2010-07-30',
    is_active: 'no',
    class_id: 6,
    section_id: 1,
    admission_date: '2022-04-01',
    father_name: 'Harpreet Singh',
    mother_name: 'Gurpreet Kaur',
    guardian_name: 'Harpreet Singh',
    guardian_phone: '9988776655',
    current_address: '9 Green Park, Raipur',
    permanent_address: '9 Green Park, Raipur',
    blood_group: 'B-',
    religion: 'Sikh',
    category_id: 'General',
    rte: 'No',
    created_at: '2022-04-01T00:00:00Z',
    updated_at: '2024-03-31',
  },
];
let nextMockId = 6;

const USE_MOCK = true; // TODO: Set to false when backend students API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function enrichList(records: StudentRecord[]): Promise<StudentListItem[]> {
  const [classes, sections] = await Promise.all([classesService.list(), sectionsService.list()]);
  const classMap = new Map(classes.map((c) => [c.id, c.class_name]));
  const sectionMap = new Map(sections.map((s) => [s.id, s.section_name]));

  return records.map((record) => ({
    id: record.id,
    admission_no: record.admission_no,
    roll_no: record.roll_no,
    firstname: record.firstname,
    middlename: record.middlename,
    lastname: record.lastname,
    full_name: formatStudentName(record.firstname, record.middlename, record.lastname),
    gender: record.gender,
    mobileno: record.mobileno,
    email: record.email,
    dob: record.dob,
    is_active: record.is_active,
    class_id: record.class_id,
    section_id: record.section_id,
    class_name: record.class_id ? (classMap.get(record.class_id) ?? null) : null,
    section_name: record.section_id ? (sectionMap.get(record.section_id) ?? null) : null,
    admission_date: record.admission_date,
    created_at: record.created_at,
  }));
}

function toDetail(record: StudentRecord, listItem: StudentListItem): StudentDetail {
  return {
    ...listItem,
    father_name: record.father_name,
    mother_name: record.mother_name,
    guardian_name: record.guardian_name,
    guardian_phone: record.guardian_phone,
    current_address: record.current_address,
    permanent_address: record.permanent_address,
    blood_group: record.blood_group,
    religion: record.religion,
    category_id: record.category_id,
    rte: record.rte,
    updated_at: record.updated_at,
  };
}

export const studentsService = {
  list: async (): Promise<StudentListItem[]> => {
    if (USE_MOCK) {
      const enriched = await enrichList([...mockStudents]);
      return delay(
        enriched.sort(
          (a, b) =>
            (a.class_name ?? '').localeCompare(b.class_name ?? '') ||
            (a.roll_no ?? 999) - (b.roll_no ?? 999) ||
            a.full_name.localeCompare(b.full_name),
        ),
      );
    }
    // TODO: Wire when backend exposes GET /api/v1/students/
    const { data } = await apiClient.get<ApiSuccessResponse<StudentListItem[]>>(
      API_ENDPOINTS.students.list,
    );
    return data.data;
  },

  getById: async (id: number): Promise<StudentDetail> => {
    if (USE_MOCK) {
      const record = mockStudents.find((s) => s.id === id);
      if (!record) throw new Error('Student not found');
      const [listItem] = await enrichList([record]);
      return delay(toDetail(record, listItem));
    }
    // TODO: Wire when backend exposes GET /api/v1/students/{id}/
    const { data } = await apiClient.get<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.detail(id),
    );
    return data.data;
  },

  suggestAdmissionNo: async (): Promise<string> => {
    if (USE_MOCK) {
      return delay(suggestAdmissionNumber(mockStudents.map((s) => s.admission_no)));
    }
    const students = await studentsService.list();
    return suggestAdmissionNumber(students.map((s) => s.admission_no));
  },

  create: async (payload: CreateStudentPayload): Promise<StudentDetail> => {
    if (USE_MOCK) {
      const admissionNo = payload.admission_no.trim().toUpperCase();
      if (mockStudents.some((s) => s.admission_no.toUpperCase() === admissionNo)) {
        throw new Error('A student with this admission number already exists');
      }
      const [classes, sections] = await Promise.all([
        classesService.list(),
        sectionsService.list(),
      ]);
      const schoolClass = classes.find((c) => c.id === payload.class_id);
      const section = sections.find((s) => s.id === payload.section_id);
      if (!schoolClass || schoolClass.is_active !== 'yes') {
        throw new Error('Selected class is not available');
      }
      if (!section || section.is_active !== 'yes') {
        throw new Error('Selected section is not available');
      }

      const guardianName =
        payload.guardian_name?.trim() ||
        payload.father_name?.trim() ||
        payload.mother_name?.trim() ||
        null;
      const created: StudentRecord = {
        id: nextMockId++,
        admission_no: payload.admission_no.trim(),
        roll_no: payload.roll_no,
        firstname: payload.firstname.trim(),
        middlename: payload.middlename?.trim() || null,
        lastname: payload.lastname.trim(),
        gender: payload.gender,
        mobileno: payload.mobileno?.trim() || null,
        email: payload.email?.trim() || null,
        dob: payload.dob,
        is_active: payload.is_active,
        class_id: payload.class_id,
        section_id: payload.section_id,
        admission_date: payload.admission_date,
        father_name: payload.father_name?.trim() || null,
        mother_name: payload.mother_name?.trim() || null,
        guardian_name: guardianName,
        guardian_phone: payload.guardian_phone?.trim() || payload.mobileno?.trim() || null,
        current_address: payload.current_address?.trim() || null,
        permanent_address: payload.current_address?.trim() || null,
        blood_group: payload.blood_group?.trim() || null,
        religion: payload.religion?.trim() || null,
        category_id: payload.category_id?.trim() || null,
        rte: payload.rte,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockStudents = [...mockStudents, created];
      const [listItem] = await enrichList([created]);
      return delay(toDetail(created, listItem));
    }
    // TODO: Wire when backend exposes POST /api/v1/students/
    const { data } = await apiClient.post<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.list,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateStudentPayload): Promise<StudentDetail> => {
    if (USE_MOCK) {
      const index = mockStudents.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Student not found');

      const admissionNo = payload.admission_no.trim().toUpperCase();
      if (mockStudents.some((s) => s.id !== id && s.admission_no.toUpperCase() === admissionNo)) {
        throw new Error('A student with this admission number already exists');
      }

      const [classes, sections] = await Promise.all([
        classesService.list(),
        sectionsService.list(),
      ]);
      const schoolClass = classes.find((c) => c.id === payload.class_id);
      const section = sections.find((s) => s.id === payload.section_id);
      if (!schoolClass || schoolClass.is_active !== 'yes') {
        throw new Error('Selected class is not available');
      }
      if (!section || section.is_active !== 'yes') {
        throw new Error('Selected section is not available');
      }

      const guardianName =
        payload.guardian_name?.trim() ||
        payload.father_name?.trim() ||
        payload.mother_name?.trim() ||
        null;
      const updated: StudentRecord = {
        ...mockStudents[index],
        admission_no: payload.admission_no.trim(),
        roll_no: payload.roll_no,
        firstname: payload.firstname.trim(),
        middlename: payload.middlename?.trim() || null,
        lastname: payload.lastname.trim(),
        gender: payload.gender,
        mobileno: payload.mobileno?.trim() || null,
        email: payload.email?.trim() || null,
        dob: payload.dob,
        is_active: payload.is_active,
        class_id: payload.class_id,
        section_id: payload.section_id,
        admission_date: payload.admission_date,
        father_name: payload.father_name?.trim() || null,
        mother_name: payload.mother_name?.trim() || null,
        guardian_name: guardianName,
        guardian_phone: payload.guardian_phone?.trim() || payload.mobileno?.trim() || null,
        current_address: payload.current_address?.trim() || null,
        permanent_address: payload.current_address?.trim() || null,
        blood_group: payload.blood_group?.trim() || null,
        religion: payload.religion?.trim() || null,
        category_id: payload.category_id?.trim() || null,
        rte: payload.rte,
        updated_at: new Date().toISOString(),
      };
      mockStudents = mockStudents.map((s) => (s.id === id ? updated : s));
      const [listItem] = await enrichList([updated]);
      return delay(toDetail(updated, listItem));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/students/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.detail(id),
      payload,
    );
    return data.data;
  },
};
