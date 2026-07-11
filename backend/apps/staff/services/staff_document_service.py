import datetime
import json
import logging
import os
from typing import Any

from django.core.files.storage import default_storage

from apps.staff.domain.staff_exceptions import (
    StaffDocumentError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.department import Department
from apps.staff.models.staff import Staff
from apps.staff.models.staff_designation import StaffDesignation
from apps.staff.selectors import staff_selectors as selectors

logger = logging.getLogger(__name__)

ALLOWED_DOCUMENT_TYPES = frozenset(
    {"resume", "joining_letter", "resignation_letter", "other_document_file"}
)


class StaffLookupService:
    def list_departments(self) -> list[dict[str, Any]]:
        if not Department.objects.exists():
            Department.objects.bulk_create(
                [
                    Department(department_name="Teaching", is_active="yes"),
                    Department(department_name="Administration", is_active="yes"),
                    Department(department_name="Accounts", is_active="yes"),
                ]
            )
        return [
            {"id": row.id, "name": row.department_name}
            for row in selectors.list_departments()
        ]

    def list_designations(self) -> list[dict[str, Any]]:
        if not StaffDesignation.objects.exists():
            StaffDesignation.objects.bulk_create(
                [
                    StaffDesignation(designation="Principal", is_active="yes"),
                    StaffDesignation(designation="Teacher", is_active="yes"),
                    StaffDesignation(designation="Accountant", is_active="yes"),
                    StaffDesignation(designation="Librarian", is_active="yes"),
                ]
            )
        return [
            {"id": row.id, "name": row.designation}
            for row in selectors.list_designations()
        ]


class StaffDocumentService:
    def upload_document(
        self,
        staff_id: int,
        *,
        document_type: str,
        uploaded_file,
        document_name: str = "",
    ) -> dict[str, Any]:
        staff = selectors.get_staff_by_id(staff_id)
        if staff is None:
            raise StaffNotFoundError()
        if document_type not in ALLOWED_DOCUMENT_TYPES:
            raise StaffValidationError("Invalid document type.")
        if not uploaded_file:
            raise StaffValidationError("No file provided.")

        ext = os.path.splitext(uploaded_file.name)[1]
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"staff_documents/{staff_id}_{document_type}_{timestamp}{ext}"

        try:
            saved_path = default_storage.save(filename, uploaded_file)
        except Exception as exc:
            logger.error("File upload failed for staff %s: %s", staff_id, exc)
            raise StaffDocumentError(f"File upload failed: {exc}") from exc

        if document_type == "other_document_file":
            docs = self._load_other_docs(staff)
            new_id = max([doc.get("id", 0) for doc in docs] + [0]) + 1
            doc_name = document_name or uploaded_file.name
            docs.append(
                {
                    "id": new_id,
                    "name": doc_name,
                    "file_path": saved_path,
                    "created_at": datetime.datetime.now().isoformat(),
                }
            )
            staff.other_document_file = json.dumps(docs)
            staff.other_document_name = ""
        else:
            current_val = getattr(staff, document_type) or ""
            new_val = f"{current_val}|{saved_path}" if current_val else saved_path
            setattr(staff, document_type, new_val)

        staff.save()
        return {
            "document_type": document_type,
            "file_path": saved_path,
            "document_name": (
                document_name if document_type == "other_document_file" else None
            ),
        }

    def delete_document(
        self,
        staff_id: int,
        *,
        document_type: str,
        document_id,
    ) -> None:
        staff = selectors.get_staff_by_id(staff_id)
        if staff is None:
            raise StaffNotFoundError()

        if document_type == "other_document_file":
            docs = self._load_other_docs(staff)
            original_len = len(docs)
            docs = [doc for doc in docs if str(doc.get("id")) != str(document_id)]
            if len(docs) == original_len:
                raise StaffNotFoundError("Document not found.")
            staff.other_document_file = json.dumps(docs)
            staff.save()
            return

        if document_type in {"resume", "joining_letter", "resignation_letter"}:
            current_val = getattr(staff, document_type) or ""
            paths = [path for path in current_val.split("|") if path.strip()]
            try:
                idx = int(document_id) - 1
            except (TypeError, ValueError) as exc:
                raise StaffValidationError("Invalid document ID.") from exc
            if idx < 0 or idx >= len(paths):
                raise StaffNotFoundError("Document not found.")
            del paths[idx]
            setattr(staff, document_type, "|".join(paths))
            staff.save()
            return

        raise StaffValidationError("Invalid document type.")

    @staticmethod
    def _load_other_docs(staff: Staff) -> list[dict[str, Any]]:
        if staff.other_document_file and staff.other_document_file.startswith("["):
            try:
                return json.loads(staff.other_document_file)
            except json.JSONDecodeError:
                return []
        if staff.other_document_file:
            return [
                {
                    "id": 1,
                    "name": staff.other_document_name or "Other Document",
                    "file_path": staff.other_document_file,
                    "created_at": datetime.datetime.now().isoformat(),
                }
            ]
        return []
