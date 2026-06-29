import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStaffPayload,
  StaffDepartment,
  StaffDesignation,
  StaffDetail,
  StaffListItem,
  UpdateStaffPayload,
} from '@app-types/staff/staff';
import { formatStaffName, suggestEmployeeId } from '@utils/staff';

interface StaffRecord {
  id: number;
  employee_id: string;
  name: string;
  surname: string;
  email: string;
  contact_no: string;
  emergency_contact_no: string;
  gender: string;
  department_id: number;
  designation_id: number;
  qualification: string;
  work_exp: string;
  father_name: string;
  mother_name: string;
  dob: string;
  marital_status: string;
  date_of_joining: string | null;
  date_of_leaving: string | null;
  local_address: string;
  permanent_address: string;
  contract_type: string;
  basic_salary: number | null;
  note: string;
  is_active: StaffListItem['is_active'];
  updated_at: string | null;
}

// TODO: Remove when backend exposes staff lookup endpoints
export const MOCK_DEPARTMENTS: StaffDepartment[] = [
  { id: 1, name: 'Teaching' },
  { id: 2, name: 'Administration' },
  { id: 3, name: 'Accounts' },
];

export const MOCK_DESIGNATIONS: StaffDesignation[] = [
  { id: 1, name: 'Principal' },
  { id: 2, name: 'Teacher' },
  { id: 3, name: 'Accountant' },
  { id: 4, name: 'Office Assistant' },
];

// TODO: Remove mock store when GET /api/v1/staff/ is available
let mockStaff: StaffRecord[] = [
  {
    id: 1,
    employee_id: 'EMP-2024-001',
    name: 'Ramesh',
    surname: 'Tiwari',
    email: 'ramesh.tiwari@school.example',
    contact_no: '9876500001',
    emergency_contact_no: '9876500101',
    gender: 'Male',
    department_id: 1,
    designation_id: 1,
    qualification: 'M.Ed',
    work_exp: '15 years',
    father_name: 'Suresh Tiwari',
    mother_name: 'Geeta Tiwari',
    dob: '1975-03-18',
    marital_status: 'Married',
    date_of_joining: '2010-06-01',
    date_of_leaving: null,
    local_address: '101 Staff Quarters, Raipur',
    permanent_address: '101 Staff Quarters, Raipur',
    contract_type: 'Permanent',
    basic_salary: 85000,
    note: '',
    is_active: 'yes',
    updated_at: null,
  },
  {
    id: 2,
    employee_id: 'EMP-2024-002',
    name: 'Sunita',
    surname: 'Rao',
    email: 'sunita.rao@school.example',
    contact_no: '9876500002',
    emergency_contact_no: '9876500102',
    gender: 'Female',
    department_id: 1,
    designation_id: 2,
    qualification: 'B.Ed, M.A. English',
    work_exp: '8 years',
    father_name: 'Vijay Rao',
    mother_name: 'Lata Rao',
    dob: '1988-11-22',
    marital_status: 'Married',
    date_of_joining: '2016-07-15',
    date_of_leaving: null,
    local_address: '22 Green Park, Raipur',
    permanent_address: '22 Green Park, Raipur',
    contract_type: 'Permanent',
    basic_salary: 45000,
    note: '',
    is_active: 'yes',
    updated_at: null,
  },
  {
    id: 3,
    employee_id: 'EMP-2024-003',
    name: 'Amit',
    surname: 'Jain',
    email: 'amit.jain@school.example',
    contact_no: '9876500003',
    emergency_contact_no: '9876500103',
    gender: 'Male',
    department_id: 3,
    designation_id: 3,
    qualification: 'B.Com, CA Inter',
    work_exp: '6 years',
    father_name: 'Raj Jain',
    mother_name: 'Neha Jain',
    dob: '1990-07-05',
    marital_status: 'Single',
    date_of_joining: '2018-04-01',
    date_of_leaving: null,
    local_address: '5 Civil Lines, Raipur',
    permanent_address: '5 Civil Lines, Raipur',
    contract_type: 'Permanent',
    basic_salary: 40000,
    note: '',
    is_active: 'yes',
    updated_at: null,
  },
  {
    id: 4,
    employee_id: 'EMP-2024-004',
    name: 'Priya',
    surname: 'Singh',
    email: 'priya.singh@school.example',
    contact_no: '9876500004',
    emergency_contact_no: '9876500104',
    gender: 'Female',
    department_id: 2,
    designation_id: 4,
    qualification: 'B.A.',
    work_exp: '3 years',
    father_name: 'Harish Singh',
    mother_name: 'Kavita Singh',
    dob: '1995-01-30',
    marital_status: 'Single',
    date_of_joining: '2021-08-10',
    date_of_leaving: null,
    local_address: '14 Station Road, Raipur',
    permanent_address: '14 Station Road, Raipur',
    contract_type: 'Contract',
    basic_salary: 25000,
    note: '',
    is_active: 'no',
    updated_at: null,
  },
];

