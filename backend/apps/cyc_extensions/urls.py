from django.urls import path

from apps.cyc_extensions.api.views.entry_types import EntryTypesView
from apps.cyc_extensions.api.views.fee_head_mapper import FeeHeadMapperView
from apps.cyc_extensions.api.views.journal_entries import (
    JournalEntriesDetailView,
    JournalEntriesView,
)
from apps.cyc_extensions.api.views.ledger_groups import (
    LedgerGroupsDetailView,
    LedgerGroupsView,
)
from apps.cyc_extensions.api.views.ledgers import LedgersDetailView, LedgersView
from apps.cyc_extensions.api.views.reports import TrialBalanceReportView

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
    # Reports
    path(
        "finance/reports/trial-balance/",
        TrialBalanceReportView.as_view(),
        name="finance-reports-tb",
    ),
]
