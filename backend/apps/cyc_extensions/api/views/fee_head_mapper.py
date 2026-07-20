from rest_framework import status
from rest_framework.views import APIView

from apps.cyc_extensions.api.permissions import FINANCE_MODULE, FinanceIsAuthenticated
from apps.cyc_extensions.api.serializers.fee_head_mapper import (
    CycFeeHeadLedgerSerializer,
)
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger
from common.responses.api import APIResponse


class FeeHeadMapperView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "accounts"

    def get(self, request):
        queryset = CycFeeHeadLedger.objects.all()
        serializer = CycFeeHeadLedgerSerializer(queryset, many=True)
        return APIResponse.success(
            data=serializer.data, message="Mapper fetched successfully"
        )

    def post(self, request):
        serializer = CycFeeHeadLedgerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Mapper created successfully",
                status_code=status.HTTP_201_CREATED,
            )
        return APIResponse.error(
            message="Validation Error",
            details=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class FeeHeadMapperDetailView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "accounts"

    def get_object(self, pk):
        try:
            return CycFeeHeadLedger.objects.get(pk=pk)
        except CycFeeHeadLedger.DoesNotExist:
            return None

    def get(self, request, pk):
        mapper = self.get_object(pk)
        if not mapper:
            return APIResponse.error(
                message="Mapper entry not found", status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = CycFeeHeadLedgerSerializer(mapper)
        return APIResponse.success(data=serializer.data, message="Mapper fetched successfully")

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        mapper = self.get_object(pk)
        if not mapper:
            return APIResponse.error(
                message="Mapper entry not found", status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = CycFeeHeadLedgerSerializer(mapper, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Mapper updated successfully")
        return APIResponse.error(
            message="Validation Error",
            details=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        mapper = self.get_object(pk)
        if not mapper:
            return APIResponse.error(
                message="Mapper entry not found", status_code=status.HTTP_404_NOT_FOUND
            )
        mapper.delete()
        return APIResponse.success(message="Mapper entry deleted successfully")
