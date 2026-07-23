import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  Backup,
  BackupsList,
  Captcha,
  CreateOnlineAdmissionFieldPayload,
  CustomField,
  CustomFieldPayload,
  FileTypesSettings,
  ModuleItem,
  OnlineAdmissionField,
  OnlineAdmissionSettings,
  OnlineAdmissionSettingsPayload,
  SidebarMenu,
  SidebarSubMenu,
  SystemFields,
  SystemFieldsPayload,
  UpdateFileTypesPayload,
  UpdateModulePayload,
  UpdateOnlineAdmissionFieldPayload,
  UpdateSidebarMenuPayload,
  UpdateSidebarSubMenuPayload,
} from '@app-types/settings/advanced-settings';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

interface BackendModule {
  id: number;
  name: string;
  short_code: string;
  is_active: number;
  system: number;
  created_at: string | null;
}

function mapModule(row: BackendModule): ModuleItem {
  return {
    ...row,
    is_active: Boolean(row.is_active),
    system: Boolean(row.system),
  };
}

interface BackendCustomField {
  id: number;
  name: string;
  belong_to: string;
  type: string;
  bs_column: number | null;
  validation: number;
  field_values: string;
  show_table: string;
  visible_on_table: number;
  weight: number | null;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
}

function mapCustomField(row: BackendCustomField): CustomField {
  return {
    ...row,
    validation: Boolean(row.validation),
    visible_on_table: Boolean(row.visible_on_table),
    is_active: Boolean(row.is_active),
  };
}

function toCustomFieldPayload(payload: Partial<CustomFieldPayload>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  if ('validation' in payload) out.validation = payload.validation ? 1 : 0;
  if ('visible_on_table' in payload) out.visible_on_table = payload.visible_on_table ? 1 : 0;
  if ('is_active' in payload) out.is_active = payload.is_active ? 1 : 0;
  return out;
}

interface BackendCaptcha {
  id: number;
  name: string;
  status: number;
  created_at: string | null;
}

function mapCaptcha(row: BackendCaptcha): Captcha {
  return { ...row, status: Boolean(row.status) };
}

function mapFlagRecord(record: Record<string, number>): Record<string, boolean> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, Boolean(value)]));
}

function unmapFlagRecord(record: Record<string, boolean>): Record<string, number> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value ? 1 : 0]));
}

interface BackendSystemFields {
  student: Record<string, number>;
  staff: Record<string, number>;
}

function mapSystemFields(row: BackendSystemFields): SystemFields {
  return {
    student: mapFlagRecord(row.student ?? {}),
    staff: mapFlagRecord(row.staff ?? {}),
  };
}

interface BackendOnlineAdmissionSettings {
  online_admission: number;
  online_admission_payment: string;
  online_admission_amount: string;
  online_admission_instruction: string;
  online_admission_conditions: string;
  online_admission_application_form: string;
}

function mapOnlineAdmissionSettings(row: BackendOnlineAdmissionSettings): OnlineAdmissionSettings {
  return { ...row, online_admission: Boolean(row.online_admission) };
}

interface BackendOnlineAdmissionField {
  id: number;
  name: string;
  status: number;
  created_at: string | null;
}

function mapOnlineAdmissionField(row: BackendOnlineAdmissionField): OnlineAdmissionField {
  return { ...row, status: Boolean(row.status) };
}

interface BackendSidebarMenu {
  id: number;
  permission_group_id: number | null;
  icon: string;
  menu: string;
  activate_menu: string;
  lang_key: string;
  system_level: number | null;
  level: number | null;
  sidebar_display: number;
  is_active: number;
  created_at: string | null;
}

function mapSidebarMenu(row: BackendSidebarMenu): SidebarMenu {
  return {
    ...row,
    sidebar_display: Boolean(row.sidebar_display),
    is_active: Boolean(row.is_active),
  };
}

interface BackendSidebarSubMenu {
  id: number;
  sidebar_menu_id: number;
  menu: string;
  key: string;
  lang_key: string;
  url: string;
  level: number | null;
  permission_group_id: number | null;
  is_active: number;
  created_at: string | null;
}

