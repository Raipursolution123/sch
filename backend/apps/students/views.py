import logging
from django.db import connection, transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.academics.models import Classes, Sections, Sessions

from common.responses.api import APIResponse
from apps.accounts.services.legacy_password import hash_legacy_password

from apps.accounts.models import User
from apps.students.selectors.student_selectors import get_active_session, safe_date_str

logger = logging.getLogger(__name__)


class ParentsTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM feetype")
                ft = [
                    dict(zip([c[0] for c in cursor.description], row))
                    for row in cursor.fetchall()
                ]
                cursor.execute(
                    "SELECT * FROM fee_groups_feetype ORDER BY id DESC LIMIT 5"
                )
                fgft = [
                    dict(zip([c[0] for c in cursor.description], row))
                    for row in cursor.fetchall()
                ]
            return Response({"ft": ft, "fgft": fgft})
        except Exception as e:
            import traceback

            return Response({"error": str(e), "traceback": traceback.format_exc()})


class StudentFeesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message="Student not found.", status_code=404)

        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message="No active session found.")

        ss = StudentSession.objects.filter(
            session_id=active_session.id, student_id=student.id
        ).first()
        if not ss or not ss.class_id:
            return APIResponse.error(
                message="Student is not enrolled in a class for the active session."
            )

        school_class = Classes.objects.filter(id=ss.class_id).first()
        section = (
            Sections.objects.filter(id=ss.section_id).first() if ss.section_id else None
        )

        class_name = school_class.class_field if school_class else "—"
        section_name = section.section if section else "—"

        lines = []
        payments = []

        with connection.cursor() as cursor:
            # Get fee groups assigned to this student via student_fees_master
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
                WHERE sfm.student_session_id = %s AND sfm.is_active = 'yes'
            """,
                [ss.id],
            )

            assigned_lines = cursor.fetchall()

            if assigned_lines:
                cols = [col[0] for col in cursor.description]
                assigned_lines = [dict(zip(cols, row)) for row in assigned_lines]
            else:
                assigned_lines = []

            # Query payments from student_fees_deposite linked via student_fees_master
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
                [ss.id],
            )

            deposite_rows = cursor.fetchall()
            if deposite_rows:
                import json

                for row in deposite_rows:
                    (
                        dep_id,
                        master_id,
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
                    except Exception:
                        continue

                    for trans_id, detail in detail_dict.items():
                        unique_payment_id = f"dep-{dep_id}-{trans_id}"
                        payments.append(
                            {
                                "id": unique_payment_id,
                                "deposite_id": dep_id,
                                "trans_id": trans_id,
                                "date": safe_date_str(detail.get("date")),
                                "amount": float(detail.get("amount") or 0),
                                "amount_discount": float(
                                    detail.get("amount_discount") or 0
                                ),
                                "amount_fine": float(detail.get("amount_fine") or 0),
                                "payment_mode": detail.get("payment_mode", "Cash"),
                                "description": detail.get("description", ""),
                                "feetype_name": feetype_name,
                                "feetype_id": feetype_id,
                                "feetype_code": feetype_code,
                                "fgft_id": fgft_id,
                            }
                        )

            print("DEBUG: Retrieved payments count:", len(payments))

        # Group lines by fee_groups_feetype_id to distribute payments
        fgft_paid_map = {}
        for p in payments:
            fid = p.get("fgft_id")
            if fid:
                fgft_paid_map[fid] = fgft_paid_map.get(fid, 0) + p["amount"]

        for line in assigned_lines:
            amount = float(line["amount"] or 0)
            fgft_id = line["line_id"]

            # Distribute available paid amount to this line
            available_paid = fgft_paid_map.get(fgft_id, 0)
            amount_paid = min(amount, available_paid)

            # Subtract the used amount from the pool
            fgft_paid_map[fgft_id] = max(0, available_paid - amount_paid)

            balance = max(0, amount - amount_paid)

            due_date = line["due_date"]
            due_date_str = safe_date_str(due_date)

            if balance <= 0:
                status_str = "paid"
            elif amount_paid > 0:
                status_str = "partial"
            else:
                status_str = "pending"

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
                    "status": status_str,
                }
            )

        total_due = sum([line["amount"] for line in lines])
        total_paid_all = sum([line["amount_paid"] for line in lines])
        total_balance = max(0, total_due - total_paid_all)

        return APIResponse.success(
            data={
                "student_id": student.id,
                "session_name": active_session.session if active_session else "—",
                "class_name": class_name,
                "section_name": section_name,
                "total_due": total_due,
                "total_paid": total_paid_all,
                "total_balance": total_balance,
                "lines": lines,
                "payments": payments,
            }
        )

    def post(self, request, pk):
        data = request.data
        amount = data.get("amount")
        feetype_id = data.get("feetype_id")
        payment_mode = data.get("payment_mode", "Cash")
        description = data.get("description", "")
        payment_date = data.get("date")

        if not payment_date:
            payment_date = timezone.now().date()

        if not amount or not feetype_id:
            return APIResponse.error(message="Amount and Fee Type are required.")

        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message="Student not found.", status_code=404)

        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message="No active session found.")

        ss = StudentSession.objects.filter(
            session_id=active_session.id, student_id=student.id
        ).first()
        if not ss:
            return APIResponse.error(
                message="Student is not enrolled in a class for the active session."
            )

        try:
            with transaction.atomic():
                # 1. Resolve fgft_id and fsg_id
                # First check student's explicitly assigned fees
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT fgft.id, fgft.fee_session_group_id, sfm.id
                        FROM student_fees_master sfm
                        JOIN fee_session_groups fsg
                          ON sfm.fee_session_group_id = fsg.id
                        JOIN fee_groups_feetype fgft
                          ON fgft.fee_session_group_id = fsg.id
                        WHERE sfm.student_session_id = %s
                          AND fgft.feetype_id = %s
                          AND sfm.is_active = 'yes'
                        LIMIT 1
                    """,
                        [ss.id, feetype_id],
                    )
                    res = cursor.fetchone()

                if res:
                    fgft_id, fsg_id, sfm_id = res
                    from apps.students.models.student_fees_master import (
                        StudentFeesMaster,
                    )

                    sfm = StudentFeesMaster.objects.get(id=sfm_id)
                else:
                    # Fallback to class level
                    with connection.cursor() as cursor:
                        cursor.execute(
                            """
                            SELECT fgft.id, fgft.fee_session_group_id
                             FROM fee_groups_feetype fgft
                             JOIN fee_session_groups fsg
                               ON fgft.fee_session_group_id = fsg.id
                             WHERE fsg.class_id = %s
                               AND fgft.feetype_id = %s
                               AND fsg.is_active = 'yes'
                            LIMIT 1
                        """,
                            [ss.class_id, feetype_id],
                        )
                        res_class = cursor.fetchone()

                    if not res_class:
                        return APIResponse.error(
                            message=(
                                "Fee group configuration not found for "
                                "this class and feetype."
                            )
                        )

                    fgft_id, fsg_id = res_class

                    from apps.students.models.student_fees_master import (
                        StudentFeesMaster,
                    )

                    sfm, created = StudentFeesMaster.objects.get_or_create(
                        student_session_id=ss.id,
                        fee_session_group_id=fsg_id,
                        defaults={
                            "is_system": 0,
                            "amount": 0.0,
                            "is_active": "yes",
                            "created_at": timezone.now(),
                        },
                    )

                # 3. Create or Update StudentFeesDeposite
                from apps.students.models.student_fees_deposite import (
                    StudentFeesDeposite,
                )
                import json

                sfd = StudentFeesDeposite.objects.filter(
                    student_fees_master_id=sfm.id, fee_groups_feetype_id=fgft_id
                ).first()

                new_payment = {
                    "amount": float(amount),
                    "amount_discount": 0.0,
                    "amount_fine": 0.0,
                    "date": safe_date_str(payment_date),
                    "description": description,
                    "collected_by": "Super Admin(9000)",
                    "payment_mode": payment_mode.lower(),
                    "received_by": "1",
                }

                if sfd:
                    try:
                        detail_dict = (
                            json.loads(sfd.amount_detail) if sfd.amount_detail else {}
                        )
                    except Exception:
                        detail_dict = {}

                    existing_keys = [int(k) for k in detail_dict.keys() if k.isdigit()]
                    next_key = str(max(existing_keys) + 1) if existing_keys else "1"

                    new_payment["inv_no"] = int(next_key)
                    detail_dict[next_key] = new_payment
                    sfd.amount_detail = json.dumps(detail_dict)
                    sfd.save()
                else:
                    new_payment["inv_no"] = 1
                    detail_dict = {"1": new_payment}
                    sfd = StudentFeesDeposite.objects.create(
                        student_fees_master_id=sfm.id,
                        fee_groups_feetype_id=fgft_id,
                        student_transport_fee_id=None,
                        amount_detail=json.dumps(detail_dict),
                        file="",
                        is_active="yes",
                        created_at=timezone.now(),
                    )

            return APIResponse.success(message="Payment recorded successfully.")
        except Exception as e:
            logger.error(f"Error recording payment: {e}")
            return APIResponse.error(message=f"Failed to record payment: {str(e)}")

    def delete(self, request, pk):
        feetype_id = request.query_params.get("feetype_id")
        payment_id = request.query_params.get("payment_id")

        if payment_id:
            if payment_id.startswith("dep-"):
                parts = payment_id.split("-")
                if len(parts) == 3:
                    dep_id = int(parts[1])
                    trans_id = parts[2]

                    from apps.students.models.student_fees_deposite import (
                        StudentFeesDeposite,
                    )
                    import json

                    try:
                        with transaction.atomic():
                            sfd = StudentFeesDeposite.objects.filter(id=dep_id).first()
                            if sfd:
                                detail_dict = (
                                    json.loads(sfd.amount_detail)
                                    if sfd.amount_detail
                                    else {}
                                )
                                if trans_id in detail_dict:
                                    del detail_dict[trans_id]
                                    if detail_dict:
                                        sfd.amount_detail = json.dumps(detail_dict)
                                        sfd.save()
                                    else:
                                        sfd.delete()
                                    return APIResponse.success(
                                        message="Payment deleted successfully."
                                    )
                            return APIResponse.error(
                                message="Payment record not found."
                            )
                    except Exception as e:
                        logger.error(f"Error deleting payment: {e}")
                        return APIResponse.error(
                            message=f"Failed to delete payment: {str(e)}"
                        )
            else:
                # Legacy direct ID fallback
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "DELETE FROM student_fees WHERE id = %s", [payment_id]
                        )
                    return APIResponse.success(message="Payment deleted successfully.")
                except Exception as e:
                    logger.error(f"Error deleting payment: {e}")
                    return APIResponse.error(
                        message=f"Failed to delete payment: {str(e)}"
                    )

        if not feetype_id:
            return APIResponse.error(
                message="Fee type ID or Payment ID is required for reverting."
            )

        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message="Student not found.", status_code=404)

        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message="No active session found.")

        ss = StudentSession.objects.filter(
            session_id=active_session.id, student_id=student.id
        ).first()
        if not ss:
            return APIResponse.error(
                message="Student is not enrolled in a class for the active session."
            )

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        DELETE FROM student_fees_deposite
                        WHERE student_fees_master_id IN (
                            SELECT id FROM student_fees_master
                            WHERE student_session_id = %s
                        ) AND fee_groups_feetype_id IN (
                            SELECT id FROM fee_groups_feetype
                            WHERE feetype_id = %s
                        )
                    """,
                        [ss.id, feetype_id],
                    )

            return APIResponse.success(message="Payment reverted successfully.")
        except Exception as e:
            logger.error(f"Error reverting payment: {e}")
            return APIResponse.error(message=f"Failed to revert payment: {str(e)}")


class StudentAcademicSessionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        student = Students.objects.filter(id=student_id).first()
        if not student:
            return APIResponse.error(
                message="Student not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        session_ids = (
            StudentSession.objects.filter(student_id=student_id)
            .values_list("session_id", flat=True)
            .distinct()
        )
        sessions = Sessions.objects.filter(id__in=session_ids).order_by("id")

        from apps.settings.models.sch_settings import SchSettings

        sch_setting = SchSettings.objects.first()
        active_session_id = sch_setting.session_id if sch_setting else 0

        sessions_data = []
        for s in sessions:
            sessions_data.append(
                {
                    "id": s.id,
                    "session": s.session,
                    "is_active": s.is_active,
                    "active": s.id if s.id == active_session_id else 0,
                    "created_at": (
                        s.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if s.created_at
                        else None
                    ),
                    "updated_at": (
                        s.updated_at.strftime("%Y-%m-%d") if s.updated_at else None
                    ),
                }
            )

        return APIResponse.success(
            data={"sessions": sessions_data},
            message="Student academic sessions retrieved successfully.",
        )
