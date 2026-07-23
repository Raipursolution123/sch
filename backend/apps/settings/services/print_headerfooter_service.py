from __future__ import annotations

import logging
from typing import Any

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.print_headerfooter import PrintHeaderfooter
from apps.settings.selectors.settings_selectors import now_datetime

logger = logging.getLogger(__name__)


def _to_dict(row: PrintHeaderfooter) -> dict[str, Any]:
    return {
        "id": row.id,
        "print_type": row.print_type,
        "header_image": row.header_image,
        "footer_content": row.footer_content,
        "created_by": row.created_by,
        "entry_date": (
            row.entry_date.strftime("%Y-%m-%d %H:%M:%S") if row.entry_date else None
        ),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class PrintHeaderFooterService:
    def list_items(self):
        return PrintHeaderfooter.objects.all().order_by("print_type", "id")

    def get_item(self, item_id: int) -> dict[str, Any]:
        row = PrintHeaderfooter.objects.filter(id=item_id).first()
        if row is None:
            raise SettingsNotFoundError("Print header/footer not found.")
        return _to_dict(row)

    def create_item(
        self, payload: dict[str, Any], *, created_by: int = 0
    ) -> dict[str, Any]:
        print_type = str(payload.get("print_type") or "").strip()
        header_image = str(payload.get("header_image") or "").strip()
        footer_content = str(payload.get("footer_content") or "").strip()
        if not print_type or not header_image:
            raise SettingsValidationError("print_type and header_image are required.")

        now = now_datetime()
        row = PrintHeaderfooter.objects.create(
            print_type=print_type,
            header_image=header_image,
            footer_content=footer_content,
            created_by=int(created_by or 0),
            entry_date=now,
            created_at=now,
        )
        logger.info("Created print header/footer id=%s type=%s", row.id, row.print_type)
        return _to_dict(row)

    def update_item(self, item_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = PrintHeaderfooter.objects.filter(id=item_id).first()
        if row is None:
            raise SettingsNotFoundError("Print header/footer not found.")

        if "print_type" in payload:
            print_type = str(payload.get("print_type") or "").strip()
            if not print_type:
                raise SettingsValidationError("print_type cannot be empty.")
            row.print_type = print_type
        if "header_image" in payload:
            header_image = str(payload.get("header_image") or "").strip()
            if not header_image:
                raise SettingsValidationError("header_image cannot be empty.")
            row.header_image = header_image
        if "footer_content" in payload:
            row.footer_content = str(payload.get("footer_content") or "").strip()

        row.entry_date = now_datetime()
        row.save()
        return _to_dict(row)

    def delete_item(self, item_id: int) -> None:
        row = PrintHeaderfooter.objects.filter(id=item_id).first()
        if row is None:
            raise SettingsNotFoundError("Print header/footer not found.")
        row.delete()
        logger.info("Deleted print header/footer id=%s", item_id)
