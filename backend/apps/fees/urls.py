from django.urls import path
from .views import (
    FeeCategoriesListView, FeeCategoryDetailView,
    FeeGroupsListView, FeeGroupDetailView,
    FeeTypesListView, FeeTypeDetailView,
    FeeAssignmentsListView, FeeAssignmentDetailView,
    DebugDBView
)

urlpatterns = [
    # Fee Categories
    path('categories/', FeeCategoriesListView.as_view(), name='fee-categories-list'),
    path('categories/<int:pk>/', FeeCategoryDetailView.as_view(), name='fee-category-detail'),
    # Fee Groups
    path('fee-groups/', FeeGroupsListView.as_view(), name='fee-groups-list'),
    path('fee-groups/<int:pk>/', FeeGroupDetailView.as_view(), name='fee-group-detail'),
    # Fee Types
    path('fee-types/', FeeTypesListView.as_view(), name='fee-types-list'),
    path('fee-types/<int:pk>/', FeeTypeDetailView.as_view(), name='fee-type-detail'),
    # Fee Assignments
    path('assignments/', FeeAssignmentsListView.as_view(), name='fee-assignments-list'),
    path('assignments/<int:pk>/', FeeAssignmentDetailView.as_view(), name='fee-assignment-detail'),
    path('debug/', DebugDBView.as_view(), name='fee-debug'),
]
