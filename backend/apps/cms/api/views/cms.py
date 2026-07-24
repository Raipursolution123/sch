from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cms.services.cms_service import (
    CmsBannerService,
    CmsError,
    CmsEventService,
    CmsMediaService,
    CmsMenuService,
    CmsNotFoundError,
    CmsPageService,
    CmsSettingsService,
    CmsValidationError,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_cms"


def cms_error(exc: CmsError):
    code = status.HTTP_400_BAD_REQUEST
    if isinstance(exc, CmsNotFoundError):
        code = status.HTTP_404_NOT_FOUND
    elif not isinstance(exc, CmsValidationError):
        code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return APIResponse.error(message=exc.message, status_code=code)


def _paginated(request, view, qs, to_dict, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = [to_dict(r) for r in (page if page is not None else qs)]
    if page is not None:
        return paginator.get_paginated_response(rows)
    return APIResponse.success(data=rows, message=message)


class _CrudMixin:
    service_cls = None
    category = None
    list_message = "Retrieved."
    create_message = "Created."

    @property
    def permission_classes(self):
        return [IsAuthenticated, HasLegacyPrivilege]

    @property
    def legacy_module_short_code(self):
        return MODULE

    @property
    def legacy_permission_category(self):
        return self.category


# Explicit views (cleaner than mixin for DRF class attrs)


class CmsEventListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "event"

    def get(self, request):
        s = CmsEventService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q")),
            s.to_dict,
            "Events retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=CmsEventService().create(request.data),
                message="Event created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsEventDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "event"

    def get(self, request, pk):
        try:
            s = CmsEventService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except CmsError as e:
            return cms_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsEventService().update(pk, request.data),
                message="Event updated.",
            )
        except CmsError as e:
            return cms_error(e)

    def delete(self, request, pk):
        try:
            CmsEventService().delete(pk)
            return APIResponse.success(message="Event deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsMediaListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "media_manager"

    def get(self, request):
        s = CmsMediaService()
        return _paginated(
            request,
            self,
            s.list(
                query=request.query_params.get("q"),
                category=request.query_params.get("category"),
            ),
            s.to_dict,
            "Media retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=CmsMediaService().create(request.data),
                message="Media created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsMediaDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "media_manager"

    def get(self, request, pk):
        try:
            s = CmsMediaService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except CmsError as e:
            return cms_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsMediaService().update(pk, request.data),
                message="Media updated.",
            )
        except CmsError as e:
            return cms_error(e)

    def delete(self, request, pk):
        try:
            CmsMediaService().delete(pk)
            return APIResponse.success(message="Media deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsGalleryListCreateView(CmsMediaListCreateView):
    legacy_permission_category = "gallery"

    def get(self, request):
        s = CmsMediaService()
        category = request.query_params.get("category") or "gallery"
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q"), category=category),
            s.to_dict,
            "Gallery retrieved.",
        )

    def post(self, request):
        data = dict(request.data)
        data.setdefault("category", "gallery")
        try:
            return APIResponse.success(
                data=CmsMediaService().create(data),
                message="Gallery item created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsGalleryDetailView(CmsMediaDetailView):
    legacy_permission_category = "gallery"


class CmsPageListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "pages"

    def get(self, request):
        s = CmsPageService()
        return _paginated(
            request,
            self,
            s.list(
                query=request.query_params.get("q"),
                page_type=request.query_params.get("type"),
            ),
            s.to_dict,
            "Pages retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=CmsPageService().create(request.data),
                message="Page created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsPageDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "pages"

    def get(self, request, pk):
        try:
            s = CmsPageService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except CmsError as e:
            return cms_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsPageService().update(pk, request.data), message="Page updated."
            )
        except CmsError as e:
            return cms_error(e)

    def delete(self, request, pk):
        try:
            CmsPageService().delete(pk)
            return APIResponse.success(message="Page deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsNoticeListCreateView(CmsPageListCreateView):
    legacy_permission_category = "notice"

    def get(self, request):
        s = CmsPageService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q"), page_type="notice"),
            s.to_dict,
            "Notices retrieved.",
        )

    def post(self, request):
        data = dict(request.data)
        data["type"] = "notice"
        try:
            return APIResponse.success(
                data=CmsPageService().create(data),
                message="Notice created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsNoticeDetailView(CmsPageDetailView):
    legacy_permission_category = "notice"


class CmsMenuListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "menus"

    def get(self, request):
        s = CmsMenuService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q")),
            s.to_dict,
            "Menus retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=CmsMenuService().create(request.data),
                message="Menu created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsMenuDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "menus"

    def get(self, request, pk):
        try:
            s = CmsMenuService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except CmsError as e:
            return cms_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsMenuService().update(pk, request.data), message="Menu updated."
            )
        except CmsError as e:
            return cms_error(e)

    def delete(self, request, pk):
        try:
            CmsMenuService().delete(pk)
            return APIResponse.success(message="Menu deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsMenuItemCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "menus"

    def post(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsMenuService().add_item(pk, request.data),
                message="Menu item added.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsMenuItemDeleteView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "menus"

    def delete(self, request, pk, item_id):
        try:
            CmsMenuService().delete_item(pk, item_id)
            return APIResponse.success(message="Menu item deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsBannerListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "banner_images"

    def get(self, request):
        s = CmsBannerService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q")),
            s.to_dict,
            "Banners retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=CmsBannerService().create(request.data),
                message="Banner created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CmsError as e:
            return cms_error(e)


class CmsBannerDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "banner_images"

    def get(self, request, pk):
        try:
            s = CmsBannerService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except CmsError as e:
            return cms_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CmsBannerService().update(pk, request.data),
                message="Banner updated.",
            )
        except CmsError as e:
            return cms_error(e)

    def delete(self, request, pk):
        try:
            CmsBannerService().delete(pk)
            return APIResponse.success(message="Banner deleted.")
        except CmsError as e:
            return cms_error(e)


class CmsSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "system_settings"
    legacy_permission_category = "front_cms_setting"
    legacy_method_actions = {"PUT": "can_edit", "PATCH": "can_edit"}

    def get(self, request):
        s = CmsSettingsService()
        return APIResponse.success(
            data=s.to_dict(s.get_or_create()), message="CMS settings."
        )

    def patch(self, request):
        return self.put(request)

    def put(self, request):
        try:
            return APIResponse.success(
                data=CmsSettingsService().update(request.data),
                message="CMS settings updated.",
            )
        except CmsError as e:
            return cms_error(e)
