from __future__ import annotations

import logging
from typing import Any

from django.utils import timezone

from apps.documents.models.template_admitcards import TemplateAdmitcards
from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.template_marksheets import TemplateMarksheets

logger = logging.getLogger(__name__)


def _flag(value: Any, default: int = 1) -> int:
    if value is None:
        return default
    if value in (1, True, "1", "yes", "true", "True"):
        return 1
    return 0


class AdmitCardTemplateService:
    def list(self) -> list[dict[str, Any]]:
        return [
            self._to_dict(row)
            for row in TemplateAdmitcards.objects.all().order_by("-id")
        ]

    def get(self, pk: int) -> dict[str, Any]:
        row = TemplateAdmitcards.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Admit card template not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate(payload)
        row = TemplateAdmitcards.objects.create(
            **cleaned,
            is_letter_head=_flag(payload.get("is_letter_head"), 0),
            is_photo=_flag(payload.get("is_photo"), 1),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )
        logger.info("Created admit card template id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = TemplateAdmitcards.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Admit card template not found.")
        cleaned = self._validate({**self._to_dict(row), **payload}, partial=True)
        for key, value in cleaned.items():
            setattr(row, key, value)
        for flag in (
            "is_letter_head",
            "is_name",
            "is_father_name",
            "is_mother_name",
            "is_dob",
            "is_admission_no",
            "is_roll_no",
            "is_address",
            "is_gender",
            "is_photo",
            "is_class",
            "is_section",
        ):
            if flag in payload:
                setattr(row, flag, _flag(payload.get(flag)))
        row.updated_at = timezone.now().date()
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = TemplateAdmitcards.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Admit card template not found.")
        row.delete()

    def _validate(
        self, payload: dict[str, Any], *, partial: bool = False
    ) -> dict[str, Any]:
        heading = str(payload.get("heading") or "").strip()
        title = str(payload.get("title") or "").strip()
        if not partial or "heading" in payload or "title" in payload:
            if not heading and not title:
                raise ExaminationValidationError("Heading or title is required.")
        return {
            "template": str(payload.get("template") or "default").strip() or "default",
            "heading": heading,
            "title": title,
            "exam_name": str(payload.get("exam_name") or "").strip(),
            "school_name": str(payload.get("school_name") or "").strip(),
            "exam_center": str(payload.get("exam_center") or "").strip(),
            "content_footer": str(payload.get("content_footer") or "").strip(),
            "left_logo": str(payload.get("left_logo") or "").strip() or None,
            "right_logo": str(payload.get("right_logo") or "").strip() or None,
            "sign": str(payload.get("sign") or "").strip() or None,
            "background_img": str(payload.get("background_img") or "").strip() or None,
            "is_name": _flag(payload.get("is_name"), 1),
            "is_father_name": _flag(payload.get("is_father_name"), 1),
            "is_mother_name": _flag(payload.get("is_mother_name"), 1),
            "is_dob": _flag(payload.get("is_dob"), 1),
            "is_admission_no": _flag(payload.get("is_admission_no"), 1),
            "is_roll_no": _flag(payload.get("is_roll_no"), 1),
            "is_address": _flag(payload.get("is_address"), 1),
            "is_gender": _flag(payload.get("is_gender"), 1),
            "is_class": _flag(payload.get("is_class"), 0),
            "is_section": _flag(payload.get("is_section"), 0),
        }

    def _to_dict(self, row: TemplateAdmitcards) -> dict[str, Any]:
        return {
            "id": row.id,
            "template": row.template or "",
            "heading": row.heading or "",
            "title": row.title or "",
            "exam_name": row.exam_name or "",
            "school_name": row.school_name or "",
            "exam_center": row.exam_center or "",
            "content_footer": row.content_footer or "",
            "left_logo": row.left_logo or "",
            "right_logo": row.right_logo or "",
            "sign": row.sign or "",
            "background_img": row.background_img or "",
            "is_letter_head": int(row.is_letter_head or 0),
            "is_name": int(row.is_name or 0),
            "is_father_name": int(row.is_father_name or 0),
            "is_mother_name": int(row.is_mother_name or 0),
            "is_dob": int(row.is_dob or 0),
            "is_admission_no": int(row.is_admission_no or 0),
            "is_roll_no": int(row.is_roll_no or 0),
            "is_address": int(row.is_address or 0),
            "is_gender": int(row.is_gender or 0),
            "is_photo": int(row.is_photo or 0),
            "is_class": int(row.is_class or 0),
            "is_section": int(row.is_section or 0),
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }


