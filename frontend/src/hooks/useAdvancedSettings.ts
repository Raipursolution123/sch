import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  backupsService,
  captchaService,
  customFieldsService,
  fileTypesService,
  modulesService,
  onlineAdmissionSettingsService,
  sidebarMenuService,
  systemFieldsService,
} from '@services/api';
import type {
  CreateOnlineAdmissionFieldPayload,
  CustomFieldPayload,
  OnlineAdmissionSettingsPayload,
  SystemFieldsPayload,
  UpdateFileTypesPayload,
  UpdateOnlineAdmissionFieldPayload,
  UpdateSidebarMenuPayload,
  UpdateSidebarSubMenuPayload,
} from '@app-types/settings/advanced-settings';
import { getApiErrorMessage } from '@utils/error-message';

// Modules
export function useModules(page = 1, search = '') {
  return useQuery({
    queryKey: queryKeys.settings.modules.list(page, search),
    queryFn: () => modulesService.list(page, search),
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      modulesService.update(id, { is_active: isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.modules.all });
      toast.success('Module updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update module')),
  });
}

// Custom fields
export function useCustomFields(page = 1, search = '', belongTo = '') {
  return useQuery({
    queryKey: queryKeys.settings.customFields.list(page, search, belongTo),
    queryFn: () => customFieldsService.list(page, search, belongTo),
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomFieldPayload) => customFieldsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields.all });
      toast.success('Custom field created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create custom field')),
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CustomFieldPayload> }) =>
      customFieldsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields.all });
      toast.success('Custom field updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update custom field')),
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customFieldsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields.all });
      toast.success('Custom field deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete custom field')),
  });
}

// Captcha
export function useCaptchaSettings(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.captcha.list(page),
    queryFn: () => captchaService.list(page),
  });
}

export function useUpdateCaptcha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: boolean }) =>
      captchaService.update(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.captcha.all });
      toast.success('Captcha setting updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update captcha')),
  });
}

// System fields
export function useSystemFields() {
  return useQuery({
    queryKey: queryKeys.settings.systemFields.detail(),
    queryFn: systemFieldsService.get,
  });
}

export function useUpdateSystemFields() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SystemFieldsPayload) => systemFieldsService.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.systemFields.all });
      toast.success('System fields saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save system fields')),
  });
}

// Online admission settings
export function useOnlineAdmissionSettings() {
  return useQuery({
    queryKey: queryKeys.settings.onlineAdmissionSettings.detail(),
    queryFn: onlineAdmissionSettingsService.get,
  });
}

export function useUpdateOnlineAdmissionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnlineAdmissionSettingsPayload) =>
      onlineAdmissionSettingsService.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.onlineAdmissionSettings.all,
      });
      toast.success('Online admission settings saved');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to save online admission settings')),
  });
}

export function useOnlineAdmissionFields(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.onlineAdmissionFields.list(page),
    queryFn: () => onlineAdmissionSettingsService.listFields(page),
  });
}

export function useCreateOnlineAdmissionField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnlineAdmissionFieldPayload) =>
      onlineAdmissionSettingsService.createField(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.onlineAdmissionFields.all,
      });
      toast.success('Field added');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add field')),
  });
}

export function useUpdateOnlineAdmissionField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOnlineAdmissionFieldPayload }) =>
      onlineAdmissionSettingsService.updateField(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.onlineAdmissionFields.all,
      });
      toast.success('Field updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update field')),
  });
}

// Sidebar menus
export function useSidebarMenus(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.sidebarMenus.list(page),
    queryFn: () => sidebarMenuService.listMenus(page),
  });
}

export function useUpdateSidebarMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSidebarMenuPayload }) =>
      sidebarMenuService.updateMenu(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sidebarMenus.all });
      toast.success('Sidebar menu updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update sidebar menu')),
  });
}

export function useSidebarSubmenus(page = 1, menuId: number | null = null) {
  return useQuery({
    queryKey: queryKeys.settings.sidebarSubmenus.list(page, menuId),
    queryFn: () => sidebarMenuService.listSubmenus(page, menuId),
  });
}

export function useUpdateSidebarSubmenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSidebarSubMenuPayload }) =>
      sidebarMenuService.updateSubmenu(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sidebarSubmenus.all });
      toast.success('Sidebar submenu updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update sidebar submenu')),
  });
}

// File types
export function useFileTypes() {
  return useQuery({
    queryKey: queryKeys.settings.fileTypes.detail(),
    queryFn: fileTypesService.get,
  });
}

export function useUpdateFileTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFileTypesPayload) => fileTypesService.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.fileTypes.all });
      toast.success('File type settings saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save file type settings')),
  });
}

// Backups
export function useBackups() {
  return useQuery({
    queryKey: queryKeys.settings.backups.list(),
    queryFn: backupsService.list,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: backupsService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.backups.all });
      toast.success('Backup created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create backup')),
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: (filename: string) => backupsService.download(filename),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to download backup')),
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => backupsService.delete(filename),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.backups.all });
      toast.success('Backup deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete backup')),
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => backupsService.restore(filename),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.backups.all });
      toast.success('Database restored successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to restore backup')),
  });
}
