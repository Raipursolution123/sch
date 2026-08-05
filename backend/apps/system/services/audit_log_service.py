from typing import Any

from django.db.models import Q

from apps.staff.models.staff import Staff
from apps.system.models.logs import Logs


class AuditLogService:
    def list_logs(
        self,
        *,
        action: str | None = None,
        q: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> list[dict[str, Any]]:
        qs = Logs.objects.all().order_by("-time", "-id")
        if action:
            qs = qs.filter(action__icontains=action.strip())
        if q:
            qs = qs.filter(
                Q(message__icontains=q.strip())
                | Q(action__icontains=q.strip())
                | Q(ip_address__icontains=q.strip())
                | Q(platform__icontains=q.strip())
            )
        if from_date:
            qs = qs.filter(time__date__gte=from_date)
        if to_date:
            qs = qs.filter(time__date__lte=to_date)

        rows = list(qs[:2000])
        staff_ids = {r.user_id for r in rows if r.user_id}
        staff_names = {
            s.id: (
                " ".join(
                    p
                    for p in [s.name, s.surname]
                    if p and str(p).strip()
                ).strip()
                or s.email
                or str(s.id)
            )
            for s in Staff.objects.filter(id__in=staff_ids)
        }

        return [self._to_dict(row, staff_names) for row in rows]

    def _to_dict(self, row: Logs, staff_names: dict[int, str]) -> dict[str, Any]:
        return {
            "id": row.id,
            "message": row.message or "",
            "record_id": row.record_id,
            "user_id": row.user_id,
            "user_name": staff_names.get(row.user_id) if row.user_id else "System",
            "action": row.action or "",
            "ip_address": row.ip_address or "",
            "platform": row.platform or "",
            "agent": row.agent or "",
            "time": (
                row.time.isoformat(sep=" ", timespec="seconds") if row.time else None
            ),
        }
