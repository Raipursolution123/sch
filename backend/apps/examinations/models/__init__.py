from apps.examinations.models.cbse_exam_assessment_types import CbseExamAssessmentTypes
from apps.examinations.models.cbse_exam_assessments import CbseExamAssessments
from apps.examinations.models.cbse_exam_class_sections import CbseExamClassSections
from apps.examinations.models.cbse_exam_grades import CbseExamGrades
from apps.examinations.models.cbse_exam_grades_range import CbseExamGradesRange
from apps.examinations.models.cbse_exam_observations import CbseExamObservations
from apps.examinations.models.cbse_exam_student_subject_rank import (
    CbseExamStudentSubjectRank,
)
from apps.examinations.models.cbse_exam_students import CbseExamStudents
from apps.examinations.models.cbse_exam_timetable import CbseExamTimetable
from apps.examinations.models.cbse_exam_timetable_assessment_types import (
    CbseExamTimetableAssessmentTypes,
)
from apps.examinations.models.cbse_exam_timetable_grade import CbseExamTimetableGrade
from apps.examinations.models.cbse_exams import CbseExams
from apps.examinations.models.cbse_marksheet_type import CbseMarksheetType
from apps.examinations.models.cbse_observation_class_section import (
    CbseObservationClassSection,
)
from apps.examinations.models.cbse_observation_parameters import (
    CbseObservationParameters,
)
from apps.examinations.models.cbse_observation_subparameter import (
    CbseObservationSubparameter,
)
from apps.examinations.models.cbse_observation_term_student_subparameter import (
    CbseObservationTermStudentSubparameter,
)
from apps.examinations.models.cbse_observation_terms import CbseObservationTerms
from apps.examinations.models.cbse_student_exam_ranks import CbseStudentExamRanks
from apps.examinations.models.cbse_student_subject_marks import CbseStudentSubjectMarks
from apps.examinations.models.cbse_student_subject_result import (
    CbseStudentSubjectResult,
)
from apps.examinations.models.cbse_student_template_rank import CbseStudentTemplateRank
from apps.examinations.models.cbse_template import CbseTemplate
from apps.examinations.models.cbse_template_class_sections import (
    CbseTemplateClassSections,
)
from apps.examinations.models.cbse_template_term_exams import CbseTemplateTermExams
from apps.examinations.models.cbse_template_terms import CbseTemplateTerms
from apps.examinations.models.cbse_terms import CbseTerms
from apps.examinations.models.exam_group_class_batch_exam_students import (
    ExamGroupClassBatchExamStudents,
)
from apps.examinations.models.exam_group_class_batch_exam_subjects import (
    ExamGroupClassBatchExamSubjects,
)
from apps.examinations.models.exam_group_class_batch_exams import (
    ExamGroupClassBatchExams,
)
from apps.examinations.models.exam_group_exam_connections import (
    ExamGroupExamConnections,
)
from apps.examinations.models.exam_group_exam_results import ExamGroupExamResults
from apps.examinations.models.exam_group_students import ExamGroupStudents
from apps.examinations.models.exam_groups import ExamGroups
from apps.examinations.models.exam_schedules import ExamSchedules
from apps.examinations.models.exams import Exams
from apps.examinations.models.grades import Grades
from apps.examinations.models.mark_divisions import MarkDivisions
from apps.examinations.models.onlineexam import Onlineexam
from apps.examinations.models.onlineexam_attempts import OnlineexamAttempts
from apps.examinations.models.onlineexam_questions import OnlineexamQuestions
from apps.examinations.models.onlineexam_student_results import OnlineexamStudentResults
from apps.examinations.models.onlineexam_students import OnlineexamStudents
from apps.examinations.models.questions import Questions
from apps.examinations.models.template_marksheets import TemplateMarksheets

__all__ = [
    "CbseExamAssessmentTypes",
    "CbseExamAssessments",
    "CbseExamClassSections",
    "CbseExamGrades",
    "CbseExamGradesRange",
    "CbseExamObservations",
    "CbseExamStudentSubjectRank",
    "CbseExamStudents",
    "CbseExamTimetable",
    "CbseExamTimetableAssessmentTypes",
    "CbseExamTimetableGrade",
    "CbseExams",
    "CbseMarksheetType",
    "CbseObservationClassSection",
    "CbseObservationParameters",
    "CbseObservationSubparameter",
    "CbseObservationTermStudentSubparameter",
    "CbseObservationTerms",
    "CbseStudentExamRanks",
    "CbseStudentSubjectMarks",
    "CbseStudentSubjectResult",
    "CbseStudentTemplateRank",
    "CbseTemplate",
    "CbseTemplateClassSections",
    "CbseTemplateTermExams",
    "CbseTemplateTerms",
    "CbseTerms",
    "ExamGroupClassBatchExamStudents",
    "ExamGroupClassBatchExamSubjects",
    "ExamGroupClassBatchExams",
    "ExamGroupExamConnections",
    "ExamGroupExamResults",
    "ExamGroupStudents",
    "ExamGroups",
    "ExamSchedules",
    "Exams",
    "Grades",
    "MarkDivisions",
    "Onlineexam",
    "OnlineexamAttempts",
    "OnlineexamQuestions",
    "OnlineexamStudentResults",
    "OnlineexamStudents",
    "Questions",
    "TemplateMarksheets",
]
