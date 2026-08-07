from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.scheme_scholarship_service import SchemeScholarshipService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_master"


class SchemeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            data = SchemeScholarshipService().list_schemes()
            return APIResponse.success(data=data, message="Schemes retrieved.")
        except FeeError as exc:
            return fee_error_response(exc)

    def post(self, request):
        try:
            data = SchemeScholarshipService().create_scheme(request.data)
            return APIResponse.success(
                data=data,
                message="Scheme created.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)


class SchemeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            data = SchemeScholarshipService().get_scheme_config(pk)
            return APIResponse.success(data=data, message="Scheme retrieved.")
        except FeeError as exc:
            return fee_error_response(exc)

    def put(self, request, pk):
        try:
            data = SchemeScholarshipService().update_scheme(pk, request.data)
            return APIResponse.success(data=data, message="Scheme updated.")
        except FeeError as exc:
            return fee_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            SchemeScholarshipService().delete_scheme(pk)
            return APIResponse.success(message="Scheme deleted.")
        except FeeError as exc:
            return fee_error_response(exc)


class SchemeConfigView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            data = SchemeScholarshipService().get_scheme_config(pk)
            return APIResponse.success(
                data=data, message="Scheme configuration retrieved."
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def put(self, request, pk):
        try:
            data = SchemeScholarshipService().save_scheme_config(pk, request.data)
            return APIResponse.success(data=data, message="Scheme configuration saved.")
        except FeeError as exc:
            return fee_error_response(exc)

    patch = put


class SchemeApplicationListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        ss_id = request.query_params.get("ss_id")
        applied_status = request.query_params.get("applied_status")
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        try:
            data = SchemeScholarshipService().list_applications(
                ss_id=int(ss_id) if ss_id else None,
                applied_status=(
                    int(applied_status) if applied_status not in (None, "") else None
                ),
                class_id=int(class_id) if class_id else None,
                section_id=int(section_id) if section_id else None,
            )
            return APIResponse.success(
                data=data, message="Scheme applications retrieved."
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def post(self, request):
        applied_by = getattr(request.user, "id", 0) or 0
        try:
            data = SchemeScholarshipService().apply_scheme(
                request.data, applied_by=applied_by
            )
            return APIResponse.success(
                data=data,
                message="Scheme applied.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)


class SchemeApplicationApproveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = SchemeScholarshipService().set_application_status(pk, 1)
            return APIResponse.success(data=data, message="Application approved.")
        except FeeError as exc:
            return fee_error_response(exc)


class SchemeApplicationRejectView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = SchemeScholarshipService().set_application_status(pk, 2)
            return APIResponse.success(data=data, message="Application rejected.")
        except FeeError as exc:
            return fee_error_response(exc)
