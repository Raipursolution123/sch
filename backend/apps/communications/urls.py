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
from apps.communications.api.views.gmeet import (
    GmeetSettingsView,
    GmeetClassView,
    GmeetClassDetailView,
    GmeetMeetingView,
    GmeetMeetingDetailView,
    GmeetJoinView,
    GmeetClassReportView,
    GmeetMeetingReportView,
    GmeetClassViewersView,
    GmeetMeetingViewersView,
)
from apps.communications.api.views.zoom import (
    ZoomSettingsView,
    ZoomClassView,
    ZoomClassDetailView,
    ZoomMeetingView,
    ZoomMeetingDetailView,
    ZoomJoinView,
    ZoomClassReportView,
    ZoomMeetingReportView,
    ZoomClassViewersView,
    ZoomMeetingViewersView,
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
    # GMeet API Routes
    path("gmeet/settings/", GmeetSettingsView.as_view(), name="gmeet_settings"),
    path("gmeet/classes/", GmeetClassView.as_view(), name="gmeet_classes"),
    path("gmeet/classes/<int:pk>/", GmeetClassDetailView.as_view(), name="gmeet_class_detail"),
    path("gmeet/meetings/", GmeetMeetingView.as_view(), name="gmeet_meetings"),
    path("gmeet/meetings/<int:pk>/", GmeetMeetingDetailView.as_view(), name="gmeet_meeting_detail"),
    path("gmeet/join/<int:pk>/", GmeetJoinView.as_view(), name="gmeet_join"),
    path("gmeet/reports/class/", GmeetClassReportView.as_view(), name="gmeet_class_report"),
    path("gmeet/reports/meeting/", GmeetMeetingReportView.as_view(), name="gmeet_meeting_report"),
    path("gmeet/reports/class/<int:pk>/viewers/", GmeetClassViewersView.as_view(), name="gmeet_class_viewers"),
    path("gmeet/reports/meeting/<int:pk>/viewers/", GmeetMeetingViewersView.as_view(), name="gmeet_meeting_viewers"),
    # Zoom API Routes
    path("zoom/settings/", ZoomSettingsView.as_view(), name="zoom_settings"),
    path("zoom/classes/", ZoomClassView.as_view(), name="zoom_classes"),
    path("zoom/classes/<int:pk>/", ZoomClassDetailView.as_view(), name="zoom_class_detail"),
    path("zoom/meetings/", ZoomMeetingView.as_view(), name="zoom_meetings"),
    path("zoom/meetings/<int:pk>/", ZoomMeetingDetailView.as_view(), name="zoom_meeting_detail"),
    path("zoom/join/<int:pk>/", ZoomJoinView.as_view(), name="zoom_join"),
    path("zoom/reports/class/", ZoomClassReportView.as_view(), name="zoom_class_report"),
    path("zoom/reports/meeting/", ZoomMeetingReportView.as_view(), name="zoom_meeting_report"),
    path("zoom/reports/class/<int:pk>/viewers/", ZoomClassViewersView.as_view(), name="zoom_class_viewers"),
    path("zoom/reports/meeting/<int:pk>/viewers/", ZoomMeetingViewersView.as_view(), name="zoom_meeting_viewers"),
]


