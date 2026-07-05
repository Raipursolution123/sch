from django.urls import path
from . import views

urlpatterns = [
    path('', views.StaffListCreateView.as_view(), name='staff_list_create'),
    path('<int:pk>/', views.StaffDetailView.as_view(), name='staff_detail'),
    path('departments/', views.DepartmentListView.as_view(), name='department_list'),
    path('designations/', views.DesignationListView.as_view(), name='designation_list'),
    path('<int:pk>/documents/upload/', views.StaffDocumentUploadView.as_view(), name='staff_document_upload'),
    path('<int:pk>/documents/delete/', views.StaffDocumentDeleteView.as_view(), name='staff_document_delete'),
]
