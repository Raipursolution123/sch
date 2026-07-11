import logging
from typing import Any

from django.utils import timezone

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.staff import Staff
from apps.staff.selectors import staff_selectors as selectors

logger = logging.getLogger(__name__)

CREATE_DEFAULTS = {
    "surname": "",
    "father_name": "",
    "mother_name": "",
    "email": "",
    "contact_no": "",
    "emergency_contact_no": "",
    "marital_status": "",
    "local_address": "",
    "permanent_address": "",
    "gender": "",
    "lang_id": 1,
    "user_id": 0,
    "qualification": "",
    "work_exp": "",
    "note": "",
    "image": "",
    "password": "",
    "account_title": "",
    "bank_account_no": "",
    "bank_name": "",
    "ifsc_code": "",
    "bank_branch": "",
    "payscale": "",
    "epf_no": "",
    "contract_type": "",
    "shift": "",
    "location": "",
    "facebook": "",
    "twitter": "",
    "linkedin": "",
    "instagram": "",
    "resume": "",
    "joining_letter": "",
    "resignation_letter": "",
    "other_document_name": "",
    "other_document_file": "",
    "verification_code": "",
}


class StaffService:
    def list_staff(self):
        return selectors.list_staff_qs()

    def enrich_list_page(self, rows) -> list[dict[str, Any]]:
        return [selectors.staff_list_item(row) for row in rows]

    def get_staff(self, staff_id: int) -> dict[str, Any]:
        staff = selectors.get_staff_by_id(staff_id)
        if staff is None:
            raise StaffNotFoundError()
        return selectors.staff_detail(staff)

    def create_staff(self, payload: dict[str, Any]) -> dict[str, Any]:
        employee_id = str(payload.get("employee_id", "")).strip()
        name = str(payload.get("name", "")).strip()
        if not employee_id:
            raise StaffValidationError("Employee ID is required.")
        if not name:
            raise StaffValidationError("Name is required.")
        if Staff.objects.filter(employee_id__iexact=employee_id).exists():
            raise StaffConflictError(
                f"Staff with employee ID '{employee_id}' already exists."
            )

        department = payload.get("department_id") or payload.get("department")
        designation = payload.get("designation_id") or payload.get("designation")
        is_active = 1 if str(payload.get("is_active", "yes")).lower() == "yes" else 0
        defaults = {k: payload.get(k, v) for k, v in CREATE_DEFAULTS.items()}
        if not payload.get("permanent_address"):
            defaults["permanent_address"] = payload.get(
                "local_address", defaults["permanent_address"]
            )

        staff = Staff.objects.create(
            employee_id=employee_id,
            name=name,
            department=department,
            designation=designation,
            dob=payload.get("dob") or None,
            date_of_joining=payload.get("date_of_joining") or timezone.now().date(),
            date_of_leaving=payload.get("date_of_leaving") or None,
            is_active=is_active,
            **defaults,
        )
        logger.info("Staff '%s' created.", staff.name)
        return selectors.staff_detail(staff)

    def update_staff(self, staff_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        staff = selectors.get_staff_by_id(staff_id)
        if staff is None:
            raise StaffNotFoundError()

        employee_id = payload.get("employee_id")
        if employee_id is not None:
            emp_clean = str(employee_id).strip()
            if not emp_clean:
                raise StaffValidationError("Employee ID cannot be empty.")
            if (
                Staff.objects.filter(employee_id__iexact=emp_clean)
                .exclude(pk=staff_id)
                .exists()
            ):
                raise StaffConflictError(
                    f"Staff with Employee ID '{emp_clean}' already exists."
                )
            staff.employee_id = emp_clean

        name = payload.get("name")
        if name is not None:
            name_clean = str(name).strip()
            if not name_clean:
                raise StaffValidationError("Name cannot be empty.")
            staff.name = name_clean

        if "department_id" in payload:
            staff.department = payload["department_id"]
        elif "department" in payload:
            staff.department = payload["department"]

        if "designation_id" in payload:
            staff.designation = payload["designation_id"]
        elif "designation" in payload:
            staff.designation = payload["designation"]

        for field in (
            "surname",
            "father_name",
            "mother_name",
            "email",
            "contact_no",
            "emergency_contact_no",
            "dob",
            "marital_status",
            "date_of_joining",
            "date_of_leaving",
            "local_address",
            "permanent_address",
            "gender",
            "qualification",
            "work_exp",
            "contract_type",
            "basic_salary",
            "note",
        ):
            if field in payload:
                setattr(staff, field, payload[field])

        if "is_active" in payload:
            staff.is_active = 1 if str(payload["is_active"]).lower() == "yes" else 0

        staff.save()
        logger.info("Staff ID %s updated.", staff_id)
        return selectors.staff_detail(staff)

    def delete_staff(self, staff_id: int) -> str:
        staff = selectors.get_staff_by_id(staff_id)
        if staff is None:
            raise StaffNotFoundError()
        staff_name = staff.name
        staff.delete()
        logger.info("Staff '%s' (ID %s) deleted.", staff_name, staff_id)
        return staff_name
