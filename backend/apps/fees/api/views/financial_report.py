import json
from datetime import datetime

from django.db.models import Q, Sum

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.models.expenses import Expenses
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.fees.models.feetype import Feetype
from apps.fees.models.income import Income
from apps.fees.models.offline_fees_payments import OfflineFeesPayments
from apps.staff.models.staff import Staff
from apps.staff.models.staff_payslip import StaffPayslip
from apps.students.models.student_fees_deposite import StudentFeesDeposite
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class FinancialReportView(APIView):
    """
    Generates a financial summary (Profit & Loss) report.
    Expected query parameters:
    - start_date (YYYY-MM-DD)
    - end_date (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "income"  # using income category for financial access
    legacy_permission_action = "can_view"

    def get(self, request):
        try:
            return self._get(request)
        except Exception as e:
            import traceback

            with open(r"e:\sch\backend\logs\custom_crash.txt", "w") as f:
                f.write(traceback.format_exc())
            return APIResponse.error(
                message=f"CRASH: {str(e)}",
                status_code=500,
            )

    def _get(self, request):
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return APIResponse.error(
                message="Both start_date and end_date are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return APIResponse.error(
                message="Invalid date format. Use YYYY-MM-DD.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Revenue
        general_income = float(
            Income.objects.filter(
                date__range=[start_date, end_date], is_active="yes", is_deleted="no"
            ).aggregate(total=Sum("amount"))["total"]
            or 0.0
        )

        # Breakdown of student fees
        fee_breakdown_query = (
            OfflineFeesPayments.objects.filter(
                payment_date__range=[start_date, end_date]
            )
            .values("fee_groups_feetype_id")
            .annotate(total=Sum("amount"))
        )

        # Build mapping for fee types
        fee_group_ids = [
            item["fee_groups_feetype_id"]
            for item in fee_breakdown_query
            if item["fee_groups_feetype_id"]
        ]

        # Also get all fee deposites and parse their JSON to extract payments in the date range
        all_deposites = StudentFeesDeposite.objects.all().iterator(chunk_size=2000)
        deposite_payments = []
        for dep in all_deposites:
            if not dep.amount_detail:
                continue
            try:
                details = json.loads(dep.amount_detail)
            except Exception:
                continue

            if isinstance(details, dict):
                payment_list = details.values()
            elif isinstance(details, list):
                payment_list = details
            else:
                continue

            for payment in payment_list:
                if not isinstance(payment, dict):
                    continue
                p_date_str = payment.get("date")
                if not p_date_str or not isinstance(p_date_str, str):
                    continue
                try:
                    p_date = datetime.strptime(p_date_str[:10], "%Y-%m-%d").date()
                except ValueError:
                    continue
                if start_date <= p_date <= end_date:
                    amt_raw = payment.get("amount")
                    try:
                        amt = float(amt_raw) if amt_raw else 0.0
                    except (ValueError, TypeError):
                        amt = 0.0
                    deposite_payments.append(
                        {
                            "fee_groups_feetype_id": dep.fee_groups_feetype_id,
                            "amount": amt,
                        }
                    )
                    if (
                        dep.fee_groups_feetype_id
                        and dep.fee_groups_feetype_id not in fee_group_ids
                    ):
                        fee_group_ids.append(dep.fee_groups_feetype_id)

        # Map fee group ids to feetype names
        fee_groups = FeeGroupsFeetype.objects.filter(id__in=fee_group_ids).values(
            "id", "feetype_id"
        )
        feetype_ids = [fg["feetype_id"] for fg in fee_groups if fg["feetype_id"]]

        feetypes = Feetype.objects.filter(id__in=feetype_ids).values("id", "type")
        feetype_map = {ft["id"]: ft["type"] for ft in feetypes}
        fg_to_feetype_map = {
            fg["id"]: feetype_map.get(fg["feetype_id"], "Unknown Fee")
            for fg in fee_groups
        }

        student_fees_breakdown = {}
        total_fee_revenue = 0.0

        # Add Offline Fees
        for item in fee_breakdown_query:
            fg_id = item["fee_groups_feetype_id"]
            try:
                amount = float(item["total"] if item["total"] is not None else 0.0)
            except (ValueError, TypeError):
                amount = 0.0
            fee_name = (
                fg_to_feetype_map.get(fg_id, "Uncategorized Fee")
                if fg_id
                else "Uncategorized Fee"
            )
            student_fees_breakdown[fee_name] = (
                student_fees_breakdown.get(fee_name, 0.0) + amount
            )
            total_fee_revenue += amount

        # Add Student Directory Fees
        for dp in deposite_payments:
            fg_id = dp["fee_groups_feetype_id"]
            amount = dp["amount"]
            fee_name = (
                fg_to_feetype_map.get(fg_id, "Uncategorized Fee")
                if fg_id
                else "Uncategorized Fee"
            )
            student_fees_breakdown[fee_name] = (
                student_fees_breakdown.get(fee_name, 0.0) + amount
            )
            total_fee_revenue += amount

        student_fees_data = {
            "total": total_fee_revenue,
            "breakdown": student_fees_breakdown,
        }

        total_revenue = general_income + total_fee_revenue

        # Expenditures
        try:
            general_expenses = float(
                Expenses.objects.filter(
                    date__range=[start_date, end_date], is_active="yes", is_deleted="no"
                ).aggregate(total=Sum("amount"))["total"]
                or 0.0
            )
        except (ValueError, TypeError):
            general_expenses = 0.0

        # Dynamically extract months and years covered by the date range
        months_years = []
        current = start_date.replace(day=1)
        while current <= end_date:
            months_years.append((current.strftime("%B"), str(current.year)))
            next_month = current.month % 12 + 1
            next_year = current.year + (current.month // 12)
            current = current.replace(year=next_year, month=next_month, day=1)

        # Get all staff members
        all_staff = Staff.objects.all()

        # Build a set of matching payslips for fast lookup: (staff_id, month, year) -> net_salary
        payslip_map = {}
        payroll_query = StaffPayslip.objects.filter(
            Q(payment_date__range=[start_date, end_date])
            | Q(
                month__in=[m for m, y in months_years],
                year__in=[y for m, y in months_years],
            )
        )
        for ps in payroll_query:
            if ps.staff_id and ps.month and ps.year:
                try:
                    payslip_map[(ps.staff_id, ps.month, ps.year)] = float(
                        ps.net_salary if ps.net_salary is not None else 0.0
                    )
                except (ValueError, TypeError):
                    payslip_map[(ps.staff_id, ps.month, ps.year)] = 0.0

        staff_payroll_breakdown = {}
        total_payroll = 0.0

        for staff in all_staff:
            s_name = (
                f"{staff.name or ''} {staff.surname or ''}".strip()
                or f"Staff #{staff.id}"
            )
            try:
                basic = float(staff.basic_salary if staff.basic_salary else 35000.0)
            except (ValueError, TypeError):
                basic = 35000.0

            staff_total_for_period = 0.0

            for m, y in months_years:
                if (staff.id, m, y) in payslip_map:
                    staff_total_for_period += payslip_map[(staff.id, m, y)]
                else:
                    # Unpaid/Generated amount to be paid
                    staff_total_for_period += basic

            staff_payroll_breakdown[s_name] = (
                staff_payroll_breakdown.get(s_name, 0.0) + staff_total_for_period
            )
            total_payroll += staff_total_for_period

        staff_payroll_data = {
            "total": total_payroll,
            "breakdown": staff_payroll_breakdown,
        }

        total_expenditures = general_expenses + total_payroll

        # Net Profit
        net_balance = total_revenue - total_expenditures

        report_data = {
            "period": {"start_date": start_date_str, "end_date": end_date_str},
            "revenue": {
                "general_income": general_income,
                "student_fees": student_fees_data,
                "total": total_revenue,
            },
            "expenditures": {
                "general_expenses": general_expenses,
                "staff_payroll": staff_payroll_data,
                "total": total_expenditures,
            },
            "net_profit": net_balance,
            "is_profitable": net_balance >= 0,
        }

        return APIResponse.success(
            data=report_data, message="Financial report generated successfully."
        )
