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
from apps.staff.api.views.staff import StaffDetailView, StaffListCreateView
from apps.staff.api.views.staff_document import (
    StaffDocumentDeleteView,
    StaffDocumentUploadView,
)
from apps.staff.api.views.staff_masters import (
    DepartmentDetailView,
    DepartmentListCreateView,
    DesignationDetailView,
    DesignationListCreateView,
    StaffAttendanceMarkView,
    StaffAttendanceRosterView,
    StaffAttendanceTypesView,
    StaffPayrollScaleDetailView,
    StaffPayrollScaleListCreateView,
    StaffPayslipDetailView,
    StaffPayslipListCreateView,
)

urlpatterns = [
    path("", StaffListCreateView.as_view(), name="staff_list_create"),
    path(
        "departments/",
        DepartmentListCreateView.as_view(),
        name="department_list_create",
    ),
    path(
        "departments/<int:pk>/",
        DepartmentDetailView.as_view(),
        name="department_detail",
    ),
    path(
        "designations/",
        DesignationListCreateView.as_view(),
        name="designation_list_create",
    ),
    path(
        "designations/<int:pk>/",
        DesignationDetailView.as_view(),
        name="designation_detail",
    ),
    path(
        "attendance/types/",
        StaffAttendanceTypesView.as_view(),
        name="staff_attendance_types",
    ),
    path(
        "attendance/roster/",
        StaffAttendanceRosterView.as_view(),
        name="staff_attendance_roster",
    ),
    path(
        "attendance/mark/",
        StaffAttendanceMarkView.as_view(),
        name="staff_attendance_mark",
    ),
    path(
        "payroll/scales/",
        StaffPayrollScaleListCreateView.as_view(),
        name="staff_payroll_scales",
    ),
    path(
        "payroll/scales/<int:pk>/",
        StaffPayrollScaleDetailView.as_view(),
        name="staff_payroll_scale_detail",
    ),
    path(
        "payroll/payslips/",
        StaffPayslipListCreateView.as_view(),
        name="staff_payslips",
    ),
    path(
        "payroll/payslips/<int:pk>/",
        StaffPayslipDetailView.as_view(),
        name="staff_payslip_detail",
    ),
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
