from django.urls import path

from apps.cyc_extensions.api.views.entry_types import EntryTypesView
from apps.cyc_extensions.api.views.fee_head_mapper import FeeHeadMapperView, FeeHeadMapperDetailView
from apps.cyc_extensions.api.views.journal_entries import (
    JournalEntriesDetailView,
    JournalEntriesView,
)
from apps.cyc_extensions.api.views.ledger_groups import (
    LedgerGroupsDetailView,
    LedgerGroupsView,
)
from apps.cyc_extensions.api.views.ledgers import LedgersDetailView, LedgersView
from apps.cyc_extensions.api.views.reports import (
    BalanceSheetReportView,
    FinanceReportsIndexView,
    LedgerEntriesReportView,
    LedgerStatementReportView,
    ProfitLossReportView,
    ReconciliationReportView,
    TrialBalanceReportView,
)

urlpatterns = [
    # Ledger Groups
    path("finance/groups/", LedgerGroupsView.as_view(), name="finance-groups-list"),
    path(
        "finance/groups/<int:pk>/",
        LedgerGroupsDetailView.as_view(),
        name="finance-groups-detail",
    ),
    # Ledgers
    path("finance/ledgers/", LedgersView.as_view(), name="finance-ledgers-list"),
    path(
        "finance/ledgers/<int:pk>/",
        LedgersDetailView.as_view(),
        name="finance-ledgers-detail",
    ),
    # Entry Types
    path(
        "finance/entry-types/",
        EntryTypesView.as_view(),
        name="finance-entry-types-list",
    ),
    # Journal Entries
    path("finance/entries/", JournalEntriesView.as_view(), name="finance-entries-list"),
    path(
        "finance/entries/<int:pk>/",
        JournalEntriesDetailView.as_view(),
        name="finance-entries-detail",
    ),
    # Fee Head & Ledger Mapper
    path("finance/mapper/", FeeHeadMapperView.as_view(), name="finance-mapper-list"),
    path("finance/mapper/<int:pk>/", FeeHeadMapperDetailView.as_view(), name="finance-mapper-detail"),
    # Reports
    path(
        "finance/reports/",
        FinanceReportsIndexView.as_view(),
        name="finance-reports-index",
    ),
    path(
        "finance/reports/trial-balance/",
        TrialBalanceReportView.as_view(),
        name="finance-reports-tb",
    ),
    path(
        "finance/reports/balance-sheet/",
        BalanceSheetReportView.as_view(),
        name="finance-reports-bs",
    ),
    path(
        "finance/reports/profit-loss/",
        ProfitLossReportView.as_view(),
        name="finance-reports-pl",
    ),
    path(
        "finance/reports/ledger-statement/",
        LedgerStatementReportView.as_view(),
        name="finance-reports-ledger-statement",
    ),
    path(
        "finance/reports/ledger-entries/",
        LedgerEntriesReportView.as_view(),
        name="finance-reports-ledger-entries",
    ),
    path(
        "finance/reports/reconciliation/",
        ReconciliationReportView.as_view(),
        name="finance-reports-reconciliation",
    ),
]
