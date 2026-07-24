from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.serializers.online_exam import (
    OnlineExamAssignSerializer,
    OnlineExamQuestionAddSerializer,
    OnlineExamUpdateSerializer,
    OnlineExamWriteSerializer,
    QuestionBankUpdateSerializer,
    QuestionBankWriteSerializer,
)
from apps.examinations.api.views.common import examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.online_exam_service import (
    OnlineExamService,
    QuestionBankService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "online_examination"


def _paginated_dicts(request, view, rows: list, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = list(page if page is not None else rows)
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class QuestionBankListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "question_bank"

    def get(self, request):
        service = QuestionBankService()
        qs = service.list(
            query=request.query_params.get("q"),
            class_id=request.query_params.get("class_id") or None,
            subject_id=request.query_params.get("subject_id") or None,
            question_type=request.query_params.get("question_type") or None,
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = [service.to_dict(row) for row in (page if page is not None else qs)]
        if page is not None:
            return paginator.get_paginated_response(rows)
        return APIResponse.success(data=rows, message="Questions retrieved.")

    def post(self, request):
        serializer = QuestionBankWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        staff_id = int(getattr(request.user, "user_id", 0) or 0)
        try:
            data = QuestionBankService().create(
                serializer.validated_data, staff_id=staff_id
            )
            return APIResponse.success(
                data=data,
                message="Question created.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class QuestionBankDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "question_bank"

    def get(self, request, pk):
        try:
            service = QuestionBankService()
            return APIResponse.success(data=service.to_dict(service.get(pk)))
        except ExaminationError as exc:
            return examination_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = QuestionBankUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = QuestionBankService().update(pk, serializer.validated_data)
            return APIResponse.success(data=data, message="Question updated.")
        except ExaminationError as exc:
            return examination_error_response(exc)

    def delete(self, request, pk):
        try:
            QuestionBankService().delete(pk)
            return APIResponse.success(message="Question deleted.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "online_examination"

    def get(self, request):
        service = OnlineExamService()
        qs = service.list(
            query=request.query_params.get("q"),
            session_id=request.query_params.get("session_id") or None,
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = [service.to_dict(row) for row in (page if page is not None else qs)]
        if page is not None:
            return paginator.get_paginated_response(rows)
        return APIResponse.success(data=rows, message="Online exams retrieved.")

    def post(self, request):
        serializer = OnlineExamWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = OnlineExamService().create(serializer.validated_data)
            return APIResponse.success(
                data=data,
                message="Online exam created.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "online_examination"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=OnlineExamService().to_dict(OnlineExamService().get(pk))
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = OnlineExamUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = OnlineExamService().update(pk, serializer.validated_data)
            return APIResponse.success(data=data, message="Online exam updated.")
        except ExaminationError as exc:
            return examination_error_response(exc)

    def delete(self, request, pk):
        try:
            OnlineExamService().delete(pk)
            return APIResponse.success(message="Online exam deleted.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamQuestionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "add_questions_in_exam"
    legacy_method_actions = {"POST": "can_edit", "DELETE": "can_edit"}

    def get(self, request, pk):
        try:
            data = OnlineExamService().list_questions(pk)
            return APIResponse.success(data=data, message="Exam questions retrieved.")
        except ExaminationError as exc:
            return examination_error_response(exc)

    def post(self, request, pk):
        serializer = OnlineExamQuestionAddSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = OnlineExamService().add_questions(
                pk, serializer.validated_data["questions"]
            )
            return APIResponse.success(data=data, message="Questions added to exam.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "add_questions_in_exam"
    legacy_method_actions = {"DELETE": "can_edit"}

    def delete(self, request, pk, link_id):
        try:
            OnlineExamService().remove_question(pk, link_id)
            return APIResponse.success(message="Question removed from exam.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamStudentsRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "online_assign_view_student"

    def get(self, request, pk):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        if not class_id or not section_id:
            return APIResponse.error(
                message="class_id and section_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = OnlineExamService().get_roster(pk, int(class_id), int(section_id))
            return APIResponse.success(data=data, message="Student roster retrieved.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamStudentsAssignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "online_assign_view_student"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        serializer = OnlineExamAssignSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = OnlineExamService().assign_students(
                pk, serializer.validated_data["student_session_ids"]
            )
            return APIResponse.success(data=data, message="Students assigned.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class OnlineExamStudentUnassignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "online_assign_view_student"
    legacy_method_actions = {"DELETE": "can_edit"}

    def delete(self, request, pk, assignment_id):
        try:
            OnlineExamService().unassign_student(pk, assignment_id)
            return APIResponse.success(message="Student unassigned.")
        except ExaminationError as exc:
            return examination_error_response(exc)
