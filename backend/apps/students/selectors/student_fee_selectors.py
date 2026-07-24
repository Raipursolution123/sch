import json
from typing import Any

from django.db import connection

from apps.academics.models import Classes, Sections
from apps.students.models.student_session import StudentSession
from apps.students.selectors.student_selectors import (
    get_active_session,
    safe_date_str,
    today_date,
)


def get_active_student_session(student_id: int) -> StudentSession | None:
    active_session = get_active_session()
    if not active_session:
        return None
    return StudentSession.objects.filter(
        session_id=active_session.id, student_id=student_id
    ).first()


def resolve_class_section_names(
    student_session: StudentSession,
) -> tuple[str, str]:
    school_class = Classes.objects.filter(id=student_session.class_id).first()
    section = (
        Sections.objects.filter(id=student_session.section_id).first()
        if student_session.section_id
        else None
    )
    class_name = school_class.class_field if school_class else "—"
    section_name = section.section if section else "—"
    return class_name, section_name


def _cursor_rows_to_dicts(cursor) -> list[dict[str, Any]]:
    rows = cursor.fetchall()
    if not rows:
        return []
    cols = [col[0] for col in cursor.description]
    return [dict(zip(cols, row)) for row in rows]


def _fetch_student_fee_master_lines(student_session_id: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                sfm.id as student_fees_master_id,
                fsg.id as assignment_id,
                fg.name as fee_group_name,
                fgft.id as line_id,
                fgft.feetype_id,
                ft.code as feetype_code,
                ft.type as feetype_name,
                fgft.amount,
                fgft.due_date
            FROM student_fees_master sfm
            JOIN fee_session_groups fsg ON sfm.fee_session_group_id = fsg.id
            JOIN fee_groups fg ON fsg.fee_groups_id = fg.id
            JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
            JOIN feetype ft ON fgft.feetype_id = ft.id
            WHERE sfm.student_session_id = %s
              AND sfm.is_active = 'yes'
              AND fgft.is_active = 'yes'
            """,
            [student_session_id],
        )
        return _cursor_rows_to_dicts(cursor)


def _fetch_class_fee_lines(class_id: int, session_id: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                NULL as student_fees_master_id,
                fsg.id as assignment_id,
                fg.name as fee_group_name,
                fgft.id as line_id,
                fgft.feetype_id,
                ft.code as feetype_code,
                ft.type as feetype_name,
                fgft.amount,
                fgft.due_date
            FROM fee_session_groups fsg
            JOIN fee_groups fg ON fsg.fee_groups_id = fg.id
            JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
            JOIN feetype ft ON fgft.feetype_id = ft.id
            WHERE fsg.class_id = %s
              AND fsg.session_id = %s
              AND fsg.is_active = 'yes'
              AND fgft.is_active = 'yes'
            """,
            [class_id, session_id],
        )
        return _cursor_rows_to_dicts(cursor)


