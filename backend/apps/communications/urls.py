from django.urls import path

from apps.communications.api.views.messages import (
    BulkEmailView,
    EmailComposeView,
    MessagesListView,
    SmsComposeView,
)
from apps.communications.api.views.notices import (
    NoticesDetailView,
    NoticesListCreateView,
)

app_name = "communications"

urlpatterns = [
    path("notices/", NoticesListCreateView.as_view(), name="notices_list_create"),
    path("notices/<int:pk>/", NoticesDetailView.as_view(), name="notices_detail"),
    path("messages/", MessagesListView.as_view(), name="messages_list"),
    path("messages/email/", EmailComposeView.as_view(), name="messages_email"),
    path("messages/sms/", SmsComposeView.as_view(), name="messages_sms"),
    path("bulk-email/", BulkEmailView.as_view(), name="bulk_email"),
]