let nextMockId = 5;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function getDepartmentName(id: number): string {
  return MOCK_DEPARTMENTS.find((d) => d.id === id)?.name ?? '—';
}

function getDesignationName(id: number): string {
  return MOCK_DESIGNATIONS.find((d) => d.id === id)?.name ?? '—';
}

function toListItem(record: StaffRecord): StaffListItem {
  return {
    id: record.id,
    employee_id: record.employee_id,
    name: record.name,
    surname: record.surname,
    full_name: formatStaffName(record.name, record.surname),
    email: record.email,
    contact_no: record.contact_no,
    gender: record.gender,
    department_id: record.department_id,
    department_name: getDepartmentName(record.department_id),
    designation_id: record.designation_id,
    designation_name: getDesignationName(record.designation_id),
    date_of_joining: record.date_of_joining,
    is_active: record.is_active,
  };
}

function toDetail(record: StaffRecord): StaffDetail {
  return {
    ...toListItem(record),
    qualification: record.qualification,
    work_exp: record.work_exp,
    father_name: record.father_name,
    mother_name: record.mother_name,
    emergency_contact_no: record.emergency_contact_no,
    dob: record.dob,
    marital_status: record.marital_status,
    date_of_leaving: record.date_of_leaving,
    local_address: record.local_address,
    permanent_address: record.permanent_address,
    contract_type: record.contract_type,
    basic_salary: record.basic_salary,
    note: record.note,
    updated_at: record.updated_at,
  };
}

function recordFromPayload(payload: CreateStaffPayload, id: number): StaffRecord {
  return {
    id,
    employee_id: payload.employee_id,
    name: payload.name,
    surname: payload.surname,
    email: payload.email,
    contact_no: payload.contact_no,
    emergency_contact_no: payload.emergency_contact_no,
    gender: payload.gender,
    department_id: payload.department_id,
    designation_id: payload.designation_id,
    qualification: payload.qualification,
    work_exp: payload.work_exp,
    father_name: payload.father_name ?? '',
    mother_name: payload.mother_name ?? '',
    dob: payload.dob,
    marital_status: payload.marital_status,
    date_of_joining: payload.date_of_joining,
    date_of_leaving: null,
    local_address: payload.local_address,
    permanent_address: payload.local_address,
    contract_type: payload.contract_type,
    basic_salary: null,
    note: '',
    is_active: payload.is_active,
    updated_at: null,
  };
}