class MarksheetTemplateService:
    def list(self) -> list[dict[str, Any]]:
        return [
            self._to_dict(row)
            for row in TemplateMarksheets.objects.all().order_by("-id")
        ]

    def get(self, pk: int) -> dict[str, Any]:
        row = TemplateMarksheets.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Marksheet template not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate(payload)
        row = TemplateMarksheets.objects.create(
            **cleaned,
            is_customfield=_flag(payload.get("is_customfield"), 0),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )
        logger.info("Created marksheet template id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = TemplateMarksheets.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Marksheet template not found.")
        cleaned = self._validate({**self._to_dict(row), **payload}, partial=True)
        for key, value in cleaned.items():
            setattr(row, key, value)
        for flag in (
            "exam_session",
            "is_name",
            "is_father_name",
            "is_mother_name",
            "is_dob",
            "is_admission_no",
            "is_roll_no",
            "is_photo",
            "is_division",
            "is_rank",
            "is_customfield",
            "is_class",
            "is_teacher_remark",
            "is_section",
        ):
            if flag in payload:
                setattr(row, flag, _flag(payload.get(flag), getattr(row, flag) or 0))
        row.updated_at = timezone.now().date()
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = TemplateMarksheets.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Marksheet template not found.")
        row.delete()

    def _validate(
        self, payload: dict[str, Any], *, partial: bool = False
    ) -> dict[str, Any]:
        heading = str(payload.get("heading") or "").strip()
        title = str(payload.get("title") or "").strip()
        if not partial or "heading" in payload or "title" in payload:
            if not heading and not title:
                raise ExaminationValidationError("Heading or title is required.")
        return {
            "template": str(payload.get("template") or "default").strip() or "default",
            "heading": heading,
            "title": title,
            "exam_name": str(payload.get("exam_name") or "").strip(),
            "school_name": str(payload.get("school_name") or "").strip(),
            "exam_center": str(payload.get("exam_center") or "").strip(),
            "content": str(payload.get("content") or "").strip(),
            "content_footer": str(payload.get("content_footer") or "").strip(),
            "date": str(payload.get("date") or "").strip() or None,
            "header_image": str(payload.get("header_image") or "").strip() or None,
            "left_logo": str(payload.get("left_logo") or "").strip() or None,
            "right_logo": str(payload.get("right_logo") or "").strip() or None,
            "left_sign": str(payload.get("left_sign") or "").strip() or None,
            "middle_sign": str(payload.get("middle_sign") or "").strip() or None,
            "right_sign": str(payload.get("right_sign") or "").strip() or None,
            "background_img": str(payload.get("background_img") or "").strip() or None,
            "exam_session": _flag(payload.get("exam_session"), 1),
            "is_name": _flag(payload.get("is_name"), 1),
            "is_father_name": _flag(payload.get("is_father_name"), 1),
            "is_mother_name": _flag(payload.get("is_mother_name"), 1),
            "is_dob": _flag(payload.get("is_dob"), 1),
            "is_admission_no": _flag(payload.get("is_admission_no"), 1),
            "is_roll_no": _flag(payload.get("is_roll_no"), 1),
            "is_photo": _flag(payload.get("is_photo"), 1),
            "is_division": _flag(payload.get("is_division"), 1),
            "is_rank": _flag(payload.get("is_rank"), 0),
            "is_class": _flag(payload.get("is_class"), 0),
            "is_teacher_remark": _flag(payload.get("is_teacher_remark"), 1),
            "is_section": _flag(payload.get("is_section"), 0),
        }

    def _to_dict(self, row: TemplateMarksheets) -> dict[str, Any]:
        return {
            "id": row.id,
            "template": row.template or "",
            "heading": row.heading or "",
            "title": row.title or "",
            "exam_name": row.exam_name or "",
            "school_name": row.school_name or "",
            "exam_center": row.exam_center or "",
            "content": row.content or "",
            "content_footer": row.content_footer or "",
            "date": row.date or "",
            "header_image": row.header_image or "",
            "left_logo": row.left_logo or "",
            "right_logo": row.right_logo or "",
            "left_sign": row.left_sign or "",
            "middle_sign": row.middle_sign or "",
            "right_sign": row.right_sign or "",
            "background_img": row.background_img or "",
            "exam_session": int(row.exam_session or 0),
            "is_name": int(row.is_name or 0),
            "is_father_name": int(row.is_father_name or 0),
            "is_mother_name": int(row.is_mother_name or 0),
            "is_dob": int(row.is_dob or 0),
            "is_admission_no": int(row.is_admission_no or 0),
            "is_roll_no": int(row.is_roll_no or 0),
            "is_photo": int(row.is_photo or 0),
            "is_division": int(row.is_division or 0),
            "is_rank": int(row.is_rank or 0),
            "is_customfield": int(row.is_customfield or 0),
            "is_class": int(row.is_class or 0),
            "is_teacher_remark": int(row.is_teacher_remark or 0),
            "is_section": int(row.is_section or 0),
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }
