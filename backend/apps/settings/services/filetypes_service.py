from __future__ import annotations

import logging
from typing import Any

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.filetypes import Filetypes

logger = logging.getLogger(__name__)


def filetypes_to_dict(row: Filetypes) -> dict[str, Any]:
    return {
        "id": row.id,
        "file_extension": row.file_extension or "",
        "file_mime": row.file_mime or "",
        "file_size": int(row.file_size or 0),
        "image_extension": row.image_extension or "",
        "image_mime": row.image_mime or "",
        "image_size": int(row.image_size or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class FileTypesService:
    def get_settings(self) -> dict[str, Any]:
        row = Filetypes.objects.order_by("id").first()
        if row is None:
            raise SettingsNotFoundError("File types settings not found.")
        return filetypes_to_dict(row)

    def update_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = Filetypes.objects.order_by("id").first()
        if row is None:
            raise SettingsNotFoundError("File types settings not found.")

        updates: list[str] = []
        for key in ("file_extension", "file_mime", "image_extension", "image_mime"):
            if key in payload:
                setattr(row, key, str(payload.get(key) or "").strip() or None)
                updates.append(key)
        for key in ("file_size", "image_size"):
            if key in payload:
                try:
                    setattr(row, key, int(payload.get(key)))
                except (TypeError, ValueError) as exc:
                    raise SettingsValidationError(f"{key} must be an integer.") from exc
                updates.append(key)
        if not updates:
            raise SettingsValidationError("No file type fields provided.")
        row.save(update_fields=updates)
        logger.info("Updated file types id=%s", row.id)
        return filetypes_to_dict(row)
