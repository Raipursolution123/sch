from django.urls import path

from apps.hostel.api.views.hostel import (
    HostelListCreateView,
    HostelDetailView,
    HostelRoomListCreateView,
    HostelRoomDetailView,
    RoomTypeListCreateView,
    RoomTypeDetailView,
    HostelRoomBedListCreateView,
    HostelRoomBedDetailView,
)

urlpatterns = [
    # Hostels / Buildings
    path("", HostelListCreateView.as_view(), name="hostel-list-create-root"),
    path("<int:pk>/", HostelDetailView.as_view(), name="hostel-detail-root"),
    path("hostels/", HostelListCreateView.as_view(), name="hostels-list-create"),
    path("hostels/<int:pk>/", HostelDetailView.as_view(), name="hostels-detail"),
    path("buildings/", HostelListCreateView.as_view(), name="hostel-buildings-list-create"),
    path("buildings/<int:pk>/", HostelDetailView.as_view(), name="hostel-buildings-detail"),
    # Hostel Rooms
    path("rooms/", HostelRoomListCreateView.as_view(), name="hostel-room-list-create"),
    path("rooms/<int:pk>/", HostelRoomDetailView.as_view(), name="hostel-room-detail"),
    # Room Types
    path("room-types/", RoomTypeListCreateView.as_view(), name="room-type-list-create"),
    path("room-types/<int:pk>/", RoomTypeDetailView.as_view(), name="room-type-detail"),
    # Room Beds
    path("room-beds/", HostelRoomBedListCreateView.as_view(), name="room-beds-list-create"),
    path("room-beds/<int:pk>/", HostelRoomBedDetailView.as_view(), name="room-beds-detail"),
]

