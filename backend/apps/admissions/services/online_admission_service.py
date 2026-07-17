from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models.class_sections import ClassSections
from apps.admissions.domain.admissions_exceptions import (
    AdmissionsConflictError,
    AdmissionsNotFoundError,
    AdmissionsValidationError,
)
from apps.admissions.models.online_admissions import OnlineAdmissions
from apps.students.services.student_service import StudentService


class OnlineAdmissionService:
    def list_admissions(self):
        return OnlineAdmissions.objects.all().order_by("-id")

    def get_admission(self, admission_id: int) -> OnlineAdmissions:
        admission = OnlineAdmissions.objects.filter(id=admission_id).first()
        if admission is None:
            raise AdmissionsNotFoundError("Online admission not found.")
        return admission

    def create_admission(self, payload: dict[str, Any]) -> OnlineAdmissions:
        reference_no = str(payload.get("reference_no", "")).strip()
        if not reference_no:
            raise AdmissionsValidationError("Reference number is required.")

        return OnlineAdmissions.objects.create(
            admission_no=str(payload.get("admission_no", "")).strip() or None,
            roll_no=str(payload.get("roll_no", "")).strip() or None,
            reference_no=reference_no,
            admission_date=payload.get("admission_date"),
            firstname=str(payload.get("firstname", "")).strip() or None,
            middlename=str(payload.get("middlename", "")).strip(),
            lastname=str(payload.get("lastname", "")).strip() or None,
            rte=str(payload.get("rte", "No")).strip() or "No",
            image=str(payload.get("image", "")).strip() or None,
            mobileno=str(payload.get("mobileno", "")).strip() or None,
            email=str(payload.get("email", "")).strip() or None,
            state=str(payload.get("state", "")).strip() or None,
            city=str(payload.get("city", "")).strip() or None,
            pincode=str(payload.get("pincode", "")).strip() or None,
            religion=str(payload.get("religion", "")).strip() or None,
            cast=str(payload.get("cast", "")).strip(),
            dob=payload.get("dob"),
            gender=str(payload.get("gender", "")).strip() or None,
            current_address=str(payload.get("current_address", "")).strip() or None,
            permanent_address=str(payload.get("permanent_address", "")).strip() or None,
            category_id=payload.get("category_id"),
            class_section_id=payload.get("class_section_id"),
            route_id=int(payload.get("route_id", 0) or 0),
            school_house_id=payload.get("school_house_id"),
            blood_group=str(payload.get("blood_group", "")).strip(),
            vehroute_id=int(payload.get("vehroute_id", 0) or 0),
            hostel_room_id=payload.get("hostel_room_id"),
            adhar_no=str(payload.get("adhar_no", "")).strip() or None,
            samagra_id=str(payload.get("samagra_id", "")).strip() or None,
            bank_account_no=str(payload.get("bank_account_no", "")).strip() or None,
            bank_name=str(payload.get("bank_name", "")).strip() or None,
            ifsc_code=str(payload.get("ifsc_code", "")).strip() or None,
            guardian_is=str(payload.get("guardian_is", "father")).strip() or "father",
            father_name=str(payload.get("father_name", "")).strip() or None,
            father_phone=str(payload.get("father_phone", "")).strip() or None,
            father_occupation=str(payload.get("father_occupation", "")).strip() or None,
            mother_name=str(payload.get("mother_name", "")).strip() or None,
            mother_phone=str(payload.get("mother_phone", "")).strip() or None,
            mother_occupation=str(payload.get("mother_occupation", "")).strip() or None,
            guardian_name=str(payload.get("guardian_name", "")).strip() or None,
            guardian_relation=str(payload.get("guardian_relation", "")).strip() or None,
            guardian_phone=str(payload.get("guardian_phone", "")).strip() or None,
            guardian_occupation=str(payload.get("guardian_occupation", "")).strip(),
            guardian_address=str(payload.get("guardian_address", "")).strip() or None,
            guardian_email=str(payload.get("guardian_email", "")).strip(),
            father_pic=str(payload.get("father_pic", "")).strip(),
            mother_pic=str(payload.get("mother_pic", "")).strip(),
            guardian_pic=str(payload.get("guardian_pic", "")).strip(),
            is_enroll=int(payload.get("is_enroll", 0) or 0),
            previous_school=str(payload.get("previous_school", "")).strip() or None,
            height=str(payload.get("height", "")).strip(),
            weight=str(payload.get("weight", "")).strip(),
            note=str(payload.get("note", "")).strip(),
            form_status=int(payload.get("form_status", 0) or 0),
            paid_status=int(payload.get("paid_status", 0) or 0),
            measurement_date=payload.get("measurement_date"),
            app_key=str(payload.get("app_key", "")).strip() or None,
            document=str(payload.get("document", "")).strip() or None,
            submit_date=payload.get("submit_date"),
            disable_at=payload.get("disable_at"),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update_admission(
        self, admission_id: int, payload: dict[str, Any]
    ) -> OnlineAdmissions:
        admission = self.get_admission(admission_id)

        if "reference_no" in payload:
            reference_no = str(payload.get("reference_no", "")).strip()
            if not reference_no:
                raise AdmissionsValidationError("Reference number is required.")
            admission.reference_no = reference_no

        field_map = {
            "admission_no": lambda value: str(value).strip() or None,
            "roll_no": lambda value: str(value).strip() or None,
            "admission_date": lambda value: value,
            "firstname": lambda value: str(value).strip() or None,
            "middlename": lambda value: str(value).strip(),
            "lastname": lambda value: str(value).strip() or None,
            "rte": lambda value: str(value).strip() or "No",
            "image": lambda value: str(value).strip() or None,
            "mobileno": lambda value: str(value).strip() or None,
            "email": lambda value: str(value).strip() or None,
            "state": lambda value: str(value).strip() or None,
            "city": lambda value: str(value).strip() or None,
            "pincode": lambda value: str(value).strip() or None,
            "religion": lambda value: str(value).strip() or None,
            "cast": lambda value: str(value).strip(),
            "dob": lambda value: value,
            "gender": lambda value: str(value).strip() or None,
            "current_address": lambda value: str(value).strip() or None,
            "permanent_address": lambda value: str(value).strip() or None,
            "category_id": lambda value: value,
            "class_section_id": lambda value: value,
            "route_id": lambda value: int(value or 0),
            "school_house_id": lambda value: value,
            "blood_group": lambda value: str(value).strip(),
            "vehroute_id": lambda value: int(value or 0),
            "hostel_room_id": lambda value: value,
            "adhar_no": lambda value: str(value).strip() or None,
            "samagra_id": lambda value: str(value).strip() or None,
            "bank_account_no": lambda value: str(value).strip() or None,
            "bank_name": lambda value: str(value).strip() or None,
            "ifsc_code": lambda value: str(value).strip() or None,
            "guardian_is": lambda value: str(value).strip() or "father",
            "father_name": lambda value: str(value).strip() or None,
            "father_phone": lambda value: str(value).strip() or None,
            "father_occupation": lambda value: str(value).strip() or None,
            "mother_name": lambda value: str(value).strip() or None,
            "mother_phone": lambda value: str(value).strip() or None,
            "mother_occupation": lambda value: str(value).strip() or None,
            "guardian_name": lambda value: str(value).strip() or None,
            "guardian_relation": lambda value: str(value).strip() or None,
            "guardian_phone": lambda value: str(value).strip() or None,
            "guardian_occupation": lambda value: str(value).strip(),
            "guardian_address": lambda value: str(value).strip() or None,
            "guardian_email": lambda value: str(value).strip(),
            "father_pic": lambda value: str(value).strip(),
            "mother_pic": lambda value: str(value).strip(),
            "guardian_pic": lambda value: str(value).strip(),
            "is_enroll": lambda value: int(value or 0),
            "previous_school": lambda value: str(value).strip() or None,
            "height": lambda value: str(value).strip(),
            "weight": lambda value: str(value).strip(),
            "note": lambda value: str(value).strip(),
            "form_status": lambda value: int(value or 0),
            "paid_status": lambda value: int(value or 0),
            "measurement_date": lambda value: value,
            "app_key": lambda value: str(value).strip() or None,
            "document": lambda value: str(value).strip() or None,
            "submit_date": lambda value: value,
            "disable_at": lambda value: value,
        }

        for field, transform in field_map.items():
            if field in payload:
                setattr(admission, field, transform(payload[field]))

        admission.updated_at = timezone.now().date()
        admission.save()
        return admission

    def convert_to_student(
        self, admission_id: int, payload: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        payload = payload or {}
        admission = self.get_admission(admission_id)

        if int(admission.is_enroll or 0) == 1:
            raise AdmissionsConflictError("Online admission is already enrolled.")

        class_id = payload.get("class_id")
        section_id = payload.get("section_id")
        if not class_id or not section_id:
            class_id, section_id = self._resolve_class_section(
                admission.class_section_id
            )

        admission_no = str(
            payload.get("admission_no")
            or admission.admission_no
            or admission.reference_no
        ).strip()
        if not admission_no:
            raise AdmissionsValidationError(
                "Admission number is required for enrollment."
            )

        student_payload = {
            "admission_no": admission_no,
            "admission_date": payload.get("admission_date") or admission.admission_date,
            "roll_no": payload.get("roll_no") or admission.roll_no,
            "firstname": admission.firstname,
            "middlename": admission.middlename,
            "lastname": admission.lastname,
            "gender": admission.gender,
            "mobileno": admission.mobileno,
            "email": admission.email,
            "state": admission.state,
            "city": admission.city,
            "pincode": admission.pincode,
            "religion": admission.religion,
            "cast": admission.cast,
            "dob": admission.dob,
            "father_name": admission.father_name,
            "father_phone": admission.father_phone,
            "father_occupation": admission.father_occupation,
            "mother_name": admission.mother_name,
            "mother_phone": admission.mother_phone,
            "mother_occupation": admission.mother_occupation,
            "guardian_name": admission.guardian_name,
            "guardian_relation": admission.guardian_relation,
            "guardian_phone": admission.guardian_phone,
            "guardian_occupation": admission.guardian_occupation,
            "guardian_address": admission.guardian_address,
            "guardian_email": admission.guardian_email,
            "guardian_is": admission.guardian_is,
            "current_address": admission.current_address,
            "permanent_address": admission.permanent_address,
            "blood_group": admission.blood_group,
            "school_house_id": admission.school_house_id,
            "hostel_room_id": admission.hostel_room_id,
            "adhar_no": admission.adhar_no,
            "samagra_id": admission.samagra_id,
            "bank_account_no": admission.bank_account_no,
            "bank_name": admission.bank_name,
            "ifsc_code": admission.ifsc_code,
            "previous_school": admission.previous_school,
            "height": admission.height,
            "weight": admission.weight,
            "measurement_date": admission.measurement_date,
            "note": admission.note,
            "rte": admission.rte,
            "category_id": admission.category_id,
            "class_id": class_id,
            "section_id": section_id,
        }

        with transaction.atomic():
            student = StudentService().admit_student(student_payload)
            admission.is_enroll = 1
            admission.admission_no = admission_no
            admission.updated_at = timezone.now().date()
            admission.save(update_fields=["is_enroll", "admission_no", "updated_at"])

        return {
            "online_admission_id": admission.id,
            "student": student,
        }

    @staticmethod
    def _resolve_class_section(class_section_id: int | None) -> tuple[int, int]:
        if not class_section_id:
            raise AdmissionsValidationError(
                "Class and section are required to convert this admission."
            )

        mapping = ClassSections.objects.filter(
            id=class_section_id, is_active="yes"
        ).first()
        if mapping is None or not mapping.class_id or not mapping.section_id:
            raise AdmissionsValidationError(
                "Selected class section mapping is not available."
            )

        return mapping.class_id, mapping.section_id
