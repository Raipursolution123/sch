from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses.api import APIResponse
from common.pagination.standard import StandardResultsSetPagination
from core.permissions.legacy_privilege import HasLegacyPrivilege

from apps.academics.domain.lesson_plan_exceptions import (
    LessonPlanError,
    LessonPlanNotFoundError,
    LessonPlanValidationError,
)
from apps.academics.services.lesson_plan_service import LessonPlanService
from apps.academics.api.serializers.lesson_plan import (
    LessonSerializer,
    LessonCreateSerializer,
    LessonUpdateSerializer,
    TopicSerializer,
    TopicCreateSerializer,
    TopicUpdateSerializer,
    SubjectSyllabusSerializer,
    SubjectSyllabusCreateSerializer,
    SubjectSyllabusUpdateSerializer,
    LessonPlanForumSerializer,
    LessonPlanForumCreateSerializer,
)


def _handle_exception(exc: Exception):
    if isinstance(exc, LessonPlanValidationError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
        )
    if isinstance(exc, LessonPlanNotFoundError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, LessonPlanError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
        )
    return APIResponse.error(
        message="An unexpected error occurred.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class LessonListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "lesson"

    def get(self, request):
        sg_id = request.query_params.get("subject_group_id")
        subj_id = request.query_params.get("subject_id")
        cs_id = request.query_params.get("class_section_id")

        service = LessonPlanService()
        qs = service.list_lessons(
            subject_group_id=sg_id, subject_id=subj_id, class_section_id=cs_id
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = LessonSerializer(rows, many=True).data
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Lessons retrieved successfully.",
            )
        return APIResponse.success(data=data, message="Lessons retrieved successfully.")

    def post(self, request):
        serializer = LessonCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            lesson = service.create_lesson(serializer.validated_data)
            return APIResponse.success(
                data=LessonSerializer(lesson).data,
                message="Lesson created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LessonPlanError as e:
            return _handle_exception(e)


class LessonDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "lesson"

    def get(self, request, pk):
        service = LessonPlanService()
        try:
            lesson = service.get_lesson(pk)
            return APIResponse.success(
                data=LessonSerializer(lesson).data,
                message="Lesson retrieved successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    def put(self, request, pk):
        serializer = LessonUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            lesson = service.update_lesson(pk, serializer.validated_data)
            return APIResponse.success(
                data=LessonSerializer(lesson).data,
                message="Lesson updated successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    patch = put

    def delete(self, request, pk):
        service = LessonPlanService()
        try:
            service.delete_lesson(pk)
            return APIResponse.success(message="Lesson deleted successfully.")
        except LessonPlanError as e:
            return _handle_exception(e)


class TopicListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "topic"

    def get(self, request):
        lesson_id = request.query_params.get("lesson_id")
        service = LessonPlanService()
        qs = service.list_topics(lesson_id=lesson_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = TopicSerializer(rows, many=True).data
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Topics retrieved successfully.",
            )
        return APIResponse.success(data=data, message="Topics retrieved successfully.")

    def post(self, request):
        serializer = TopicCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            topic = service.create_topic(serializer.validated_data)
            return APIResponse.success(
                data=TopicSerializer(topic).data,
                message="Topic created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LessonPlanError as e:
            return _handle_exception(e)


class TopicDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "topic"

    def get(self, request, pk):
        service = LessonPlanService()
        try:
            topic = service.get_topic(pk)
            return APIResponse.success(
                data=TopicSerializer(topic).data,
                message="Topic retrieved successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    def put(self, request, pk):
        serializer = TopicUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            topic = service.update_topic(pk, serializer.validated_data)
            return APIResponse.success(
                data=TopicSerializer(topic).data,
                message="Topic updated successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    patch = put

    def delete(self, request, pk):
        service = LessonPlanService()
        try:
            service.delete_topic(pk)
            return APIResponse.success(message="Topic deleted successfully.")
        except LessonPlanError as e:
            return _handle_exception(e)


class SyllabusListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "syllabus"

    def get(self, request):
        service = LessonPlanService()
        qs = service.list_syllabus()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = SubjectSyllabusSerializer(rows, many=True).data
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Syllabus retrieved successfully.",
            )
        return APIResponse.success(
            data=data, message="Syllabus retrieved successfully."
        )

    def post(self, request):
        serializer = SubjectSyllabusCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            syllabus = service.create_syllabus(serializer.validated_data)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LessonPlanError as e:
            return _handle_exception(e)


class SyllabusDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "syllabus"

    def get(self, request, pk):
        service = LessonPlanService()
        try:
            syllabus = service.get_syllabus(pk)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus retrieved successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    def put(self, request, pk):
        serializer = SubjectSyllabusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            syllabus = service.update_syllabus(pk, serializer.validated_data)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus updated successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    patch = put

    def delete(self, request, pk):
        service = LessonPlanService()
        try:
            service.delete_syllabus(pk)
            return APIResponse.success(message="Syllabus deleted successfully.")
        except LessonPlanError as e:
            return _handle_exception(e)


class SyllabusCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "syllabus_comment"

    def get(self, request, syllabus_id):
        service = LessonPlanService()
        qs = service.list_forum_comments(syllabus_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = LessonPlanForumSerializer(rows, many=True).data
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Comments retrieved successfully.",
            )
        return APIResponse.success(
            data=data, message="Comments retrieved successfully."
        )

    def post(self, request, syllabus_id):
        serializer = LessonPlanForumCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            comment = service.create_forum_comment(
                syllabus_id, serializer.validated_data
            )
            return APIResponse.success(
                data=LessonPlanForumSerializer(comment).data,
                message="Comment created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LessonPlanError as e:
            return _handle_exception(e)
