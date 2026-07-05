from django.urls import path
from . import views

urlpatterns = [
    path('classes/', views.ClassesListCreateView.as_view(), name='classes_list_create'),
    path('classes/<int:pk>/', views.ClassesDetailView.as_view(), name='classes_detail'),
    path('sections/', views.SectionsListCreateView.as_view(), name='sections_list_create'),
    path('sections/<int:pk>/', views.SectionsDetailView.as_view(), name='sections_detail'),  
    path('class-sections/', views.ClassSectionsListView.as_view(), name='class_sections_list'),
    path('class-sections/assign/', views.ClassSectionsBulkAssignView.as_view(), name='class_sections_bulk_assign'),
    path('classes/<int:class_id>/sections/', views.ClassAssignedSectionsView.as_view(), name='class_assigned_sections'),
    path('class-sections/<int:pk>/', views.ClassSectionsDetailView.as_view(), name='class_sections_detail'), 
    path('sessions/', views.SessionsListCreateView.as_view(), name='sessions_list_create'),
    path('sessions/<int:pk>/', views.SessionsDetailView.as_view(), name='sessions_detail'),
    path('sessions/<int:pk>/activate/', views.SessionActivateView.as_view(), name='sessions_activate'),
    path('subjects/', views.SubjectsListCreateView.as_view(), name='subjects_list_create'),
    path('subjects/<int:pk>/', views.SubjectsDetailView.as_view(), name='subjects_detail'),
]