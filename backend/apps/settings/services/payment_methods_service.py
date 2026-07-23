from __future__ import annotations

import logging
from typing import Any

from django.db import transaction

from apps.fees.models.payment_settings import PaymentSettings
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.selectors.settings_selectors import now_datetime, today_date
from apps.settings.services.secret_utils import (
    as_yes_no,
    mask_secret,
    resolve_secret,
)

logger = logging.getLogger(__name__)


def _to_dict(row: PaymentSettings) -> dict[str, Any]:
    return {
        "id": row.id,
        "payment_type": row.payment_type,
        "api_username": row.api_username or "",
        "api_secret_key": mask_secret(row.api_secret_key),
        "salt": mask_secret(row.salt),
        "api_publishable_key": row.api_publishable_key or "",
        "api_password": mask_secret(row.api_password),
        "api_signature": mask_secret(row.api_signature),
        "api_email": row.api_email or "",
        "paypal_demo": row.paypal_demo or "",
        "account_no": row.account_no or "",
        "is_active": row.is_active or "no",
        "gateway_mode": int(row.gateway_mode or 0),
        "paytm_website": row.paytm_website or "",
        "paytm_industrytype": row.paytm_industrytype or "",
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
        "updated_at": str(row.updated_at) if row.updated_at else None,
    }


class PaymentMethodsService:
    def list_methods(self):
        return PaymentSettings.objects.all().order_by("payment_type", "id")

    def get_method(self, method_id: int) -> dict[str, Any]:
        row = PaymentSettings.objects.filter(id=method_id).first()
        if row is None:
            raise SettingsNotFoundError("Payment method not found.")
        return _to_dict(row)

    def create_method(self, payload: dict[str, Any]) -> dict[str, Any]:
        payment_type = str(payload.get("payment_type") or "").strip()
        if not payment_type:
            raise SettingsValidationError("payment_type is required.")

        try:
            gateway_mode = int(payload.get("gateway_mode", 0))
        except (TypeError, ValueError) as exc:
            raise SettingsValidationError("gateway_mode must be an integer.") from exc

        row = PaymentSettings.objects.create(
            payment_type=payment_type,
            api_username=str(payload.get("api_username") or "").strip() or None,
            api_secret_key=str(payload.get("api_secret_key") or "").strip(),
            salt=str(payload.get("salt") or "").strip(),
            api_publishable_key=str(payload.get("api_publishable_key") or "").strip(),
            api_password=str(payload.get("api_password") or "").strip() or None,
            api_signature=str(payload.get("api_signature") or "").strip() or None,
            api_email=str(payload.get("api_email") or "").strip() or None,
            paypal_demo=str(payload.get("paypal_demo") or "").strip(),
            account_no=str(payload.get("account_no") or "").strip(),
            is_active=as_yes_no(payload.get("is_active", "no")),
            gateway_mode=gateway_mode,
            paytm_website=str(payload.get("paytm_website") or "").strip(),
            paytm_industrytype=str(payload.get("paytm_industrytype") or "").strip(),
            created_at=now_datetime(),
            updated_at=today_date(),
        )
        if row.is_active == "yes":
            self._activate_only(row.id)
            row.refresh_from_db()
        logger.info("Created payment method id=%s type=%s", row.id, row.payment_type)
        return _to_dict(row)

    def update_method(self, method_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = PaymentSettings.objects.filter(id=method_id).first()
        if row is None:
            raise SettingsNotFoundError("Payment method not found.")

        if "payment_type" in payload:
            payment_type = str(payload.get("payment_type") or "").strip()
            if not payment_type:
                raise SettingsValidationError("payment_type cannot be empty.")
            row.payment_type = payment_type
        for field in (
            "api_username",
            "api_publishable_key",
            "api_email",
            "paypal_demo",
            "account_no",
            "paytm_website",
            "paytm_industrytype",
        ):
            if field in payload:
                value = str(payload.get(field) or "").strip()
                if field in {"api_username", "api_email"}:
                    setattr(row, field, value or None)
                else:
                    setattr(row, field, value)
        if "api_secret_key" in payload:
            row.api_secret_key = resolve_secret(
                payload.get("api_secret_key"), row.api_secret_key
            )
        if "salt" in payload:
            row.salt = resolve_secret(payload.get("salt"), row.salt)
        if "api_password" in payload:
            row.api_password = (
                resolve_secret(payload.get("api_password"), row.api_password) or None
            )
        if "api_signature" in payload:
            row.api_signature = (
                resolve_secret(payload.get("api_signature"), row.api_signature) or None
            )
        if "gateway_mode" in payload:
            try:
                row.gateway_mode = int(payload.get("gateway_mode"))
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError(
                    "gateway_mode must be an integer."
                ) from exc
        if "is_active" in payload:
            row.is_active = as_yes_no(payload.get("is_active"))

        row.updated_at = today_date()
        row.save()
        if row.is_active == "yes":
            self._activate_only(row.id)
            row.refresh_from_db()
        return _to_dict(row)

    def delete_method(self, method_id: int) -> None:
        row = PaymentSettings.objects.filter(id=method_id).first()
        if row is None:
            raise SettingsNotFoundError("Payment method not found.")
        if (row.is_active or "").lower() == "yes":
            raise SettingsValidationError(
                "Cannot delete the active payment method. Activate another method first."
            )
        row.delete()
        logger.info("Deleted payment method id=%s", method_id)

    def activate_method(self, method_id: int) -> dict[str, Any]:
        row = PaymentSettings.objects.filter(id=method_id).first()
        if row is None:
            raise SettingsNotFoundError("Payment method not found.")
        self._activate_only(method_id)
        row.refresh_from_db()
        logger.info("Activated payment method id=%s", method_id)
        return _to_dict(row)

    def _activate_only(self, method_id: int) -> None:
        with transaction.atomic():
            PaymentSettings.objects.all().update(is_active="no")
            PaymentSettings.objects.filter(id=method_id).update(
                is_active="yes", updated_at=today_date()
            )
