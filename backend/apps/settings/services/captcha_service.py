from __future__ import annotations

import logging
from typing import Any

from apps.accounts.models.captcha import Captcha
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.services.secret_utils import as_int_flag

logger = logging.getLogger(__name__)


def captcha_to_dict(row: Captcha) -> dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name,
        "status": int(row.status or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class CaptchaService:
    def list_captchas(self):
        return Captcha.objects.all().order_by("name", "id")

    def get_captcha(self, captcha_id: int) -> dict[str, Any]:
        row = Captcha.objects.filter(id=captcha_id).first()
        if row is None:
            raise SettingsNotFoundError("Captcha setting not found.")
        return captcha_to_dict(row)

    def update_captcha(
        self, captcha_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        row = Captcha.objects.filter(id=captcha_id).first()
        if row is None:
            raise SettingsNotFoundError("Captcha setting not found.")
        if "status" not in payload:
            raise SettingsValidationError("status is required.")
        row.status = as_int_flag(payload.get("status"))
        row.save(update_fields=["status"])
        logger.info("Updated captcha id=%s status=%s", captcha_id, row.status)
        return captcha_to_dict(row)
