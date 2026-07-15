from django.urls import path

from apps.settings.api.views.currencies import (
    CurrenciesActivateView,
    CurrenciesDetailView,
    CurrenciesListCreateView,
)
from apps.settings.api.views.general_settings import GeneralSettingsView
from apps.settings.api.views.languages import (
    LanguagesDetailView,
    LanguagesListCreateView,
)

urlpatterns = [
    path("general/", GeneralSettingsView.as_view(), name="general_settings"),
    path(
        "languages/",
        LanguagesListCreateView.as_view(),
        name="languages_list_create",
    ),
    path(
        "languages/<int:pk>/",
        LanguagesDetailView.as_view(),
        name="languages_detail",
    ),
    path(
        "currencies/",
        CurrenciesListCreateView.as_view(),
        name="currencies_list_create",
    ),
    path(
        "currencies/<int:pk>/",
        CurrenciesDetailView.as_view(),
        name="currencies_detail",
    ),
    path(
        "currencies/<int:pk>/activate/",
        CurrenciesActivateView.as_view(),
        name="currencies_activate",
    ),
]
