from django.urls import path

from apps.fees.api.views.income_expense import (
    ExpenseDetailView,
    ExpenseHeadDetailView,
    ExpenseHeadListCreateView,
    ExpenseListCreateView,
)

urlpatterns = [
    path(
        "heads/",
        ExpenseHeadListCreateView.as_view(),
        name="expense-heads-list-create",
    ),
    path(
        "heads/<int:pk>/",
        ExpenseHeadDetailView.as_view(),
        name="expense-heads-detail",
    ),
    path("", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),
]
