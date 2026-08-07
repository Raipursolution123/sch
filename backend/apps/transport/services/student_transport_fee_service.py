"""Assign monthly transport fee masters to students (student_transport_fees)."""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.academics.selectors.session_selectors import get_current_session
from apps.students.models.student_session import StudentSession
from apps.students.models.student_transport_fees import StudentTransportFees
from apps.students.selectors import student_selectors as student_sel
from apps.students.selectors.promotion_selectors import students_by_ids
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)
from apps.transport.models.pickup_point import PickupPoint
from apps.transport.models.route_pickup_point import RoutePickupPoint
from apps.transport.models.transport_feemaster import TransportFeemaster
from apps.transport.models.transport_route import TransportRoute

logger = logging.getLogger(__name__)


class StudentTransportFeeService:
    def get_roster(
        self, *, class_id: int | None = None, section_id: int | None = None
    ) -> dict[str, Any]:
        session = get_current_session()
        if session is None:
            raise TransportValidationError("No active academic session found.")

        enrollments = StudentSession.objects.filter(
            session_id=session.id, is_active="yes"
        )
        if class_id:
            enrollments = enrollments.filter(class_id=class_id)
        if section_id:
            enrollments = enrollments.filter(section_id=section_id)
        enrollments = list(enrollments)

        student_ids = [e.student_id for e in enrollments if e.student_id]
        students = students_by_ids(student_ids)

        class_map = {
            c.id: c.class_field
            for c in Classes.objects.filter(
                id__in={e.class_id for e in enrollments if e.class_id}
            )
        }
        section_map = {
            s.id: s.section
            for s in Sections.objects.filter(
                id__in={e.section_id for e in enrollments if e.section_id}
            )
        }

        rpp_ids = {e.route_pickup_point_id for e in enrollments if e.route_pickup_point_id}
        rpp_map = {
            r.id: r for r in RoutePickupPoint.objects.filter(id__in=rpp_ids)
        }
        pickup_ids = {r.pickup_point_id for r in rpp_map.values()}
        pickup_map = {
            p.id: p.name for p in PickupPoint.objects.filter(id__in=pickup_ids)
        }
        route_ids = {r.transport_route_id for r in rpp_map.values()}
        route_map = {
            r.id: r.route_title
            for r in TransportRoute.objects.filter(id__in=route_ids)
        }

        assigned = StudentTransportFees.objects.filter(
            student_session_id__in=[e.id for e in enrollments]
        )
        assigned_map: dict[int, list[int]] = {}
        for row in assigned:
            assigned_map.setdefault(row.student_session_id, []).append(
                row.transport_feemaster_id
            )

        fee_masters = list(
            TransportFeemaster.objects.filter(session_id=session.id).order_by("month", "id")
        )

        rows = []
        for enrollment in enrollments:
            student = students.get(enrollment.student_id)
            if student is None:
                continue
            rpp = rpp_map.get(enrollment.route_pickup_point_id)
            pickup_name = (
                pickup_map.get(rpp.pickup_point_id) if rpp else None
            )
            route_title = (
                route_map.get(rpp.transport_route_id) if rpp else None
            )
            rows.append(
                {
                    "student_id": student.id,
                    "student_session_id": enrollment.id,
                    "admission_no": student.admission_no,
                    "student_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "class_name": class_map.get(enrollment.class_id, ""),
                    "section_name": section_map.get(enrollment.section_id, ""),
                    "route_title": route_title,
                    "pickup_point": pickup_name,
                    "monthly_fees": float(rpp.fees or 0) if rpp else 0,
                    "route_pickup_point_id": enrollment.route_pickup_point_id,
                    "assigned_feemaster_ids": assigned_map.get(enrollment.id, []),
                }
            )

        rows.sort(key=lambda r: (r["class_name"], r["section_name"], r["student_name"].lower()))
        return {
            "session_id": session.id,
            "fee_masters": [
                {
                    "id": fm.id,
                    "month": fm.month,
                    "due_date": fm.due_date.isoformat() if fm.due_date else None,
                }
                for fm in fee_masters
            ],
            "students": rows,
        }

    def assign(self, payload: dict[str, Any], *, generated_by: int) -> dict[str, Any]:
        try:
            student_session_id = int(payload.get("student_session_id"))
            route_pickup_point_id = int(payload.get("route_pickup_point_id"))
        except (TypeError, ValueError) as exc:
            raise TransportValidationError(
                "student_session_id and route_pickup_point_id are required."
            ) from exc

        feemaster_ids = payload.get("transport_feemaster_ids") or []
        if not isinstance(feemaster_ids, list):
            raise TransportValidationError("transport_feemaster_ids must be a list.")

        enrollment = StudentSession.objects.filter(id=student_session_id).first()
        if enrollment is None:
            raise TransportNotFoundError("Student enrollment not found.")

        if not RoutePickupPoint.objects.filter(id=route_pickup_point_id).exists():
            raise TransportValidationError("Invalid route pickup point.")

        selected = {int(x) for x in feemaster_ids if x}
        now = timezone.now()

        with transaction.atomic():
            enrollment.route_pickup_point_id = route_pickup_point_id
            enrollment.save(update_fields=["route_pickup_point_id"])

            existing = StudentTransportFees.objects.filter(
                student_session_id=student_session_id
            )
            for row in existing:
                if row.transport_feemaster_id not in selected:
                    row.delete()

            existing_ids = set(
                existing.values_list("transport_feemaster_id", flat=True)
            )
            for fm_id in selected:
                if fm_id in existing_ids:
                    continue
                if not TransportFeemaster.objects.filter(id=fm_id).exists():
                    continue
                StudentTransportFees.objects.create(
                    transport_feemaster_id=fm_id,
                    student_session_id=student_session_id,
                    route_pickup_point_id=route_pickup_point_id,
                    generated_by=generated_by or None,
                    created_at=now,
                )

        logger.info(
            "Assigned transport fees ss=%s months=%s",
            student_session_id,
            len(selected),
        )
        return self.get_roster()
