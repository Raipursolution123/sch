from django.urls import path

from apps.lms.api.views.course_views import CourseListView, CourseDetailView

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
]
