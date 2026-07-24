from __future__ import annotations

from typing import Any

from django.db.models import Q

from apps.documents.domain.certificate_exceptions import (
    CertificateNotFoundError,
    CertificateValidationError,
)
from apps.documents.models.id_card import IdCard
from apps.staff.domain.staff_exceptions import StaffNotFoundError
from apps.staff.models.staff_id_card import StaffIdCard
from apps.staff.services.staff_service import StaffService
from apps.students.domain.student_exceptions import StudentNotFoundError
from apps.students.services.student_service import StudentService


def _int_flag(value, default=0) -> int:
    if value is None:
        return default
    return int(value)


class StudentIdCardService:
    def list(self, *, query: str | None = None):
        qs = IdCard.objects.all().order_by("title", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(title__icontains=term) | Q(school_name__icontains=term))
        return qs

    def get(self, pk: int) -> IdCard:
        row = IdCard.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Student ID card template not found.")
        return row

    def create(self, payload: dict[str, Any]) -> IdCard:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise CertificateValidationError("Title is required.")
        return IdCard.objects.create(
            title=title,
            school_name=str(payload.get("school_name", "")).strip() or "",
            school_address=str(payload.get("school_address", "")).strip() or "",
            background=str(payload.get("background", "")).strip() or "",
            logo=str(payload.get("logo", "")).strip() or "",
            sign_image=str(payload.get("sign_image", "")).strip() or "",
            enable_vertical_card=_int_flag(payload.get("enable_vertical_card"), 0),
            header_color=str(payload.get("header_color", "")).strip() or "#0d6efd",
            enable_admission_no=_int_flag(payload.get("enable_admission_no"), 1),
            enable_student_name=_int_flag(payload.get("enable_student_name"), 1),
            enable_class=_int_flag(payload.get("enable_class"), 1),
            enable_fathers_name=_int_flag(payload.get("enable_fathers_name"), 1),
            enable_mothers_name=_int_flag(payload.get("enable_mothers_name"), 0),
            enable_address=_int_flag(payload.get("enable_address"), 1),
            enable_phone=_int_flag(payload.get("enable_phone"), 1),
            enable_dob=_int_flag(payload.get("enable_dob"), 1),
            enable_blood_group=_int_flag(payload.get("enable_blood_group"), 0),
            enable_student_barcode=_int_flag(payload.get("enable_student_barcode"), 1),
            status=_int_flag(payload.get("status"), 1),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> IdCard:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload["title"]).strip()
            if not title:
                raise CertificateValidationError("Title cannot be empty.")
            row.title = title
        for field in (
            "school_name",
            "school_address",
            "background",
            "logo",
            "sign_image",
            "header_color",
        ):
            if field in payload:
                setattr(row, field, str(payload[field] or "").strip())
        for field in (
            "enable_vertical_card",
            "enable_admission_no",
            "enable_student_name",
            "enable_class",
            "enable_fathers_name",
            "enable_mothers_name",
            "enable_address",
            "enable_phone",
            "enable_dob",
            "enable_blood_group",
            "enable_student_barcode",
            "status",
        ):
            if field in payload and payload[field] is not None:
                setattr(row, field, int(payload[field]))
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()

    def preview(self, *, template_id: int, student_id: int) -> dict[str, Any]:
        template = self.get(template_id)
        try:
            student = StudentService().get_student(student_id)
        except StudentNotFoundError as exc:
            raise CertificateNotFoundError("Student not found.") from exc

        fields: list[dict[str, str]] = []
        mapping = [
            ("enable_admission_no", "Admission No", student.get("admission_no")),
            ("enable_student_name", "Name", student.get("full_name")),
            (
                "enable_class",
                "Class",
                " ".join(
                    p
                    for p in (
                        student.get("class_name") or "",
                        student.get("section_name") or "",
                    )
                    if p
                ),
            ),
            ("enable_fathers_name", "Father", student.get("father_name")),
            ("enable_mothers_name", "Mother", student.get("mother_name")),
            ("enable_address", "Address", student.get("current_address")),
            ("enable_phone", "Phone", student.get("mobileno")),
            ("enable_dob", "DOB", student.get("dob")),
            ("enable_blood_group", "Blood group", student.get("blood_group")),
        ]
        for flag, label, value in mapping:
            if int(getattr(template, flag) or 0) == 1 and value:
                fields.append({"label": label, "value": str(value)})

        barcode = ""
        if int(template.enable_student_barcode or 0) == 1:
            barcode = str(student.get("admission_no") or student_id)

        return {
            "kind": "student",
            "template_id": template.id,
            "title": template.title,
            "school_name": template.school_name,
            "school_address": template.school_address,
            "background": template.background,
            "logo": template.logo,
            "sign_image": template.sign_image,
            "header_color": template.header_color,
            "enable_vertical_card": template.enable_vertical_card,
            "person_id": student_id,
            "person_name": student.get("full_name") or "",
            "photo": student.get("image"),
            "barcode": barcode,
            "fields": fields,
        }


