from django.urls import path

from apps.front_office.api.views.enquiry import EnquiryDetailView, EnquiryListCreateView
from apps.front_office.api.views.visitors_book import (
    VisitorsBookListCreateView,
    VisitorsBookDetailView,
)
from apps.front_office.api.views.complaint import (
    ComplaintListCreateView,
    ComplaintDetailView,
)
from apps.front_office.api.views.dispatch_receive import (
    DispatchReceiveListCreateView,
    DispatchReceiveDetailView,
)

urlpatterns = [
    path("enquiries/", EnquiryListCreateView.as_view(), name="enquiries-list-create"),
    path("enquiries/<int:pk>/", EnquiryDetailView.as_view(), name="enquiries-detail"),
    # Visitors Book
    path("visitors/", VisitorsBookListCreateView.as_view(), name="visitors-list-create"),
    path("visitors/<int:pk>/", VisitorsBookDetailView.as_view(), name="visitors-detail"),
    # Complaints
    path("complaints/", ComplaintListCreateView.as_view(), name="complaints-list-create"),
    path("complaints/<int:pk>/", ComplaintDetailView.as_view(), name="complaints-detail"),
    # Postal Dispatch / Receive
    path("postal/", DispatchReceiveListCreateView.as_view(), name="postal-list-create"),
    path("postal/<int:pk>/", DispatchReceiveDetailView.as_view(), name="postal-detail"),
]
