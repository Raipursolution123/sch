from typing import Any
from django.utils import timezone

from apps.transport.models.vehicles import Vehicles
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class VehiclesService:
    def list_vehicles(self):
        return Vehicles.objects.all().order_by("-id")

    def get_vehicle(self, vehicle_id: int) -> Vehicles:
        vehicle = Vehicles.objects.filter(id=vehicle_id).first()
        if vehicle is None:
            raise TransportNotFoundError("Vehicle not found.")
        return vehicle

    def create_vehicle(self, payload: dict[str, Any]) -> Vehicles:
        reg_no = payload.get("registration_number")
        if not reg_no or not reg_no.strip():
            raise TransportValidationError("Registration number is required.")

        vehicle = Vehicles.objects.create(
            vehicle_no=payload.get("vehicle_no"),
            vehicle_model=payload.get("vehicle_model", "None"),
            vehicle_base_average=payload.get("vehicle_base_average"),
            vehicle_photo=payload.get("vehicle_photo"),
            manufacture_year=payload.get("manufacture_year"),
            registration_number=reg_no.strip(),
            chasis_number=payload.get("chasis_number", ""),
            max_seating_capacity=payload.get("max_seating_capacity", ""),
            driver_name=payload.get("driver_name"),
            driver_licence=payload.get("driver_licence", "None"),
            driver_contact=payload.get("driver_contact"),
            note=payload.get("note"),
            swap_with=payload.get("swap_with", ""),
            swap_till=payload.get("swap_till") or timezone.now().date(),
            swap_status=payload.get("swap_status", 0),
            swap_history=payload.get("swap_history"),
            v_name=payload.get("v_name", ""),
            v_color=payload.get("v_color", ""),
            v_group=payload.get("v_group", ""),
            v_api_url=payload.get("v_api_url", ""),
            created_at=timezone.now(),
        )
        return vehicle

    def update_vehicle(self, vehicle_id: int, payload: dict[str, Any]) -> Vehicles:
        vehicle = self.get_vehicle(vehicle_id)

        for key, val in payload.items():
            if key == "registration_number":
                if not val or not val.strip():
                    raise TransportValidationError("Registration number cannot be empty.")
                vehicle.registration_number = val.strip()
            else:
                setattr(vehicle, key, val)

        vehicle.save()
        return vehicle

    def delete_vehicle(self, vehicle_id: int) -> None:
        vehicle = self.get_vehicle(vehicle_id)
        vehicle.delete()
