from __future__ import annotations

from typing import Any

from apps.students.domain.student_exceptions import StudentValidationError
from apps.students.services.student_service import StudentService

IMPORT_TEMPLATE_COLUMNS = [
    "admission_no",
    "firstname",
    "lastname",
    "gender",
    "dob",
    "admission_date",
    "class_id",
    "section_id",
    "mobileno",
    "email",
    "father_name",
    "mother_name",
    "guardian_name",
    "guardian_phone",
    "current_address",
    "blood_group",
    "religion",
    "category_id",
    "school_house_id",
    "rte",
]


class StudentImportService:
    def template(self) -> dict[str, Any]:
        return {
            "columns": IMPORT_TEMPLATE_COLUMNS,
            "required": [
                "admission_no",
                "firstname",
                "lastname",
                "class_id",
                "section_id",
            ],
            "notes": (
                "Students are enrolled in the active academic session. "
                "category_id may be the category name (e.g. General) or id. "
                "school_house_id is the numeric house id."
            ),
        }

    def import_rows(self, rows: list[dict[str, Any]]) -> dict[str, Any]:
        if not rows:
            raise StudentValidationError("At least one row is required.")

        created: list[dict[str, Any]] = []
        errors: list[dict[str, Any]] = []
        service = StudentService()

        for index, raw in enumerate(rows, start=1):
            if not isinstance(raw, dict):
                errors.append({"row": index, "message": "Row must be an object."})
                continue
            payload = {k: v for k, v in raw.items() if v not in (None, "")}
            try:
                for field in ("class_id", "section_id"):
                    if field in payload and payload[field] is not None:
                        payload[field] = int(payload[field])
                if "school_house_id" in payload and payload["school_house_id"] is not None:
                    payload["school_house_id"] = int(payload["school_house_id"])
                if "roll_no" in payload and payload["roll_no"] not in (None, ""):
                    payload["roll_no"] = int(payload["roll_no"])
                if "is_active" not in payload:
                    payload["is_active"] = "yes"
                elif payload["is_active"] in (True, 1, "1", "true", "True"):
                    payload["is_active"] = "yes"
                elif payload["is_active"] in (False, 0, "0", "false", "False"):
                    payload["is_active"] = "no"

                student = service.admit_student(payload)
                created.append(
                    {
                        "row": index,
                        "id": student.get("id"),
                        "admission_no": student.get("admission_no"),
                    }
                )
            except Exception as exc:
                message = getattr(exc, "message", None) or str(exc)
                errors.append({"row": index, "message": message})

        return {
            "created_count": len(created),
            "error_count": len(errors),
            "created": created,
            "errors": errors,
        }
