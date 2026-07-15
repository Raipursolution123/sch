from typing import Any

from django.db import connection
from django.utils import timezone

from apps.academics.models import Classes, Sessions
from apps.fees.models.fee_groups import FeeGroups
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.models.feetype import Feetype


def now_datetime():
    return timezone.now()


def today_date():
    return timezone.now().date()


def safe_date_str(value, fmt="%Y-%m-%dT%H:%M:%SZ") -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)


def dictfetchall(cursor) -> list[dict[str, Any]]:
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def category_to_dict(cat_dict: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": cat_dict.get("id"),
        "name": cat_dict.get("category") or "",
        "is_active": cat_dict.get("is_active"),
        "created_at": safe_date_str(cat_dict.get("created_at")),
    }


def get_categories_map() -> dict[int, str]:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, category FROM categories")
        return {row[0]: row[1] for row in cursor.fetchall()}


def fee_group_to_dict(group: FeeGroups) -> dict[str, Any]:
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "is_system": group.is_system,
        "is_active": group.is_active,
        "created_at": safe_date_str(group.created_at),
    }


def fee_discount_to_dict(discount, session_name: str | None = None) -> dict[str, Any]:
    amount = discount.amount
    return {
        "id": discount.id,
        "session_id": discount.session_id,
        "session_name": session_name,
        "name": discount.name or "",
        "code": discount.code or "",
        "type": discount.type or "",
        "percentage": discount.percentage,
        "amount": float(amount) if amount is not None else None,
        "description": discount.description,
        "is_active": discount.is_active,
        "created_at": safe_date_str(discount.created_at),
    }


def fee_type_to_dict(
    ft: Feetype, category_map: dict[int, str] | None = None
) -> dict[str, Any]:
    if category_map is None:
        category_map = {}
    category_name = category_map.get(ft.feecategory_id)
    if not category_name and ft.feecategory_id:
        category_name = "General"

    return {
        "id": ft.id,
        "code": ft.code or "",
        "name": ft.type or "",
        "feecategory_id": ft.feecategory_id,
        "category_name": category_name,
        "description": ft.description,
        "is_active": ft.is_active,
        "created_at": safe_date_str(ft.created_at),
        "updated_at": safe_date_str(ft.updated_at, "%Y-%m-%d"),
    }


def assignment_to_dict(fsg: FeeSessionGroups) -> dict[str, Any]:
    lines_qs = FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).order_by(
        "id"
    )
    fee_group = FeeGroups.objects.filter(id=fsg.fee_groups_id).first()
    school_class = Classes.objects.filter(id=fsg.class_id).first()
    session = Sessions.objects.filter(id=fsg.session_id).first()

    feetype_ids = [line.feetype_id for line in lines_qs]
    feetypes = {ft.id: ft for ft in Feetype.objects.filter(id__in=feetype_ids)}

    lines: list[dict[str, Any]] = []
    total_amount = 0.0
    for line in lines_qs:
        ft = feetypes.get(line.feetype_id)
        amt = float(line.amount) if line.amount else 0
        lines.append(
            {
                "id": line.id,
                "feetype_id": line.feetype_id,
                "feetype_code": ft.code if ft else "—",
                "feetype_name": ft.type if ft else "Unknown",
                "amount": amt,
                "due_date": safe_date_str(line.due_date, "%Y-%m-%d"),
            }
        )
        total_amount += amt

    return {
        "id": fsg.id,
        "class_id": fsg.class_id,
        "class_name": school_class.class_field if school_class else "—",
        "fee_group_id": fsg.fee_groups_id,
        "fee_group_name": fee_group.name if fee_group else "—",
        "session_id": fsg.session_id,
        "session_name": session.session if session else "—",
        "lines": lines,
        "total_amount": total_amount,
        "is_active": fsg.is_active,
        "created_at": safe_date_str(fsg.created_at),
        "updated_at": None,
    }
