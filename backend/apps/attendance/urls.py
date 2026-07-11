from django.urls import path

from apps.attendance.api.views.approve_leave import (
    ApproveLeaveDetailView,
    ApproveLeaveListCreateView,
)
from apps.attendance.api.views.attendance import (
    AttendanceMarkView,
    AttendanceReportView,
    AttendanceRosterView,
    AttendanceTypeListView,
)

urlpatterns = [
    path("types/", AttendanceTypeListView.as_view(), name="attendance_types"),
    path("roster/", AttendanceRosterView.as_view(), name="attendance_roster"),
    path("mark/", AttendanceMarkView.as_view(), name="attendance_mark"),
    path("report/", AttendanceReportView.as_view(), name="attendance_report"),
    path(
        "approve-leave/",
        ApproveLeaveListCreateView.as_view(),
        name="approve_leave_list_create",
    ),
    path(
        "approve-leave/<str:pk>/",
        ApproveLeaveDetailView.as_view(),
        name="approve_leave_detail",
    ),
]
