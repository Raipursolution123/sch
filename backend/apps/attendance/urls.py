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
from apps.attendance.api.views.subject_attendance import (
    SubjectAttendanceMarkView,
    SubjectAttendancePeriodsView,
    SubjectAttendanceRosterView,
)

urlpatterns = [
    path("types/", AttendanceTypeListView.as_view(), name="attendance_types"),
    path("roster/", AttendanceRosterView.as_view(), name="attendance_roster"),
    path("mark/", AttendanceMarkView.as_view(), name="attendance_mark"),
    path("report/", AttendanceReportView.as_view(), name="attendance_report"),
    path(
        "subject/periods/",
        SubjectAttendancePeriodsView.as_view(),
        name="subject_attendance_periods",
    ),
    path(
        "subject/roster/",
        SubjectAttendanceRosterView.as_view(),
        name="subject_attendance_roster",
    ),
    path(
        "subject/mark/",
        SubjectAttendanceMarkView.as_view(),
        name="subject_attendance_mark",
    ),
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
