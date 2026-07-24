export interface CmsEvent {
  id: number;
  event_title: string;
  event_description: string;
  start_date: string;
  end_date: string;
  event_type: string;
  event_color: string;
  event_for: string;
  role_id?: number | null;
  is_active: string;
}

export interface CmsEventCreatePayload {
  event_title: string;
  start_date: string;
  end_date: string;
  event_description?: string;
  event_type?: string;
  event_color?: string;
  event_for?: string;
  is_active?: string;
}

export type CmsEventUpdatePayload = Partial<CmsEventCreatePayload>;

export interface CmsMedia {
  id: number;
  category: string;
  image?: string | null;
  thumb_path?: string | null;
  dir_path?: string | null;
  img_name?: string | null;
  thumb_name?: string | null;
  file_type: string;
  file_size: string;
  vid_url: string;
  vid_title: string;
  is_it_award?: number;
  is_it_form?: number;
  is_it_notice?: number;
  is_it_order?: number;
  is_it_report?: number;
  content_description: string;
  created_at?: string | null;
}

export interface CmsMediaCreatePayload {
  category?: string;
  img_name?: string;
  image?: string;
  file_type?: string;
  vid_url?: string;
  vid_title?: string;
  content_description?: string;
}

export type CmsMediaUpdatePayload = Partial<CmsMediaCreatePayload>;

export interface CmsPage {
  id: number;
  page_type: string;
  is_homepage: number;
  title: string;
  url?: string | null;
  type: string;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keyword?: string | null;
  feature_image: string;
  description?: string | null;
  publish_date?: string | null;
  publish: number;
  sidebar: number;
  is_active: string;
  created_at?: string | null;
}

export interface CmsPageCreatePayload {
  title: string;
  type?: string;
  slug?: string;
  description?: string;
  url?: string;
  feature_image?: string;
  publish?: number;
  is_active?: string;
  publish_date?: string;
}

export type CmsPageUpdatePayload = Partial<CmsPageCreatePayload>;

export interface CmsMenuItem {
  id: number;
  menu_id: number;
  menu: string;
  page_id: number;
  parent_id: number;
  level: number;
  ext_url?: string | null;
  open_new_tab: number;
  ext_url_link?: string | null;
  slug: string;
  weight: number;
  publish: number;
  description?: string | null;
  is_active: string;
}

export interface CmsMenu {
  id: number;
  menu: string;
  slug: string;
  description?: string | null;
  open_new_tab: number;
  ext_url: string;
  ext_url_link: string;
  publish: number;
  content_type: string;
  is_active: string;
  created_at?: string | null;
  items: CmsMenuItem[];
}

export interface CmsMenuCreatePayload {
  menu: string;
  slug?: string;
  description?: string;
  publish?: number;
  is_active?: string;
}

export type CmsMenuUpdatePayload = Partial<CmsMenuCreatePayload>;

export interface CmsMenuItemCreatePayload {
  menu: string;
  page_id?: number;
  ext_url?: string;
  ext_url_link?: string;
  weight?: number;
  publish?: number;
}

export interface CmsBanner {
  id: number;
  type: string;
  title: string;
  slug: string;
  url?: string | null;
  description?: string | null;
  feature_image: string;
  publish: string;
  is_active: string;
  publish_date?: string | null;
  created_at?: string | null;
}

export interface CmsBannerCreatePayload {
  title: string;
  slug?: string;
  url?: string;
  description?: string;
  feature_image?: string;
  publish?: string;
  is_active?: string;
  publish_date?: string;
}

export type CmsBannerUpdatePayload = Partial<CmsBannerCreatePayload>;

export interface CmsSettings {
  id: number;
  theme: string;
  is_active_rtl: number;
  is_active_front_cms: number;
  is_active_sidebar: number;
  logo?: string | null;
  contact_us_email?: string | null;
  complain_form_email?: string | null;
  sidebar_options: string;
  whatsapp_url: string;
  fb_url: string;
  twitter_url: string;
  youtube_url: string;
  google_plus: string;
  instagram_url: string;
  pinterest_url: string;
  linkedin_url: string;
  google_analytics?: string | null;
  footer_text?: string | null;
  cookie_consent: string;
  fav_icon?: string | null;
  created_at?: string | null;
}

export type CmsSettingsUpdatePayload = Partial<Omit<CmsSettings, 'id' | 'created_at'>>;
