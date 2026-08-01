from django.urls import path

from apps.communications.api.views.email_template import (
    EmailTemplateDetailView,
    EmailTemplateListCreateView,
)
from apps.communications.api.views.messages import (
    BulkEmailView,
    EmailComposeView,
    MessagesDetailView,
    MessagesListView,
    SmsComposeView,
)
from apps.communications.api.views.notices import (
    NoticesDetailView,
    NoticesListCreateView,
)
from apps.communications.api.views.sms_template import (
    SmsTemplateDetailView,
    SmsTemplateListCreateView,
)

app_name = "communications"

urlpatterns = [
    path("notices/", NoticesListCreateView.as_view(), name="notices_list_create"),
    path("notices/<int:pk>/", NoticesDetailView.as_view(), name="notices_detail"),
    path("messages/", MessagesListView.as_view(), name="messages_list"),
    path("messages/<int:pk>/", MessagesDetailView.as_view(), name="messages_detail"),
    path("messages/email/", EmailComposeView.as_view(), name="messages_email"),
    path("messages/sms/", SmsComposeView.as_view(), name="messages_sms"),
    path("bulk-email/", BulkEmailView.as_view(), name="bulk_email"),
    path(
        "email-templates/",
        EmailTemplateListCreateView.as_view(),
        name="email_template_list_create",
    ),
    path(
        "email-templates/<int:pk>/",
        EmailTemplateDetailView.as_view(),
        name="email_template_detail",
    ),
    path(
        "sms-templates/",
        SmsTemplateListCreateView.as_view(),
        name="sms_template_list_create",
    ),
    path(
        "sms-templates/<int:pk>/",
        SmsTemplateDetailView.as_view(),
        name="sms_template_detail",
    ),
]
