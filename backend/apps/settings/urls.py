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
from apps.settings.api.views.sms import SmsSettingsView, SmsSettingsDetailView
from apps.settings.api.views.email import EmailSettingsView
from apps.settings.api.views.notifications import NotificationSettingsView, NotificationSettingsDetailView
from apps.settings.api.views.print_headerfooter import PrintHeaderFooterListView, PrintHeaderFooterDetailView

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
    # SMS settings
    path("sms/", SmsSettingsView.as_view(), name="sms_settings"),
    path("sms/<int:pk>/", SmsSettingsDetailView.as_view(), name="sms_settings_detail"),
    # Email settings
    path("email/", EmailSettingsView.as_view(), name="email_settings"),
    # Notification settings
    path("notifications/", NotificationSettingsView.as_view(), name="notification_settings"),
    path("notifications/<int:pk>/", NotificationSettingsDetailView.as_view(), name="notification_settings_detail"),
    # Print Header/Footer settings
    path("print-header-footer/", PrintHeaderFooterListView.as_view(), name="print_header_footer_list"),
    path("print-header-footer/<int:pk>/", PrintHeaderFooterDetailView.as_view(), name="print_header_footer_detail"),
]
