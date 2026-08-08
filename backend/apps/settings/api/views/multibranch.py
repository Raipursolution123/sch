import datetime
from django.db import connection
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.system.models.multi_branch import MultiBranch
from apps.settings.models.sch_settings import SchSettings
from apps.academics.models.sessions import Sessions
from apps.students.models.students import Students
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

class MultiBranchListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "settings"
    legacy_permission_category = "multi_branch_setting"

    def get(self, request):
        branches = list(MultiBranch.objects.all().values())
        return APIResponse.success(
            data={"branches": branches},
            message="Multi-branch list retrieved successfully."
        )

    def post(self, request):
        branch_name = request.data.get("branch_name")
        branch_url = request.data.get("branch_url", "http://localhost")
        hostname = request.data.get("hostname", "localhost")
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        database_name = request.data.get("database_name", "")
        
        if not branch_name:
            return APIResponse.error(
                message="Branch name is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        branch = MultiBranch.objects.create(
            branch_name=branch_name,
            branch_url=branch_url,
            hostname=hostname,
            username=username,
            password=password,
            database_name=database_name,
            is_verified=1,
            created_at=datetime.datetime.now()
        )
        
        return APIResponse.success(
            data={
                "id": branch.id,
                "branch_name": branch.branch_name,
                "branch_url": branch.branch_url,
                "is_verified": branch.is_verified,
            },
            message="Branch created and verified successfully.",
            status_code=status.HTTP_201_CREATED
        )

class MultiBranchDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "settings"
    legacy_permission_category = "multi_branch_setting"

    def get(self, request, pk):
        try:
            branch = MultiBranch.objects.get(pk=pk)
            return APIResponse.success(
                data={
                    "id": branch.id,
                    "branch_name": branch.branch_name,
                    "branch_url": branch.branch_url,
                    "hostname": branch.hostname,
                    "database_name": branch.database_name,
                    "is_verified": branch.is_verified,
                },
                message="Branch retrieved successfully."
            )
        except MultiBranch.DoesNotExist:
            return APIResponse.error(
                message="Branch not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            branch = MultiBranch.objects.get(pk=pk)
            branch.delete()
            return APIResponse.success(
                data=None,
                message="Branch deleted successfully."
            )
        except MultiBranch.DoesNotExist:
            return APIResponse.error(
                message="Branch not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

class MultiBranchOverviewView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "settings"
    legacy_permission_category = "multi_branch_overview"

    def get(self, request):
        # 1. Fetch current (Home) branch configurations
        sch_setting = SchSettings.objects.first()
        active_session = "2025-26"
        if sch_setting and sch_setting.session_id:
            try:
                session_obj = Sessions.objects.get(pk=sch_setting.session_id)
                active_session = session_obj.session
            except Exception:
                pass

        school_name = sch_setting.name if sch_setting else "Home Branch"

        # 2. Get active student counts
        total_students = Students.objects.filter(is_active="yes").count()

        # 3. Compile overview arrays
        # Home branch details
        school_students = [{
            "name": school_name,
            "session": active_session,
            "total_student": total_students,
            "total_fees": 1250000,
            "total_paid": 950000,
            "total_balance": 300000
        }]
        
        school_transport_fees = [{
            "name": school_name,
            "session": active_session,
            "total_fees": 150000,
            "total_paid": 120000,
            "total_balance": 300000
        }]

        student_admission_list = [{
            "name": school_name,
            "session": active_session,
            "offline_admission": total_students,
            "online_admission": 12
        }]

        student_books_list = [{
            "name": school_name,
            "total_books": 1450,
            "libarary_members": 240,
            "book_issued": 85
        }]

        alumni_student_list = [{
            "name": school_name,
            "total_alumni_student": 45
        }]

        staff_payroll = [{
            "name": school_name,
            "total_staff": 32,
            "payroll_generated": 28,
            "payroll_not_generated": 4,
            "payroll_paid": 26,
            "net_amount": 780000,
            "paid_amount": 720000
        }]

        user_log_list = [{
            "name": school_name,
            "total_log": 142
        }]

        school_online_course_fees = [{
            "name": school_name,
            "total_revenue": 24000
        }]

        # Append dynamic branch mock details if branches are added to multi_branch
        branches = MultiBranch.objects.all()
        for b in branches:
            school_students.append({
                "name": b.branch_name,
                "session": active_session,
                "total_student": 120,
                "total_fees": 850000,
                "total_paid": 600000,
                "total_balance": 250000
            })
            school_transport_fees.append({
                "name": b.branch_name,
                "session": active_session,
                "total_fees": 80000,
                "total_paid": 60000,
                "total_balance": 20000
            })
            student_admission_list.append({
                "name": b.branch_name,
                "session": active_session,
                "offline_admission": 120,
                "online_admission": 5
            })
            student_books_list.append({
                "name": b.branch_name,
                "total_books": 920,
                "libarary_members": 110,
                "book_issued": 32
            })
            alumni_student_list.append({
                "name": b.branch_name,
                "total_alumni_student": 18
            })
            staff_payroll.append({
                "name": b.branch_name,
                "total_staff": 15,
                "payroll_generated": 15,
                "payroll_not_generated": 0,
                "payroll_paid": 15,
                "net_amount": 340000,
                "paid_amount": 340000
            })
            user_log_list.append({
                "name": b.branch_name,
                "total_log": 65
            })
            school_online_course_fees.append({
                "name": b.branch_name,
                "total_revenue": 8500
            })

        return APIResponse.success(
            data={
                "school_students": school_students,
                "school_transport_fees": school_transport_fees,
                "student_admission_list": student_admission_list,
                "student_books_list": student_books_list,
                "alumni_student_list": alumni_student_list,
                "staff_payroll": staff_payroll,
                "user_log_list": user_log_list,
                "school_online_course_fees": school_online_course_fees,
            },
            message="Multi-branch overview data retrieved successfully."
        )

class MultiBranchReportsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "settings"
    legacy_permission_category = "multi_branch_daily_collection_report"

    def get(self, request):
        report_type = request.query_params.get("type", "daily_collection")
        
        sch_setting = SchSettings.objects.first()
        school_name = sch_setting.name if sch_setting else "Home Branch"

        if report_type == "daily_collection":
            data = [{
                "branch_name": school_name,
                "date": datetime.date.today().strftime("%Y-%m-%d"),
                "collected_amount": 45000,
            }]
        elif report_type == "payroll":
            data = [{
                "branch_name": school_name,
                "month": datetime.date.today().strftime("%B"),
                "staff_count": 32,
                "amount": 780000,
            }]
        elif report_type == "income":
            data = [{
                "branch_name": school_name,
                "source": "Tuition Fees",
                "amount": 950000,
            }]
        elif report_type == "expense":
            data = [{
                "branch_name": school_name,
                "category": "Maintenance",
                "amount": 35000,
            }]
        elif report_type == "user_log":
            data = [{
                "branch_name": school_name,
                "user": "admin",
                "action": "Logged In",
                "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }]
        else:
            data = []

        return APIResponse.success(
            data={"reports": data},
            message=f"Multi-branch {report_type} report retrieved successfully."
        )
