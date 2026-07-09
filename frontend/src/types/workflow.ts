export type WorkflowStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface WorkflowEvent {
  id: string;
  status: WorkflowStatus;
  actorName: string;
  actorRole?: string;
  timestamp: string;
  note?: string;
}

export interface WorkflowRecord {
  entityType: string;
  entityId: number;
  status: WorkflowStatus;
  events: WorkflowEvent[];
}
