from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.cyc_extensions.models.cyc_groups import CycGroups
from apps.cyc_extensions.api.serializers.ledger_groups import CycGroupsSerializer
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse


class LedgerGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycGroups.objects.all().order_by('id')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = CycGroupsSerializer(page, many=True)
        paginated_response = paginator.get_paginated_response(serializer.data)
        return APIResponse.success(data=paginated_response.data, message="Ledger Groups fetched successfully")

    def post(self, request):
        serializer = CycGroupsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Ledger Group created successfully", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class LedgerGroupsDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return CycGroups.objects.get(pk=pk)
        except CycGroups.DoesNotExist:
            return None

    def get(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return APIResponse.error(message="Ledger Group not found", status_code=status.HTTP_404_NOT_FOUND)
        serializer = CycGroupsSerializer(group)
        return APIResponse.success(data=serializer.data, message="Ledger Group fetched successfully")

    def put(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return APIResponse.error(message="Group not found", status_code=status.HTTP_404_NOT_FOUND)
        serializer = CycGroupsSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Ledger Group updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return APIResponse.error(message="Group not found", status_code=status.HTTP_404_NOT_FOUND)
        group.delete()
        return APIResponse.success(message="Ledger Group deleted successfully")
