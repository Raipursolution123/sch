from rest_framework.views import APIView

from apps.cyc_extensions.api.permissions import FINANCE_MODULE, FinanceIsAuthenticated
from apps.cyc_extensions.api.serializers.entry_types import CycEntrytypesSerializer
from apps.cyc_extensions.models.cyc_entrytypes import CycEntrytypes
from common.responses.api import APIResponse


class EntryTypesView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "entries"

    def get(self, request):
        queryset = CycEntrytypes.objects.all().order_by("id")
        serializer = CycEntrytypesSerializer(queryset, many=True)
        return APIResponse.success(
            data=serializer.data, message="Entry types fetched successfully"
        )
