from typing import Any
from django.utils import timezone

from apps.transport.models.transport_route import TransportRoute
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class TransportRouteService:
    def list_routes(self):
        return TransportRoute.objects.all().order_by("-id")

    def get_route(self, route_id: int) -> TransportRoute:
        route = TransportRoute.objects.filter(id=route_id).first()
        if route is None:
            raise TransportNotFoundError("Transport route not found.")
        return route

    def create_route(self, payload: dict[str, Any]) -> TransportRoute:
        route = TransportRoute.objects.create(
            route_title=payload.get("route_title"),
            route_from=payload.get("route_from"),
            route_to=payload.get("route_to"),
            route_distance=payload.get("route_distance"),
            no_of_vehicle=payload.get("no_of_vehicle"),
            note=payload.get("note"),
            is_active=payload.get("is_active", "no"),
            created_at=timezone.now(),
        )
        return route

    def update_route(self, route_id: int, payload: dict[str, Any]) -> TransportRoute:
        route = self.get_route(route_id)

        if "route_title" in payload:
            route.route_title = payload["route_title"]
        if "route_from" in payload:
            route.route_from = payload["route_from"]
        if "route_to" in payload:
            route.route_to = payload["route_to"]
        if "route_distance" in payload:
            route.route_distance = payload["route_distance"]
        if "no_of_vehicle" in payload:
            route.no_of_vehicle = payload["no_of_vehicle"]
        if "note" in payload:
            route.note = payload["note"]
        if "is_active" in payload:
            route.is_active = payload["is_active"]

        route.updated_at = timezone.now().date()
        route.save()
        return route

    def delete_route(self, route_id: int) -> None:
        route = self.get_route(route_id)
        route.delete()
