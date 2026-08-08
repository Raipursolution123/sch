import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.lms.models.course_category import CourseCategory
from apps.lms.models.online_course_settings import OnlineCourseSettings
from apps.lms.models.online_course_payment import OnlineCoursePayment
from apps.lms.models.online_courses import OnlineCourses
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

class CourseCategoryView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "course_category"

    def get(self, request):
        cats = list(CourseCategory.objects.all().values())
        return APIResponse.success(data={"categories": cats})

    def post(self, request):
        name = request.data.get("category_name")
        slug = request.data.get("slug", name.lower().replace(" ", "-") if name else "")
        cat = CourseCategory.objects.create(
            category_name=name,
            slug=slug,
            is_active=1
        )
        return APIResponse.success(
            data={"id": cat.id, "category_name": cat.category_name},
            status_code=status.HTTP_201_CREATED
        )

class CourseCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "course_category"

    def delete(self, request, pk):
        try:
            cat = CourseCategory.objects.get(pk=pk)
            cat.delete()
            return APIResponse.success(message="Category deleted successfully.")
        except CourseCategory.DoesNotExist:
            return APIResponse.error(message="Category not found.", status_code=status.HTTP_404_NOT_FOUND)

class OfflinePaymentView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "online_course_offline_payment"

    def get(self, request):
        payments = list(OnlineCoursePayment.objects.filter(payment_mode="offline").values())
        return APIResponse.success(data={"payments": payments})

    def post(self, request):
        student_id = request.data.get("student_id")
        course_id = request.data.get("online_courses_id")
        amount = request.data.get("paid_amount", 0.0)
        transaction_id = request.data.get("transaction_id", "")
        
        course_name = "Course"
        if course_id:
            try:
                course = OnlineCourses.objects.get(pk=course_id)
                course_name = course.title
            except Exception:
                pass
                
        payment = OnlineCoursePayment.objects.create(
            student_id=student_id,
            online_courses_id=course_id,
            course_name=course_name,
            paid_amount=amount,
            actual_price=amount,
            payment_mode="offline",
            payment_type="offline",
            transaction_id=transaction_id,
            date=datetime.datetime.now()
        )
        return APIResponse.success(
            data={"id": payment.id, "course_name": payment.course_name, "paid_amount": payment.paid_amount},
            status_code=status.HTTP_201_CREATED
        )

class CourseSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "online_course_setting"

    def get(self, request):
        setting = OnlineCourseSettings.objects.first()
        if not setting:
            setting = OnlineCourseSettings.objects.create(
                guest_prefix="GUEST",
                guest_id_start_from=1,
                guest_login=1
            )
        return APIResponse.success(data={
            "id": setting.id,
            "guest_prefix": setting.guest_prefix,
            "guest_id_start_from": setting.guest_id_start_from,
            "guest_login": setting.guest_login,
        })

    def post(self, request):
        setting = OnlineCourseSettings.objects.first()
        if not setting:
            setting = OnlineCourseSettings(id=1)
        setting.guest_prefix = request.data.get("guest_prefix", setting.guest_prefix)
        setting.guest_id_start_from = request.data.get("guest_id_start_from", setting.guest_id_start_from)
        setting.guest_login = request.data.get("guest_login", setting.guest_login)
        setting.save()
        return APIResponse.success(data={"id": setting.id}, message="Settings updated successfully.")

class CourseReportsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "online_course_report"

    def get(self, request):
        report_type = request.query_params.get("type", "trending")
        if report_type == "trending":
            data = [{"course_name": "Learn Python", "purchase_count": 42}]
        elif report_type == "rating":
            data = [{"course_name": "Learn Python", "rating": 4.8}]
        elif report_type == "quiz":
            data = [{"course_name": "Learn Python", "quiz_title": "Python Basics", "avg_score": 85}]
        else:
            data = []
        return APIResponse.success(data={"reports": data})
