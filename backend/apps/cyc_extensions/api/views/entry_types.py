from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.cyc_extensions.models.cyc_entrytypes import CycEntrytypes
from apps.cyc_extensions.api.serializers.entry_types import CycEntrytypesSerializer
from common.responses.api import APIResponse


class EntryTypesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CycEntrytypes.objects.all().order_by('id')
        serializer = CycEntrytypesSerializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Entry types fetched successfully")
