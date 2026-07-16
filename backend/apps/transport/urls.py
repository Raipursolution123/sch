from django.urls import path

from apps.transport.api.views.transport_fees import (
    TransportFeesDetailView,
    TransportFeesListCreateView,
)
from apps.transport.api.views.pickup_point import (
    PickupPointDetailView,
    PickupPointListCreateView,
)
from apps.transport.api.views.routes import (
    TransportRouteDetailView,
    TransportRouteListCreateView,
)
from apps.transport.api.views.vehicles import (
    VehiclesDetailView,
    VehiclesListCreateView,
)
from apps.transport.api.views.vehicle_routes import (
    VehicleRoutesDetailView,
    VehicleRoutesListCreateView,
)

urlpatterns = [
    path("fees/", TransportFeesListCreateView.as_view(), name="transport-fees-list-create"),
    path("fees/<int:pk>/", TransportFeesDetailView.as_view(), name="transport-fees-detail"),
    path("pickup-points/", PickupPointListCreateView.as_view(), name="pickup-points-list-create"),
    path("pickup-points/<int:pk>/", PickupPointDetailView.as_view(), name="pickup-points-detail"),
    path("routes/", TransportRouteListCreateView.as_view(), name="transport-routes-list-create"),
    path("routes/<int:pk>/", TransportRouteDetailView.as_view(), name="transport-routes-detail"),
    path("vehicles/", VehiclesListCreateView.as_view(), name="vehicles-list-create"),
    path("vehicles/<int:pk>/", VehiclesDetailView.as_view(), name="vehicles-detail"),
    path("assign-vehicles/", VehicleRoutesListCreateView.as_view(), name="assign-vehicles-list-create"),
    path("assign-vehicles/<int:pk>/", VehicleRoutesDetailView.as_view(), name="assign-vehicles-detail"),
]
