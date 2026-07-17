from typing import Any

from django.db import transaction

from apps.students.domain.student_exceptions import (
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as selectors
from apps.transport.models.pickup_point import PickupPoint
from apps.transport.models.route_pickup_point import RoutePickupPoint
from apps.transport.models.transport_route import TransportRoute
from apps.transport.models.vehicle_routes import VehicleRoutes
from apps.transport.models.vehicles import Vehicles


class StudentTransportService:
    def get_transport(self, student_id: int) -> dict[str, Any]:
        enrollment = self._get_active_enrollment(student_id)
        return self._serialize(enrollment)

    @transaction.atomic
    def update_transport(
        self, student_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        enrollment = self._get_active_enrollment(student_id)
        vehicle_route_id = payload.get("vehroute_id", enrollment.vehroute_id)
        pickup_mapping_id = payload.get(
            "route_pickup_point_id", enrollment.route_pickup_point_id
        )

        assignment = None
        if vehicle_route_id is not None:
            assignment = VehicleRoutes.objects.filter(id=vehicle_route_id).first()
            if assignment is None:
                raise StudentValidationError(
                    "Selected vehicle route assignment is not valid."
                )

        if pickup_mapping_id is not None:
            pickup_mapping = RoutePickupPoint.objects.filter(
                id=pickup_mapping_id
            ).first()
            if pickup_mapping is None:
                raise StudentValidationError("Selected pickup point is not valid.")
            if assignment is None:
                raise StudentValidationError(
                    "Select a vehicle route before selecting a pickup point."
                )
            if pickup_mapping.transport_route_id != assignment.route_id:
                raise StudentValidationError(
                    "Selected pickup point does not belong to the vehicle route."
                )

        if "vehroute_id" in payload:
            enrollment.vehroute_id = vehicle_route_id
            if vehicle_route_id is None:
                enrollment.route_pickup_point_id = None
        if "route_pickup_point_id" in payload:
            enrollment.route_pickup_point_id = pickup_mapping_id
        if "transport_fees" in payload:
            enrollment.transport_fees = payload["transport_fees"]
        enrollment.save(
            update_fields=[
                "vehroute_id",
                "route_pickup_point_id",
                "transport_fees",
            ]
        )
        return self._serialize(enrollment)

    @staticmethod
    def _get_active_enrollment(student_id: int) -> StudentSession:
        if selectors.get_student_by_id(student_id) is None:
            raise StudentNotFoundError()
        active_session = selectors.get_active_session()
        if active_session is None:
            raise StudentValidationError("No active academic session found.")
        enrollment = selectors.get_enrollment_for_session(student_id, active_session.id)
        if enrollment is None:
            raise StudentValidationError(
                "Student is not enrolled in the active academic session."
            )
        return enrollment

    @staticmethod
    def _serialize(enrollment: StudentSession) -> dict[str, Any]:
        assignment = (
            VehicleRoutes.objects.filter(id=enrollment.vehroute_id).first()
            if enrollment.vehroute_id
            else None
        )
        route = (
            TransportRoute.objects.filter(id=assignment.route_id).first()
            if assignment
            else None
        )
        vehicle = (
            Vehicles.objects.filter(id=assignment.vehicle_id).first()
            if assignment
            else None
        )
        selected_mapping = (
            RoutePickupPoint.objects.filter(id=enrollment.route_pickup_point_id).first()
            if enrollment.route_pickup_point_id
            else None
        )
        pickup = (
            PickupPoint.objects.filter(id=selected_mapping.pickup_point_id).first()
            if selected_mapping
            else None
        )

        mappings = list(RoutePickupPoint.objects.all().order_by("order_number", "id"))
        pickup_names = {
            point.id: point.name
            for point in PickupPoint.objects.filter(
                id__in=[item.pickup_point_id for item in mappings]
            )
        }
        return {
            "student_session_id": enrollment.id,
            "session_id": enrollment.session_id,
            "vehroute_id": enrollment.vehroute_id,
            "route_pickup_point_id": enrollment.route_pickup_point_id,
            "transport_fees": enrollment.transport_fees,
            "route_title": route.route_title if route else None,
            "vehicle_no": vehicle.vehicle_no if vehicle else None,
            "registration_number": (vehicle.registration_number if vehicle else None),
            "pickup_point_name": pickup.name if pickup else None,
            "pickup_points": [
                {
                    "id": item.id,
                    "route_id": item.transport_route_id,
                    "pickup_point_id": item.pickup_point_id,
                    "name": pickup_names.get(
                        item.pickup_point_id, f"Pickup point {item.pickup_point_id}"
                    ),
                    "fees": item.fees,
                    "pickup_time": item.pickup_time,
                }
                for item in mappings
            ],
        }
