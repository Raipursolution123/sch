import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { cmsService } from '@services/api/cms.service';
import type {
  CmsBannerCreatePayload,
  CmsBannerUpdatePayload,
  CmsEventCreatePayload,
  CmsEventUpdatePayload,
  CmsMediaCreatePayload,
  CmsMediaUpdatePayload,
  CmsMenuCreatePayload,
  CmsMenuItemCreatePayload,
  CmsMenuUpdatePayload,
  CmsPageCreatePayload,
  CmsPageUpdatePayload,
  CmsSettingsUpdatePayload,
} from '@app-types/cms';
import { getApiErrorMessage } from '@utils/session';

function invalidateCms(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.cms.all });
}

export function useCmsEvents(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.events.list(query),
    queryFn: () => cmsService.listEvents(query || undefined),
  });
}

export function useCreateCmsEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsEventCreatePayload) => cmsService.createEvent(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Event created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create event')),
  });
}

export function useUpdateCmsEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsEventUpdatePayload }) =>
      cmsService.updateEvent(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Event updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update event')),
  });
}

export function useDeleteCmsEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteEvent(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Event deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete event')),
  });
}

export function useCmsGallery(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.gallery.list(query),
    queryFn: () => cmsService.listGallery(query || undefined),
  });
}

export function useCreateCmsGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsMediaCreatePayload) => cmsService.createGallery(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Gallery item created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create gallery item')),
  });
}

export function useUpdateCmsGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsMediaUpdatePayload }) =>
      cmsService.updateGallery(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Gallery item updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update gallery item')),
  });
}

export function useDeleteCmsGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteGallery(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Gallery item deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete gallery item')),
  });
}

export function useCmsMedia(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.media.list(query),
    queryFn: () => cmsService.listMedia(query || undefined),
  });
}

export function useCreateCmsMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsMediaCreatePayload) => cmsService.createMedia(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Media created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create media')),
  });
}

export function useUpdateCmsMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsMediaUpdatePayload }) =>
      cmsService.updateMedia(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Media updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update media')),
  });
}

export function useDeleteCmsMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteMedia(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Media deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete media')),
  });
}

export function useCmsNotices(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.notices.list(query),
    queryFn: () => cmsService.listNotices(query || undefined),
  });
}

export function useCreateCmsNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsPageCreatePayload) => cmsService.createNotice(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Notice created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create notice')),
  });
}

export function useUpdateCmsNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsPageUpdatePayload }) =>
      cmsService.updateNotice(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Notice updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update notice')),
  });
}

export function useDeleteCmsNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteNotice(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Notice deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete notice')),
  });
}

export function useCmsPages(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.pages.list(query),
    queryFn: () => cmsService.listPages(query || undefined),
  });
}

export function useCreateCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsPageCreatePayload) => cmsService.createPage(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Page created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create page')),
  });
}

export function useUpdateCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsPageUpdatePayload }) =>
      cmsService.updatePage(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Page updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update page')),
  });
}

export function useDeleteCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deletePage(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Page deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete page')),
  });
}

export function useCmsMenus(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.menus.list(query),
    queryFn: () => cmsService.listMenus(query || undefined),
  });
}

export function useCreateCmsMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsMenuCreatePayload) => cmsService.createMenu(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Menu created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create menu')),
  });
}

export function useUpdateCmsMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsMenuUpdatePayload }) =>
      cmsService.updateMenu(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Menu updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update menu')),
  });
}

export function useDeleteCmsMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteMenu(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Menu deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete menu')),
  });
}

export function useAddCmsMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, payload }: { menuId: number; payload: CmsMenuItemCreatePayload }) =>
      cmsService.addMenuItem(menuId, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Menu item added');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to add menu item')),
  });
}

export function useDeleteCmsMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, itemId }: { menuId: number; itemId: number }) =>
      cmsService.deleteMenuItem(menuId, itemId),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Menu item deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete menu item')),
  });
}

export function useCmsBanners(query = '') {
  return useQuery({
    queryKey: queryKeys.cms.banners.list(query),
    queryFn: () => cmsService.listBanners(query || undefined),
  });
}

export function useCreateCmsBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsBannerCreatePayload) => cmsService.createBanner(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Banner created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create banner')),
  });
}

export function useUpdateCmsBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsBannerUpdatePayload }) =>
      cmsService.updateBanner(id, payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Banner updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update banner')),
  });
}

export function useDeleteCmsBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cmsService.deleteBanner(id),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('Banner deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete banner')),
  });
}

export function useCmsSettings() {
  return useQuery({
    queryKey: queryKeys.cms.settings(),
    queryFn: () => cmsService.getSettings(),
  });
}

export function useUpdateCmsSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CmsSettingsUpdatePayload) => cmsService.updateSettings(payload),
    onSuccess: () => {
      invalidateCms(qc);
      toast.success('CMS settings saved');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to save CMS settings')),
  });
}
