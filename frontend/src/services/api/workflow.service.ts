import type { WorkflowEvent, WorkflowRecord, WorkflowStatus } from '@app-types/workflow';

const STORAGE_KEY = 'school_erp_workflow_records';

function loadRecords(): Record<string, WorkflowRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, WorkflowRecord>) : {};
  } catch {
    return {};
  }
}

function saveRecords(records: Record<string, WorkflowRecord>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function key(entityType: string, entityId: number) {
  return `${entityType}:${entityId}`;
}

function createEvent(
  status: WorkflowStatus,
  actorName: string,
  actorRole?: string,
  note?: string,
): WorkflowEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status,
    actorName,
    actorRole,
    timestamp: new Date().toISOString(),
    note,
  };
}

export const workflowService = {
  get(entityType: string, entityId: number): WorkflowRecord {
    const records = loadRecords();
    return (
      records[key(entityType, entityId)] ?? {
        entityType,
        entityId,
        status: 'draft',
        events: [],
      }
    );
  },

  transition(
    entityType: string,
    entityId: number,
    status: WorkflowStatus,
    actor: { name: string; role?: string },
    note?: string,
  ): WorkflowRecord {
    const records = loadRecords();
    const recordKey = key(entityType, entityId);
    const existing = records[recordKey] ?? {
      entityType,
      entityId,
      status: 'draft' as const,
      events: [],
    };
    const event = createEvent(status, actor.name, actor.role, note);
    const next: WorkflowRecord = {
      ...existing,
      status,
      events: [event, ...existing.events],
    };
    records[recordKey] = next;
    saveRecords(records);
    return next;
  },

  listByType(entityType: string): WorkflowRecord[] {
    const records = loadRecords();
    return Object.values(records).filter((record) => record.entityType === entityType);
  },
};
