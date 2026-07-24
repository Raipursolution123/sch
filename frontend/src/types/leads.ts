export interface Lead {
  id: number;
  c_id: number;
  is_student_admitted?: number | null;
  student_id?: number | null;
  l_name: string;
  l_father_name?: string | null;
  l_mother_name?: string | null;
  l_class?: string | null;
  l_address?: string | null;
  l_phone_number: string;
  l_alternative_phone?: string | null;
  l_email?: string | null;
  l_source?: string | null;
  l_resources?: string | null;
  l_location?: string | null;
  l_qualification?: string | null;
  l_status?: string | null;
  is_closed?: number | null;
  closed_date?: string | null;
  l_date?: string | null;
  l_manager?: number | null;
  current_agent?: number | null;
  l_taken_status?: number | null;
}

export interface LeadCreatePayload {
  l_name: string;
  l_phone_number: string;
  c_id: number;
  l_father_name?: string;
  l_class?: string;
  l_address?: string;
  l_email?: string;
  l_source?: string;
  l_status?: string;
  is_closed?: number;
  l_date?: string;
}

export type LeadUpdatePayload = Partial<LeadCreatePayload>;

export interface LeadCampaign {
  id: number;
  c_title: string;
  c_description: string;
  c_date: string | null;
  c_by?: number | null;
  c_manager?: number | null;
  c_status: string;
  staff_ids: number[];
  lead_count?: number;
}

export interface LeadCampaignCreatePayload {
  c_title: string;
  c_description?: string;
  c_date?: string;
  c_status?: string;
  staff_ids?: number[];
}

export type LeadCampaignUpdatePayload = Partial<LeadCampaignCreatePayload>;

export interface LeadFollowupStatus {
  id: number;
  title: string;
}

export interface LeadFollowupStatusPayload {
  title: string;
}

export interface LeadFollowup {
  id: number;
  c_id: number;
  l_id: number;
  followup_date: string;
  followup_time: string | null;
  next_followup_date: string;
  next_followup_time: string | null;
  followup_remark: string;
  call_status: string;
  followup_by?: number | null;
  followup_status: number;
  followup_priority: string;
}

export interface LeadFollowupCreatePayload {
  l_id: number;
  followup_date: string;
  next_followup_date: string;
  followup_time?: string;
  next_followup_time?: string;
  followup_remark?: string;
  call_status?: string;
  followup_priority?: string;
  followup_status?: number;
}

export type LeadFollowupUpdatePayload = Partial<Omit<LeadFollowupCreatePayload, 'l_id'>>;

export interface LeadSource {
  source: string;
  count: number;
}

export interface LeadSourceRenamePayload {
  old: string;
  new: string;
}

export interface LeadPromoter {
  id: number;
  c_id: number;
  campaign_title?: string | null;
  staff_id: number;
}

export interface LeadPromoterCreatePayload {
  c_id: number;
  staff_id: number;
}

export interface LeadReportSummary {
  total: number;
  open: number;
  closed: number;
  by_status: Array<{ l_status: string | null; count: number }>;
  by_source: Array<{ l_source: string | null; count: number }>;
  by_campaign: Array<{ c_id: number; c_title: string; count: number }>;
  followups: number;
}
