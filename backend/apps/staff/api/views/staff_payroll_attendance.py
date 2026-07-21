import datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.models.staff import Staff
from apps.staff.models.staff_attendance import StaffAttendance
from apps.staff.models.staff_attendance_type import StaffAttendanceType
from apps.staff.models.staff_payslip import StaffPayslip
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class StaffAttendanceView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff"

    def get(self, request):
        try:
            date_str = request.query_params.get("date") or datetime.date.today().isoformat()
            staff_members = list(Staff.objects.all())

            # Map existing attendance for the date
            attendances = {}
            try:
                for att in StaffAttendance.objects.filter(date=date_str):
                    if att.staff_id is not None:
                        attendances[att.staff_id] = att
            except Exception:
                attendances = {}

            results = []
            for member in staff_members:
                att = attendances.get(member.id)
                name_part = f"{member.name or ''} {member.surname or ''}".strip()
                results.append({
                    "staff_id": member.id,
                    "staff_name": name_part or f"Staff #{member.id}",
                    "employee_id": member.employee_id or f"EMP-{member.id}",
                    "date": date_str,
                    "attendance_type_id": att.staff_attendance_type_id if (att and att.staff_attendance_type_id) else 1,
                    "remark": att.remark if (att and att.remark) else "",
                })

            return APIResponse.success(
                data={"results": results, "count": len(results), "date": date_str},
                message="Staff attendance roster retrieved successfully.",
            )
        except Exception as exc:
            return staff_error_response(exc)

    def post(self, request):
        try:
            date_str = request.data.get("date") or datetime.date.today().isoformat()
            attendance_list = request.data.get("attendance_data") or []

            # Prevent marking future dates
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date() if isinstance(date_str, str) else date_str
            if target_date > datetime.date.today():
                return APIResponse.error(message="Cannot mark staff attendance for future dates.")

            # Ensure default StaffAttendanceType records exist for foreign key constraint
            if not StaffAttendanceType.objects.exists():
                StaffAttendanceType.objects.bulk_create([
                    StaffAttendanceType(id=1, type="Present", key_value="present", is_active="yes", created_at=timezone.now()),
                    StaffAttendanceType(id=2, type="Late", key_value="late", is_active="yes", created_at=timezone.now()),
                    StaffAttendanceType(id=3, type="Absent", key_value="absent", is_active="yes", created_at=timezone.now()),
                    StaffAttendanceType(id=4, type="Half Day", key_value="half_day", is_active="yes", created_at=timezone.now()),
                ])

            for item in attendance_list:
                staff_id = item.get("staff_id")
                if not staff_id:
                    continue
                type_id = item.get("attendance_type_id", 1)
                remark = item.get("remark", "")

                att = StaffAttendance.objects.filter(staff_id=staff_id, date=target_date).first()
                if att:
                    att.staff_attendance_type_id = type_id
                    att.remark = remark
                    att.is_active = 1
                    att.save()
                else:
                    StaffAttendance.objects.create(
                        staff_id=staff_id,
                        date=target_date,
                        staff_attendance_type_id=type_id,
                        remark=remark,
                        is_active=1,
                        created_at=timezone.now(),
                    )

            return APIResponse.success(message="Staff attendance saved successfully.")
        except Exception as exc:
            return staff_error_response(exc)


class StaffPayrollView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff"

    def get(self, request):
        try:
            month = request.query_params.get("month") or datetime.date.today().strftime("%B")
            year = request.query_params.get("year") or str(datetime.date.today().year)

            staff_members = list(Staff.objects.all())
            payslips = {
                ps.staff_id: ps
                for ps in StaffPayslip.objects.filter(month=month, year=year)
                if ps.staff_id is not None
            }

            results = []
            for member in staff_members:
                ps = payslips.get(member.id)
                basic = float(member.basic_salary or 35000)
                results.append({
                    "id": ps.id if ps else member.id,
                    "staff_id": member.id,
                    "staff_name": f"{member.name or ''} {member.surname or ''}".strip() or f"Staff #{member.id}",
                    "employee_id": member.employee_id or f"EMP-{member.id}",
                    "basic_salary": basic,
                    "net_salary": float(ps.net_salary) if (ps and ps.net_salary is not None) else basic,
                    "status": ps.status if ps else "unpaid",
                    "month": month,
                    "year": year,
                    "payment_mode": ps.payment_mode if ps else "Cash",
                    "payment_date": ps.payment_date if ps else None,
                })

            return APIResponse.success(
                data={"results": results, "count": len(results), "month": month, "year": year},
                message="Staff payroll list retrieved successfully.",
            )
        except Exception as exc:
            return staff_error_response(exc)

    def post(self, request):
        try:
            staff_id = request.data.get("staff_id")
            if not staff_id:
                return APIResponse.error(message="Staff ID is required.")

            month = request.data.get("month") or datetime.date.today().strftime("%B")
            year = str(request.data.get("year") or datetime.date.today().year)
            basic = float(request.data.get("basic_salary") or 35000.0)
            net_salary = float(request.data.get("net_salary") or basic)
            payment_mode = request.data.get("payment_mode") or "Cash"

            ps = StaffPayslip.objects.filter(staff_id=staff_id, month=month, year=year).first()
            if ps:
                ps.basic = basic
                ps.net_salary = net_salary
                ps.status = "paid"
                ps.payment_mode = payment_mode
                ps.payment_date = datetime.date.today()
                ps.save()
            else:
                ps = StaffPayslip.objects.create(
                    staff_id=staff_id,
                    month=month,
                    year=year,
                    basic=basic,
                    total_allowance=0.0,
                    total_deduction=0.0,
                    leave_deduction=0,
                    tax="0",
                    net_salary=net_salary,
                    status="paid",
                    payment_mode=payment_mode,
                    payment_date=datetime.date.today(),
                    remark="",
                    generated_by=1,
                    created_at=timezone.now(),
                    payment_modes=payment_mode,
                )

            return APIResponse.success(
                data={"id": ps.id, "status": ps.status},
                message="Payslip generated and marked as paid successfully.",
            )
        except Exception as exc:
            return staff_error_response(exc)
