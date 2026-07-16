from django.urls import path

from apps.academics.api.views.class_ import ClassDetailView, ClassListCreateView
from apps.academics.api.views.class_section import (
    ClassAssignedSectionsView,
    ClassSectionBulkAssignView,
    ClassSectionDetailView,
    ClassSectionListCreateView,
)
from apps.academics.api.views.class_teacher import (
    ClassTeacherDetailView,
    ClassTeacherListCreateView,
)
from apps.academics.api.views.promote import PromoteExecuteView, PromotePreviewView
from apps.academics.api.views.section import SectionDetailView, SectionListCreateView
from apps.academics.api.views.session import (
    SessionActivateView,
    SessionActiveView,
    SessionDetailView,
    SessionListCreateView,
)
from apps.academics.api.views.subject import SubjectDetailView, SubjectListCreateView
from apps.academics.api.views.subject_group import (
    SubjectGroupDetailView,
    SubjectGroupListCreateView,
    SubjectGroupSyncClassSectionsView,
    SubjectGroupSyncSubjectsView,
)
from apps.academics.api.views.lesson_plan import (
    LessonListCreateView,
    LessonDetailView,
    TopicListCreateView,
    TopicDetailView,
    SyllabusListCreateView,
    SyllabusDetailView,
    SyllabusCommentListCreateView,
)
from apps.academics.api.views.syllabus_status import (
    SyllabusStatusListCreateView,
    SyllabusStatusDetailView,
)
from apps.academics.api.views.timetable import (
    TeacherTimetableView,
    TimetableDetailView,
    TimetableListCreateView,
    TimetableSubjectOptionsView,
)
from apps.academics.api.views.homework import (
    HomeworkListCreateView,
    HomeworkDetailView,
    HomeworkEvaluationListCreateView,
    HomeworkEvaluationDetailView,
    DailyAssignmentListCreateView,
    DailyAssignmentDetailView,
    SubmitAssignmentListCreateView,
    SubmitAssignmentDetailView,
)


urlpatterns = [
    path("classes/", ClassListCreateView.as_view(), name="classes_list_create"),
    path("classes/<int:pk>/", ClassDetailView.as_view(), name="classes_detail"),
    path("sections/", SectionListCreateView.as_view(), name="sections_list_create"),
    path("sections/<int:pk>/", SectionDetailView.as_view(), name="sections_detail"),
    path(
        "class-sections/",
        ClassSectionListCreateView.as_view(),
        name="class_sections_list",
    ),
    path(
        "class-sections/assign/",
        ClassSectionBulkAssignView.as_view(),
        name="class_sections_bulk_assign",
    ),
    path(
        "classes/<int:class_id>/sections/",
        ClassAssignedSectionsView.as_view(),
        name="class_assigned_sections",
    ),
    path(
        "class-sections/<int:pk>/",
        ClassSectionDetailView.as_view(),
        name="class_sections_detail",
    ),
    path("sessions/active/", SessionActiveView.as_view(), name="sessions_active"),
    path("sessions/", SessionListCreateView.as_view(), name="sessions_list_create"),
    path("sessions/<int:pk>/", SessionDetailView.as_view(), name="sessions_detail"),
    path(
        "sessions/<int:pk>/activate/",
        SessionActivateView.as_view(),
        name="sessions_activate",
    ),
    path("subjects/", SubjectListCreateView.as_view(), name="subjects_list_create"),
    path("subjects/<int:pk>/", SubjectDetailView.as_view(), name="subjects_detail"),
    path(
        "subject-groups/",
        SubjectGroupListCreateView.as_view(),
        name="subject_groups_list_create",
    ),
    path(
        "subject-groups/<int:pk>/",
        SubjectGroupDetailView.as_view(),
        name="subject_groups_detail",
    ),
    path(
        "subject-groups/<int:pk>/subjects/",
        SubjectGroupSyncSubjectsView.as_view(),
        name="subject_groups_sync_subjects",
    ),
    path(
        "subject-groups/<int:pk>/class-sections/",
        SubjectGroupSyncClassSectionsView.as_view(),
        name="subject_groups_sync_class_sections",
    ),
    path("lessons/", LessonListCreateView.as_view(), name="lessons_list_create"),
    path("lessons/<int:pk>/", LessonDetailView.as_view(), name="lessons_detail"),
    path("topics/", TopicListCreateView.as_view(), name="topics_list_create"),
    path("topics/<int:pk>/", TopicDetailView.as_view(), name="topics_detail"),
    path("syllabus/", SyllabusListCreateView.as_view(), name="syllabus_list_create"),
    path("syllabus/<int:pk>/", SyllabusDetailView.as_view(), name="syllabus_detail"),
    path(
        "syllabus/<int:syllabus_id>/comments/",
        SyllabusCommentListCreateView.as_view(),
        name="syllabus_comments_list_create",
    ),
    path(
        "syllabus-status/",
        SyllabusStatusListCreateView.as_view(),
        name="syllabus_status_list_create",
    ),
    path(
        "syllabus-status/<int:pk>/",
        SyllabusStatusDetailView.as_view(),
        name="syllabus_status_detail",
    ),
    path(
        "timetable/teacher/",
        TeacherTimetableView.as_view(),
        name="timetable_teacher",
    ),
    path(
        "timetable/subject-options/",
        TimetableSubjectOptionsView.as_view(),
        name="timetable_subject_options",
    ),
    path("timetable/", TimetableListCreateView.as_view(), name="timetable_list_create"),
    path("timetable/<int:pk>/", TimetableDetailView.as_view(), name="timetable_detail"),
    path(
        "class-teachers/",
        ClassTeacherListCreateView.as_view(),
        name="class_teachers_list_create",
    ),
    path(
        "class-teachers/<int:pk>/",
        ClassTeacherDetailView.as_view(),
        name="class_teachers_detail",
    ),
    path("promote/preview/", PromotePreviewView.as_view(), name="promote_preview"),
    path("promote/", PromoteExecuteView.as_view(), name="promote_execute"),
    # Homework and Assignment endpoints
    path("homework/", HomeworkListCreateView.as_view(), name="homework_list_create"),
    path("homework/<int:pk>/", HomeworkDetailView.as_view(), name="homework_detail"),
    path(
        "homework-evaluations/",
        HomeworkEvaluationListCreateView.as_view(),
        name="homework_evaluations_list_create",
    ),
    path(
        "homework-evaluations/<int:pk>/",
        HomeworkEvaluationDetailView.as_view(),
        name="homework_evaluations_detail",
    ),
    path(
        "daily-assignments/",
        DailyAssignmentListCreateView.as_view(),
        name="daily_assignments_list_create",
    ),
    path(
        "daily-assignments/<int:pk>/",
        DailyAssignmentDetailView.as_view(),
        name="daily_assignments_detail",
    ),
    path(
        "submit-assignments/",
        SubmitAssignmentListCreateView.as_view(),
        name="submit_assignments_list_create",
    ),
    path(
        "submit-assignments/<int:pk>/",
        SubmitAssignmentDetailView.as_view(),
        name="submit_assignments_detail",
    ),
]
