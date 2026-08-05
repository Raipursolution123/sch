from django.urls import path

from apps.system.api.views.reports import AuditTrailListView, UserLogListView

urlpatterns = [
    path("user-logs/", UserLogListView.as_view(), name="reports_user_logs"),
    path("audit-trail/", AuditTrailListView.as_view(), name="reports_audit_trail"),
]
