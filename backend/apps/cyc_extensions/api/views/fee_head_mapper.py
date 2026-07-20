from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cyc_extensions.api.serializers.fee_head_mapper import (
    CycFeeHeadLedgerSerializer,
)
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger
from common.responses.api import APIResponse


class FeeHeadMapperView(APIView):
    permission_classes = [IsAuthenticated]

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
