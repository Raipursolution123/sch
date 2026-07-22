export interface PrintHeaderFooter {
  id: number;
  print_type: string;
  header_image: string;
  footer_content: string;
  created_by: number;
  entry_date: string;
  created_at: string;
}

export type PrintHeaderFooterCreatePayload = Omit<PrintHeaderFooter, 'id' | 'created_by' | 'entry_date' | 'created_at'>;
export type PrintHeaderFooterUpdatePayload = Partial<PrintHeaderFooterCreatePayload>;
