from django.urls import path

from apps.front_office.api.views.enquiry import EnquiryDetailView, EnquiryListCreateView

urlpatterns = [
    path("enquiries/", EnquiryListCreateView.as_view(), name="enquiries-list-create"),
    path("enquiries/<int:pk>/", EnquiryDetailView.as_view(), name="enquiries-detail"),
]
