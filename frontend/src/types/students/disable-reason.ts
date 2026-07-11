export interface DisableReason {
  id: number;
  reason: string;
}

export interface DisableStudentPayload {
  disable_reason_id: number;
  dis_note?: string;
}
