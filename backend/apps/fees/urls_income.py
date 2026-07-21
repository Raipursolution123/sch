from django.urls import path

from apps.fees.api.views.income_expense import (
    IncomeDetailView,
    IncomeHeadDetailView,
    IncomeHeadListCreateView,
    IncomeListCreateView,
)

urlpatterns = [
    path(
        "heads/",
        IncomeHeadListCreateView.as_view(),
        name="income-heads-list-create",
    ),
    path(
        "heads/<int:pk>/",
        IncomeHeadDetailView.as_view(),
        name="income-heads-detail",
    ),
    path("", IncomeListCreateView.as_view(), name="income-list-create"),
    path("<int:pk>/", IncomeDetailView.as_view(), name="income-detail"),
]
