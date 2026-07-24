from django.urls import path

from apps.fees.api.views.fee_assignment import (
    FeeAssignmentDetailView,
    FeeAssignmentsListView,
)
from apps.fees.api.views.fee_category import (
    FeeCategoriesListView,
    FeeCategoryDetailView,
)
from apps.fees.api.views.fee_collect import FeeCollectRosterView
from apps.fees.api.views.fee_discount import FeeDiscountDetailView, FeeDiscountsListView
from apps.fees.api.views.fee_discount_assign import (
    FeeDiscountAssignRosterView,
    FeeDiscountAssignView,
    FeeDiscountUnassignView,
)
from apps.fees.api.views.fee_group import FeeGroupDetailView, FeeGroupsListView
from apps.fees.api.views.fee_reminder import FeeReminderDetailView, FeeRemindersListView
from apps.fees.api.views.fee_search import FeeDueSearchView, FeePaymentSearchView
from apps.fees.api.views.fee_student_assign import (
    FeeCarryForwardApplyView,
    FeeCarryForwardPreviewView,
    FeeStudentAssignRosterView,
    FeeStudentAssignSaveView,
)
from apps.fees.api.views.fee_type import FeeTypeDetailView, FeeTypesListView
from apps.fees.api.views.offline_bank_payments import (
    OfflineBankPaymentApproveView,
    OfflineBankPaymentDetailView,
    OfflineBankPaymentRejectView,
    OfflineBankPaymentsListView,
)
from apps.fees.api.views.payment_settings import PaymentGatewaysListView

urlpatterns = [
    path("collect/roster/", FeeCollectRosterView.as_view(), name="fee-collect-roster"),
    path("search/due/", FeeDueSearchView.as_view(), name="fee-due-search"),
    path("search/payments/", FeePaymentSearchView.as_view(), name="fee-payment-search"),
    path(
        "student-assignments/roster/",
        FeeStudentAssignRosterView.as_view(),
        name="fee-student-assign-roster",
    ),
    path(
        "student-assignments/",
        FeeStudentAssignSaveView.as_view(),
        name="fee-student-assign-save",
    ),
    path(
        "carry-forward/preview/",
        FeeCarryForwardPreviewView.as_view(),
        name="fee-carry-forward-preview",
    ),
    path(
        "carry-forward/",
        FeeCarryForwardApplyView.as_view(),
        name="fee-carry-forward-apply",
    ),
    path(
        "offline-payments/",
        OfflineBankPaymentsListView.as_view(),
        name="offline-bank-payments-list",
    ),
    path(
        "offline-payments/<int:pk>/",
        OfflineBankPaymentDetailView.as_view(),
        name="offline-bank-payments-detail",
    ),
    path(
        "offline-payments/<int:pk>/approve/",
        OfflineBankPaymentApproveView.as_view(),
        name="offline-bank-payments-approve",
    ),
    path(
        "offline-payments/<int:pk>/reject/",
        OfflineBankPaymentRejectView.as_view(),
        name="offline-bank-payments-reject",
    ),
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
    path("discounts/", FeeDiscountsListView.as_view(), name="fee-discounts-list"),
    path(
        "discounts/<int:pk>/",
        FeeDiscountDetailView.as_view(),
        name="fee-discount-detail",
    ),
    path(
        "discount-assignments/roster/",
        FeeDiscountAssignRosterView.as_view(),
        name="fee-discount-assign-roster",
    ),
    path(
        "discount-assignments/",
        FeeDiscountAssignView.as_view(),
        name="fee-discount-assign",
    ),
    path(
        "discount-assignments/<int:pk>/",
        FeeDiscountUnassignView.as_view(),
        name="fee-discount-unassign",
    ),
    path("assignments/", FeeAssignmentsListView.as_view(), name="fee-assignments-list"),
    path(
        "assignments/<int:pk>/",
        FeeAssignmentDetailView.as_view(),
        name="fee-assignment-detail",
    ),
    path("reminders/", FeeRemindersListView.as_view(), name="fee-reminders-list"),
    path(
        "reminders/<int:pk>/",
        FeeReminderDetailView.as_view(),
        name="fee-reminder-detail",
    ),
    path(
        "payment-gateways/",
        PaymentGatewaysListView.as_view(),
        name="payment-gateways-list",
    ),
]
