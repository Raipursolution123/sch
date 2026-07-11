import json
from datetime import date
from typing import Any

from django.db import connection

from apps.students.models.student_session import StudentSession
from apps.students.selectors.student_selectors import safe_date_str


def list_session_enrollments(
    session_id: int,
    *,
    class_id: int | None = None,
    section_id: int | None = None,
) -> list[StudentSession]:
    qs = StudentSession.objects.filter(session_id=session_id, is_active="yes")
    if class_id:
        qs = qs.filter(class_id=class_id)
    if section_id:
        qs = qs.filter(section_id=section_id)
    return list(qs.order_by("class_id", "section_id", "student_id"))


def search_payment_rows(
    *,
    session_id: int,
    from_date: date,
    to_date: date,
    class_id: int | None = None,
    section_id: int | None = None,
    query: str | None = None,
    payment_mode: str | None = None,
) -> list[dict[str, Any]]:
    if from_date > to_date:
        return []

    params: list[Any] = [session_id]
    class_filter = ""
    section_filter = ""
    if class_id:
        class_filter = "AND ss.class_id = %s"
        params.append(class_id)
    if section_id:
        section_filter = "AND ss.section_id = %s"
        params.append(section_id)

    sql = f"""
        SELECT
            sfd.id AS deposite_id,
            sfd.amount_detail,
            sfd.fee_groups_feetype_id,
            ft.type AS feetype_name,
            ft.code AS feetype_code,
            s.id AS student_id,
            s.admission_no,
            s.firstname,
            s.middlename,
            s.lastname,
            s.roll_no,
            c.class AS class_name,
            sec.section AS section_name
        FROM student_fees_deposite sfd
        JOIN student_fees_master sfm ON sfd.student_fees_master_id = sfm.id
        JOIN student_session ss ON sfm.student_session_id = ss.id
        JOIN students s ON ss.student_id = s.id
        LEFT JOIN classes c ON ss.class_id = c.id
        LEFT JOIN sections sec ON ss.section_id = sec.id
        JOIN fee_groups_feetype fgft ON sfd.fee_groups_feetype_id = fgft.id
        JOIN feetype ft ON fgft.feetype_id = ft.id
        WHERE sfd.is_active = 'yes'
          AND sfm.is_active = 'yes'
          AND ss.session_id = %s
          AND s.is_active = 'yes'
          {class_filter}
          {section_filter}
    """

    rows: list[dict[str, Any]] = []
    query_value = (query or "").strip().lower()
    mode_value = (payment_mode or "").strip().lower()

    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        cols = [col[0] for col in cursor.description]
        for raw in cursor.fetchall():
            record = dict(zip(cols, raw))
            amount_detail_str = record.pop("amount_detail")
            if not amount_detail_str:
                continue
            try:
                detail_dict = json.loads(amount_detail_str)
            except (json.JSONDecodeError, TypeError):
                continue

            full_name = " ".join(
                part.strip()
                for part in (
                    record.get("firstname"),
                    record.get("middlename"),
                    record.get("lastname"),
                )
                if part and str(part).strip()
            )

            for trans_id, detail in detail_dict.items():
                payment_date = safe_date_str(detail.get("date"))
                if not payment_date or payment_date < from_date.isoformat():
                    continue
                if payment_date > to_date.isoformat():
                    continue

                mode = str(detail.get("payment_mode") or "cash").lower()
                if mode_value and mode != mode_value:
                    continue

                admission_no = record.get("admission_no") or ""
                if query_value:
                    haystack = " ".join(
                        [
                            admission_no.lower(),
                            full_name.lower(),
                            str(record.get("roll_no") or "").lower(),
                        ]
                    )
                    if query_value not in haystack:
                        continue

                rows.append(
                    {
                        "payment_id": f"dep-{record['deposite_id']}-{trans_id}",
                        "date": payment_date,
                        "amount": float(detail.get("amount") or 0),
                        "payment_mode": mode,
                        "description": detail.get("description") or None,
                        "feetype_name": record.get("feetype_name"),
                        "feetype_code": record.get("feetype_code"),
                        "student_id": record.get("student_id"),
                        "admission_no": admission_no,
                        "full_name": full_name,
                        "roll_no": record.get("roll_no"),
                        "class_name": record.get("class_name") or "—",
                        "section_name": record.get("section_name") or "—",
                    }
                )

    rows.sort(key=lambda row: (row["date"], row["full_name"]), reverse=True)
    return rows
