from django.urls import path

from apps.examinations.api.views.cbse_exam import CbseExamsListCreateView
from apps.examinations.api.views.exam import ExamsDetailView, ExamsListCreateView
from apps.examinations.api.views.exam_enrollment import (
    ExamEnrollmentAssignView,
    ExamEnrollmentRosterView,
    ExamEnrollmentUnassignView,
)
from apps.examinations.api.views.exam_groups import (
    ExamGroupsDetailView,
    ExamGroupsListCreateView,
)
from apps.examinations.api.views.exam_results import (
    ExamResultRosterView,
    ExamResultsSaveView,
)
from apps.examinations.api.views.exam_schedules import (
    ExamSchedulesDetailView,
    ExamSchedulesListCreateView,
)
from apps.examinations.api.views.exam_templates import (
    AdmitCardTemplateDetailView,
    AdmitCardTemplateListCreateView,
    MarksheetTemplateDetailView,
    MarksheetTemplateListCreateView,
)
from apps.examinations.api.views.grades import GradesDetailView, GradesListCreateView
from apps.examinations.api.views.mark_divisions import (
    MarkDivisionsDetailView,
    MarkDivisionsListCreateView,
)
from apps.examinations.api.views.online_exam import (
    OnlineExamDetailView,
    OnlineExamListCreateView,
    OnlineExamQuestionDetailView,
    OnlineExamQuestionsView,
    OnlineExamStudentsAssignView,
    OnlineExamStudentsRosterView,
    OnlineExamStudentUnassignView,
    QuestionBankDetailView,
    QuestionBankListCreateView,
)

app_name = "examinations"

urlpatterns = [
    path("groups/", ExamGroupsListCreateView.as_view(), name="exam_groups_list_create"),
    path("groups/<int:pk>/", ExamGroupsDetailView.as_view(), name="exam_groups_detail"),
    path("exams/", ExamsListCreateView.as_view(), name="exams_list_create"),
    path("exams/<int:pk>/", ExamsDetailView.as_view(), name="exams_detail"),
    path(
        "schedules/",
        ExamSchedulesListCreateView.as_view(),
        name="exam_schedules_list_create",
    ),
    path(
        "schedules/<int:pk>/",
        ExamSchedulesDetailView.as_view(),
        name="exam_schedules_detail",
    ),
    path("grades/", GradesListCreateView.as_view(), name="grades_list_create"),
    path("grades/<int:pk>/", GradesDetailView.as_view(), name="grades_detail"),
    path(
        "divisions/",
        MarkDivisionsListCreateView.as_view(),
        name="mark_divisions_list_create",
    ),
    path(
        "divisions/<int:pk>/",
        MarkDivisionsDetailView.as_view(),
        name="mark_divisions_detail",
    ),
    path(
        "admit-cards/",
        AdmitCardTemplateListCreateView.as_view(),
        name="admit_card_templates",
    ),
    path(
        "admit-cards/<int:pk>/",
        AdmitCardTemplateDetailView.as_view(),
        name="admit_card_template_detail",
    ),
    path(
        "marksheets/",
        MarksheetTemplateListCreateView.as_view(),
        name="marksheet_templates",
    ),
    path(
        "marksheets/<int:pk>/",
        MarksheetTemplateDetailView.as_view(),
        name="marksheet_template_detail",
    ),
    path(
        "results/roster/",
        ExamResultRosterView.as_view(),
        name="exam_results_roster",
    ),
    path("results/", ExamResultsSaveView.as_view(), name="exam_results_save"),
    path(
        "enrollments/roster/",
        ExamEnrollmentRosterView.as_view(),
        name="exam_enrollments_roster",
    ),
    path(
        "enrollments/",
        ExamEnrollmentAssignView.as_view(),
        name="exam_enrollments_assign",
    ),
    path(
        "enrollments/<int:pk>/",
        ExamEnrollmentUnassignView.as_view(),
        name="exam_enrollments_unassign",
    ),
    path(
        "cbse-exams/",
        CbseExamsListCreateView.as_view(),
        name="cbse_exams_list_create",
    ),
    path(
        "questions/",
        QuestionBankListCreateView.as_view(),
        name="question_bank_list_create",
    ),
    path(
        "questions/<int:pk>/",
        QuestionBankDetailView.as_view(),
        name="question_bank_detail",
    ),
    path(
        "online-exams/",
        OnlineExamListCreateView.as_view(),
        name="online_exams_list_create",
    ),
    path(
        "online-exams/<int:pk>/",
        OnlineExamDetailView.as_view(),
        name="online_exams_detail",
    ),
    path(
        "online-exams/<int:pk>/questions/",
        OnlineExamQuestionsView.as_view(),
        name="online_exams_questions",
    ),
    path(
        "online-exams/<int:pk>/questions/<int:link_id>/",
        OnlineExamQuestionDetailView.as_view(),
        name="online_exams_question_detail",
    ),
    path(
        "online-exams/<int:pk>/students/roster/",
        OnlineExamStudentsRosterView.as_view(),
        name="online_exams_students_roster",
    ),
    path(
        "online-exams/<int:pk>/students/",
        OnlineExamStudentsAssignView.as_view(),
        name="online_exams_students_assign",
    ),
    path(
        "online-exams/<int:pk>/students/<int:assignment_id>/",
        OnlineExamStudentUnassignView.as_view(),
        name="online_exams_students_unassign",
    ),
]
