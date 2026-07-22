from __future__ import annotations

import datetime
import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.staff.domain.staff_exceptions import (
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.staff import Staff
from apps.staff.models.staff_attendance import StaffAttendance
from apps.staff.models.staff_attendance_type import StaffAttendanceType

logger = logging.getLogger(__name__)


class StaffAttendanceService:
    def list_types(self) -> list[dict[str, Any]]:
        rows = StaffAttendanceType.objects.filter(is_active="yes").order_by("id")
        if not rows.exists():
            rows = StaffAttendanceType.objects.all().order_by("id")
        return [
            {
                "id": row.id,
                "type": row.type or "",
                "key_value": row.key_value or "",
                "key": (row.key_value or row.type or "").lower(),
                "label": row.type or row.key_value or "",
                "is_active": row.is_active or "no",
            }
            for row in rows
        ]

    def get_roster(self, *, date_str: str) -> dict[str, Any]:
        if not date_str:
            raise StaffValidationError("date is required.")
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise StaffValidationError("Invalid date format. Use YYYY-MM-DD.") from exc

        staff_qs = Staff.objects.filter(is_active=1).order_by("name", "surname", "id")
        if not staff_qs.exists():
            staff_qs = Staff.objects.all().order_by("name", "surname", "id")
        types = {t["id"]: t for t in self.list_types()}
        default_type_id = next(iter(types), None)
        if default_type_id is None:
            raise StaffValidationError("No staff attendance types are configured.")

        existing = {
            row.staff_id: row
            for row in StaffAttendance.objects.filter(date=target_date)
        }

        entries = []
        for person in staff_qs:
            record = existing.get(person.id)
            type_id = (
                record.staff_attendance_type_id
                if record is not None
                else default_type_id
            )
            att_type = types.get(type_id) or types.get(default_type_id) or {}
            entries.append(
                {
                    "staff_id": person.id,
                    "employee_id": person.employee_id or "",
                    "name": " ".join(
                        p for p in (person.name or "", person.surname or "") if p
                    ).strip()
                    or person.name
                    or "",
                    "staff_attendance_type_id": type_id,
                    "status_key": att_type.get("key", ""),
                    "status_label": att_type.get("label", ""),
                    "remark": (record.remark if record else "") or "",
                    "attendance_id": record.id if record else None,
                }
            )

        return {"date": date_str, "entries": entries}

    def mark(self, payload: dict[str, Any]) -> dict[str, Any]:
        date_str = str(payload.get("date") or "").strip()
        entries = payload.get("entries") or []
        if not date_str:
            raise StaffValidationError("date is required.")
        if not isinstance(entries, list) or not entries:
            raise StaffValidationError("entries are required.")

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise StaffValidationError("Invalid date format. Use YYYY-MM-DD.") from exc

        type_ids = {t["id"] for t in self.list_types()}
        if not type_ids:
            raise StaffValidationError("No staff attendance types are configured.")

        now = timezone.now()
        today = now.date()
        saved = 0

        with transaction.atomic():
            for raw in entries:
                staff_id = int(raw.get("staff_id") or 0)
                type_id = int(raw.get("staff_attendance_type_id") or 0)
                if not staff_id or type_id not in type_ids:
                    continue
                if not Staff.objects.filter(id=staff_id).exists():
                    raise StaffNotFoundError(f"Staff {staff_id} not found.")

                remark = str(raw.get("remark") or "").strip()[:200]
                row = StaffAttendance.objects.filter(
                    date=target_date, staff_id=staff_id
                ).first()
                if row is None:
                    StaffAttendance.objects.create(
                        date=target_date,
                        staff_id=staff_id,
                        staff_attendance_type_id=type_id,
                        biometric_attendence=0,
                        biometric_device_data=None,
                        remark=remark,
                        is_active=1,
                        created_at=now,
                        updated_at=today,
                    )
                else:
                    row.staff_attendance_type_id = type_id
                    row.remark = remark
                    row.updated_at = today
                    row.save(
                        update_fields=[
                            "staff_attendance_type_id",
                            "remark",
                            "updated_at",
                        ]
                    )
                saved += 1

        logger.info("Marked staff attendance date=%s count=%s", date_str, saved)
        return self.get_roster(date_str=date_str)
