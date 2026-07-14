from django.urls import include, path

from apps.accounts.views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    # settings
    path("settings/", include("apps.settings.urls")),
    # attendance
    path("attendance/", include("apps.attendance.urls")),
    # academics
    path("academics/", include("apps.academics.urls")),
    # staff
    path("staff/", include("apps.staff.urls")),
    # students
    path("students/", include("apps.students.urls")),
    # examinations
    path("examinations/", include("apps.examinations.urls")),
    # fees
    path("fees/", include("apps.fees.urls")),
    # transport
    path("transport/", include("apps.transport.urls")),
]

