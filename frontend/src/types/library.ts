export interface LibraryBook {
  id: number;
  book_title: string;
  book_no: string;
  isbn_no: string;
  subject: string | null;
  claases: string | null;
  category: string | null;
  rack_no: string;
  publish: string | null;
  author: string | null;
  qty: number | null;
  perunitcost: number | null;
  postdate: string | null;
  description: string | null;
  available: string | null;
  is_active: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateLibraryBookPayload {
  book_title: string;
  book_no: string;
  isbn_no: string;
  rack_no: string;
  subject?: string | null;
  claases?: string | null;
  category?: string | null;
  publish?: string | null;
  author?: string | null;
  qty?: number;
  perunitcost?: number | null;
  postdate?: string | null;
  description?: string | null;
  available?: string | null;
  is_active?: string | null;
}

export type UpdateLibraryBookPayload = Partial<CreateLibraryBookPayload>;

export interface LibraryMember {
  id: number;
  library_card_no: string | null;
  member_type: string | null;
  member_id: number | null;
  is_active: string;
  created_at: string;
}

export interface CreateLibraryMemberPayload {
  library_card_no?: string | null;
  member_type: string;
  member_id: number;
  is_active?: string;
}

export interface BookIssue {
  id: number;
  book_id: number;
  member_id: number | null;
  issue_date: string | null;
  duereturn_date: string | null;
  return_date: string | null;
  is_returned: number;
  is_active: string | null;
  created_at: string;
  book_title: string | null;
  book_no: string | null;
  library_card_no: string | null;
  member_type: string | null;
  member_ref_id: number | null;
}

export interface IssueBookPayload {
  book_id: number;
  member_id: number;
  issue_date?: string;
  duereturn_date?: string | null;
}
