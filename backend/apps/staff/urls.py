from django.urls import path

from apps.staff.api.views.leave_allotment import (
    StaffLeaveAllotmentDetailView,
    StaffLeaveAllotmentRosterView,
    StaffLeaveAllotmentsView,
)
from apps.staff.api.views.leave_request import (
    StaffLeaveRequestDetailView,
    StaffLeaveRequestsListCreateView,
)
from apps.staff.api.views.leave_type import (
    LeaveTypeDetailView,
    LeaveTypesListCreateView,
)
from apps.staff.api.views.lookup import DepartmentListView, DesignationListView
from apps.staff.api.views.staff import StaffDetailView, StaffListCreateView
from apps.staff.api.views.staff_document import (
    StaffDocumentDeleteView,
    StaffDocumentUploadView,
)

urlpatterns = [
    path("", StaffListCreateView.as_view(), name="staff_list_create"),
    path("departments/", DepartmentListView.as_view(), name="department_list"),
    path("designations/", DesignationListView.as_view(), name="designation_list"),
    path("leave-types/", LeaveTypesListCreateView.as_view(), name="leave_types_list"),
    path(
        "leave-types/<int:pk>/",
        LeaveTypeDetailView.as_view(),
        name="leave_type_detail",
    ),
    path(
        "leave-requests/",
        StaffLeaveRequestsListCreateView.as_view(),
        name="staff_leave_requests_list",
    ),
    path(
        "leave-requests/<int:pk>/",
        StaffLeaveRequestDetailView.as_view(),
        name="staff_leave_request_detail",
    ),
    path(
        "leave-allotments/roster/",
        StaffLeaveAllotmentRosterView.as_view(),
        name="staff_leave_allotment_roster",
    ),
    path(
        "leave-allotments/",
        StaffLeaveAllotmentsView.as_view(),
        name="staff_leave_allotments",
    ),
    path(
        "leave-allotments/<int:pk>/",
        StaffLeaveAllotmentDetailView.as_view(),
        name="staff_leave_allotment_detail",
    ),
    path("<int:pk>/", StaffDetailView.as_view(), name="staff_detail"),
    path(
        "<int:pk>/documents/upload/",
        StaffDocumentUploadView.as_view(),
        name="staff_document_upload",
    ),
    path(
        "<int:pk>/documents/delete/",
        StaffDocumentDeleteView.as_view(),
        name="staff_document_delete",
    ),
]
