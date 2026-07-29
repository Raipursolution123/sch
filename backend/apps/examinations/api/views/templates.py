from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.documents.models.template_admitcards import TemplateAdmitcards
from apps.examinations.api.serializers.templates import (
    TemplateAdmitcardsSerializer,
    TemplateMarksheetsSerializer,
)
from apps.examinations.api.views.common import MODULE
from apps.examinations.models.template_marksheets import TemplateMarksheets
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class MarksheetTemplatesView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_marksheet"

    def get(self, request):
        templates = TemplateMarksheets.objects.all().order_by("-id")
        serializer = TemplateMarksheetsSerializer(templates, many=True)
        return APIResponse.success(
            data={"results": serializer.data, "count": len(serializer.data)},
            message="Marksheet templates retrieved successfully.",
        )

    def post(self, request):
        serializer = TemplateMarksheetsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Marksheet template created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        return APIResponse.error(
            message="Validation error",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class MarksheetTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_marksheet"

    def get_object(self, pk):
        try:
            return TemplateMarksheets.objects.get(pk=pk)
        except TemplateMarksheets.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Marksheet template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = TemplateMarksheetsSerializer(obj)
        return APIResponse.success(
            data=serializer.data, message="Marksheet template retrieved."
        )

    def put(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Marksheet template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = TemplateMarksheetsSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data, message="Marksheet template updated successfully."
            )
        return APIResponse.error(
            message="Validation error",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Marksheet template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        obj.delete()
        return APIResponse.success(message="Marksheet template deleted successfully.")


class AdmitCardTemplatesView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_admit_card"

    def get(self, request):
        templates = TemplateAdmitcards.objects.all().order_by("-id")
        serializer = TemplateAdmitcardsSerializer(templates, many=True)
        return APIResponse.success(
            data={"results": serializer.data, "count": len(serializer.data)},
            message="Admit card templates retrieved successfully.",
        )

    def post(self, request):
        serializer = TemplateAdmitcardsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Admit card template created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        return APIResponse.error(
            message="Validation error",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class AdmitCardTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_admit_card"

    def get_object(self, pk):
        try:
            return TemplateAdmitcards.objects.get(pk=pk)
        except TemplateAdmitcards.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Admit card template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = TemplateAdmitcardsSerializer(obj)
        return APIResponse.success(
            data=serializer.data, message="Admit card template retrieved."
        )

    def put(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Admit card template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = TemplateAdmitcardsSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Admit card template updated successfully.",
            )
        return APIResponse.error(
            message="Validation error",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return APIResponse.error(
                message="Admit card template not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        obj.delete()
        return APIResponse.success(message="Admit card template deleted successfully.")
