"""Selectors for offline bank payment submissions."""

from __future__ import annotations

from datetime import date
from typing import Any

from django.db import connection

from apps.students.selectors.student_selectors import safe_date_str

_SELECT_SQL = """
    SELECT
        ofp.id,
        ofp.invoice_id,
        ofp.student_session_id,
        ofp.student_fees_master_id,
        ofp.fee_groups_feetype_id,
        ofp.student_transport_fee_id,
        ofp.payment_date,
        ofp.bank_from,
        ofp.bank_account_transferred,
        ofp.reference,
        ofp.amount,
        ofp.submit_date,
        ofp.approve_date,
        ofp.attachment,
        ofp.reply,
        ofp.approved_by,
        ofp.is_active,
        ofp.created_at,
        ofp.alt_mobile_no,
        s.id AS student_id,
        s.admission_no,
        s.firstname,
        s.middlename,
        s.lastname,
        c.class AS class_name,
        sec.section AS section_name,
        ft.type AS feetype_name,
        ft.code AS feetype_code,
        st.name AS approver_name,
        st.surname AS approver_surname
    FROM offline_fees_payments ofp
    LEFT JOIN student_session ss ON ofp.student_session_id = ss.id
    LEFT JOIN students s ON ss.student_id = s.id
    LEFT JOIN classes c ON ss.class_id = c.id
    LEFT JOIN sections sec ON ss.section_id = sec.id
    LEFT JOIN fee_groups_feetype fgft ON ofp.fee_groups_feetype_id = fgft.id
    LEFT JOIN feetype ft ON fgft.feetype_id = ft.id
    LEFT JOIN staff st ON ofp.approved_by = st.id
"""


def _status_label(is_active: str | None) -> str:
    flag = str(is_active or "0").strip()
    if flag == "1":
        return "approved"
    if flag == "2":
        return "rejected"
    return "pending"


def _row_to_dict(row: dict[str, Any]) -> dict[str, Any]:
    first = (row.get("firstname") or "").strip()
    middle = (row.get("middlename") or "").strip()
    last = (row.get("lastname") or "").strip()
    full_name = " ".join(p for p in (first, middle, last) if p)
    approver = " ".join(
        p
        for p in (
            (row.get("approver_name") or "").strip(),
            (row.get("approver_surname") or "").strip(),
        )
        if p
    )
    return {
        "id": row["id"],
        "invoice_id": row.get("invoice_id") or "",
        "student_session_id": row.get("student_session_id"),
        "student_fees_master_id": row.get("student_fees_master_id"),
        "fee_groups_feetype_id": row.get("fee_groups_feetype_id"),
        "student_transport_fee_id": row.get("student_transport_fee_id"),
        "payment_date": safe_date_str(row.get("payment_date")),
        "bank_from": row.get("bank_from") or "",
        "bank_account_transferred": row.get("bank_account_transferred") or "",
        "reference": row.get("reference") or "",
        "amount": float(row.get("amount") or 0),
        "submit_date": (
            row["submit_date"].isoformat() if row.get("submit_date") else None
        ),
        "approve_date": (
            row["approve_date"].isoformat() if row.get("approve_date") else None
        ),
        "attachment": row.get("attachment") or "",
        "reply": row.get("reply") or "",
        "approved_by": row.get("approved_by"),
        "approver_name": approver,
        "is_active": str(row.get("is_active") or "0"),
        "status": _status_label(row.get("is_active")),
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        "alt_mobile_no": row.get("alt_mobile_no") or "",
        "student_id": row.get("student_id"),
        "admission_no": row.get("admission_no") or "",
        "full_name": full_name,
        "class_name": row.get("class_name") or "",
        "section_name": row.get("section_name") or "",
        "feetype_name": row.get("feetype_name") or "",
        "feetype_code": row.get("feetype_code") or "",
    }


def list_offline_payments(
    *,
    status: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    query: str | None = None,
) -> list[dict[str, Any]]:
    params: list[Any] = []
    filters: list[str] = ["1=1"]

    if status == "pending":
        filters.append(
            "(ofp.is_active IS NULL OR ofp.is_active = '' OR ofp.is_active = '0')"
        )
    elif status == "approved":
        filters.append("ofp.is_active = '1'")
    elif status == "rejected":
        filters.append("ofp.is_active = '2'")

    if from_date:
        filters.append("ofp.payment_date >= %s")
        params.append(from_date)
    if to_date:
        filters.append("ofp.payment_date <= %s")
        params.append(to_date)

    q = (query or "").strip()
    if q:
        filters.append(
            """(
                ofp.invoice_id LIKE %s
                OR ofp.reference LIKE %s
                OR ofp.bank_from LIKE %s
                OR s.admission_no LIKE %s
                OR CONCAT_WS(' ', s.firstname, s.middlename, s.lastname) LIKE %s
            )"""
        )
        like = f"%{q}%"
        params.extend([like, like, like, like, like])

    where_sql = " AND ".join(filters)
    sql = f"{_SELECT_SQL} WHERE {where_sql} ORDER BY ofp.payment_date DESC, ofp.id DESC"

    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        raw_rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return [_row_to_dict(row) for row in raw_rows]


def get_offline_payment(payment_id: int) -> dict[str, Any] | None:
    sql = f"{_SELECT_SQL} WHERE ofp.id = %s LIMIT 1"
    with connection.cursor() as cursor:
        cursor.execute(sql, [payment_id])
        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()
        if not row:
            return None
        return _row_to_dict(dict(zip(columns, row)))
