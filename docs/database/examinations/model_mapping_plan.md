# Examinations Domain — Model Mapping Plan

**App:** `apps.examinations`  
**Status:** Complete (41/41 tables mapped)  
**All models:** `managed = False`

## CBSE exam core

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `cbse_exams` | `CbseExams` | 108 | Mapped |
| `cbse_exam_class_sections` | `CbseExamClassSections` | 676 | Mapped |
| `cbse_exam_students` | `CbseExamStudents` | 23,305 | Mapped |
| `cbse_exam_timetable` | `CbseExamTimetable` | 654 | Mapped |
| `cbse_exam_timetable_assessment_types` | `CbseExamTimetableAssessmentTypes` | 816 | Mapped |
| `cbse_exam_timetable_grade` | `CbseExamTimetableGrade` | 4,600 | Mapped |

## CBSE config & grading

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `cbse_terms` | `CbseTerms` | 13 | Mapped |
| `cbse_exam_grades` | `CbseExamGrades` | 2 | Mapped |
| `cbse_exam_grades_range` | `CbseExamGradesRange` | 16 | Mapped |
| `cbse_exam_assessments` | `CbseExamAssessments` | 10 | Mapped |
| `cbse_exam_assessment_types` | `CbseExamAssessmentTypes` | 15 | Mapped |
| `cbse_exam_observations` | `CbseExamObservations` | 12 | Mapped |
| `cbse_marksheet_type` | `CbseMarksheetType` | 4 | Mapped |

## CBSE template & observations

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `cbse_template` | `CbseTemplate` | 25 | Mapped |
| `cbse_template_class_sections` | `CbseTemplateClassSections` | 142 | Mapped |
| `cbse_template_terms` | `CbseTemplateTerms` | 24 | Mapped |
| `cbse_template_term_exams` | `CbseTemplateTermExams` | 68 | Mapped |
| `cbse_observation_parameters` | `CbseObservationParameters` | 4 | Mapped |
| `cbse_observation_subparameter` | `CbseObservationSubparameter` | 33 | Mapped |
| `cbse_observation_terms` | `CbseObservationTerms` | 18 | Mapped |
| `cbse_observation_class_section` | `CbseObservationClassSection` | 0 | Mapped |
| `cbse_observation_term_student_subparameter` | `CbseObservationTermStudentSubparameter` | 17,809 | Mapped |

## CBSE marks & ranks

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `cbse_student_subject_marks` | `CbseStudentSubjectMarks` | 169,901 | Mapped |
| `cbse_student_subject_result` | `CbseStudentSubjectResult` | 0 | Mapped |
| `cbse_student_exam_ranks` | `CbseStudentExamRanks` | 240 | Mapped |
| `cbse_exam_student_subject_rank` | `CbseExamStudentSubjectRank` | 0 | Mapped |
| `cbse_student_template_rank` | `CbseStudentTemplateRank` | 0 | Mapped |

## Legacy exam groups

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `exam_groups` | `ExamGroups` | 3 | Mapped |
| `exam_group_students` | `ExamGroupStudents` | 0 | Mapped |
| `exam_group_exam_connections` | `ExamGroupExamConnections` | 0 | Mapped |
| `exam_group_class_batch_exams` | `ExamGroupClassBatchExams` | 2 | Mapped |
| `exam_group_class_batch_exam_subjects` | `ExamGroupClassBatchExamSubjects` | 2 | Mapped |
| `exam_group_class_batch_exam_students` | `ExamGroupClassBatchExamStudents` | 111 | Mapped |
| `exam_group_exam_results` | `ExamGroupExamResults` | 0 | Mapped |
| `exams` | `Exams` | 0 | Mapped |
| `exam_schedules` | `ExamSchedules` | 0 | Mapped |

## Online exam

| Table | Model class | Rows | Status |
|-------|-------------|------|--------|
| `onlineexam` | `Onlineexam` | 0 | Mapped |
| `onlineexam_students` | `OnlineexamStudents` | 0 | Mapped |
| `onlineexam_questions` | `OnlineexamQuestions` | 0 | Mapped |
| `onlineexam_attempts` | `OnlineexamAttempts` | 0 | Mapped |
| `onlineexam_student_results` | `OnlineexamStudentResults` | 0 | Mapped |

## Excluded

| Table | Reason |
|-------|--------|
| `cyc_advance_exam_group` | cyc_extensions |

## Cross-domain references

See [business_flow.md](./business_flow.md) and [cross_app_fk_enhancement_report.md](../cross_app_fk_enhancement_report.md).

## Regeneration

```bash
cd backend
python scripts/introspect_examinations_domain.py
python scripts/generate_examinations_models.py
```
