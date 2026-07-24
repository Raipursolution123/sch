import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CmsBanner,
  CmsBannerCreatePayload,
  CmsBannerUpdatePayload,
  CmsEvent,
  CmsEventCreatePayload,
  CmsEventUpdatePayload,
  CmsMedia,
  CmsMediaCreatePayload,
  CmsMediaUpdatePayload,
  CmsMenu,
  CmsMenuCreatePayload,
  CmsMenuItemCreatePayload,
  CmsMenuUpdatePayload,
  CmsPage,
  CmsPageCreatePayload,
  CmsPageUpdatePayload,
  CmsSettings,
  CmsSettingsUpdatePayload,
} from '@app-types/cms';
import { type BackendPayload, extractList } from '@utils/api-response';

const listParams = (query?: string) => ({
  page_size: 100,
  ...(query ? { q: query } : {}),
});

export const cmsService = {
  listEvents: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.events, {
      params: listParams(query),
    });
    return extractList<CmsEvent>(data);
  },

  createEvent: async (payload: CmsEventCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsEvent>>(
      API_ENDPOINTS.cms.events,
      payload,
    );
    return data.data;
  },

  updateEvent: async (id: number, payload: CmsEventUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsEvent>>(
      API_ENDPOINTS.cms.eventDetail(id),
      payload,
    );
    return data.data;
  },

  deleteEvent: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.eventDetail(id));
  },

  listGallery: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.gallery, {
      params: listParams(query),
    });
    return extractList<CmsMedia>(data);
  },

  createGallery: async (payload: CmsMediaCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsMedia>>(
      API_ENDPOINTS.cms.gallery,
      payload,
    );
    return data.data;
  },

  updateGallery: async (id: number, payload: CmsMediaUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsMedia>>(
      API_ENDPOINTS.cms.galleryDetail(id),
      payload,
    );
    return data.data;
  },

  deleteGallery: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.galleryDetail(id));
  },

  listMedia: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.media, {
      params: listParams(query),
    });
    return extractList<CmsMedia>(data);
  },

  createMedia: async (payload: CmsMediaCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsMedia>>(
      API_ENDPOINTS.cms.media,
      payload,
    );
    return data.data;
  },

  updateMedia: async (id: number, payload: CmsMediaUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsMedia>>(
      API_ENDPOINTS.cms.mediaDetail(id),
      payload,
    );
    return data.data;
  },

  deleteMedia: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.mediaDetail(id));
  },

  listNotices: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.notices, {
      params: listParams(query),
    });
    return extractList<CmsPage>(data);
  },

  createNotice: async (payload: CmsPageCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsPage>>(
      API_ENDPOINTS.cms.notices,
      payload,
    );
    return data.data;
  },

  updateNotice: async (id: number, payload: CmsPageUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsPage>>(
      API_ENDPOINTS.cms.noticeDetail(id),
      payload,
    );
    return data.data;
  },

  deleteNotice: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.noticeDetail(id));
  },

  listPages: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.pages, {
      params: listParams(query),
    });
    return extractList<CmsPage>(data);
  },

  createPage: async (payload: CmsPageCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsPage>>(
      API_ENDPOINTS.cms.pages,
      payload,
    );
    return data.data;
  },

  updatePage: async (id: number, payload: CmsPageUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsPage>>(
      API_ENDPOINTS.cms.pageDetail(id),
      payload,
    );
    return data.data;
  },

  deletePage: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.pageDetail(id));
  },

  listMenus: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.menus, {
      params: listParams(query),
    });
    return extractList<CmsMenu>(data);
  },

  createMenu: async (payload: CmsMenuCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsMenu>>(
      API_ENDPOINTS.cms.menus,
      payload,
    );
    return data.data;
  },

  updateMenu: async (id: number, payload: CmsMenuUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsMenu>>(
      API_ENDPOINTS.cms.menuDetail(id),
      payload,
    );
    return data.data;
  },

  deleteMenu: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.menuDetail(id));
  },

  addMenuItem: async (menuId: number, payload: CmsMenuItemCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsMenu>>(
      API_ENDPOINTS.cms.menuItems(menuId),
      payload,
    );
    return data.data;
  },

  deleteMenuItem: async (menuId: number, itemId: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.menuItemDetail(menuId, itemId));
  },

  listBanners: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.cms.banners, {
      params: listParams(query),
    });
    return extractList<CmsBanner>(data);
  },

  createBanner: async (payload: CmsBannerCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<CmsBanner>>(
      API_ENDPOINTS.cms.banners,
      payload,
    );
    return data.data;
  },

  updateBanner: async (id: number, payload: CmsBannerUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CmsBanner>>(
      API_ENDPOINTS.cms.bannerDetail(id),
      payload,
    );
    return data.data;
  },

  deleteBanner: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.cms.bannerDetail(id));
  },

  getSettings: async () => {
    const { data } = await apiClient.get<ApiSuccessResponse<CmsSettings>>(
      API_ENDPOINTS.cms.settings,
    );
    return data.data;
  },

  updateSettings: async (payload: CmsSettingsUpdatePayload) => {
    const { data } = await apiClient.put<ApiSuccessResponse<CmsSettings>>(
      API_ENDPOINTS.cms.settings,
      payload,
    );
    return data.data;
  },
};
