import logging
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.examinations.models.exam_groups import ExamGroups
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse

from apps.examinations.models.exam_group_class_batch_exams import (
    ExamGroupClassBatchExams,
)
from apps.examinations.models.exam_schedules import ExamSchedules

logger = logging.getLogger(__name__)


def safe_date_str(value, fmt="%Y-%m-%d"):
    """Return a date string.

    Works if value is a date/datetime object or already a string.
    """
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)


def serialize_exam_group(group):
    # Map IntegerField (1/0) to string ('yes'/'no') for the frontend
    is_active_str = "yes" if group.is_active == 1 else "no"

    return {
        "id": group.id,
        "name": group.name,
        "exam_type": group.exam_type,
        "description": group.description,
        "is_active": is_active_str,
        "created_at": safe_date_str(group.created_at, "%Y-%m-%dT%H:%M:%SZ"),
        "updated_at": safe_date_str(group.updated_at),
    }


class ExamGroupsListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            exam_groups_qs = ExamGroups.objects.all().order_by("-id")

            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(
                exam_groups_qs, request, view=self
            )

            current_page = paginated_qs if paginated_qs is not None else exam_groups_qs
            data = [serialize_exam_group(group) for group in current_page]

            if paginated_qs is not None:
                # Wrap standard paginator response in APIResponse
                return APIResponse.success(
                    data={
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": data,
                    },
                    message="Exam groups retrieved successfully.",
                )

            return APIResponse.success(
                data=data, message="Exam groups retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exam groups: {e}")
            return APIResponse.error(message=f"Failed to fetch exam groups: {str(e)}")

    def post(self, request):
        try:
            data = request.data

            # Convert 'yes'/'no' to 1/0
            is_active_val = data.get("is_active")
            if isinstance(is_active_val, str):
                is_active_val = 1 if is_active_val.lower() == "yes" else 0
            elif is_active_val is None:
                is_active_val = 1

            exam_group = ExamGroups.objects.create(
                name=data.get("name"),
                exam_type=data.get("exam_type"),
                description=data.get("description"),
                is_active=is_active_val,
                created_at=timezone.now(),
                updated_at=timezone.now().date(),
            )

            return APIResponse.success(
                data=serialize_exam_group(exam_group),
                message="Exam group created successfully.",
                status_code=201,
            )
        except Exception as e:
            logger.error(f"Error creating exam group: {e}")
            return APIResponse.error(message=f"Failed to create exam group: {str(e)}")


class ExamGroupsDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        return ExamGroups.objects.filter(id=pk).first()

    def get(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(
                    message="Exam group not found.", status_code=404
                )

            return APIResponse.success(
                data=serialize_exam_group(exam_group),
                message="Exam group retrieved successfully.",
            )
        except Exception as e:
            logger.error(f"Error fetching exam group: {e}")
            return APIResponse.error(message=f"Failed to fetch exam group: {str(e)}")

    def put(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(
                    message="Exam group not found.", status_code=404
                )

            data = request.data

            if "name" in data:
                exam_group.name = data["name"]
            if "exam_type" in data:
                exam_group.exam_type = data["exam_type"]
            if "description" in data:
                exam_group.description = data["description"]
            if "is_active" in data:
                is_active_val = data["is_active"]
                if isinstance(is_active_val, str):
                    exam_group.is_active = 1 if is_active_val.lower() == "yes" else 0
                else:
                    exam_group.is_active = is_active_val

            exam_group.updated_at = timezone.now().date()
            exam_group.save()

            return APIResponse.success(
                data=serialize_exam_group(exam_group),
                message="Exam group updated successfully.",
            )
        except Exception as e:
            logger.error(f"Error updating exam group: {e}")
            return APIResponse.error(message=f"Failed to update exam group: {str(e)}")

    patch = put

    def delete(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(
                    message="Exam group not found.", status_code=404
                )

            exam_group.delete()
            return APIResponse.success(message="Exam group deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting exam group: {e}")
            return APIResponse.error(message=f"Failed to delete exam group: {str(e)}")


def serialize_exam(exam):
    is_active_str = "yes" if exam.is_active == 1 else "no"
    is_published = bool(exam.is_publish == 1)

    return {
        "id": exam.id,
        "name": exam.exam,  # The model uses 'exam' for the name
        "exam_group_id": exam.exam_group_id,
        "session_id": exam.session_id,
        "date_from": safe_date_str(exam.date_from),
        "date_to": safe_date_str(exam.date_to),
        "passing_percentage": exam.passing_percentage,
        "is_published": is_published,
        "is_active": is_active_str,
        "description": exam.description,
        "created_at": safe_date_str(exam.created_at, "%Y-%m-%dT%H:%M:%SZ"),
        "updated_at": safe_date_str(exam.updated_at),
    }


class ExamsListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            exams_qs = ExamGroupClassBatchExams.objects.all().order_by("-id")

            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(exams_qs, request, view=self)

            current_page = paginated_qs if paginated_qs is not None else exams_qs
            data = [serialize_exam(exam) for exam in current_page]

            if paginated_qs is not None:
                return APIResponse.success(
                    data={
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": data,
                    },
                    message="Exams retrieved successfully.",
                )

            return APIResponse.success(
                data=data, message="Exams retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exams: {e}")
            return APIResponse.error(message=f"Failed to fetch exams: {str(e)}")

    def post(self, request):
        try:
            data = request.data

            is_active_val = data.get("is_active")
            if isinstance(is_active_val, str):
                is_active_val = 1 if is_active_val.lower() == "yes" else 0
            elif is_active_val is None:
                is_active_val = 1

            is_publish_val = 1 if data.get("is_published") else 0

            exam = ExamGroupClassBatchExams.objects.create(
                exam=data.get("name"),
                exam_group_id=data.get("exam_group_id"),
                session_id=data.get("session_id"),
                date_from=data.get("date_from"),
                date_to=data.get("date_to"),
                passing_percentage=data.get("passing_percentage"),
                is_publish=is_publish_val,
                description=data.get("description"),
                is_active=is_active_val,
                created_at=timezone.now(),
                updated_at=timezone.now().date(),
            )

            return APIResponse.success(
                data=serialize_exam(exam),
                message="Exam created successfully.",
                status_code=201,
            )
        except Exception as e:
            logger.error(f"Error creating exam: {e}")
            return APIResponse.error(message=f"Failed to create exam: {str(e)}")


class ExamsDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        return ExamGroupClassBatchExams.objects.filter(id=pk).first()

    def get(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)

            return APIResponse.success(
                data=serialize_exam(exam), message="Exam retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exam: {e}")
            return APIResponse.error(message=f"Failed to fetch exam: {str(e)}")

    def put(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)

            data = request.data

            if "name" in data:
                exam.exam = data["name"]
            if "exam_group_id" in data:
                exam.exam_group_id = data["exam_group_id"]
            if "session_id" in data:
                exam.session_id = data["session_id"]
            if "date_from" in data:
                exam.date_from = data["date_from"]
            if "date_to" in data:
                exam.date_to = data["date_to"]
            if "passing_percentage" in data:
                exam.passing_percentage = data["passing_percentage"]
            if "is_published" in data:
                exam.is_publish = 1 if data["is_published"] else 0
            if "description" in data:
                exam.description = data["description"]
            if "is_active" in data:
                is_active_val = data["is_active"]
                if isinstance(is_active_val, str):
                    exam.is_active = 1 if is_active_val.lower() == "yes" else 0
                else:
                    exam.is_active = is_active_val

            exam.updated_at = timezone.now().date()
            exam.save()

            return APIResponse.success(
                data=serialize_exam(exam), message="Exam updated successfully."
            )
        except Exception as e:
            logger.error(f"Error updating exam: {e}")
            return APIResponse.error(message=f"Failed to update exam: {str(e)}")

    patch = put

    def delete(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)

            exam.delete()
            return APIResponse.success(message="Exam deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting exam: {e}")
            return APIResponse.error(message=f"Failed to delete exam: {str(e)}")


def serialize_exam_schedule(schedule):
    is_active_str = (
        "yes"
        if schedule.is_active == "yes"
        or schedule.is_active == 1
        or schedule.is_active == "1"
        else "no"
    )
    return {
        "id": schedule.id,
        "exam_id": schedule.exam_id,
        "subject_id": schedule.teacher_subject_id,
        "session_id": schedule.session_id,
        "date_of_exam": safe_date_str(schedule.date_of_exam),
        "start_time": schedule.start_to,
        "end_time": schedule.end_from,
        "room_no": schedule.room_no,
        "full_marks": schedule.full_marks,
        "passing_marks": schedule.passing_marks,
        "note": schedule.note,
        "is_active": is_active_str,
        "created_at": (
            safe_date_str(schedule.created_at, "%Y-%m-%dT%H:%M:%SZ")
            if schedule.created_at
            else None
        ),
        "updated_at": safe_date_str(schedule.updated_at),
    }


class ExamSchedulesListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            schedules_qs = ExamSchedules.objects.all().order_by("-id")
            data = [serialize_exam_schedule(s) for s in schedules_qs]
            return APIResponse.success(
                data=data, message="Exam schedules retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exam schedules: {e}")
            return APIResponse.error(
                message=f"Failed to fetch exam schedules: {str(e)}"
            )

    def post(self, request):
        try:
            data = request.data

            is_active_val = data.get("is_active")
            if isinstance(is_active_val, str):
                is_active_val = "yes" if is_active_val.lower() == "yes" else "no"
            elif is_active_val is None:
                is_active_val = "yes"

            schedule = ExamSchedules.objects.create(
                session_id=data.get("session_id"),
                exam_id=data.get("exam_id"),
                teacher_subject_id=data.get("subject_id"),
                date_of_exam=data.get("date_of_exam") or None,
                start_to=data.get("start_time"),
                end_from=data.get("end_time"),
                room_no=data.get("room_no"),
                full_marks=data.get("full_marks"),
                passing_marks=data.get("passing_marks"),
                note=data.get("note"),
                is_active=is_active_val,
                created_at=timezone.now(),
                updated_at=timezone.now().date(),
            )

            return APIResponse.success(
                data=serialize_exam_schedule(schedule),
                message="Exam schedule created successfully.",
                status_code=201,
            )
        except Exception as e:
            logger.error(f"Error creating exam schedule: {e}")
            return APIResponse.error(
                message=f"Failed to create exam schedule: {str(e)}"
            )


class ExamSchedulesDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        return ExamSchedules.objects.filter(id=pk).first()

    def get(self, request, pk):
        try:
            schedule = self.get_object(pk)
            if not schedule:
                return APIResponse.error(
                    message="Exam schedule not found.", status_code=404
                )

            return APIResponse.success(
                data=serialize_exam_schedule(schedule),
                message="Exam schedule retrieved successfully.",
            )
        except Exception as e:
            logger.error(f"Error fetching exam schedule: {e}")
            return APIResponse.error(message=f"Failed to fetch exam schedule: {str(e)}")

    def put(self, request, pk):
        try:
            schedule = self.get_object(pk)
            if not schedule:
                return APIResponse.error(
                    message="Exam schedule not found.", status_code=404
                )

            data = request.data

            if "session_id" in data:
                schedule.session_id = data["session_id"]
            if "exam_id" in data:
                schedule.exam_id = data["exam_id"]
            if "subject_id" in data:
                schedule.teacher_subject_id = data["subject_id"]
            if "date_of_exam" in data:
                schedule.date_of_exam = data["date_of_exam"] or None
            if "start_time" in data:
                schedule.start_to = data["start_time"]
            if "end_time" in data:
                schedule.end_from = data["end_time"]
            if "room_no" in data:
                schedule.room_no = data["room_no"]
            if "full_marks" in data:
                schedule.full_marks = data["full_marks"]
            if "passing_marks" in data:
                schedule.passing_marks = data["passing_marks"]
            if "note" in data:
                schedule.note = data["note"]
            if "is_active" in data:
                is_active_val = data["is_active"]
                if isinstance(is_active_val, str):
                    schedule.is_active = (
                        "yes" if is_active_val.lower() == "yes" else "no"
                    )
                else:
                    schedule.is_active = "yes" if is_active_val else "no"

            schedule.updated_at = timezone.now().date()
            schedule.save()

            return APIResponse.success(
                data=serialize_exam_schedule(schedule),
                message="Exam schedule updated successfully.",
            )
        except Exception as e:
            logger.error(f"Error updating exam schedule: {e}")
            return APIResponse.error(
                message=f"Failed to update exam schedule: {str(e)}"
            )

    patch = put

    def delete(self, request, pk):
        try:
            schedule = self.get_object(pk)
            if not schedule:
                return APIResponse.error(
                    message="Exam schedule not found.", status_code=404
                )

            schedule.delete()
            return APIResponse.success(message="Exam schedule deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting exam schedule: {e}")
            return APIResponse.error(
                message=f"Failed to delete exam schedule: {str(e)}"
            )
