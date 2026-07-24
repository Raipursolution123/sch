from __future__ import annotations

import re
from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.documents.domain.certificate_exceptions import (
    CertificateNotFoundError,
    CertificateValidationError,
)
from apps.documents.models.certificates import Certificates
from apps.students.domain.student_exceptions import StudentNotFoundError
from apps.students.services.student_service import StudentService

# created_for: 1 = staff, 2 = students (legacy)
CREATED_FOR_STAFF = 1
CREATED_FOR_STUDENT = 2


class CertificateTemplateService:
    def list(self, *, query: str | None = None, created_for: int | None = None):
        qs = Certificates.objects.all().order_by("certificate_name", "id")
        if created_for is not None:
            qs = qs.filter(created_for=created_for)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(certificate_name__icontains=term)
                | Q(certificate_text__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Certificates:
        row = Certificates.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Certificate template not found.")
        return row

    def create(self, payload: dict[str, Any]) -> Certificates:
        name = str(payload.get("certificate_name", "")).strip()
        text = str(payload.get("certificate_text", "")).strip()
        if not name:
            raise CertificateValidationError("Certificate name is required.")
        if not text:
            raise CertificateValidationError("Certificate text is required.")

        created_for = int(payload.get("created_for") or CREATED_FOR_STUDENT)
        if created_for not in {CREATED_FOR_STAFF, CREATED_FOR_STUDENT}:
            raise CertificateValidationError(
                "created_for must be 1 (staff) or 2 (students)."
            )

        return Certificates.objects.create(
            certificate_name=name,
            certificate_text=text,
            left_header=str(payload.get("left_header", "")).strip() or "",
            center_header=str(payload.get("center_header", "")).strip() or "",
            right_header=str(payload.get("right_header", "")).strip() or "",
            left_footer=str(payload.get("left_footer", "")).strip() or "",
            right_footer=str(payload.get("right_footer", "")).strip() or "",
            center_footer=str(payload.get("center_footer", "")).strip() or "",
            background_image=str(payload.get("background_image", "")).strip()
            or None,
            created_for=created_for,
            status=int(payload.get("status") if payload.get("status") is not None else 1),
            header_height=int(payload.get("header_height") or 100),
            content_height=int(payload.get("content_height") or 250),
            footer_height=int(payload.get("footer_height") or 100),
            content_width=int(payload.get("content_width") or 800),
            enable_student_image=int(payload.get("enable_student_image") or 0),
            enable_image_height=int(payload.get("enable_image_height") or 100),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> Certificates:
        row = self.get(pk)
        if "certificate_name" in payload:
            name = str(payload["certificate_name"]).strip()
            if not name:
                raise CertificateValidationError("Certificate name cannot be empty.")
            row.certificate_name = name
        if "certificate_text" in payload:
            text = str(payload["certificate_text"]).strip()
            if not text:
                raise CertificateValidationError("Certificate text cannot be empty.")
            row.certificate_text = text
        for field in (
            "left_header",
            "center_header",
            "right_header",
            "left_footer",
            "right_footer",
            "center_footer",
        ):
            if field in payload:
                setattr(row, field, str(payload[field] or "").strip())
        if "background_image" in payload:
            row.background_image = str(payload["background_image"] or "").strip() or None
        if "created_for" in payload:
            created_for = int(payload["created_for"])
            if created_for not in {CREATED_FOR_STAFF, CREATED_FOR_STUDENT}:
                raise CertificateValidationError(
                    "created_for must be 1 (staff) or 2 (students)."
                )
            row.created_for = created_for
        for field in (
            "status",
            "header_height",
            "content_height",
            "footer_height",
            "content_width",
            "enable_student_image",
            "enable_image_height",
        ):
            if field in payload and payload[field] is not None:
                setattr(row, field, int(payload[field]))
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CertificateGenerateService:
    """Merge a certificate template with student data for print preview."""

    TOKEN_RE = re.compile(r"\[([a-zA-Z0-9_]+)\]|\{\{([a-zA-Z0-9_]+)\}\}")

    def preview(self, *, certificate_id: int, student_id: int) -> dict[str, Any]:
        template = CertificateTemplateService().get(certificate_id)
        if int(template.created_for) == CREATED_FOR_STAFF:
            raise CertificateValidationError(
                "This template is for staff; staff generate is not available yet."
            )

        try:
            detail = StudentService().get_student(student_id)
        except StudentNotFoundError as exc:
            raise CertificateNotFoundError("Student not found.") from exc

        tokens = self._student_tokens(detail)

        def replace_text(value: str | None) -> str:
            text = value or ""

            def _sub(match: re.Match) -> str:
                key = (match.group(1) or match.group(2) or "").lower()
                return str(tokens.get(key, match.group(0)))

            return self.TOKEN_RE.sub(_sub, text)

        return {
            "certificate_id": template.id,
            "certificate_name": template.certificate_name,
            "student_id": student_id,
            "student_name": tokens.get("name", ""),
            "left_header": replace_text(template.left_header),
            "center_header": replace_text(template.center_header),
            "right_header": replace_text(template.right_header),
            "left_footer": replace_text(template.left_footer),
            "center_footer": replace_text(template.center_footer),
            "right_footer": replace_text(template.right_footer),
            "certificate_text": replace_text(template.certificate_text),
            "background_image": template.background_image,
            "header_height": template.header_height,
            "content_height": template.content_height,
            "footer_height": template.footer_height,
            "content_width": template.content_width,
            "enable_student_image": template.enable_student_image,
            "enable_image_height": template.enable_image_height,
            "student_image": detail.get("image"),
        }

    @staticmethod
    def _student_tokens(detail: dict[str, Any]) -> dict[str, str]:
        def s(key: str, fallback: str = "") -> str:
            val = detail.get(key)
            if val is None or val == "":
                return fallback
            return str(val)

        full = s("full_name") or " ".join(
            p
            for p in (s("firstname"), s("middlename"), s("lastname"))
            if p
        )

        return {
            "name": full,
            "student_name": full,
            "firstname": s("firstname"),
            "middlename": s("middlename"),
            "lastname": s("lastname"),
            "admission_no": s("admission_no"),
            "roll_no": s("roll_no"),
            "class": s("class_name"),
            "section": s("section_name"),
            "class_section": " ".join(
                p for p in (s("class_name"), s("section_name")) if p
            ),
            "dob": s("dob"),
            "gender": s("gender"),
            "father_name": s("father_name"),
            "mother_name": s("mother_name"),
            "guardian_name": s("guardian_name"),
            "guardian_phone": s("guardian_phone"),
            "phone": s("mobileno"),
            "mobileno": s("mobileno"),
            "email": s("email"),
            "current_address": s("current_address"),
            "permanent_address": s("permanent_address"),
            "address": s("current_address") or s("permanent_address"),
            "blood_group": s("blood_group"),
            "religion": s("religion"),
            "admission_date": s("admission_date"),
            "cast": s("cast"),
            "caste": s("cast"),
        }
