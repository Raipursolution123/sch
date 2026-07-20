from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cyc_extensions.api.serializers.journal_entries import (
    CycEntriesCreateSerializer,
    CycEntriesSerializer,
)
from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.services.posting_service import (
    AccountPostingError,
    PostingService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse


class JournalEntriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycEntries.objects.all().order_by("-date", "-id")
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = CycEntriesSerializer(page, many=True)
        paginated_response = paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=paginated_response.data, message="Journal entries fetched successfully"
        )

    def post(self, request):
        serializer = CycEntriesCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation Error",
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = PostingService()
        try:
            entry = service.create_journal_entry(serializer.validated_data)
            out_serializer = CycEntriesSerializer(entry)
            return APIResponse.success(
                data=out_serializer.data,
                message="Journal entry created successfully",
                status_code=status.HTTP_201_CREATED,
            )
        except AccountPostingError as e:
            return APIResponse.error(
                message=str(e), status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return APIResponse.error(
                message="An error occurred during posting.",
                details=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JournalEntriesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            entry = CycEntries.objects.get(pk=pk)
            serializer = CycEntriesSerializer(entry)
            return APIResponse.success(
                data=serializer.data, message="Entry fetched successfully"
            )
        except CycEntries.DoesNotExist:
            return APIResponse.error(
                message="Entry not found", status_code=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            entry = CycEntries.objects.get(pk=pk)
            # Reversal logic could be implemented here or a flag updated, but per hard-delete requirement fallback:
            entry.delete()
            return APIResponse.success(message="Entry deleted successfully")
        except CycEntries.DoesNotExist:
            return APIResponse.error(
                message="Entry not found", status_code=status.HTTP_404_NOT_FOUND
            )
