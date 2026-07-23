from django.urls import path

from apps.cms.api.views.cms import (
    CmsBannerDetailView,
    CmsBannerListCreateView,
    CmsEventDetailView,
    CmsEventListCreateView,
    CmsGalleryDetailView,
    CmsGalleryListCreateView,
    CmsMediaDetailView,
    CmsMediaListCreateView,
    CmsMenuDetailView,
    CmsMenuItemCreateView,
    CmsMenuItemDeleteView,
    CmsMenuListCreateView,
    CmsNoticeDetailView,
    CmsNoticeListCreateView,
    CmsPageDetailView,
    CmsPageListCreateView,
    CmsSettingsView,
)

urlpatterns = [
    path("events/", CmsEventListCreateView.as_view(), name="cms_events"),
    path("events/<int:pk>/", CmsEventDetailView.as_view(), name="cms_events_detail"),
    path("gallery/", CmsGalleryListCreateView.as_view(), name="cms_gallery"),
    path(
        "gallery/<int:pk>/", CmsGalleryDetailView.as_view(), name="cms_gallery_detail"
    ),
    path("media/", CmsMediaListCreateView.as_view(), name="cms_media"),
    path("media/<int:pk>/", CmsMediaDetailView.as_view(), name="cms_media_detail"),
    path("notices/", CmsNoticeListCreateView.as_view(), name="cms_notices"),
    path("notices/<int:pk>/", CmsNoticeDetailView.as_view(), name="cms_notices_detail"),
    path("pages/", CmsPageListCreateView.as_view(), name="cms_pages"),
    path("pages/<int:pk>/", CmsPageDetailView.as_view(), name="cms_pages_detail"),
    path("menus/", CmsMenuListCreateView.as_view(), name="cms_menus"),
    path("menus/<int:pk>/", CmsMenuDetailView.as_view(), name="cms_menus_detail"),
    path(
        "menus/<int:pk>/items/", CmsMenuItemCreateView.as_view(), name="cms_menu_items"
    ),
    path(
        "menus/<int:pk>/items/<int:item_id>/",
        CmsMenuItemDeleteView.as_view(),
        name="cms_menu_item_detail",
    ),
    path("banners/", CmsBannerListCreateView.as_view(), name="cms_banners"),
    path("banners/<int:pk>/", CmsBannerDetailView.as_view(), name="cms_banners_detail"),
    path("settings/", CmsSettingsView.as_view(), name="cms_settings"),
]
