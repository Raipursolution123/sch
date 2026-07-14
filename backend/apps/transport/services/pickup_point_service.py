from typing import Any
from django.utils import timezone

from apps.transport.models.pickup_point import PickupPoint
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class PickupPointService:
    def list_pickup_points(self):
        return PickupPoint.objects.all().order_by("-id")

    def get_pickup_point(self, point_id: int) -> PickupPoint:
        point = PickupPoint.objects.filter(id=point_id).first()
        if point is None:
            raise TransportNotFoundError("Pickup point not found.")
        return point

    def create_pickup_point(self, payload: dict[str, Any]) -> PickupPoint:
        name = payload.get("name")
        if not name or not name.strip():
            raise TransportValidationError("Pickup point name is required.")

        point = PickupPoint.objects.create(
            name=name.strip(),
            latitude=payload.get("latitude"),
            longitude=payload.get("longitude"),
            created_at=timezone.now(),
        )
        return point

    def update_pickup_point(self, point_id: int, payload: dict[str, Any]) -> PickupPoint:
        point = self.get_pickup_point(point_id)

        if "name" in payload:
            name = payload["name"]
            if not name or not name.strip():
                raise TransportValidationError("Pickup point name cannot be empty.")
            point.name = name.strip()
        if "latitude" in payload:
            point.latitude = payload["latitude"]
        if "longitude" in payload:
            point.longitude = payload["longitude"]

        point.save()
        return point

    def delete_pickup_point(self, point_id: int) -> None:
        point = self.get_pickup_point(point_id)
        point.delete()
