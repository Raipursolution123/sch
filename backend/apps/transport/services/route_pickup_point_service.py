from typing import Any

from django.utils import timezone

from apps.transport.models.route_pickup_point import RoutePickupPoint
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class RoutePickupPointService:
    def list_by_route(self, route_id: int):
        return RoutePickupPoint.objects.filter(transport_route_id=route_id).order_by("order_number", "id")

    def list_all(self):
        return RoutePickupPoint.objects.all().order_by("transport_route_id", "order_number")

    def get(self, assignment_id: int) -> RoutePickupPoint:
        obj = RoutePickupPoint.objects.filter(id=assignment_id).first()
        if obj is None:
            raise TransportNotFoundError("Route-pickup-point assignment not found.")
        return obj

    def create(self, payload: dict[str, Any]) -> RoutePickupPoint:
        route_id = payload.get("transport_route_id")
        pickup_id = payload.get("pickup_point_id")
        if not route_id:
            raise TransportValidationError("transport_route_id is required.")
        if not pickup_id:
            raise TransportValidationError("pickup_point_id is required.")

        # prevent duplicate assignment on same route+pickup
        existing = RoutePickupPoint.objects.filter(
            transport_route_id=route_id, pickup_point_id=pickup_id
        ).first()
        if existing is not None:
            raise TransportValidationError(
                "This pickup point is already assigned to the route."
            )

        return RoutePickupPoint.objects.create(
            transport_route_id=int(route_id),
            pickup_point_id=int(pickup_id),
            fees=payload.get("fees") or 0.0,
            destination_distance=payload.get("destination_distance") or 0.0,
            pickup_time=payload.get("pickup_time"),
            order_number=str(payload.get("order_number", "")).strip(),
            created_at=timezone.now(),
        )

    def update(self, assignment_id: int, payload: dict[str, Any]) -> RoutePickupPoint:
        obj = self.get(assignment_id)

        if "fees" in payload:
            obj.fees = payload["fees"]
        if "destination_distance" in payload:
            obj.destination_distance = payload["destination_distance"]
        if "pickup_time" in payload:
            obj.pickup_time = payload["pickup_time"]
        if "order_number" in payload:
            obj.order_number = str(payload["order_number"]).strip()

        obj.save()
        return obj

    def delete(self, assignment_id: int) -> None:
        obj = self.get(assignment_id)
        obj.delete()
