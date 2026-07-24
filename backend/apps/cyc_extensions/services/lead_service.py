from __future__ import annotations

from datetime import date, datetime, time
from typing import Any

from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time

from apps.cyc_extensions.models.cyc_campaign import CycCampaign
from apps.cyc_extensions.models.cyc_leads import CycLeads
from apps.cyc_extensions.models.cyc_leads_counsellor import CycLeadsCounsellor
from apps.cyc_extensions.models.cyc_leads_followup import CycLeadsFollowup
from apps.cyc_extensions.models.cyc_leads_followup_status import CycLeadsFollowupStatus


class LeadError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class LeadNotFoundError(LeadError):
    pass


class LeadValidationError(LeadError):
    pass


def _parse_d(value: Any) -> date | None:
    if value in (None, ""):
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    return parse_date(str(value)[:10])


def _parse_t(value: Any) -> time | None:
    if value in (None, ""):
        return None
    if isinstance(value, time):
        return value
    return parse_time(str(value))


def _as_int(value: Any, default: int | None = None) -> int | None:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


class LeadService:
    def list(self, *, query: str | None = None, campaign_id: int | None = None):
        qs = CycLeads.objects.all().order_by("-l_id")
        if campaign_id:
            qs = qs.filter(c_id=campaign_id)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(l_name__icontains=term)
                | Q(l_phone_number__icontains=term)
                | Q(l_email__icontains=term)
                | Q(l_father_name__icontains=term)
                | Q(l_source__icontains=term)
            )
        return qs

    def get(self, pk: int) -> CycLeads:
        row = CycLeads.objects.filter(l_id=pk).first()
        if row is None:
            raise LeadNotFoundError("Lead not found.")
        return row

    def to_dict(self, row: CycLeads) -> dict[str, Any]:
        return {
            "id": row.l_id,
            "c_id": row.c_id,
            "is_student_admitted": row.is_student_admitted,
            "student_id": row.student_id,
            "l_name": row.l_name,
            "l_father_name": row.l_father_name,
            "l_mother_name": row.l_mother_name,
            "l_class": row.l_class,
            "l_address": row.l_address,
            "l_phone_number": row.l_phone_number,
            "l_alternative_phone": row.l_alternative_phone,
            "l_email": row.l_email,
            "l_source": row.l_source,
            "l_resources": row.l_resources,
            "l_location": row.l_location,
            "l_qualification": row.l_qualification,
            "l_status": row.l_status,
            "is_closed": row.is_closed,
            "closed_date": row.closed_date,
            "l_date": row.l_date,
            "l_manager": row.l_manager,
            "current_agent": row.current_agent,
            "l_taken_status": row.l_taken_status,
        }

    def create(self, payload: dict[str, Any], *, manager_id: int) -> dict[str, Any]:
        name = str(payload.get("l_name", "")).strip()
        if not name:
            raise LeadValidationError("l_name is required.")
        c_id = _as_int(payload.get("c_id"))
        if not c_id:
            raise LeadValidationError("c_id (campaign) is required.")
        if not CycCampaign.objects.filter(c_id=c_id).exists():
            raise LeadValidationError("Campaign not found.")
        phone = str(payload.get("l_phone_number", "")).strip()
        if not phone:
            raise LeadValidationError("l_phone_number is required.")
        l_date = _parse_d(payload.get("l_date")) or timezone.localdate()
        closed = _as_int(payload.get("is_closed"), 0) or 0
        closed_date = _parse_d(payload.get("closed_date")) or (
            timezone.localdate() if closed else date(1970, 1, 1)
        )
        row = CycLeads.objects.create(
            c_id=c_id,
            is_student_admitted=_as_int(payload.get("is_student_admitted"), 0) or 0,
            student_id=_as_int(payload.get("student_id")),
            l_name=name,
            l_father_name=str(payload.get("l_father_name", "")).strip(),
            l_class=str(payload.get("l_class", "")).strip(),
            l_address=str(payload.get("l_address", "")).strip(),
            l_phone_number=phone,
            l_taken_status=_as_int(payload.get("l_taken_status"), 0) or 0,
            taken_by=_as_int(payload.get("taken_by")),
            current_agent=_as_int(payload.get("current_agent")),
            l_reverse_status=0,
            l_taken_data=None,
            l_reverse_data=None,
            l_follow_up_data=None,
            l_status=str(payload.get("l_status", "Open")).strip() or "Open",
            is_closed=closed,
            closed_date=closed_date,
            closed_by=_as_int(payload.get("closed_by")),
            l_manager=manager_id or _as_int(payload.get("l_manager"), 0) or 0,
            l_manager_data=None,
            l_date=l_date,
            l_mother_name=str(payload.get("l_mother_name", "")).strip() or None,
            l_location=str(payload.get("l_location", "")).strip() or None,
            l_qualification=str(payload.get("l_qualification", "")).strip() or None,
            l_alternative_phone=str(payload.get("l_alternative_phone", "")).strip()
            or None,
            l_email=str(payload.get("l_email", "")).strip() or None,
            l_source=str(payload.get("l_source", "")).strip() or None,
            l_resources=str(payload.get("l_resources", "")).strip() or None,
            individual_status=_as_int(payload.get("individual_status")),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "l_name" in payload:
            name = str(payload.get("l_name", "")).strip()
            if not name:
                raise LeadValidationError("l_name cannot be empty.")
            row.l_name = name
        if "c_id" in payload:
            c_id = _as_int(payload.get("c_id"))
            if not c_id or not CycCampaign.objects.filter(c_id=c_id).exists():
                raise LeadValidationError("Campaign not found.")
            row.c_id = c_id
        for field, key in (
            ("l_father_name", "l_father_name"),
            ("l_class", "l_class"),
            ("l_address", "l_address"),
            ("l_phone_number", "l_phone_number"),
            ("l_status", "l_status"),
            ("l_mother_name", "l_mother_name"),
            ("l_location", "l_location"),
            ("l_qualification", "l_qualification"),
            ("l_alternative_phone", "l_alternative_phone"),
            ("l_email", "l_email"),
            ("l_source", "l_source"),
            ("l_resources", "l_resources"),
        ):
            if key in payload:
                setattr(row, field, str(payload.get(key) or "").strip() or None)
        for field in (
            "is_student_admitted",
            "student_id",
            "l_taken_status",
            "taken_by",
            "current_agent",
            "is_closed",
            "closed_by",
            "individual_status",
        ):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field)))
        if "l_date" in payload:
            row.l_date = _parse_d(payload.get("l_date")) or row.l_date
        if "closed_date" in payload:
            row.closed_date = _parse_d(payload.get("closed_date")) or row.closed_date
        if "l_phone_number" in payload and not (row.l_phone_number or "").strip():
            raise LeadValidationError("l_phone_number cannot be empty.")
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class CampaignService:
    def list(self, *, query: str | None = None):
        qs = CycCampaign.objects.all().order_by("-c_id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(c_title__icontains=term) | Q(c_description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> CycCampaign:
        row = CycCampaign.objects.filter(c_id=pk).first()
        if row is None:
            raise LeadNotFoundError("Campaign not found.")
        return row

    def to_dict(self, row: CycCampaign) -> dict[str, Any]:
        counsellors = list(
            CycLeadsCounsellor.objects.filter(c_id=row.c_id).values_list(
                "staff_id", flat=True
            )
        )
        return {
            "id": row.c_id,
            "c_title": row.c_title,
            "c_description": row.c_description,
            "c_date": row.c_date,
            "c_by": row.c_by,
            "c_manager": row.c_manager,
            "c_status": row.c_status,
            "staff_ids": counsellors,
            "lead_count": CycLeads.objects.filter(c_id=row.c_id).count(),
        }

    def create(self, payload: dict[str, Any], *, user_id: int) -> dict[str, Any]:
        title = str(payload.get("c_title", "")).strip()
        if not title:
            raise LeadValidationError("c_title is required.")
        row = CycCampaign.objects.create(
            c_title=title,
            c_description=str(payload.get("c_description", "")).strip(),
            c_date=_parse_d(payload.get("c_date")) or timezone.localdate(),
            c_by=user_id or 0,
            c_manager=_as_int(payload.get("c_manager"), user_id) or user_id or 0,
            c_status=str(payload.get("c_status", "Active")).strip() or "Active",
            c_manager_data=None,
        )
        self._sync_counsellors(row.c_id, list(payload.get("staff_ids") or []))
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "c_title" in payload:
            title = str(payload.get("c_title", "")).strip()
            if not title:
                raise LeadValidationError("c_title cannot be empty.")
            row.c_title = title
        if "c_description" in payload:
            row.c_description = str(payload.get("c_description") or "").strip()
        if "c_date" in payload:
            row.c_date = _parse_d(payload.get("c_date")) or row.c_date
        if "c_status" in payload:
            row.c_status = str(payload.get("c_status") or "Active").strip() or "Active"
        if "c_manager" in payload:
            row.c_manager = (
                _as_int(payload.get("c_manager"), row.c_manager) or row.c_manager
            )
        row.save()
        if "staff_ids" in payload:
            self._sync_counsellors(row.c_id, list(payload.get("staff_ids") or []))
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        if CycLeads.objects.filter(c_id=row.c_id).exists():
            raise LeadValidationError("Campaign has leads and cannot be deleted.")
        CycLeadsCounsellor.objects.filter(c_id=row.c_id).delete()
        row.delete()

    def _sync_counsellors(self, c_id: int, staff_ids: list[int]) -> None:
        CycLeadsCounsellor.objects.filter(c_id=c_id).delete()
        for sid in sorted({int(s) for s in staff_ids if s}):
            CycLeadsCounsellor.objects.create(c_id=c_id, staff_id=sid)


class FollowupStatusService:
    def list(self, *, query: str | None = None):
        qs = CycLeadsFollowupStatus.objects.all().order_by("title", "fws_id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(title__icontains=term)
        return qs

    def get(self, pk: int) -> CycLeadsFollowupStatus:
        row = CycLeadsFollowupStatus.objects.filter(fws_id=pk).first()
        if row is None:
            raise LeadNotFoundError("Follow-up status not found.")
        return row

    def to_dict(self, row: CycLeadsFollowupStatus) -> dict[str, Any]:
        return {"id": row.fws_id, "title": row.title}

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise LeadValidationError("title is required.")
        row = CycLeadsFollowupStatus.objects.create(title=title[:100])
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "title" in payload:
            title = str(payload.get("title", "")).strip()
            if not title:
                raise LeadValidationError("title cannot be empty.")
            row.title = title[:100]
            row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class FollowupService:
    def list(self, *, lead_id: int | None = None, query: str | None = None):
        qs = CycLeadsFollowup.objects.all().order_by("-f_id")
        if lead_id:
            qs = qs.filter(l_id=lead_id)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(followup_remark__icontains=term) | Q(call_status__icontains=term)
            )
        return qs

    def get(self, pk: int) -> CycLeadsFollowup:
        row = CycLeadsFollowup.objects.filter(f_id=pk).first()
        if row is None:
            raise LeadNotFoundError("Follow-up not found.")
        return row

    def to_dict(self, row: CycLeadsFollowup) -> dict[str, Any]:
        return {
            "id": row.f_id,
            "c_id": row.c_id,
            "l_id": row.l_id,
            "followup_date": row.followup_date,
            "followup_time": (
                row.followup_time.strftime("%H:%M:%S") if row.followup_time else None
            ),
            "next_followup_date": row.next_followup_date,
            "next_followup_time": (
                row.next_followup_time.strftime("%H:%M:%S")
                if row.next_followup_time
                else None
            ),
            "followup_remark": row.followup_remark,
            "call_status": row.call_status,
            "followup_by": row.followup_by,
            "followup_status": row.followup_status,
            "followup_priority": row.followup_priority,
        }

    def create(self, payload: dict[str, Any], *, user_id: int) -> dict[str, Any]:
        l_id = _as_int(payload.get("l_id"))
        if not l_id:
            raise LeadValidationError("l_id is required.")
        lead = CycLeads.objects.filter(l_id=l_id).first()
        if lead is None:
            raise LeadValidationError("Lead not found.")
        f_date = _parse_d(payload.get("followup_date"))
        n_date = _parse_d(payload.get("next_followup_date"))
        if not f_date or not n_date:
            raise LeadValidationError(
                "followup_date and next_followup_date are required."
            )
        f_time = _parse_t(payload.get("followup_time")) or time(10, 0)
        n_time = _parse_t(payload.get("next_followup_time")) or time(10, 0)
        row = CycLeadsFollowup.objects.create(
            c_id=lead.c_id,
            l_id=l_id,
            followup_date=f_date,
            followup_time=f_time,
            next_followup_date=n_date,
            next_followup_time=n_time,
            followup_remark=str(payload.get("followup_remark", "")).strip(),
            call_status=str(payload.get("call_status", "Pending")).strip() or "Pending",
            followup_by=user_id or 0,
            followup_status=_as_int(payload.get("followup_status"), 0) or 0,
            followup_priority=str(payload.get("followup_priority", "Normal")).strip()
            or "Normal",
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "followup_date" in payload:
            row.followup_date = (
                _parse_d(payload.get("followup_date")) or row.followup_date
            )
        if "next_followup_date" in payload:
            row.next_followup_date = (
                _parse_d(payload.get("next_followup_date")) or row.next_followup_date
            )
        if "followup_time" in payload:
            row.followup_time = (
                _parse_t(payload.get("followup_time")) or row.followup_time
            )
        if "next_followup_time" in payload:
            row.next_followup_time = (
                _parse_t(payload.get("next_followup_time")) or row.next_followup_time
            )
        for field in ("followup_remark", "call_status", "followup_priority"):
            if field in payload:
                setattr(row, field, str(payload.get(field) or "").strip())
        if "followup_status" in payload:
            row.followup_status = _as_int(payload.get("followup_status"), 0) or 0
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class LeadReportService:
    def summary(self) -> dict[str, Any]:
        total = CycLeads.objects.count()
        open_count = CycLeads.objects.filter(is_closed=0).count()
        closed = CycLeads.objects.filter(is_closed=1).count()
        by_status = list(
            CycLeads.objects.values("l_status").annotate(count=Count("l_id")).order_by()
        )
        by_source = list(
            CycLeads.objects.exclude(l_source__isnull=True)
            .exclude(l_source="")
            .values("l_source")
            .annotate(count=Count("l_id"))
            .order_by("-count")[:20]
        )
        by_campaign = []
        for camp in CycCampaign.objects.all().order_by("c_title"):
            by_campaign.append(
                {
                    "c_id": camp.c_id,
                    "c_title": camp.c_title,
                    "count": CycLeads.objects.filter(c_id=camp.c_id).count(),
                }
            )
        return {
            "total": total,
            "open": open_count,
            "closed": closed,
            "by_status": by_status,
            "by_source": by_source,
            "by_campaign": by_campaign,
            "followups": CycLeadsFollowup.objects.count(),
        }

    def list_sources(self) -> list[dict[str, Any]]:
        """Campaign-type proxy: distinct lead sources (no dedicated types table)."""
        rows = (
            CycLeads.objects.exclude(l_source__isnull=True)
            .exclude(l_source="")
            .values("l_source")
            .annotate(count=Count("l_id"))
            .order_by("l_source")
        )
        return [{"source": r["l_source"], "count": r["count"]} for r in rows]

    def rename_source(self, old: str, new: str) -> dict[str, Any]:
        old_s = (old or "").strip()
        new_s = (new or "").strip()
        if not old_s or not new_s:
            raise LeadValidationError("old and new source values are required.")
        updated = CycLeads.objects.filter(l_source=old_s).update(l_source=new_s)
        return {"updated": updated, "source": new_s}

    def list_promoters(self) -> list[dict[str, Any]]:
        """Promoters = campaign counsellors (staff assigned to campaigns)."""
        rows = []
        for link in CycLeadsCounsellor.objects.all().order_by("-lc_id"):
            camp = CycCampaign.objects.filter(c_id=link.c_id).first()
            rows.append(
                {
                    "id": link.lc_id,
                    "c_id": link.c_id,
                    "campaign_title": camp.c_title if camp else None,
                    "staff_id": link.staff_id,
                }
            )
        return rows

    def assign_promoter(self, *, c_id: int, staff_id: int) -> dict[str, Any]:
        if not CycCampaign.objects.filter(c_id=c_id).exists():
            raise LeadValidationError("Campaign not found.")
        if not staff_id:
            raise LeadValidationError("staff_id is required.")
        existing = CycLeadsCounsellor.objects.filter(
            c_id=c_id, staff_id=staff_id
        ).first()
        if existing:
            return {
                "id": existing.lc_id,
                "c_id": c_id,
                "staff_id": staff_id,
            }
        row = CycLeadsCounsellor.objects.create(c_id=c_id, staff_id=staff_id)
        return {"id": row.lc_id, "c_id": c_id, "staff_id": staff_id}

    def remove_promoter(self, pk: int) -> None:
        row = CycLeadsCounsellor.objects.filter(lc_id=pk).first()
        if row is None:
            raise LeadNotFoundError("Promoter assignment not found.")
        row.delete()
