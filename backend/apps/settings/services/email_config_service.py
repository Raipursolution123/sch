from __future__ import annotations

import logging
from typing import Any

from django.db import transaction

from apps.communications.models.email_config import EmailConfig
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.selectors.settings_selectors import now_datetime
from apps.settings.services.secret_utils import as_yes_no, mask_secret, resolve_secret

logger = logging.getLogger(__name__)


def _to_dict(row: EmailConfig) -> dict[str, Any]:
    return {
        "id": row.id,
        "email_type": row.email_type or "",
        "smtp_server": row.smtp_server or "",
        "smtp_port": row.smtp_port or "",
        "smtp_username": row.smtp_username or "",
        "smtp_password": mask_secret(row.smtp_password),
        "ssl_tls": row.ssl_tls or "",
        "smtp_auth": row.smtp_auth or "false",
        "api_key": mask_secret(row.api_key),
        "api_secret": mask_secret(row.api_secret),
        "region": row.region or "",
        "is_active": row.is_active or "no",
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class EmailConfigService:
    def list_configs(self):
        return EmailConfig.objects.all().order_by("email_type", "id")

    def get_config(self, config_id: int) -> dict[str, Any]:
        row = EmailConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("Email config not found.")
        return _to_dict(row)

    def create_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        email_type = str(payload.get("email_type") or "").strip()
        if not email_type:
            raise SettingsValidationError("email_type is required.")

        smtp_auth = str(payload.get("smtp_auth") or "false").strip() or "false"
        row = EmailConfig.objects.create(
            email_type=email_type,
            smtp_server=str(payload.get("smtp_server") or "").strip() or None,
            smtp_port=str(payload.get("smtp_port") or "").strip() or None,
            smtp_username=str(payload.get("smtp_username") or "").strip() or None,
            smtp_password=str(payload.get("smtp_password") or "").strip() or None,
            ssl_tls=str(payload.get("ssl_tls") or "").strip() or None,
            smtp_auth=smtp_auth,
            api_key=str(payload.get("api_key") or "").strip() or None,
            api_secret=str(payload.get("api_secret") or "").strip() or None,
            region=str(payload.get("region") or "").strip() or None,
            is_active=as_yes_no(payload.get("is_active", "no")),
            created_at=now_datetime(),
        )
        if row.is_active == "yes":
            self._activate_only(row.id)
            row.refresh_from_db()
        logger.info("Created email config id=%s type=%s", row.id, row.email_type)
        return _to_dict(row)

    def update_config(self, config_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = EmailConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("Email config not found.")

        if "email_type" in payload:
            email_type = str(payload.get("email_type") or "").strip()
            if not email_type:
                raise SettingsValidationError("email_type cannot be empty.")
            row.email_type = email_type
        for field in ("smtp_server", "smtp_port", "smtp_username", "ssl_tls", "region"):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip() or None)
        if "smtp_auth" in payload:
            row.smtp_auth = str(payload.get("smtp_auth") or "false").strip() or "false"
        if "smtp_password" in payload:
            row.smtp_password = (
                resolve_secret(payload.get("smtp_password"), row.smtp_password) or None
            )
        if "api_key" in payload:
            row.api_key = resolve_secret(payload.get("api_key"), row.api_key) or None
        if "api_secret" in payload:
            row.api_secret = (
                resolve_secret(payload.get("api_secret"), row.api_secret) or None
            )
        if "is_active" in payload:
            row.is_active = as_yes_no(payload.get("is_active"))

        row.save()
        if row.is_active == "yes":
            self._activate_only(row.id)
            row.refresh_from_db()
        return _to_dict(row)

    def delete_config(self, config_id: int) -> None:
        row = EmailConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("Email config not found.")
        if (row.is_active or "").lower() == "yes":
            raise SettingsValidationError(
                "Cannot delete the active email config. Activate another config first."
            )
        row.delete()
        logger.info("Deleted email config id=%s", config_id)

    def activate_config(self, config_id: int) -> dict[str, Any]:
        row = EmailConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("Email config not found.")
        self._activate_only(config_id)
        row.refresh_from_db()
        logger.info("Activated email config id=%s", config_id)
        return _to_dict(row)

    def _activate_only(self, config_id: int) -> None:
        with transaction.atomic():
            EmailConfig.objects.all().update(is_active="no")
            EmailConfig.objects.filter(id=config_id).update(is_active="yes")
