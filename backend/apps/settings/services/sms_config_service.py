from __future__ import annotations

import logging
from typing import Any

from django.db import transaction

from apps.communications.models.sms_config import SmsConfig
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.selectors.settings_selectors import now_datetime, today_date
from apps.settings.services.secret_utils import (
    as_enabled_disabled,
    mask_secret,
    resolve_secret,
)

logger = logging.getLogger(__name__)


def _to_dict(row: SmsConfig, *, reveal: bool = False) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": row.type,
        "name": row.name,
        "api_id": row.api_id,
        "authkey": row.authkey if reveal else mask_secret(row.authkey),
        "senderid": row.senderid,
        "contact": row.contact or "",
        "username": row.username or "",
        "url": row.url or "",
        "password": row.password if reveal else mask_secret(row.password),
        "is_active": row.is_active or "disabled",
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
        "updated_at": str(row.updated_at) if row.updated_at else None,
    }


class SmsConfigService:
    def list_configs(self):
        return SmsConfig.objects.all().order_by("name", "id")

    def get_config(self, config_id: int) -> dict[str, Any]:
        row = SmsConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("SMS config not found.")
        return _to_dict(row)

    def create_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        provider_type = str(payload.get("type") or "").strip()
        if not name or not provider_type:
            raise SettingsValidationError("name and type are required.")

        row = SmsConfig.objects.create(
            type=provider_type,
            name=name,
            api_id=str(payload.get("api_id") or "").strip(),
            authkey=str(payload.get("authkey") or "").strip(),
            senderid=str(payload.get("senderid") or "").strip(),
            contact=str(payload.get("contact") or "").strip() or None,
            username=str(payload.get("username") or "").strip() or None,
            url=str(payload.get("url") or "").strip() or None,
            password=str(payload.get("password") or "").strip() or None,
            is_active=as_enabled_disabled(payload.get("is_active", "disabled")),
            created_at=now_datetime(),
            updated_at=today_date(),
        )
        if row.is_active == "enabled":
            self._activate_only(row.id)
            row.refresh_from_db()
        logger.info("Created SMS config id=%s name=%s", row.id, row.name)
        return _to_dict(row)

    def update_config(self, config_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = SmsConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("SMS config not found.")

        if "type" in payload:
            provider_type = str(payload.get("type") or "").strip()
            if not provider_type:
                raise SettingsValidationError("type cannot be empty.")
            row.type = provider_type
        if "name" in payload:
            name = str(payload.get("name") or "").strip()
            if not name:
                raise SettingsValidationError("name cannot be empty.")
            row.name = name
        if "api_id" in payload:
            row.api_id = str(payload.get("api_id") or "").strip()
        if "authkey" in payload:
            row.authkey = resolve_secret(payload.get("authkey"), row.authkey)
        if "senderid" in payload:
            row.senderid = str(payload.get("senderid") or "").strip()
        if "contact" in payload:
            row.contact = str(payload.get("contact") or "").strip() or None
        if "username" in payload:
            row.username = str(payload.get("username") or "").strip() or None
        if "url" in payload:
            row.url = str(payload.get("url") or "").strip() or None
        if "password" in payload:
            row.password = resolve_secret(payload.get("password"), row.password) or None
        if "is_active" in payload:
            row.is_active = as_enabled_disabled(payload.get("is_active"))

        row.updated_at = today_date()
        row.save()
        if row.is_active == "enabled":
            self._activate_only(row.id)
            row.refresh_from_db()
        return _to_dict(row)

    def delete_config(self, config_id: int) -> None:
        row = SmsConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("SMS config not found.")
        if (row.is_active or "").lower() == "enabled":
            raise SettingsValidationError(
                "Cannot delete the active SMS provider. Activate another provider first."
            )
        row.delete()
        logger.info("Deleted SMS config id=%s", config_id)

    def activate_config(self, config_id: int) -> dict[str, Any]:
        row = SmsConfig.objects.filter(id=config_id).first()
        if row is None:
            raise SettingsNotFoundError("SMS config not found.")
        self._activate_only(config_id)
        row.refresh_from_db()
        logger.info("Activated SMS config id=%s", config_id)
        return _to_dict(row)

    def _activate_only(self, config_id: int) -> None:
        with transaction.atomic():
            SmsConfig.objects.all().update(is_active="disabled")
            SmsConfig.objects.filter(id=config_id).update(
                is_active="enabled", updated_at=today_date()
            )