export const staffService = {
  listDepartments: async (): Promise<StaffDepartment[]> => {
    if (USE_MOCK) return delay([...MOCK_DEPARTMENTS]);
    // TODO: Wire when backend exposes GET /api/v1/staff/departments/
    const { data } = await apiClient.get<ApiSuccessResponse<StaffDepartment[]>>(
      API_ENDPOINTS.staff.departments,
    );
    return data.data;
  },

  listDesignations: async (): Promise<StaffDesignation[]> => {
    if (USE_MOCK) return delay([...MOCK_DESIGNATIONS]);
    // TODO: Wire when backend exposes GET /api/v1/staff/designations/
    const { data } = await apiClient.get<ApiSuccessResponse<StaffDesignation[]>>(
      API_ENDPOINTS.staff.designations,
    );
    return data.data;
  },

  list: async (): Promise<StaffListItem[]> => {
    if (USE_MOCK) {
      return delay(
        [...mockStaff]
          .map(toListItem)
          .sort(
            (a, b) =>
              a.department_name.localeCompare(b.department_name) ||
              a.full_name.localeCompare(b.full_name),
          ),
      );
    }
    // TODO: Wire when backend exposes GET /api/v1/staff/
    const { data } = await apiClient.get<ApiSuccessResponse<StaffListItem[]>>(
      API_ENDPOINTS.staff.list,
    );
    return data.data;
  },

  getById: async (id: number): Promise<StaffDetail> => {
    if (USE_MOCK) {
      const record = mockStaff.find((s) => s.id === id);
      if (!record) throw new Error('Staff member not found');
      return delay(toDetail(record));
    }
    // TODO: Wire when backend exposes GET /api/v1/staff/{id}/
    const { data } = await apiClient.get<ApiSuccessResponse<StaffDetail>>(
      API_ENDPOINTS.staff.detail(id),
    );
    return data.data;
  },

  suggestEmployeeId: async (): Promise<string> => {
    if (USE_MOCK) {
      return delay(suggestEmployeeId(mockStaff.map((s) => s.employee_id)));
    }
    const staff = await staffService.list();
    return suggestEmployeeId(staff.map((s) => s.employee_id));
  },

  create: async (payload: CreateStaffPayload): Promise<StaffDetail> => {
    if (USE_MOCK) {
      const employeeId = payload.employee_id.trim().toUpperCase();
      if (mockStaff.some((s) => s.employee_id.toUpperCase() === employeeId)) {
        throw new Error('A staff member with this employee ID already exists');
      }
      if (!MOCK_DEPARTMENTS.some((d) => d.id === payload.department_id)) {
        throw new Error('Selected department is not available');
      }
      if (!MOCK_DESIGNATIONS.some((d) => d.id === payload.designation_id)) {
        throw new Error('Selected designation is not available');
      }

      const created = recordFromPayload(payload, nextMockId++);
      mockStaff = [...mockStaff, created];
      return delay(toDetail(created));
    }
    // TODO: Wire when backend exposes POST /api/v1/staff/
    const { data } = await apiClient.post<ApiSuccessResponse<StaffDetail>>(
      API_ENDPOINTS.staff.list,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateStaffPayload): Promise<StaffDetail> => {
    if (USE_MOCK) {
      const index = mockStaff.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Staff member not found');

      const employeeId = payload.employee_id.trim().toUpperCase();
      if (
        mockStaff.some((s) => s.id !== id && s.employee_id.toUpperCase() === employeeId)
      ) {
        throw new Error('A staff member with this employee ID already exists');
      }
      if (!MOCK_DEPARTMENTS.some((d) => d.id === payload.department_id)) {
        throw new Error('Selected department is not available');
      }
      if (!MOCK_DESIGNATIONS.some((d) => d.id === payload.designation_id)) {
        throw new Error('Selected designation is not available');
      }

      const updated: StaffRecord = {
        ...mockStaff[index],
        ...recordFromPayload(payload, id),
        date_of_leaving: mockStaff[index].date_of_leaving,
        basic_salary: mockStaff[index].basic_salary,
        note: mockStaff[index].note,
        updated_at: new Date().toISOString(),
      };
      mockStaff = mockStaff.map((s) => (s.id === id ? updated : s));
      return delay(toDetail(updated));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/staff/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffDetail>>(
      API_ENDPOINTS.staff.detail(id),
      payload,
    );
    return data.data;
  },
};
