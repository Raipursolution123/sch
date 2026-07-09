from django.urls import path
from .views import (
    StudentsListView,
    StudentDetailView,
    ParentsTestView,
    StudentFeesView,
    StudentAcademicSessionsView
)

urlpatterns = [
    path('test-parents/', ParentsTestView.as_view(), name='test-parents'),
    path('', StudentsListView.as_view(), name='students-list'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    path('<int:pk>/fees/', StudentFeesView.as_view(), name='student-fees'),
    path('<int:student_id>/academic-sessions/', StudentAcademicSessionsView.as_view(), name='student-academic-sessions'),
]
