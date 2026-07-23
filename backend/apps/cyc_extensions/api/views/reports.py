from rest_framework import status
from rest_framework.views import APIView

from apps.cyc_extensions.api.permissions import FINANCE_MODULE, FinanceIsAuthenticated
from apps.cyc_extensions.services.finance_report_service import FinanceReportService
from apps.cyc_extensions.services.posting_service import AccountPostingError
from common.responses.api import APIResponse


def _report_error(exc: AccountPostingError):
    return APIResponse.error(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)


class TrialBalanceReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "trialbalance"

    def get(self, request):
        try:
            data = FinanceReportService().get_trial_balance(
                from_date=request.query_params.get("from_date"),
                to_date=request.query_params.get("to_date"),
            )
            return APIResponse.success(
                data=data, message="Trial balance generated successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class BalanceSheetReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "balancesheet"

    def get(self, request):
        try:
            data = FinanceReportService().get_balance_sheet(
                as_of=request.query_params.get("as_of"),
            )
            return APIResponse.success(
                data=data, message="Balance sheet generated successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class ProfitLossReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "profitloss"

    def get(self, request):
        try:
            data = FinanceReportService().get_profit_loss(
                from_date=request.query_params.get("from_date"),
                to_date=request.query_params.get("to_date"),
            )
            return APIResponse.success(
                data=data, message="Profit and loss generated successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class LedgerStatementReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    # Seed has no ledgerstatement category; gate with reports index.
    legacy_permission_category = "index"

    def get(self, request):
        ledger_id = request.query_params.get("ledger_id")
        if not ledger_id:
            return APIResponse.error(
                message="ledger_id is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = FinanceReportService().get_ledger_statement(
                ledger_id=int(ledger_id),
                from_date=request.query_params.get("from_date"),
                to_date=request.query_params.get("to_date"),
            )
            return APIResponse.success(
                data=data, message="Ledger statement generated successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class LedgerEntriesReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "index"

    def get(self, request):
        ledger_id = request.query_params.get("ledger_id")
        try:
            data = FinanceReportService().get_ledger_entries(
                ledger_id=int(ledger_id) if ledger_id else None,
                from_date=request.query_params.get("from_date"),
                to_date=request.query_params.get("to_date"),
            )
            return APIResponse.success(
                data=data, message="Ledger entries retrieved successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class ReconciliationReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "index"
    legacy_method_actions = {"POST": "can_edit"}

    def get(self, request):
        ledger_id = request.query_params.get("ledger_id")
        try:
            data = FinanceReportService().get_reconciliation(
                ledger_id=int(ledger_id) if ledger_id else None,
            )
            return APIResponse.success(
                data=data, message="Reconciliation data retrieved successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)

    def post(self, request):
        item_id = request.data.get("item_id")
        if not item_id:
            return APIResponse.error(
                message="item_id is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = FinanceReportService().set_reconciliation(
                item_id=int(item_id),
                reconciliation_date=request.data.get("reconciliation_date"),
            )
            return APIResponse.success(
                data=data, message="Reconciliation updated successfully"
            )
        except AccountPostingError as exc:
            return _report_error(exc)


class FinanceReportsIndexView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "index"

    def get(self, request):
        return APIResponse.success(
            data={
                "reports": [
                    {
                        "key": "trialbalance",
                        "label": "Trial Balance",
                        "path": "trial-balance",
                    },
                    {
                        "key": "balancesheet",
                        "label": "Balance Sheet",
                        "path": "balance-sheet",
                    },
                    {
                        "key": "profitloss",
                        "label": "Profit & Loss",
                        "path": "profit-loss",
                    },
                    {
                        "key": "ledgerstatement",
                        "label": "Ledger Statement",
                        "path": "ledger-statement",
                    },
                    {
                        "key": "ledgerentries",
                        "label": "Ledger Entries",
                        "path": "ledger-entries",
                    },
                    {
                        "key": "reconciliation",
                        "label": "Reconciliation",
                        "path": "reconciliation",
                    },
                ]
            },
            message="Finance reports index",
        )
