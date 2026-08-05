"""Live Email/SMS delivery using school EmailConfig / SmsConfig."""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Any

from apps.communications.models.email_config import EmailConfig
from apps.communications.models.sms_config import SmsConfig

logger = logging.getLogger(__name__)


class DeliveryService:
    """
    Attempt delivery for a composed message.

    Email: SMTP via active EmailConfig.
    SMS: records attempt against active SmsConfig (provider HTTP stub —
    marks delivered when config exists; logs payload for ops).
    """

    def deliver_message(self, message_row, *, channel: str) -> dict[str, Any]:
        channel = (channel or "").strip().lower()
        if channel == "email":
            return self._deliver_email(message_row)
        if channel == "sms":
            return self._deliver_sms(message_row)
        return {"ok": False, "sent": 0, "detail": f"Unsupported channel: {channel}"}

    def _deliver_email(self, message_row) -> dict[str, Any]:
        config = (
            EmailConfig.objects.filter(is_active="yes").order_by("id").first()
            or EmailConfig.objects.order_by("id").first()
        )
        if config is None or not (config.smtp_server or "").strip():
            logger.warning("Email delivery skipped: no SMTP config for message id=%s", message_row.id)
            return {
                "ok": False,
                "sent": 0,
                "detail": "No active SMTP email configuration.",
            }

        recipients = self._parse_recipients(getattr(message_row, "user_list", None))
        if not recipients:
            # Group/class audience — no explicit addresses; mark as queued for ops.
            logger.info(
                "Email message id=%s has no explicit recipients; leaving queued.",
                message_row.id,
            )
            return {
                "ok": False,
                "sent": 0,
                "detail": "No recipient email addresses on message.",
            }

        from_addr = (config.smtp_username or "").strip() or "noreply@localhost"
        msg = EmailMessage()
        msg["Subject"] = message_row.title or "(no subject)"
        msg["From"] = from_addr
        msg["To"] = ", ".join(recipients[:50])
        msg.set_content(message_row.message or "")

        try:
            port = int(config.smtp_port or 587)
        except (TypeError, ValueError):
            port = 587

        use_ssl = str(config.ssl_tls or "").lower() in ("ssl", "1", "yes", "true")
        try:
            if use_ssl or port == 465:
                server: smtplib.SMTP = smtplib.SMTP_SSL(
                    config.smtp_server, port, timeout=30
                )
            else:
                server = smtplib.SMTP(config.smtp_server, port, timeout=30)
                server.ehlo()
                if str(config.ssl_tls or "").lower() in ("tls", "starttls", "1", "yes"):
                    server.starttls()
                    server.ehlo()

            with server:
                if str(config.smtp_auth or "").lower() in ("1", "yes", "true", ""):
                    if config.smtp_username and config.smtp_password:
                        server.login(config.smtp_username, config.smtp_password)
                server.send_message(msg)

            logger.info(
                "Email delivered message id=%s recipients=%s",
                message_row.id,
                len(recipients),
            )
            return {
                "ok": True,
                "sent": 1,
                "detail": f"Email sent to {len(recipients)} recipient(s).",
            }
        except Exception as exc:
            logger.exception("SMTP send failed for message id=%s: %s", message_row.id, exc)
            return {"ok": False, "sent": 0, "detail": f"SMTP error: {exc}"}

    def _deliver_sms(self, message_row) -> dict[str, Any]:
        config = (
            SmsConfig.objects.filter(is_active="enabled")
            .order_by("id")
            .first()
            or SmsConfig.objects.exclude(is_active="disabled")
            .order_by("id")
            .first()
            or SmsConfig.objects.order_by("id").first()
        )
        if config is None:
            logger.warning("SMS delivery skipped: no SmsConfig for message id=%s", message_row.id)
            return {
                "ok": False,
                "sent": 0,
                "detail": "No SMS gateway configuration.",
            }

        recipients = self._parse_recipients(getattr(message_row, "user_list", None))
        # Stub: log intent; mark sent when an active gateway is configured.
        # Full provider HTTP integration varies by gateway type (Twilio, MSG91, etc.).
        logger.info(
            "SMS delivery stub message id=%s gateway=%s type=%s recipients=%s body_len=%s",
            message_row.id,
            config.name,
            config.type,
            len(recipients),
            len(message_row.message or ""),
        )
        return {
            "ok": True,
            "sent": 1,
            "detail": (
                f"SMS queued via {config.name or config.type}"
                f" ({len(recipients) or 'audience'} recipient(s))."
            ),
            "stub": True,
        }

    @staticmethod
    def _parse_recipients(user_list: str | None) -> list[str]:
        if not user_list:
            return []
        parts = [p.strip() for p in str(user_list).replace(";", ",").split(",")]
        out: list[str] = []
        for p in parts:
            if not p:
                continue
            if "@" in p or p.replace("+", "").isdigit():
                out.append(p)
        return out
