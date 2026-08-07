"""Scheme & scholarship master + student applications."""

from __future__ import annotations

import logging
import time
from datetime import date
from typing import Any

from apps.academics.models import Classes, Sections
from apps.academics.selectors.session_selectors import get_current_session
from apps.cyc_extensions.models.cyc_scheme_and_scholarship import (
    CycSchemeAndScholarship,
)
from apps.cyc_extensions.models.cyc_scheme_and_scholarship_feetype import (
    CycSchemeAndScholarshipFeetype,
)
from apps.cyc_extensions.models.cyc_scheme_and_scholarship_student import (
    CycSchemeAndScholarshipStudent,
)
from apps.cyc_extensions.models.cyc_scheme_and_scholarship_value import (
    CycSchemeAndScholarshipValue,
)
from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as student_sel
from apps.students.selectors.promotion_selectors import students_by_ids

logger = logging.getLogger(__name__)

STATUS_LABELS = {0: "pending", 1: "approved", 2: "rejected"}


class SchemeScholarshipService:
    def list_schemes(self) -> list[dict[str, Any]]:
        schemes = CycSchemeAndScholarship.objects.all().order_by("-ss_id")
        values = CycSchemeAndScholarshipValue.objects.filter(
            ss_id__in=[s.ss_id for s in schemes]
        )
        value_counts = {}
        for v in values:
            value_counts[v.ss_id] = value_counts.get(v.ss_id, 0) + 1
        return [self._scheme_to_dict(s, value_counts.get(s.ss_id, 0)) for s in schemes]

    def create_scheme(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("ss_name") or payload.get("name") or "").strip()
        if not name:
            raise FeeValidationError("Scheme name is required.")
        row = CycSchemeAndScholarship.objects.create(
            ss_name=name[:255],
            ss_type=str(payload.get("ss_type") or payload.get("type") or "scholarship")[
                :255
            ],
            ss_applicable_on=str(
                payload.get("ss_applicable_on") or payload.get("applicable_on") or "fee"
            )[:255],
            ss_status=int(payload.get("ss_status", 1)),
            created_at=int(time.time()),
        )
        return self._scheme_to_dict(row, 0)

    def update_scheme(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = CycSchemeAndScholarship.objects.filter(ss_id=pk).first()
        if row is None:
            raise FeeNotFoundError("Scheme not found.")
        if "ss_name" in payload or "name" in payload:
            row.ss_name = str(
                payload.get("ss_name") or payload.get("name") or ""
            ).strip()[:255]
        if "ss_type" in payload or "type" in payload:
            row.ss_type = str(payload.get("ss_type") or payload.get("type") or "")[:255]
        if "ss_applicable_on" in payload or "applicable_on" in payload:
            row.ss_applicable_on = str(
                payload.get("ss_applicable_on") or payload.get("applicable_on") or ""
            )[:255]
        if "ss_status" in payload:
            row.ss_status = int(payload.get("ss_status") or 0)
        row.save()
        return self._scheme_to_dict(row, 0)

    def delete_scheme(self, pk: int) -> None:
        row = CycSchemeAndScholarship.objects.filter(ss_id=pk).first()
        if row is None:
            raise FeeNotFoundError("Scheme not found.")
        if CycSchemeAndScholarshipStudent.objects.filter(ss_id=pk).exists():
            raise FeeValidationError(
                "Cannot delete a scheme with student applications."
            )
        CycSchemeAndScholarshipValue.objects.filter(ss_id=pk).delete()
        CycSchemeAndScholarshipFeetype.objects.filter(ss_id=pk).delete()
        row.delete()

    def get_scheme_config(self, pk: int) -> dict[str, Any]:
        row = CycSchemeAndScholarship.objects.filter(ss_id=pk).first()
        if row is None:
            raise FeeNotFoundError("Scheme not found.")
        values = list(
            CycSchemeAndScholarshipValue.objects.filter(ss_id=pk).order_by("ssv_id")
        )
        feetype_rows = list(
            CycSchemeAndScholarshipFeetype.objects.filter(ss_id=pk).order_by("ssvft_id")
        )
        feetype_ids = [f.feetype_id for f in feetype_rows if f.feetype_id]
        from apps.fees.models.feetype import Feetype

        feetype_map = {
            ft.id: ft.type for ft in Feetype.objects.filter(id__in=feetype_ids)
        }
        return {
            **self._scheme_to_dict(row, len(values)),
            "values": [
                {
                    "id": value.ssv_id,
                    "fee_concession_type": value.fee_concession_type,
                    "fee_concession": float(value.fee_concession or 0),
                    "applicable_class": value.applicable_class,
                    "is_active": int(value.ssv_status or 0) == 1,
                }
                for value in values
            ],
            "feetype_ids": feetype_ids,
            "feetypes": [
                {"id": ft_id, "name": feetype_map.get(ft_id, f"Fee Type {ft_id}")}
                for ft_id in feetype_ids
            ],
        }

    def save_scheme_config(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = CycSchemeAndScholarship.objects.filter(ss_id=pk).first()
        if row is None:
            raise FeeNotFoundError("Scheme not found.")

        values = payload.get("values") or []
        feetype_ids = payload.get("feetype_ids") or []
        if not isinstance(values, list):
            raise FeeValidationError("values must be a list.")
        if not isinstance(feetype_ids, list):
            raise FeeValidationError("feetype_ids must be a list.")

        CycSchemeAndScholarshipValue.objects.filter(ss_id=pk).delete()
        for item in values:
            concession_type = str(item.get("fee_concession_type") or "").strip()
            if not concession_type:
                continue
            try:
                concession = float(item.get("fee_concession") or 0)
            except (TypeError, ValueError) as exc:
                raise FeeValidationError("Invalid fee concession amount.") from exc
            applicable_class = item.get("applicable_class")
            CycSchemeAndScholarshipValue.objects.create(
                ss_id=pk,
                fee_concession_type=concession_type[:255],
                fee_concession=str(concession),
                applicable_class=int(applicable_class) if applicable_class else None,
                ssv_status=1 if item.get("is_active", True) else 0,
            )

        CycSchemeAndScholarshipFeetype.objects.filter(ss_id=pk).delete()
        for ft_id in {int(x) for x in feetype_ids if x}:
            CycSchemeAndScholarshipFeetype.objects.create(
                ss_id=pk,
                feetype_id=ft_id,
                ssvft_status=1,
            )

        logger.info(
            "Saved scheme config ss_id=%s values=%s feetypes=%s",
            pk,
            len(values),
            len(feetype_ids),
        )
        return self.get_scheme_config(pk)

    def list_applications(
        self,
        *,
        ss_id: int | None = None,
        applied_status: int | None = None,
        class_id: int | None = None,
        section_id: int | None = None,
    ) -> list[dict[str, Any]]:
        qs = CycSchemeAndScholarshipStudent.objects.all().order_by("-sss_id")
        if ss_id:
            qs = qs.filter(ss_id=ss_id)
        if applied_status is not None:
            qs = qs.filter(applied_status=applied_status)
        rows = list(qs[:500])

        session = get_current_session()
        enrollments = {}
        if session:
            enr_qs = StudentSession.objects.filter(session_id=session.id)
            if class_id:
                enr_qs = enr_qs.filter(class_id=class_id)
            if section_id:
                enr_qs = enr_qs.filter(section_id=section_id)
            enrollments = {e.student_id: e for e in enr_qs}

        if class_id or section_id:
            allowed_ids = set(enrollments.keys())
            rows = [r for r in rows if r.student_id in allowed_ids]

        students = students_by_ids([r.student_id for r in rows])
        schemes = {
            s.ss_id: s
            for s in CycSchemeAndScholarship.objects.filter(
                ss_id__in={r.ss_id for r in rows}
            )
        }
        class_map = {
            c.id: c.class_field
            for c in Classes.objects.filter(
                id__in={e.class_id for e in enrollments.values() if e.class_id}
            )
        }
        section_map = {
            s.id: s.section
            for s in Sections.objects.filter(
                id__in={e.section_id for e in enrollments.values() if e.section_id}
            )
        }

        return [
            self._application_to_dict(
                row,
                students.get(row.student_id),
                schemes.get(row.ss_id),
                enrollments.get(row.student_id),
                class_map,
                section_map,
            )
            for row in rows
        ]

    def apply_scheme(
        self, payload: dict[str, Any], *, applied_by: int
    ) -> dict[str, Any]:
        try:
            ss_id = int(payload.get("ss_id"))
            student_id = int(payload.get("student_id"))
        except (TypeError, ValueError) as exc:
            raise FeeValidationError("ss_id and student_id are required.") from exc
        if not CycSchemeAndScholarship.objects.filter(ss_id=ss_id).exists():
            raise FeeNotFoundError("Scheme not found.")
        if student_id not in students_by_ids([student_id]):
            raise FeeNotFoundError("Student not found.")
        row = CycSchemeAndScholarshipStudent.objects.create(
            ss_id=ss_id,
            student_id=student_id,
            applied_on=date.today(),
            applied_by=applied_by or 0,
            applied_status=0,
        )
        scheme = CycSchemeAndScholarship.objects.get(ss_id=ss_id)
        student = students_by_ids([student_id])[student_id]
        return self._application_to_dict(row, student, scheme, None, {}, {})

    def set_application_status(self, pk: int, status: int) -> dict[str, Any]:
        row = CycSchemeAndScholarshipStudent.objects.filter(sss_id=pk).first()
        if row is None:
            raise FeeNotFoundError("Application not found.")
        row.applied_status = status
        row.save(update_fields=["applied_status"])
        scheme = CycSchemeAndScholarship.objects.filter(ss_id=row.ss_id).first()
        student = students_by_ids([row.student_id]).get(row.student_id)
        return self._application_to_dict(row, student, scheme, None, {}, {})

    def _scheme_to_dict(
        self, row: CycSchemeAndScholarship, value_count: int
    ) -> dict[str, Any]:
        return {
            "id": row.ss_id,
            "ss_name": row.ss_name,
            "ss_type": row.ss_type,
            "ss_applicable_on": row.ss_applicable_on,
            "ss_status": row.ss_status,
            "is_active": int(row.ss_status or 0) == 1,
            "value_count": value_count,
            "created_at": row.created_at,
        }

    def _application_to_dict(
        self,
        row: CycSchemeAndScholarshipStudent,
        student,
        scheme,
        enrollment,
        class_map,
        section_map,
    ) -> dict[str, Any]:
        return {
            "id": row.sss_id,
            "ss_id": row.ss_id,
            "scheme_name": scheme.ss_name if scheme else None,
            "student_id": row.student_id,
            "student_name": (
                student_sel.format_student_name(
                    student.firstname, student.middlename, student.lastname
                )
                if student
                else str(row.student_id)
            ),
            "admission_no": student.admission_no if student else None,
            "class_name": class_map.get(enrollment.class_id, "") if enrollment else "",
            "section_name": (
                section_map.get(enrollment.section_id, "") if enrollment else ""
            ),
            "applied_on": row.applied_on.isoformat() if row.applied_on else None,
            "applied_by": row.applied_by,
            "applied_status": row.applied_status,
            "status_label": STATUS_LABELS.get(int(row.applied_status or 0), "pending"),
        }
