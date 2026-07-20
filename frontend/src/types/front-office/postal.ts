export type PostalRecordType = 'dispatch' | 'receive';

export interface PostalRecord {
  id: number;
  reference_no: string;
  to_title: string;
  type: PostalRecordType;
  address: string;
  note: string;
  from_title: string;
  date: string | null;
  image: string | null;
  created_at: string;
}

export interface CreatePostalRecordPayload {
  reference_no: string;
  to_title: string;
  type: PostalRecordType;
  address?: string;
  note?: string;
  from_title?: string;
  date?: string | null;
  image?: string | null;
}

export type UpdatePostalRecordPayload = Partial<CreatePostalRecordPayload>;
