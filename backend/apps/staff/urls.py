from django.urls import path

from apps.staff.api.views.lookup import DepartmentListView, DesignationListView
from apps.staff.api.views.staff import StaffDetailView, StaffListCreateView
from apps.staff.api.views.staff_document import (
    StaffDocumentDeleteView,
    StaffDocumentUploadView,
)

urlpatterns = [
    path("", StaffListCreateView.as_view(), name="staff_list_create"),
    path("<int:pk>/", StaffDetailView.as_view(), name="staff_detail"),
    path("departments/", DepartmentListView.as_view(), name="department_list"),
    path("designations/", DesignationListView.as_view(), name="designation_list"),
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