class StaffIdCardService:
    def list(self, *, query: str | None = None):
        qs = StaffIdCard.objects.all().order_by("title", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(title__icontains=term) | Q(school_name__icontains=term))
        return qs

    def get(self, pk: int) -> StaffIdCard:
        row = StaffIdCard.objects.filter(id=pk).first()
        if row is None:
            raise CertificateNotFoundError("Staff ID card template not found.")
        return row

    def create(self, payload: dict[str, Any]) -> StaffIdCard:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise CertificateValidationError("Title is required.")
        return StaffIdCard.objects.create(
            title=title,
            school_name=str(payload.get("school_name", "")).strip() or "",
            school_address=str(payload.get("school_address", "")).strip() or "",
            background=str(payload.get("background", "")).strip() or "",
            logo=str(payload.get("logo", "")).strip() or "",
            sign_image=str(payload.get("sign_image", "")).strip() or "",
            header_color=str(payload.get("header_color", "")).strip() or "#0d6efd",
            enable_vertical_card=_int_flag(payload.get("enable_vertical_card"), 0),
            enable_staff_role=_int_flag(payload.get("enable_staff_role"), 1),
            enable_staff_id=_int_flag(payload.get("enable_staff_id"), 1),
            enable_staff_department=_int_flag(payload.get("enable_staff_department"), 1),
            enable_designation=_int_flag(payload.get("enable_designation"), 1),
            enable_name=_int_flag(payload.get("enable_name"), 1),
            enable_fathers_name=_int_flag(payload.get("enable_fathers_name"), 0),
            enable_mothers_name=_int_flag(payload.get("enable_mothers_name"), 0),
            enable_date_of_joining=_int_flag(payload.get("enable_date_of_joining"), 1),
            enable_permanent_address=_int_flag(
                payload.get("enable_permanent_address"), 1
            ),
            enable_staff_dob=_int_flag(payload.get("enable_staff_dob"), 1),
            enable_staff_phone=_int_flag(payload.get("enable_staff_phone"), 1),
            enable_staff_barcode=_int_flag(payload.get("enable_staff_barcode"), 1),
            status=_int_flag(payload.get("status"), 1),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> StaffIdCard:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload["title"]).strip()
            if not title:
                raise CertificateValidationError("Title cannot be empty.")
            row.title = title
        for field in (
            "school_name",
            "school_address",
            "background",
            "logo",
            "sign_image",
            "header_color",
        ):
            if field in payload:
                setattr(row, field, str(payload[field] or "").strip())
        for field in (
            "enable_vertical_card",
            "enable_staff_role",
            "enable_staff_id",
            "enable_staff_department",
            "enable_designation",
            "enable_name",
            "enable_fathers_name",
            "enable_mothers_name",
            "enable_date_of_joining",
            "enable_permanent_address",
            "enable_staff_dob",
            "enable_staff_phone",
            "enable_staff_barcode",
            "status",
        ):
            if field in payload and payload[field] is not None:
                setattr(row, field, int(payload[field]))
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()

    def preview(self, *, template_id: int, staff_id: int) -> dict[str, Any]:
        template = self.get(template_id)
        try:
            staff = StaffService().get_staff(staff_id)
        except StaffNotFoundError as exc:
            raise CertificateNotFoundError("Staff not found.") from exc

        name = " ".join(
            p for p in (staff.get("name") or "", staff.get("surname") or "") if p
        )
        fields: list[dict[str, str]] = []
        mapping = [
            ("enable_staff_id", "Employee ID", staff.get("employee_id")),
            ("enable_name", "Name", name or staff.get("name")),
            ("enable_staff_department", "Department", staff.get("department_name")),
            ("enable_designation", "Designation", staff.get("designation_name")),
            ("enable_staff_role", "Role", staff.get("role_name") or staff.get("role")),
            ("enable_fathers_name", "Father", staff.get("father_name")),
            ("enable_mothers_name", "Mother", staff.get("mother_name")),
            ("enable_date_of_joining", "Joined", staff.get("date_of_joining")),
            ("enable_permanent_address", "Address", staff.get("permanent_address")),
            ("enable_staff_dob", "DOB", staff.get("dob")),
            ("enable_staff_phone", "Phone", staff.get("contact_no")),
        ]
        for flag, label, value in mapping:
            if int(getattr(template, flag) or 0) == 1 and value:
                fields.append({"label": label, "value": str(value)})

        barcode = ""
        if int(template.enable_staff_barcode or 0) == 1:
            barcode = str(staff.get("employee_id") or staff_id)

        return {
            "kind": "staff",
            "template_id": template.id,
            "title": template.title,
            "school_name": template.school_name,
            "school_address": template.school_address,
            "background": template.background,
            "logo": template.logo,
            "sign_image": template.sign_image,
            "header_color": template.header_color,
            "enable_vertical_card": template.enable_vertical_card,
            "person_id": staff_id,
            "person_name": name,
            "photo": staff.get("image"),
            "barcode": barcode,
            "fields": fields,
        }