function mapSidebarSubMenu(row: BackendSidebarSubMenu): SidebarSubMenu {
  return { ...row, is_active: Boolean(row.is_active) };
}

export const modulesService = {
  list: async (
    page: number = 1,
    search = '',
  ): Promise<{ results: ModuleItem[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.modules, {
      params: { page, ...(search ? { search } : {}) },
    });
    const raw = extractList<BackendModule>(data);
    return { results: raw.map(mapModule), count: extractCount(data, raw.length) };
  },
  update: async (id: number, payload: UpdateModulePayload): Promise<ModuleItem> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendModule>>(
      API_ENDPOINTS.settings.moduleDetail(id),
      { is_active: payload.is_active ? 1 : 0 },
    );
    return mapModule(data.data);
  },
};

export const customFieldsService = {
  list: async (
    page: number = 1,
    search = '',
    belongTo = '',
  ): Promise<{ results: CustomField[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.customFields, {
      params: {
        page,
        ...(search ? { search } : {}),
        ...(belongTo ? { belong_to: belongTo } : {}),
      },
    });
    const raw = extractList<BackendCustomField>(data);
    return { results: raw.map(mapCustomField), count: extractCount(data, raw.length) };
  },
  create: async (payload: CustomFieldPayload): Promise<CustomField> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BackendCustomField>>(
      API_ENDPOINTS.settings.customFields,
      toCustomFieldPayload(payload),
    );
    return mapCustomField(data.data);
  },
  update: async (id: number, payload: Partial<CustomFieldPayload>): Promise<CustomField> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendCustomField>>(
      API_ENDPOINTS.settings.customFieldDetail(id),
      toCustomFieldPayload(payload),
    );
    return mapCustomField(data.data);
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.settings.customFieldDetail(id));
  },
};

export const captchaService = {
  list: async (page: number = 1): Promise<{ results: Captcha[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.captcha, {
      params: { page },
    });
    const raw = extractList<BackendCaptcha>(data);
    return { results: raw.map(mapCaptcha), count: extractCount(data, raw.length) };
  },
  update: async (id: number, status: boolean): Promise<Captcha> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendCaptcha>>(
      API_ENDPOINTS.settings.captchaDetail(id),
      { status: status ? 1 : 0 },
    );
    return mapCaptcha(data.data);
  },
};

export const systemFieldsService = {
  get: async (): Promise<SystemFields> => {
    const { data } = await apiClient.get<ApiSuccessResponse<BackendSystemFields>>(
      API_ENDPOINTS.settings.systemFields,
    );
    return mapSystemFields(data.data);
  },
  update: async (payload: SystemFieldsPayload): Promise<SystemFields> => {
    const backendPayload: Record<string, Record<string, number>> = {};
    if (payload.student) backendPayload.student = unmapFlagRecord(payload.student);
    if (payload.staff) backendPayload.staff = unmapFlagRecord(payload.staff);
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendSystemFields>>(
      API_ENDPOINTS.settings.systemFields,
      backendPayload,
    );
    return mapSystemFields(data.data);
  },
};

export const onlineAdmissionSettingsService = {
  get: async (): Promise<OnlineAdmissionSettings> => {
    const { data } = await apiClient.get<ApiSuccessResponse<BackendOnlineAdmissionSettings>>(
      API_ENDPOINTS.settings.onlineAdmissionSettings,
    );
    return mapOnlineAdmissionSettings(data.data);
  },
  update: async (payload: OnlineAdmissionSettingsPayload): Promise<OnlineAdmissionSettings> => {
    const backendPayload: Record<string, unknown> = { ...payload };
    if ('online_admission' in payload) {
      backendPayload.online_admission = payload.online_admission ? 1 : 0;
    }
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendOnlineAdmissionSettings>>(
      API_ENDPOINTS.settings.onlineAdmissionSettings,
      backendPayload,
    );
    return mapOnlineAdmissionSettings(data.data);
  },
  listFields: async (
    page: number = 1,
  ): Promise<{ results: OnlineAdmissionField[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      API_ENDPOINTS.settings.onlineAdmissionFields,
      { params: { page } },
    );
    const raw = extractList<BackendOnlineAdmissionField>(data);
    return { results: raw.map(mapOnlineAdmissionField), count: extractCount(data, raw.length) };
  },
  createField: async (
    payload: CreateOnlineAdmissionFieldPayload,
  ): Promise<OnlineAdmissionField> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BackendOnlineAdmissionField>>(
      API_ENDPOINTS.settings.onlineAdmissionFields,
      { name: payload.name, status: payload.status === false ? 0 : 1 },
    );
    return mapOnlineAdmissionField(data.data);
  },
  updateField: async (
    id: number,
    payload: UpdateOnlineAdmissionFieldPayload,
  ): Promise<OnlineAdmissionField> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendOnlineAdmissionField>>(
      API_ENDPOINTS.settings.onlineAdmissionFieldDetail(id),
      { status: payload.status ? 1 : 0 },
    );
    return mapOnlineAdmissionField(data.data);
  },
};

export const sidebarMenuService = {
  listMenus: async (page: number = 1): Promise<{ results: SidebarMenu[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.sidebarMenus, {
      params: { page },
    });
    const raw = extractList<BackendSidebarMenu>(data);
    return { results: raw.map(mapSidebarMenu), count: extractCount(data, raw.length) };
  },
  updateMenu: async (id: number, payload: UpdateSidebarMenuPayload): Promise<SidebarMenu> => {
    const backendPayload: Record<string, unknown> = {};
    if ('is_active' in payload) backendPayload.is_active = payload.is_active ? 1 : 0;
    if ('sidebar_display' in payload) {
      backendPayload.sidebar_display = payload.sidebar_display ? 1 : 0;
    }
    if ('level' in payload) backendPayload.level = payload.level;
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendSidebarMenu>>(
      API_ENDPOINTS.settings.sidebarMenuDetail(id),
      backendPayload,
    );
    return mapSidebarMenu(data.data);
  },
  listSubmenus: async (
    page: number = 1,
    menuId: number | null = null,
  ): Promise<{ results: SidebarSubMenu[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.sidebarSubmenus, {
      params: { page, ...(menuId ? { menu_id: menuId } : {}) },
    });
    const raw = extractList<BackendSidebarSubMenu>(data);
    return { results: raw.map(mapSidebarSubMenu), count: extractCount(data, raw.length) };
  },
  updateSubmenu: async (
    id: number,
    payload: UpdateSidebarSubMenuPayload,
  ): Promise<SidebarSubMenu> => {
    const backendPayload: Record<string, unknown> = {};
    if ('is_active' in payload) backendPayload.is_active = payload.is_active ? 1 : 0;
    if ('level' in payload) backendPayload.level = payload.level;
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendSidebarSubMenu>>(
      API_ENDPOINTS.settings.sidebarSubmenuDetail(id),
      backendPayload,
    );
    return mapSidebarSubMenu(data.data);
  },
};

export const fileTypesService = {
  get: async (): Promise<FileTypesSettings> => {
    const { data } = await apiClient.get<ApiSuccessResponse<FileTypesSettings>>(
      API_ENDPOINTS.settings.fileTypes,
    );
    return data.data;
  },
  update: async (payload: UpdateFileTypesPayload): Promise<FileTypesSettings> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FileTypesSettings>>(
      API_ENDPOINTS.settings.fileTypes,
      payload,
    );
    return data.data;
  },
};

export const backupsService = {
  list: async (): Promise<BackupsList> => {
    const { data } = await apiClient.get<ApiSuccessResponse<BackupsList>>(
      API_ENDPOINTS.settings.backups,
    );
    return data.data;
  },
  create: async (): Promise<Backup> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Backup>>(
      API_ENDPOINTS.settings.backups,
    );
    return data.data;
  },
  download: async (filename: string): Promise<void> => {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.settings.backupDetail(filename), {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
  delete: async (filename: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.settings.backupDetail(filename));
  },
  restore: async (filename: string): Promise<{ filename: string; restored: boolean }> => {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ filename: string; restored: boolean }>
    >(API_ENDPOINTS.settings.backupRestore(filename));
    return data.data;
  },
};
