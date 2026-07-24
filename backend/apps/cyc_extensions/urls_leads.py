from django.urls import path

from apps.cyc_extensions.api.views.leads import (
    CampaignDetailView,
    CampaignListCreateView,
    FollowupDetailView,
    FollowupListCreateView,
    FollowupStatusDetailView,
    FollowupStatusListCreateView,
    LeadDetailView,
    LeadListCreateView,
    LeadReportView,
    LeadSourcesView,
    PromoterDetailView,
    PromoterListCreateView,
)

urlpatterns = [
    path("", LeadListCreateView.as_view(), name="leads_list"),
    path("<int:pk>/", LeadDetailView.as_view(), name="leads_detail"),
    path("campaigns/", CampaignListCreateView.as_view(), name="leads_campaigns"),
    path(
        "campaigns/<int:pk>/",
        CampaignDetailView.as_view(),
        name="leads_campaigns_detail",
    ),
    path(
        "followup-statuses/",
        FollowupStatusListCreateView.as_view(),
        name="leads_statuses",
    ),
    path(
        "followup-statuses/<int:pk>/",
        FollowupStatusDetailView.as_view(),
        name="leads_statuses_detail",
    ),
    path("followups/", FollowupListCreateView.as_view(), name="leads_followups"),
    path(
        "followups/<int:pk>/",
        FollowupDetailView.as_view(),
        name="leads_followups_detail",
    ),
    path("sources/", LeadSourcesView.as_view(), name="leads_sources"),
    path("promoters/", PromoterListCreateView.as_view(), name="leads_promoters"),
    path(
        "promoters/<int:pk>/",
        PromoterDetailView.as_view(),
        name="leads_promoters_detail",
    ),
    path("report/", LeadReportView.as_view(), name="leads_report"),
]
