from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cyc_extensions.services.lead_service import (
    CampaignService,
    FollowupService,
    FollowupStatusService,
    LeadError,
    LeadNotFoundError,
    LeadReportService,
    LeadService,
    LeadValidationError,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "lead_manager"


def lead_error(exc: LeadError):
    code = status.HTTP_400_BAD_REQUEST
    if isinstance(exc, LeadNotFoundError):
        code = status.HTTP_404_NOT_FOUND
    elif not isinstance(exc, LeadValidationError):
        code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return APIResponse.error(message=exc.message, status_code=code)


def _paginated(request, view, qs, to_dict, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = [to_dict(r) for r in (page if page is not None else qs)]
    if page is not None:
        return paginator.get_paginated_response(rows)
    return APIResponse.success(data=rows, message=message)


class LeadListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "all_leads"

    def get(self, request):
        service = LeadService()
        qs = service.list(
            query=request.query_params.get("q"),
            campaign_id=request.query_params.get("c_id") or None,
        )
        return _paginated(request, self, qs, service.to_dict, "Leads retrieved.")

    def post(self, request):
        try:
            data = LeadService().create(
                request.data,
                manager_id=int(getattr(request.user, "user_id", 0) or 0),
            )
            return APIResponse.success(
                data=data, message="Lead created.", status_code=status.HTTP_201_CREATED
            )
        except LeadError as exc:
            return lead_error(exc)


class LeadDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "all_leads"

    def get(self, request, pk):
        try:
            s = LeadService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except LeadError as e:
            return lead_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=LeadService().update(pk, request.data), message="Lead updated."
            )
        except LeadError as e:
            return lead_error(e)

    def delete(self, request, pk):
        try:
            LeadService().delete(pk)
            return APIResponse.success(message="Lead deleted.")
        except LeadError as e:
            return lead_error(e)


class CampaignListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"

    def get(self, request):
        s = CampaignService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q")),
            s.to_dict,
            "Campaigns retrieved.",
        )

    def post(self, request):
        try:
            data = CampaignService().create(
                request.data, user_id=int(getattr(request.user, "user_id", 0) or 0)
            )
            return APIResponse.success(
                data=data,
                message="Campaign created.",
                status_code=status.HTTP_201_CREATED,
            )
        except LeadError as e:
            return lead_error(e)


class CampaignDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"

    def get(self, request, pk):
        try:
            s = CampaignService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except LeadError as e:
            return lead_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=CampaignService().update(pk, request.data),
                message="Campaign updated.",
            )
        except LeadError as e:
            return lead_error(e)

    def delete(self, request, pk):
        try:
            CampaignService().delete(pk)
            return APIResponse.success(message="Campaign deleted.")
        except LeadError as e:
            return lead_error(e)


class FollowupStatusListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "leads_follow_up"

    def get(self, request):
        s = FollowupStatusService()
        return _paginated(
            request,
            self,
            s.list(query=request.query_params.get("q")),
            s.to_dict,
            "Follow-up statuses retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=FollowupStatusService().create(request.data),
                message="Status created.",
                status_code=status.HTTP_201_CREATED,
            )
        except LeadError as e:
            return lead_error(e)


class FollowupStatusDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "leads_follow_up"

    def get(self, request, pk):
        try:
            s = FollowupStatusService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except LeadError as e:
            return lead_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=FollowupStatusService().update(pk, request.data),
                message="Status updated.",
            )
        except LeadError as e:
            return lead_error(e)

    def delete(self, request, pk):
        try:
            FollowupStatusService().delete(pk)
            return APIResponse.success(message="Status deleted.")
        except LeadError as e:
            return lead_error(e)


class FollowupListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "leads_follow_up"

    def get(self, request):
        s = FollowupService()
        return _paginated(
            request,
            self,
            s.list(
                lead_id=request.query_params.get("l_id") or None,
                query=request.query_params.get("q"),
            ),
            s.to_dict,
            "Follow-ups retrieved.",
        )

    def post(self, request):
        try:
            return APIResponse.success(
                data=FollowupService().create(
                    request.data, user_id=int(getattr(request.user, "user_id", 0) or 0)
                ),
                message="Follow-up created.",
                status_code=status.HTTP_201_CREATED,
            )
        except LeadError as e:
            return lead_error(e)


class FollowupDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "leads_follow_up"

    def get(self, request, pk):
        try:
            s = FollowupService()
            return APIResponse.success(data=s.to_dict(s.get(pk)))
        except LeadError as e:
            return lead_error(e)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=FollowupService().update(pk, request.data),
                message="Follow-up updated.",
            )
        except LeadError as e:
            return lead_error(e)

    def delete(self, request, pk):
        try:
            FollowupService().delete(pk)
            return APIResponse.success(message="Follow-up deleted.")
        except LeadError as e:
            return lead_error(e)


class LeadReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"

    def get(self, request):
        return APIResponse.success(
            data=LeadReportService().summary(), message="Lead report generated."
        )


class LeadSourcesView(APIView):
    """Campaign types proxy via distinct lead sources."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"
    legacy_method_actions = {"POST": "can_edit"}

    def get(self, request):
        return APIResponse.success(
            data=LeadReportService().list_sources(), message="Lead sources retrieved."
        )

    def post(self, request):
        try:
            data = LeadReportService().rename_source(
                str(request.data.get("old", "")), str(request.data.get("new", ""))
            )
            return APIResponse.success(data=data, message="Source renamed.")
        except LeadError as e:
            return lead_error(e)


class PromoterListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"

    def get(self, request):
        return APIResponse.success(
            data=LeadReportService().list_promoters(), message="Promoters retrieved."
        )

    def post(self, request):
        try:
            data = LeadReportService().assign_promoter(
                c_id=int(request.data.get("c_id") or 0),
                staff_id=int(request.data.get("staff_id") or 0),
            )
            return APIResponse.success(
                data=data,
                message="Promoter assigned.",
                status_code=status.HTTP_201_CREATED,
            )
        except LeadError as e:
            return lead_error(e)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="c_id and staff_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class PromoterDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "lead_manager"

    def delete(self, request, pk):
        try:
            LeadReportService().remove_promoter(pk)
            return APIResponse.success(message="Promoter removed.")
        except LeadError as e:
            return lead_error(e)