def _fetch_student_fee_master_lines_batch(
    student_session_ids: list[int],
) -> dict[int, list[dict[str, Any]]]:
    if not student_session_ids:
        return {}

    placeholders = ",".join(["%s"] * len(student_session_ids))
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
                sfm.student_session_id,
                sfm.id as student_fees_master_id,
                fsg.id as assignment_id,
                fg.name as fee_group_name,
                fgft.id as line_id,
                fgft.feetype_id,
                ft.code as feetype_code,
                ft.type as feetype_name,
                fgft.amount,
                fgft.due_date
            FROM student_fees_master sfm
            JOIN fee_session_groups fsg ON sfm.fee_session_group_id = fsg.id
            JOIN fee_groups fg ON fsg.fee_groups_id = fg.id
            JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
            JOIN feetype ft ON fgft.feetype_id = ft.id
            WHERE sfm.student_session_id IN ({placeholders})
              AND sfm.is_active = 'yes'
              AND fgft.is_active = 'yes'
            """,
            student_session_ids,
        )
        rows = _cursor_rows_to_dicts(cursor)

    grouped: dict[int, list[dict[str, Any]]] = {}
    for row in rows:
        session_id = row.pop("student_session_id")
        grouped.setdefault(session_id, []).append(row)
    return grouped


def _fetch_deposite_payments_batch(
    student_session_ids: list[int],
) -> dict[int, list[dict[str, Any]]]:
    if not student_session_ids:
        return {}

    placeholders = ",".join(["%s"] * len(student_session_ids))
    grouped: dict[int, list[dict[str, Any]]] = {}
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
                sfm.student_session_id,
                sfd.id as deposite_id,
                sfd.student_fees_master_id,
                sfd.fee_groups_feetype_id,
                sfd.amount_detail,
                fgft.feetype_id,
                ft.type as feetype_name,
                ft.code as feetype_code
            FROM student_fees_deposite sfd
            JOIN student_fees_master sfm ON sfd.student_fees_master_id = sfm.id
            JOIN fee_groups_feetype fgft ON sfd.fee_groups_feetype_id = fgft.id
            JOIN feetype ft ON fgft.feetype_id = ft.id
            WHERE sfm.student_session_id IN ({placeholders}) AND sfd.is_active = 'yes'
            """,
            student_session_ids,
        )
        for row in cursor.fetchall():
            (
                student_session_id,
                dep_id,
                _master_id,
                fgft_id,
                amount_detail_str,
                feetype_id,
                feetype_name,
                feetype_code,
            ) = row
            if not amount_detail_str:
                continue
            try:
                detail_dict = json.loads(amount_detail_str)
            except (json.JSONDecodeError, TypeError):
                continue

            for trans_id, detail in detail_dict.items():
                grouped.setdefault(student_session_id, []).append(
                    {
                        "id": f"dep-{dep_id}-{trans_id}",
                        "deposite_id": dep_id,
                        "trans_id": trans_id,
                        "date": safe_date_str(detail.get("date")),
                        "amount": float(detail.get("amount") or 0),
                        "amount_discount": float(detail.get("amount_discount") or 0),
                        "amount_fine": float(detail.get("amount_fine") or 0),
                        "payment_mode": detail.get("payment_mode", "Cash"),
                        "description": detail.get("description", ""),
                        "feetype_name": feetype_name,
                        "feetype_id": feetype_id,
                        "feetype_code": feetype_code,
                        "fgft_id": fgft_id,
                    }
                )
    return grouped


def batch_fee_totals_for_roster(
    student_session_ids: list[int],
    class_id: int,
    session_id: int,
) -> dict[int, dict[str, float]]:
    """Batch-compute fee totals for fee-collect roster (avoids per-student queries)."""
    if not student_session_ids:
        return {}

    master_lines_by_session = _fetch_student_fee_master_lines_batch(student_session_ids)
    payments_by_session = _fetch_deposite_payments_batch(student_session_ids)
    class_lines = _fetch_class_fee_lines(class_id, session_id)

    totals: dict[int, dict[str, float]] = {}
    for student_session_id in student_session_ids:
        assigned_lines = master_lines_by_session.get(student_session_id) or class_lines
        payments = payments_by_session.get(student_session_id, [])
        lines = build_fee_lines(assigned_lines, payments)
        total_due = sum(line["amount"] for line in lines)
        total_paid = sum(line["amount_paid"] for line in lines)
        totals[student_session_id] = {
            "total_due": total_due,
            "total_paid": total_paid,
            "total_balance": max(0.0, total_due - total_paid),
        }
    return totals


def fetch_assigned_fee_lines(student_session_id: int) -> list[dict[str, Any]]:
    lines = _fetch_student_fee_master_lines(student_session_id)
    if lines:
        return lines

    student_session = StudentSession.objects.filter(id=student_session_id).first()
    if (
        not student_session
        or not student_session.class_id
        or not student_session.session_id
    ):
        return []

    return _fetch_class_fee_lines(student_session.class_id, student_session.session_id)


