import logging
from typing import Any

from django.utils import timezone

from apps.settings.models.behaviour_settings import BehaviourSettings
from apps.students.models.student_behaviour import StudentBehaviour
from apps.students.models.student_incidents import StudentIncidents
from apps.students.models.students import Students
from apps.students.selectors import student_selectors as student_sel

logger = logging.getLogger(__name__)


class BehaviourService:
    def list_incident_types(self) -> list[dict[str, Any]]:
        return [
            self._type_to_dict(row)
            for row in StudentBehaviour.objects.all().order_by("title", "id")
        ]

    def create_incident_type(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title") or "").strip()
        if not title:
            raise ValueError("Title is required.")
        point = int(payload.get("point") or 0)
        description = str(payload.get("description") or "").strip()
        row = StudentBehaviour.objects.create(
            title=title[:255],
            point=point,
            description=description,
            created_at=timezone.now(),
        )
        logger.info("Created behaviour incident type id=%s", row.id)
        return self._type_to_dict(row)

    def update_incident_type(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = StudentBehaviour.objects.filter(id=pk).first()
        if row is None:
            raise LookupError("Incident type not found.")
        if "title" in payload:
            title = str(payload.get("title") or "").strip()
            if not title:
                raise ValueError("Title is required.")
            row.title = title[:255]
        if "point" in payload:
            row.point = int(payload.get("point") or 0)
        if "description" in payload:
            row.description = str(payload.get("description") or "").strip()
        row.save()
        return self._type_to_dict(row)

    def delete_incident_type(self, pk: int) -> None:
        row = StudentBehaviour.objects.filter(id=pk).first()
        if row is None:
            raise LookupError("Incident type not found.")
        if StudentIncidents.objects.filter(incident_id=pk).exists():
            raise ValueError("Cannot delete an incident type that is already assigned.")
        row.delete()

    def list_assignments(
        self, *, session_id: int | None = None, student_id: int | None = None
    ) -> list[dict[str, Any]]:
        qs = StudentIncidents.objects.all().order_by("-id")
        if session_id:
            qs = qs.filter(session_id=session_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        rows = list(qs[:1000])
        type_map = {
            t.id: t for t in StudentBehaviour.objects.filter(id__in={r.incident_id for r in rows})
        }
        students = {
            s.id: s
            for s in Students.objects.filter(id__in={r.student_id for r in rows})
        }
        return [self._assignment_to_dict(row, type_map, students) for row in rows]

    def assign_incident(self, payload: dict[str, Any], *, assign_by: int) -> dict[str, Any]:
        try:
            student_id = int(payload.get("student_id"))
            incident_id = int(payload.get("incident_id"))
            session_id = int(payload.get("session_id"))
        except (TypeError, ValueError) as exc:
            raise ValueError("student_id, incident_id, and session_id are required.") from exc

        if not Students.objects.filter(id=student_id).exists():
            raise LookupError("Student not found.")
        if not StudentBehaviour.objects.filter(id=incident_id).exists():
            raise LookupError("Incident type not found.")

        row = StudentIncidents.objects.create(
            student_id=student_id,
            incident_id=incident_id,
            session_id=session_id,
            assign_by=assign_by,
            created_at=timezone.now(),
        )
        type_map = {incident_id: StudentBehaviour.objects.get(id=incident_id)}
        students = {student_id: Students.objects.get(id=student_id)}
        return self._assignment_to_dict(row, type_map, students)

    def delete_assignment(self, pk: int) -> None:
        row = StudentIncidents.objects.filter(id=pk).first()
        if row is None:
            raise LookupError("Assignment not found.")
        row.delete()

    def get_settings(self) -> dict[str, Any]:
        row = BehaviourSettings.objects.order_by("id").first()
        return {
            "id": row.id if row else None,
            "comment_option": row.comment_option if row else None,
        }

    def _type_to_dict(self, row: StudentBehaviour) -> dict[str, Any]:
        return {
            "id": row.id,
            "title": row.title,
            "point": row.point,
            "description": row.description,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }

    def _assignment_to_dict(
        self,
        row: StudentIncidents,
        type_map: dict[int, StudentBehaviour],
        students: dict[int, Students],
    ) -> dict[str, Any]:
        incident = type_map.get(row.incident_id)
        student = students.get(row.student_id)
        return {
            "id": row.id,
            "session_id": row.session_id,
            "student_id": row.student_id,
            "student_name": (
                student_sel.format_student_name(
                    student.firstname, student.middlename, student.lastname
                )
                if student
                else str(row.student_id)
            ),
            "admission_no": student.admission_no if student else None,
            "incident_id": row.incident_id,
            "incident_title": incident.title if incident else None,
            "incident_point": incident.point if incident else None,
            "assign_by": row.assign_by,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
