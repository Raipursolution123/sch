from datetime import datetime
from typing import Any

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from apps.academics.models import Classes, Sessions
from apps.alumni.models.alumni_events import AlumniEvents
from apps.alumni.models.alumni_students import AlumniStudents
from apps.students.models.students import Students
from apps.students.selectors import student_selectors as student_sel


class AlumniError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class AlumniNotFoundError(AlumniError):
    pass


class AlumniValidationError(AlumniError):
    pass


def _parse_dt(value: Any):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip().replace("Z", "+00:00")
    parsed = parse_datetime(text)
    if parsed is not None:
        return parsed
    try:
        if len(text) == 10:
            return datetime.fromisoformat(f"{text}T00:00:00")
        return datetime.fromisoformat(text[:19])
    except Exception as exc:
        raise AlumniValidationError(f"Invalid datetime: {value}") from exc


class AlumniStudentService:
    def list(self, *, query: str | None = None):
        qs = AlumniStudents.objects.all().order_by("-id")
        term = (query or "").strip()
        if term:
            student_ids = list(
                Students.objects.filter(
                    Q(firstname__icontains=term)
                    | Q(lastname__icontains=term)
                    | Q(admission_no__icontains=term)
                ).values_list("id", flat=True)[:200]
            )
            qs = qs.filter(
                Q(current_email__icontains=term)
                | Q(current_phone__icontains=term)
                | Q(occupation__icontains=term)
                | Q(student_id__in=student_ids)
            )
        return qs

    def get(self, pk: int) -> AlumniStudents:
        row = AlumniStudents.objects.filter(id=pk).first()
        if row is None:
            raise AlumniNotFoundError("Alumni record not found.")
        return row

    def to_dict(self, row: AlumniStudents) -> dict[str, Any]:
        student = Students.objects.filter(id=row.student_id).first()
        return {
            "id": row.id,
            "student_id": row.student_id,
            "admission_no": student.admission_no if student else None,
            "student_name": (
                student_sel.format_student_name(
                    student.firstname, student.middlename, student.lastname
                )
                if student
                else None
            ),
            "current_email": row.current_email,
            "current_phone": row.current_phone,
            "occupation": row.occupation,
            "address": row.address,
            "photo": row.photo,
            "created_at": row.created_at,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        student_id = payload.get("student_id")
        if not student_id:
            raise AlumniValidationError("student_id is required.")
        student = Students.objects.filter(id=int(student_id)).first()
        if student is None:
            raise AlumniValidationError("Student not found.")
        if AlumniStudents.objects.filter(student_id=student.id).exists():
            raise AlumniValidationError(
                "Alumni record already exists for this student."
            )
        row = AlumniStudents.objects.create(
            student_id=student.id,
            current_email=str(payload.get("current_email", "")).strip(),
            current_phone=str(payload.get("current_phone", "")).strip(),
            occupation=str(payload.get("occupation", "")).strip(),
            address=str(payload.get("address", "")).strip(),
            photo=str(payload.get("photo", "")).strip() or None,
            created_at=timezone.now(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "student_id" in payload and payload["student_id"] is not None:
            student_id = int(payload["student_id"])
            if not Students.objects.filter(id=student_id).exists():
                raise AlumniValidationError("Student not found.")
            other = (
                AlumniStudents.objects.filter(student_id=student_id)
                .exclude(id=row.id)
                .exists()
            )
            if other:
                raise AlumniValidationError(
                    "Alumni record already exists for this student."
                )
            row.student_id = student_id
        for field in ("current_email", "current_phone", "occupation", "address"):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip())
        if "photo" in payload:
            row.photo = str(payload.get("photo") or "").strip() or None
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class AlumniEventService:
    def list(self, *, query: str | None = None):
        qs = AlumniEvents.objects.all().order_by("-from_date", "-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(title__icontains=term)
                | Q(note__icontains=term)
                | Q(event_for__icontains=term)
            )
        return qs

    def get(self, pk: int) -> AlumniEvents:
        row = AlumniEvents.objects.filter(id=pk).first()
        if row is None:
            raise AlumniNotFoundError("Alumni event not found.")
        return row

    def to_dict(self, row: AlumniEvents) -> dict[str, Any]:
        session = (
            Sessions.objects.filter(id=row.session_id).first()
            if row.session_id
            else None
        )
        school_class = (
            Classes.objects.filter(id=row.class_id).first() if row.class_id else None
        )
        return {
            "id": row.id,
            "title": row.title,
            "event_for": row.event_for,
            "session_id": row.session_id,
            "session_name": session.session if session else None,
            "class_id": row.class_id,
            "class_name": school_class.class_field if school_class else None,
            "section": row.section,
            "from_date": row.from_date,
            "to_date": row.to_date,
            "note": row.note,
            "photo": row.photo,
            "is_active": row.is_active,
            "event_notification_message": row.event_notification_message,
            "show_onwebsite": row.show_onwebsite,
            "created_at": row.created_at,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise AlumniValidationError("title is required.")
        from_date = _parse_dt(payload.get("from_date"))
        to_date = _parse_dt(payload.get("to_date"))
        if not from_date or not to_date:
            raise AlumniValidationError("from_date and to_date are required.")
        if to_date < from_date:
            raise AlumniValidationError("to_date cannot be before from_date.")
        session_id = payload.get("session_id")
        if session_id and not Sessions.objects.filter(id=int(session_id)).exists():
            raise AlumniValidationError("Session not found.")
        class_id = payload.get("class_id")
        if class_id and not Classes.objects.filter(id=int(class_id)).exists():
            raise AlumniValidationError("Class not found.")
        row = AlumniEvents.objects.create(
            title=title,
            event_for=str(payload.get("event_for", "all")).strip() or "all",
            session_id=int(session_id) if session_id else None,
            class_id=int(class_id) if class_id else None,
            section=str(payload.get("section", "")).strip(),
            from_date=from_date,
            to_date=to_date,
            note=str(payload.get("note", "")).strip(),
            photo=str(payload.get("photo", "")).strip() or None,
            is_active=int(
                payload.get("is_active") if payload.get("is_active") is not None else 1
            ),
            event_notification_message=str(
                payload.get("event_notification_message", "")
            ).strip(),
            show_onwebsite=int(
                payload.get("show_onwebsite")
                if payload.get("show_onwebsite") is not None
                else 0
            ),
            created_at=timezone.now(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload.get("title", "")).strip()
            if not title:
                raise AlumniValidationError("title cannot be empty.")
            row.title = title
        if "from_date" in payload:
            row.from_date = _parse_dt(payload.get("from_date")) or row.from_date
        if "to_date" in payload:
            row.to_date = _parse_dt(payload.get("to_date")) or row.to_date
        if row.to_date < row.from_date:
            raise AlumniValidationError("to_date cannot be before from_date.")
        if "session_id" in payload:
            session_id = payload.get("session_id")
            if session_id and not Sessions.objects.filter(id=int(session_id)).exists():
                raise AlumniValidationError("Session not found.")
            row.session_id = int(session_id) if session_id else None
        if "class_id" in payload:
            class_id = payload.get("class_id")
            if class_id and not Classes.objects.filter(id=int(class_id)).exists():
                raise AlumniValidationError("Class not found.")
            row.class_id = int(class_id) if class_id else None
        for field in ("event_for", "section", "note", "event_notification_message"):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip())
        if "photo" in payload:
            row.photo = str(payload.get("photo") or "").strip() or None
        if "is_active" in payload and payload["is_active"] is not None:
            row.is_active = int(payload["is_active"])
        if "show_onwebsite" in payload and payload["show_onwebsite"] is not None:
            row.show_onwebsite = int(payload["show_onwebsite"])
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()
