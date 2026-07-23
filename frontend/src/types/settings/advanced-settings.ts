export interface ModuleItem {
  id: number;
  name: string;
  short_code: string;
  is_active: boolean;
  system: boolean;
  created_at: string | null;
}

export interface UpdateModulePayload {
  is_active: boolean;
}

export interface CustomField {
  id: number;
  name: string;
  belong_to: string;
  type: string;
  bs_column: number | null;
  validation: boolean;
  field_values: string;
  show_table: string;
  visible_on_table: boolean;
  weight: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomFieldPayload {
  name: string;
  belong_to: string;
  type: string;
  bs_column?: number | null;
  validation?: boolean;
  field_values?: string;
  show_table?: string;
  visible_on_table?: boolean;
  weight?: number | null;
  is_active?: boolean;
}

export interface Captcha {
  id: number;
  name: string;
  status: boolean;
  created_at: string | null;
}

export type SystemFieldsGroup = Record<string, boolean>;

export interface SystemFields {
  student: SystemFieldsGroup;
  staff: SystemFieldsGroup;
}

export interface SystemFieldsPayload {
  student?: SystemFieldsGroup;
  staff?: SystemFieldsGroup;
}

export interface OnlineAdmissionSettings {
  online_admission: boolean;
  online_admission_payment: string;
  online_admission_amount: string;
  online_admission_instruction: string;
  online_admission_conditions: string;
  online_admission_application_form: string;
}

export type OnlineAdmissionSettingsPayload = Partial<OnlineAdmissionSettings>;

export interface OnlineAdmissionField {
  id: number;
  name: string;
  status: boolean;
  created_at: string | null;
}

export interface CreateOnlineAdmissionFieldPayload {
  name: string;
  status?: boolean;
}

export interface UpdateOnlineAdmissionFieldPayload {
  status: boolean;
}

export interface SidebarMenu {
  id: number;
  permission_group_id: number | null;
  icon: string;
  menu: string;
  activate_menu: string;
  lang_key: string;
  system_level: number | null;
  level: number | null;
  sidebar_display: boolean;
  is_active: boolean;
  created_at: string | null;
}

export interface UpdateSidebarMenuPayload {
  is_active?: boolean;
  sidebar_display?: boolean;
  level?: number;
}

export interface SidebarSubMenu {
  id: number;
  sidebar_menu_id: number;
  menu: string;
  key: string;
  lang_key: string;
  url: string;
  level: number | null;
  permission_group_id: number | null;
  is_active: boolean;
  created_at: string | null;
}

export interface UpdateSidebarSubMenuPayload {
  is_active?: boolean;
  level?: number;
}

export interface FileTypesSettings {
  id: number;
  file_extension: string;
  file_mime: string;
  file_size: number;
  image_extension: string;
  image_mime: string;
  image_size: number;
  created_at: string | null;
}

export type UpdateFileTypesPayload = Partial<Omit<FileTypesSettings, 'id' | 'created_at'>>;

export interface Backup {
  filename: string;
  size_bytes: number;
  created_at: string;
}

export interface BackupsList {
  results: Backup[];
  restore_allowed: boolean;
}
