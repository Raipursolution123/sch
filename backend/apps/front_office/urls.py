from django.urls import path

from apps.front_office.api.views.enquiry import EnquiryDetailView, EnquiryListCreateView
from apps.front_office.api.views.visitors_book import (
    VisitorsBookDetailView,
    VisitorsBookListCreateView,
)
from apps.front_office.api.views.complaint import (
    ComplaintDetailView,
    ComplaintListCreateView,
)
from apps.front_office.api.views.dispatch_receive import (
    DispatchReceiveDetailView,
    DispatchReceiveListCreateView,
)
from apps.front_office.api.views.phone_call_purpose import (
    PhoneCallLogDetailView,
    PhoneCallLogListCreateView,
    VisitorsPurposeDetailView,
    VisitorsPurposeListCreateView,
)

urlpatterns = [
    path("enquiries/", EnquiryListCreateView.as_view(), name="enquiries-list-create"),
    path("enquiries/<int:pk>/", EnquiryDetailView.as_view(), name="enquiries-detail"),
    path("visitors/", VisitorsBookListCreateView.as_view(), name="visitors-list-create"),
    path("visitors/<int:pk>/", VisitorsBookDetailView.as_view(), name="visitors-detail"),
    path(
        "visitor-purposes/",
        VisitorsPurposeListCreateView.as_view(),
        name="visitor-purposes-list",
    ),
    path(
        "visitor-purposes/<int:pk>/",
        VisitorsPurposeDetailView.as_view(),
        name="visitor-purposes-detail",
    ),
    path(
        "phone-calls/",
        PhoneCallLogListCreateView.as_view(),
        name="phone-calls-list-create",
    ),
    path(
        "phone-calls/<int:pk>/",
        PhoneCallLogDetailView.as_view(),
        name="phone-calls-detail",
    ),
    path("complaints/", ComplaintListCreateView.as_view(), name="complaints-list-create"),
    path("complaints/<int:pk>/", ComplaintDetailView.as_view(), name="complaints-detail"),
    path("postal/", DispatchReceiveListCreateView.as_view(), name="postal-list-create"),
    path("postal/<int:pk>/", DispatchReceiveDetailView.as_view(), name="postal-detail"),
]
