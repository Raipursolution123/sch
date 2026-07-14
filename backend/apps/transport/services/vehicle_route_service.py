from typing import Any
from django.utils import timezone

from apps.transport.models.vehicle_routes import VehicleRoutes
from apps.transport.models.transport_route import TransportRoute
from apps.transport.models.vehicles import Vehicles
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class VehicleRoutesService:
    def enrich_assignment(self, item: VehicleRoutes) -> dict[str, Any]:
        route = TransportRoute.objects.filter(id=item.route_id).first()
        vehicle = Vehicles.objects.filter(id=item.vehicle_id).first()

        return {
            "id": item.id,
            "route_id": item.route_id,
            "vehicle_id": item.vehicle_id,
            "created_at": item.created_at,
            "route_title": route.route_title if route else None,
            "route_from": route.route_from if route else None,
            "route_to": route.route_to if route else None,
            "vehicle_no": vehicle.vehicle_no if vehicle else None,
            "vehicle_model": vehicle.vehicle_model if vehicle else None,
            "driver_name": vehicle.driver_name if vehicle else None,
        }

    def list_assignments(self):
        return VehicleRoutes.objects.all().order_by("-id")

    def get_assignment(self, assignment_id: int) -> VehicleRoutes:
        assignment = VehicleRoutes.objects.filter(id=assignment_id).first()
        if assignment is None:
            raise TransportNotFoundError("Vehicle assignment not found.")
        return assignment

    def create_assignment(self, payload: dict[str, Any]) -> VehicleRoutes:
        route_id = payload.get("route_id")
        vehicle_id = payload.get("vehicle_id")

        if not route_id:
            raise TransportValidationError("Route ID is required.")
        if not vehicle_id:
            raise TransportValidationError("Vehicle ID is required.")

        # Verify route exists
        if not TransportRoute.objects.filter(id=route_id).exists():
            raise TransportValidationError("Transport route does not exist.")
        # Verify vehicle exists
        if not Vehicles.objects.filter(id=vehicle_id).exists():
            raise TransportValidationError("Vehicle does not exist.")

        assignment = VehicleRoutes.objects.create(
            route_id=route_id,
            vehicle_id=vehicle_id,
            created_at=timezone.now(),
        )
        return assignment

    def update_assignment(self, assignment_id: int, payload: dict[str, Any]) -> VehicleRoutes:
        assignment = self.get_assignment(assignment_id)

        if "route_id" in payload:
            route_id = payload["route_id"]
            if not TransportRoute.objects.filter(id=route_id).exists():
                raise TransportValidationError("Transport route does not exist.")
            assignment.route_id = route_id

        if "vehicle_id" in payload:
            vehicle_id = payload["vehicle_id"]
            if not Vehicles.objects.filter(id=vehicle_id).exists():
                raise TransportValidationError("Vehicle does not exist.")
            assignment.vehicle_id = vehicle_id

        assignment.save()
        return assignment

    def delete_assignment(self, assignment_id: int) -> None:
        assignment = self.get_assignment(assignment_id)
        assignment.delete()
