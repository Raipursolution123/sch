from typing import Any

from django.db.models import Q

from apps.accounts.models.session import UserLog


class UserLogService:
    def list_logs(
        self,
        *,
        role: str | None = None,
        q: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> list[dict[str, Any]]:
        qs = UserLog.objects.all().order_by("-login_datetime", "-id")
        if role:
            qs = qs.filter(role__icontains=role.strip())
        if q:
            qs = qs.filter(
                Q(user__icontains=q.strip())
                | Q(ipaddress__icontains=q.strip())
                | Q(user_agent__icontains=q.strip())
            )
        if from_date:
            qs = qs.filter(login_datetime__date__gte=from_date)
        if to_date:
            qs = qs.filter(login_datetime__date__lte=to_date)
        # Cap for report screens; pagination applied in the view.
        return [self._to_dict(row) for row in qs[:2000]]

    def _to_dict(self, row: UserLog) -> dict[str, Any]:
        return {
            "id": row.id,
            "user": row.user or "",
            "role": row.role or "",
            "class_section_id": row.class_section_id,
            "ipaddress": row.ipaddress or "",
            "user_agent": row.user_agent or "",
            "login_datetime": (
                row.login_datetime.isoformat(sep=" ", timespec="seconds")
                if row.login_datetime
                else None
            ),
        }
