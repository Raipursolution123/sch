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
