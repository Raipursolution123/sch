from django.urls import path

from apps.lms.api.views.course_views import CourseListView, CourseDetailView
from apps.lms.api.views.course_details import (
    CourseCategoryView,
    CourseCategoryDetailView,
    OfflinePaymentView,
    CourseSettingsView,
    CourseReportsView,
)

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("categories/", CourseCategoryView.as_view(), name="course-category-list"),
    path("categories/<int:pk>/", CourseCategoryDetailView.as_view(), name="course-category-detail"),
    path("offline-payments/", OfflinePaymentView.as_view(), name="offline-payment-list"),
    path("settings/", CourseSettingsView.as_view(), name="course-settings"),
    path("reports/", CourseReportsView.as_view(), name="course-reports"),
]
