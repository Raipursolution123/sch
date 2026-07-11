from datetime import datetime

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_due_search_service import FeeDueSearchService
from apps.fees.services.fee_payment_search_service import FeePaymentSearchService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

DUE_CATEGORY = "search_due_fees"
PAYMENT_CATEGORY = "search_fees_payment"


def _optional_int(value: str | None) -> int | None:
    if not value:
        return None
    return int(value)


def _parse_date(value: str | None, label: str):
    if not value:
        raise ValueError(f"{label} is required")
    return datetime.strptime(value, "%Y-%m-%d").date()


class FeeDueSearchView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = DUE_CATEGORY

    def get(self, request):
        class_id_raw = request.query_params.get("class_id")
        section_id_raw = request.query_params.get("section_id")
        query = request.query_params.get("q")
        min_balance_raw = request.query_params.get("min_balance", "0.01")

        try:
            class_id = _optional_int(class_id_raw)
            section_id = _optional_int(section_id_raw)
            min_balance = float(min_balance_raw)
            data = FeeDueSearchService().search_due_fees(
                class_id=class_id,
                section_id=section_id,
                query=query,
                min_balance=min_balance,
            )
            return APIResponse.success(
                data=data, message="Due fees search completed successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except ValueError:
            return APIResponse.error(
                message="Invalid filter values. Check class_id, section_id, and min_balance.",
                status_code=400,
            )


class FeePaymentSearchView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = PAYMENT_CATEGORY

    def get(self, request):
        from_date_raw = request.query_params.get("from_date")
        to_date_raw = request.query_params.get("to_date")
        class_id_raw = request.query_params.get("class_id")
        section_id_raw = request.query_params.get("section_id")
        query = request.query_params.get("q")
        payment_mode = request.query_params.get("payment_mode")

        try:
            from_date = _parse_date(from_date_raw, "from_date")
            to_date = _parse_date(to_date_raw, "to_date")
            class_id = _optional_int(class_id_raw)
            section_id = _optional_int(section_id_raw)
            data = FeePaymentSearchService().search_payments(
                from_date=from_date,
                to_date=to_date,
                class_id=class_id,
                section_id=section_id,
                query=query,
                payment_mode=payment_mode,
            )
            return APIResponse.success(
                data=data, message="Payment search completed successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except ValueError:
            return APIResponse.error(
                message="Invalid filter values. Use YYYY-MM-DD for dates.",
                status_code=400,
            )