def fetch_deposite_payments(student_session_id: int) -> list[dict[str, Any]]:
    payments: list[dict[str, Any]] = []
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                sfd.id as deposite_id,
                sfd.student_fees_master_id,
                sfd.fee_groups_feetype_id,
                sfd.amount_detail,
                fgft.feetype_id,
                ft.type as feetype_name,
                ft.code as feetype_code
            FROM student_fees_deposite sfd
            JOIN student_fees_master sfm ON sfd.student_fees_master_id = sfm.id
            JOIN fee_groups_feetype fgft ON sfd.fee_groups_feetype_id = fgft.id
            JOIN feetype ft ON fgft.feetype_id = ft.id
            WHERE sfm.student_session_id = %s AND sfd.is_active = 'yes'
            """,
            [student_session_id],
        )
        for row in cursor.fetchall():
            (
                dep_id,
                _master_id,
                fgft_id,
                amount_detail_str,
                feetype_id,
                feetype_name,
                feetype_code,
            ) = row
            if not amount_detail_str:
                continue
            try:
                detail_dict = json.loads(amount_detail_str)
            except (json.JSONDecodeError, TypeError):
                continue

            for trans_id, detail in detail_dict.items():
                payments.append(
                    {
                        "id": f"dep-{dep_id}-{trans_id}",
                        "deposite_id": dep_id,
                        "trans_id": trans_id,
                        "date": safe_date_str(detail.get("date")),
                        "amount": float(detail.get("amount") or 0),
                        "amount_discount": float(detail.get("amount_discount") or 0),
                        "amount_fine": float(detail.get("amount_fine") or 0),
                        "payment_mode": detail.get("payment_mode", "Cash"),
                        "description": detail.get("description", ""),
                        "feetype_name": feetype_name,
                        "feetype_id": feetype_id,
                        "feetype_code": feetype_code,
                        "fgft_id": fgft_id,
                    }
                )
    return payments


def resolve_fee_line_status(
    amount: float, amount_paid: float, due_date_str: str | None
) -> str:
    balance = max(0, amount - amount_paid)
    if balance <= 0:
        return "paid"
    if amount_paid > 0:
        return "partial"
    if due_date_str and due_date_str < today_date().isoformat():
        return "overdue"
    return "pending"


def build_fee_lines(
    assigned_lines: list[dict[str, Any]], payments: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    fgft_paid_map: dict[int, float] = {}
    for payment in payments:
        fgft_id = payment.get("fgft_id")
        if fgft_id:
            fgft_paid_map[fgft_id] = fgft_paid_map.get(fgft_id, 0) + payment["amount"]

    lines: list[dict[str, Any]] = []
    for line in assigned_lines:
        amount = float(line["amount"] or 0)
        fgft_id = line["line_id"]
        available_paid = fgft_paid_map.get(fgft_id, 0)
        amount_paid = min(amount, available_paid)
        fgft_paid_map[fgft_id] = max(0, available_paid - amount_paid)
        balance = max(0, amount - amount_paid)
        due_date_str = safe_date_str(line["due_date"])

        lines.append(
            {
                "id": f"{line['assignment_id']}-{line['line_id']}",
                "feetype_id": line["feetype_id"],
                "feetype_code": line["feetype_code"],
                "feetype_name": line["feetype_name"],
                "fee_group_name": line["fee_group_name"],
                "amount": amount,
                "amount_paid": amount_paid,
                "balance": balance,
                "due_date": due_date_str,
                "status": resolve_fee_line_status(amount, amount_paid, due_date_str),
            }
        )
    return lines


def resolve_fee_master_for_payment(
    student_session_id: int,
    class_id: int,
    feetype_id: int,
    session_id: int | None = None,
) -> tuple[int, int, int] | None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT fgft.id, fgft.fee_session_group_id, sfm.id
            FROM student_fees_master sfm
            JOIN fee_session_groups fsg ON sfm.fee_session_group_id = fsg.id
            JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
            WHERE sfm.student_session_id = %s
              AND fgft.feetype_id = %s
              AND sfm.is_active = 'yes'
              AND fgft.is_active = 'yes'
            LIMIT 1
            """,
            [student_session_id, feetype_id],
        )
        row = cursor.fetchone()
        if row:
            return row[0], row[1], row[2]

        if not session_id:
            student_session = StudentSession.objects.filter(
                id=student_session_id
            ).first()
            session_id = student_session.session_id if student_session else None
        if not session_id:
            return None

        cursor.execute(
            """
            SELECT fgft.id, fgft.fee_session_group_id
            FROM fee_groups_feetype fgft
            JOIN fee_session_groups fsg ON fgft.fee_session_group_id = fsg.id
            WHERE fsg.class_id = %s
              AND fsg.session_id = %s
              AND fgft.feetype_id = %s
              AND fsg.is_active = 'yes'
              AND fgft.is_active = 'yes'
            LIMIT 1
            """,
            [class_id, session_id, feetype_id],
        )
        row = cursor.fetchone()
        if row:
            return row[0], row[1], None
    return None
