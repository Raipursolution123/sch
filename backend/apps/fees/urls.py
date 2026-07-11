from django.urls import path

from apps.fees.api.views.fee_assignment import (
    FeeAssignmentDetailView,
    FeeAssignmentsListView,
)
from apps.fees.api.views.fee_category import (
    FeeCategoriesListView,
    FeeCategoryDetailView,
)
from apps.fees.api.views.fee_group import FeeGroupDetailView, FeeGroupsListView
from apps.fees.api.views.fee_collect import FeeCollectRosterView
from apps.fees.api.views.fee_search import FeeDueSearchView, FeePaymentSearchView
from apps.fees.api.views.fee_type import FeeTypeDetailView, FeeTypesListView

urlpatterns = [
    path("collect/roster/", FeeCollectRosterView.as_view(), name="fee-collect-roster"),
    path("search/due/", FeeDueSearchView.as_view(), name="fee-due-search"),
    path("search/payments/", FeePaymentSearchView.as_view(), name="fee-payment-search"),
    path("categories/", FeeCategoriesListView.as_view(), name="fee-categories-list"),
    path(
        "categories/<int:pk>/",
        FeeCategoryDetailView.as_view(),
        name="fee-category-detail",
    ),
    path("fee-groups/", FeeGroupsListView.as_view(), name="fee-groups-list"),
    path("fee-groups/<int:pk>/", FeeGroupDetailView.as_view(), name="fee-group-detail"),
    path("fee-types/", FeeTypesListView.as_view(), name="fee-types-list"),
    path("fee-types/<int:pk>/", FeeTypeDetailView.as_view(), name="fee-type-detail"),
    path("assignments/", FeeAssignmentsListView.as_view(), name="fee-assignments-list"),
    path(
        "assignments/<int:pk>/",
        FeeAssignmentDetailView.as_view(),
        name="fee-assignment-detail",
    ),
]
