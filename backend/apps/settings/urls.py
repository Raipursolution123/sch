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
from apps.settings.api.views.roles import (
    RoleDetailView,
    RolePermissionsUpdateView,
    RolesListView,
)
from apps.settings.api.views.system_config import (
    EmailConfigActivateView,
    EmailConfigDetailView,
    EmailConfigListCreateView,
    NotificationSettingsDetailView,
    NotificationSettingsListCreateView,
    PaymentMethodsActivateView,
    PaymentMethodsDetailView,
    PaymentMethodsListCreateView,
    PrintHeaderFooterDetailView,
    PrintHeaderFooterListCreateView,
    SmsConfigActivateView,
    SmsConfigDetailView,
    SmsConfigListCreateView,
)
from apps.settings.api.views.users import (
    UserDetailView,
    UserRoleOptionsView,
    UsersListView,
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
    path(
        "notification-settings/",
        NotificationSettingsListCreateView.as_view(),
        name="notification_settings_list_create",
    ),
    path(
        "notification-settings/<int:pk>/",
        NotificationSettingsDetailView.as_view(),
        name="notification_settings_detail",
    ),
    path("sms-config/", SmsConfigListCreateView.as_view(), name="sms_config_list_create"),
    path(
        "sms-config/<int:pk>/",
        SmsConfigDetailView.as_view(),
        name="sms_config_detail",
    ),
    path(
        "sms-config/<int:pk>/activate/",
        SmsConfigActivateView.as_view(),
        name="sms_config_activate",
    ),
    path(
        "email-config/",
        EmailConfigListCreateView.as_view(),
        name="email_config_list_create",
    ),
    path(
        "email-config/<int:pk>/",
        EmailConfigDetailView.as_view(),
        name="email_config_detail",
    ),
    path(
        "email-config/<int:pk>/activate/",
        EmailConfigActivateView.as_view(),
        name="email_config_activate",
    ),
    path(
        "payment-methods/",
        PaymentMethodsListCreateView.as_view(),
        name="payment_methods_list_create",
    ),
    path(
        "payment-methods/<int:pk>/",
        PaymentMethodsDetailView.as_view(),
        name="payment_methods_detail",
    ),
    path(
        "payment-methods/<int:pk>/activate/",
        PaymentMethodsActivateView.as_view(),
        name="payment_methods_activate",
    ),
    path(
        "print-header-footer/",
        PrintHeaderFooterListCreateView.as_view(),
        name="print_header_footer_list_create",
    ),
    path(
        "print-header-footer/<int:pk>/",
        PrintHeaderFooterDetailView.as_view(),
        name="print_header_footer_detail",
    ),
    path("roles/", RolesListView.as_view(), name="roles_list"),
    path("roles/<int:pk>/", RoleDetailView.as_view(), name="roles_detail"),
    path(
        "roles/<int:pk>/permissions/",
        RolePermissionsUpdateView.as_view(),
        name="roles_permissions_update",
    ),
    path("users/", UsersListView.as_view(), name="users_list"),
    path(
        "users/role-options/",
        UserRoleOptionsView.as_view(),
        name="users_role_options",
    ),
    path("users/<int:pk>/", UserDetailView.as_view(), name="users_detail"),
]
