from __future__ import annotations

import datetime
import logging
from typing import Any

from apps.admissions.models.online_admission_fields import OnlineAdmissionFields
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.sch_settings import SchSettings
from apps.settings.selectors.settings_selectors import now_datetime
from apps.settings.services.secret_utils import as_int_flag

logger = logging.getLogger(__name__)

STUDENT_SYSTEM_FIELDS = (
    "is_blood_group",
    "is_student_house",
    "roll_no",
    "category",
    "religion",
    "cast",
    "mobile_no",
    "student_email",
    "admission_date",
    "lastname",
    "middlename",
    "student_photo",
    "student_height",
    "student_weight",
    "measurement_date",
    "father_name",
    "father_phone",
    "father_occupation",
    "father_pic",
    "mother_name",
    "mother_phone",
    "mother_occupation",
    "mother_pic",
    "guardian_name",
    "guardian_relation",
    "guardian_phone",
    "guardian_email",
    "guardian_pic",
    "guardian_occupation",
    "guardian_address",
    "current_address",
    "permanent_address",
    "route_list",
    "hostel_id",
    "bank_account_no",
    "ifsc_code",
    "bank_name",
    "national_identification_no",
    "local_identification_no",
    "rte",
    "previous_school_details",
    "student_note",
    "upload_documents",
    "student_barcode",
)

STAFF_SYSTEM_FIELDS = (
    "staff_designation",
    "staff_department",
    "staff_last_name",
    "staff_father_name",
    "staff_mother_name",
    "staff_date_of_joining",
    "staff_phone",
    "staff_emergency_contact",
    "staff_marital_status",
    "staff_photo",
    "staff_current_address",
    "staff_permanent_address",
    "staff_qualification",
    "staff_work_experience",
    "staff_note",
    "staff_epf_no",
    "staff_basic_salary",
    "staff_contract_type",
    "staff_work_shift",
    "staff_work_location",
    "staff_leaves",
    "staff_account_details",
    "staff_social_media",
    "staff_upload_documents",
    "staff_barcode",
)

SYSTEM_FIELD_KEYS = STUDENT_SYSTEM_FIELDS + STAFF_SYSTEM_FIELDS

ONLINE_ADMISSION_KEYS = (
    "online_admission",
    "online_admission_payment",
    "online_admission_amount",
    "online_admission_instruction",
    "online_admission_conditions",
    "online_admission_application_form",
)


def _get_settings() -> SchSettings:
    row = SchSettings.objects.filter(id=1).first()
    if row is None:
        raise SettingsNotFoundError("School settings not found.")
    return row


class SystemFieldsService:
    def get_fields(self) -> dict[str, Any]:
        row = _get_settings()
        student = {key: int(getattr(row, key) or 0) for key in STUDENT_SYSTEM_FIELDS}
        staff = {key: int(getattr(row, key) or 0) for key in STAFF_SYSTEM_FIELDS}
        return {"student": student, "staff": staff}

    def update_fields(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = _get_settings()
        updates: dict[str, int] = {}
        for section in ("student", "staff"):
            section_data = payload.get(section)
            if not isinstance(section_data, dict):
                continue
            allowed = (
                STUDENT_SYSTEM_FIELDS if section == "student" else STAFF_SYSTEM_FIELDS
            )
            for key, value in section_data.items():
                if key not in allowed:
                    raise SettingsValidationError(f"Unknown system field: {key}")
                updates[key] = as_int_flag(value)

        # Also accept flat payload of known keys
        for key, value in payload.items():
            if key in ("student", "staff"):
                continue
            if key not in SYSTEM_FIELD_KEYS:
                raise SettingsValidationError(f"Unknown system field: {key}")
            updates[key] = as_int_flag(value)

        if not updates:
            raise SettingsValidationError("No system fields provided.")

        for key, value in updates.items():
            setattr(row, key, value)
        row.updated_at = datetime.date.today()
        row.save(update_fields=[*updates.keys(), "updated_at"])
        logger.info("Updated system fields (%s).", ", ".join(sorted(updates)))
        return self.get_fields()


class OnlineAdmissionSettingsService:
    def get_settings(self) -> dict[str, Any]:
        row = _get_settings()
        return {
            "online_admission": int(row.online_admission or 0),
            "online_admission_payment": row.online_admission_payment or "",
            "online_admission_amount": row.online_admission_amount or "",
            "online_admission_instruction": row.online_admission_instruction or "",
            "online_admission_conditions": row.online_admission_conditions or "",
            "online_admission_application_form": row.online_admission_application_form
            or "",
        }

    def update_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = _get_settings()
        updates: list[str] = []
        if "online_admission" in payload:
            row.online_admission = as_int_flag(payload.get("online_admission"))
            updates.append("online_admission")
        for key in (
            "online_admission_payment",
            "online_admission_amount",
            "online_admission_instruction",
            "online_admission_conditions",
            "online_admission_application_form",
        ):
            if key in payload:
                setattr(row, key, str(payload.get(key) or "").strip())
                updates.append(key)
        if not updates:
            raise SettingsValidationError("No online admission settings provided.")
        row.updated_at = datetime.date.today()
        row.save(update_fields=[*updates, "updated_at"])
        logger.info("Updated online admission settings (%s).", ", ".join(updates))
        return self.get_settings()

    def list_fields(self):
        return OnlineAdmissionFields.objects.all().order_by("name", "id")

    def field_to_dict(self, row: OnlineAdmissionFields) -> dict[str, Any]:
        return {
            "id": row.id,
            "name": row.name or "",
            "status": int(row.status or 0),
            "created_at": (
                row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
            ),
        }

    def update_field(self, field_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = OnlineAdmissionFields.objects.filter(id=field_id).first()
        if row is None:
            raise SettingsNotFoundError("Online admission field not found.")
        if "status" not in payload:
            raise SettingsValidationError("status is required.")
        row.status = as_int_flag(payload.get("status"))
        row.save(update_fields=["status"])
        return self.field_to_dict(row)

    def create_field(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        if not name:
            raise SettingsValidationError("name is required.")
        row = OnlineAdmissionFields.objects.create(
            name=name,
            status=as_int_flag(payload.get("status", 1), default=1),
            created_at=now_datetime(),
        )
        return self.field_to_dict(row)
