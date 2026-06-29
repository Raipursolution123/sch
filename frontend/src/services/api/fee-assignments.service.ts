import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeAssignmentPayload,
  FeeAssignment,
  FeeAssignmentLine,
  FeeAssignmentLinePayload,
  UpdateFeeAssignmentPayload,
} from '@app-types/fees/fee-assignment';
import { classesService } from './classes.service';
import { feeGroupsService } from './fee-groups.service';
import { feeTypesService } from './fee-types.service';
import { sessionsService } from './sessions.service';

interface AssignmentLineRecord {
  id: number;
  feetype_id: number;
  amount: number;
  due_date: string | null;
}

interface AssignmentRecord {
  id: number;
  class_id: number;
  fee_group_id: number;
  session_id: number;
  lines: AssignmentLineRecord[];
  is_active: FeeAssignment['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/fees/assignments/ is available
let mockAssignments: AssignmentRecord[] = [
  {
    id: 1,
    class_id: 4,
    fee_group_id: 1,
    session_id: 1,
    lines: [
      { id: 1, feetype_id: 1, amount: 25000, due_date: '2025-06-15' },
      { id: 2, feetype_id: 4, amount: 1500, due_date: '2025-09-01' },
      { id: 3, feetype_id: 5, amount: 500, due_date: '2025-04-15' },
    ],
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    class_id: 5,
    fee_group_id: 1,
    session_id: 1,
    lines: [
      { id: 4, feetype_id: 1, amount: 26000, due_date: '2025-06-15' },
      { id: 5, feetype_id: 4, amount: 1500, due_date: '2025-09-01' },
    ],
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    class_id: 4,
    fee_group_id: 2,
    session_id: 1,
    lines: [{ id: 6, feetype_id: 2, amount: 12000, due_date: '2025-04-15' }],
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
];
let nextAssignmentId = 4;
let nextLineId = 7;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function sumLines(lines: AssignmentLineRecord[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

async function enrichAssignment(record: AssignmentRecord): Promise<FeeAssignment> {
  const [classes, groups, sessions, feeTypes] = await Promise.all([
    classesService.list(),
    feeGroupsService.list(),
    sessionsService.list(),
    feeTypesService.list(),
  ]);

  const schoolClass = classes.find((c) => c.id === record.class_id);
  const group = groups.find((g) => g.id === record.fee_group_id);
  const session = sessions.find((s) => s.id === record.session_id);

  const lines: FeeAssignmentLine[] = record.lines.map((line) => {
    const feeType = feeTypes.find((f) => f.id === line.feetype_id);
    return {
      id: line.id,
      feetype_id: line.feetype_id,
      feetype_code: feeType?.code ?? '—',
      feetype_name: feeType?.name ?? 'Unknown',
      amount: line.amount,
      due_date: line.due_date,
    };
  });

  return {
    id: record.id,
    class_id: record.class_id,
    class_name: schoolClass?.class_name ?? '—',
    fee_group_id: record.fee_group_id,
    fee_group_name: group?.name ?? '—',
    session_id: record.session_id,
    session_name: session?.session ?? '—',
    lines,
    total_amount: sumLines(record.lines),
    is_active: record.is_active,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function buildLines(payload: FeeAssignmentLinePayload[]): AssignmentLineRecord[] {
  return payload.map((line) => ({
    id: nextLineId++,
    feetype_id: line.feetype_id,
    amount: line.amount,
    due_date: line.due_date,
  }));
}

async function validatePayload(payload: CreateFeeAssignmentPayload): Promise<void> {
  const [classes, groups, sessions, feeTypes] = await Promise.all([
    classesService.list(),
    feeGroupsService.list(),
    sessionsService.list(),
    feeTypesService.list(),
  ]);

  const schoolClass = classes.find((c) => c.id === payload.class_id);
  if (!schoolClass || schoolClass.is_active !== 'yes') {
    throw new Error('Selected class is not available');
  }
  if (!groups.some((g) => g.id === payload.fee_group_id && g.is_active === 'yes')) {
    throw new Error('Selected fee group is not available');
  }
  if (!sessions.some((s) => s.id === payload.session_id)) {
    throw new Error('Selected session is not available');
  }
  if (payload.lines.length === 0) {
    throw new Error('Add at least one fee line');
  }
  for (const line of payload.lines) {
    const feeType = feeTypes.find((f) => f.id === line.feetype_id);
    if (!feeType || feeType.is_active !== 'yes') {
      throw new Error('One or more selected fee types are not available');
    }
  }
}

export const feeAssignmentsService = {
  list: async (): Promise<FeeAssignment[]> => {
    if (USE_MOCK) {
      const enriched = await Promise.all(mockAssignments.map(enrichAssignment));
      return delay(
        enriched.sort(
          (a, b) =>
            a.class_name.localeCompare(b.class_name) ||
            a.fee_group_name.localeCompare(b.fee_group_name),
        ),
      );
    }
    // TODO: Wire when backend exposes GET /api/v1/fees/assignments/
    const { data } = await apiClient.get<ApiSuccessResponse<FeeAssignment[]>>(
      API_ENDPOINTS.fees.assignments,
    );
    return data.data;
  },

  create: async (payload: CreateFeeAssignmentPayload): Promise<FeeAssignment> => {
    if (USE_MOCK) {
      await validatePayload(payload);
      const duplicate = mockAssignments.some(
        (a) =>
          a.class_id === payload.class_id &&
          a.fee_group_id === payload.fee_group_id &&
          a.session_id === payload.session_id,
      );
      if (duplicate) {
        throw new Error('This class already has this fee group for the selected session');
      }
      const created: AssignmentRecord = {
        id: nextAssignmentId++,
        class_id: payload.class_id,
        fee_group_id: payload.fee_group_id,
        session_id: payload.session_id,
        lines: buildLines(payload.lines),
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockAssignments = [...mockAssignments, created];
      return delay(await enrichAssignment(created));
    }
    // TODO: Wire when backend exposes POST /api/v1/fees/assignments/
    const { data } = await apiClient.post<ApiSuccessResponse<FeeAssignment>>(
      API_ENDPOINTS.fees.assignments,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeAssignmentPayload): Promise<FeeAssignment> => {
    if (USE_MOCK) {
      const index = mockAssignments.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Fee assignment not found');
      await validatePayload(payload);
      const duplicate = mockAssignments.some(
        (a) =>
          a.id !== id &&
          a.class_id === payload.class_id &&
          a.fee_group_id === payload.fee_group_id &&
          a.session_id === payload.session_id,
      );
      if (duplicate) {
        throw new Error('This class already has this fee group for the selected session');
      }
      const updated: AssignmentRecord = {
        ...mockAssignments[index],
        class_id: payload.class_id,
        fee_group_id: payload.fee_group_id,
        session_id: payload.session_id,
        lines: buildLines(payload.lines),
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };
      mockAssignments = mockAssignments.map((a) => (a.id === id ? updated : a));
      return delay(await enrichAssignment(updated));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/fees/assignments/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeAssignment>>(
      API_ENDPOINTS.fees.assignmentDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockAssignments.find((a) => a.id === id);
      if (!record) throw new Error('Fee assignment not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the assignment before deleting');
      }
      mockAssignments = mockAssignments.filter((a) => a.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/fees/assignments/{id}/
    await apiClient.delete(API_ENDPOINTS.fees.assignmentDetail(id));
  },
};
