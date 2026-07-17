from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.cyc_extensions.models.cyc_groups import CycGroups
from apps.cyc_extensions.models.cyc_ledgers import CycLedgers
from apps.cyc_extensions.models.cyc_entrytypes import CycEntrytypes
from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger
from apps.cyc_extensions.models.cyc_tags import CycTags

from apps.cyc_extensions.api.serializers.accounting import (
    CycGroupsSerializer,
    CycLedgersSerializer,
    CycEntrytypesSerializer,
    CycEntriesSerializer,
    CycEntriesCreateSerializer,
    CycFeeHeadLedgerSerializer,
    CycTagsSerializer
)

from apps.cyc_extensions.services.posting_service import PostingService, AccountPostingError
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


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


class EntryTypesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycEntrytypes.objects.all().order_by('id')
        serializer = CycEntrytypesSerializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Entry types fetched successfully")


class JournalEntriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycEntries.objects.all().order_by('-date', '-id')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = CycEntriesSerializer(page, many=True)
        paginated_response = paginator.get_paginated_response(serializer.data)
        return APIResponse.success(data=paginated_response.data, message="Journal entries fetched successfully")

    def post(self, request):
        serializer = CycEntriesCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        service = PostingService()
        try:
            entry = service.create_journal_entry(serializer.validated_data)
            out_serializer = CycEntriesSerializer(entry)
            return APIResponse.success(data=out_serializer.data, message="Journal entry created successfully", status_code=status.HTTP_201_CREATED)
        except AccountPostingError as e:
            return APIResponse.error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return APIResponse.error(message="An error occurred during posting.", details=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JournalEntriesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            entry = CycEntries.objects.get(pk=pk)
            serializer = CycEntriesSerializer(entry)
            return APIResponse.success(data=serializer.data, message="Entry fetched successfully")
        except CycEntries.DoesNotExist:
            return APIResponse.error(message="Entry not found", status_code=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            entry = CycEntries.objects.get(pk=pk)
            # Reversal logic could be implemented here or a flag updated, but per hard-delete requirement fallback:
            entry.delete()
            return APIResponse.success(message="Entry deleted successfully")
        except CycEntries.DoesNotExist:
            return APIResponse.error(message="Entry not found", status_code=status.HTTP_404_NOT_FOUND)


class FeeHeadMapperView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycFeeHeadLedger.objects.all()
        serializer = CycFeeHeadLedgerSerializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Mapper fetched successfully")

    def post(self, request):
        serializer = CycFeeHeadLedgerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Mapper created successfully", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class TrialBalanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = PostingService()
        report_data = service.get_trial_balance()
        return APIResponse.success(data=report_data, message="Trial balance generated successfully")
