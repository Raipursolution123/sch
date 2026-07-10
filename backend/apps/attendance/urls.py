from django.urls import path
from . import views

urlpatterns = [
    path('types/', views.AttendanceTypeListView.as_view(), name='attendance_types'),
    path('roster/', views.AttendanceRosterView.as_view(), name='attendance_roster'),
    path('mark/', views.AttendanceMarkView.as_view(), name='attendance_mark'),
    path('report/', views.AttendanceReportView.as_view(), name='attendance_report'),
    path('approve-leave/', views.ApproveLeaveListCreateView.as_view(), name='approve_leave_list_create'),
    path('approve-leave/<str:pk>/', views.ApproveLeaveDetailView.as_view(), name='approve_leave_detail'),
]
