from django.urls import path

from apps.settings import views
from apps.settings.api.views.general_settings import GeneralSettingsView

urlpatterns = [
    path("general/", GeneralSettingsView.as_view(), name="general_settings"),
    path(
        "languages/",
        views.LanguagesListCreateView.as_view(),
        name="languages_list_create",
    ),
    path(
        "languages/<int:pk>/",
        views.LanguagesDetailView.as_view(),
        name="languages_detail",
    ),
    path(
        "currencies/",
        views.CurrenciesListCreateView.as_view(),
        name="currencies_list_create",
    ),
    path(
        "currencies/<int:pk>/",
        views.CurrenciesDetailView.as_view(),
        name="currencies_detail",
    ),
    path(
        "currencies/<int:pk>/activate/",
        views.CurrenciesActivateView.as_view(),
        name="currencies_activate",
    ),
]
