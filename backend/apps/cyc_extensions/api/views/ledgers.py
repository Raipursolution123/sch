from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.cyc_extensions.models.cyc_ledgers import CycLedgers
from apps.cyc_extensions.api.serializers.ledgers import CycLedgersSerializer
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse


class LedgersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycLedgers.objects.all().order_by('id')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = CycLedgersSerializer(page, many=True)
        paginated_response = paginator.get_paginated_response(serializer.data)
        return APIResponse.success(data=paginated_response.data, message="Ledgers fetched successfully")

    def post(self, request):
        serializer = CycLedgersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Ledger created successfully", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class LedgersDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return CycLedgers.objects.get(pk=pk)
        except CycLedgers.DoesNotExist:
            return None

    def put(self, request, pk):
        ledger = self.get_object(pk)
        if not ledger:
            return APIResponse.error(message="Ledger not found", status_code=status.HTTP_404_NOT_FOUND)
        serializer = CycLedgersSerializer(ledger, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Ledger updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ledger = self.get_object(pk)
        if not ledger:
            return APIResponse.error(message="Ledger not found", status_code=status.HTTP_404_NOT_FOUND)
        ledger.delete()
        return APIResponse.success(message="Ledger deleted successfully")
