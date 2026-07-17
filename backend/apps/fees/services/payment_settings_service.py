from typing import Any

from apps.fees.models.payment_settings import PaymentSettings


def _mask_secret(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 4:
        return "****"
    return f"{'*' * (len(value) - 4)}{value[-4:]}"


class PaymentSettingsService:
    def list_gateways(self):
        return PaymentSettings.objects.all().order_by("payment_type", "id")

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [self._to_dict(row) for row in rows]

    def _to_dict(self, row: PaymentSettings) -> dict[str, Any]:
        return {
            "id": row.id,
            "payment_type": row.payment_type,
            "api_username": row.api_username,
            "api_secret_key": _mask_secret(row.api_secret_key),
            "api_publishable_key": row.api_publishable_key,
            "api_email": row.api_email,
            "account_no": row.account_no,
            "is_active": row.is_active,
            "gateway_mode": row.gateway_mode,
            "paypal_demo": row.paypal_demo,
            "paytm_website": row.paytm_website,
            "paytm_industrytype": row.paytm_industrytype,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": str(row.updated_at) if row.updated_at else None,
        }
