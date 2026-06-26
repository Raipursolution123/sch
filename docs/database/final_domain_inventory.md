# Final Domain Inventory

**Generated:** 2026-06-25 14:28 UTC
**Source:** `db_current` + `master_domain_assignment.json` + Django models

**Total tables:** 280
**Total domains:** 23
**Django apps:** 22

## Domain summary

| Domain | Django App | Tables | Total Rows |
|--------|------------|--------|------------|
| accounts | `accounts` | 11 | 28,157 |
| students | `students` | 21 | 1,050,421 |
| academics | `academics` | 22 | 6,167 |
| staff | `staff` | 16 | 1,113 |
| attendance | `attendance` | 1 | 6 |
| fees | `fees` | 16 | 188 |
| examinations | `examinations` | 45 | 218,618 |
| library | `library` | 3 | 0 |
| transport | `transport` | 6 | 50 |
| hostel | `hostel` | 2 | 7 |
| admissions | `admissions` | 4 | 0 |
| lms | `lms` | 14 | 6 |
| settings | `settings` | 18 | 13,856 |
| communications | `communications` | 21 | 1,284 |
| cms | `cms` | 9 | 54 |
| inventory | `inventory` | 6 | 5 |
| front_office | `front_office` | 7 | 7 |
| documents | `documents` | 4 | 8 |
| shared | `shared` | 7 | 5 |
| alumni | `alumni` | 2 | 1 |
| hr | `staff` | 2 | 3 |
| cyc_extensions | `cyc_extensions` | 35 | 7,292 |
| system | `system` | 8 | 132,896 |

## Tables by domain

### accounts (`apps.accounts`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `captcha` | 6 | 0 | `backend\apps\accounts\models\captcha.py` |
| `notification_roles` | 83 | 2 | `backend\apps\accounts\models\notification_roles.py` |
| `permission_category` | 301 | 1 | `backend\apps\accounts\models\permission.py` |
| `permission_group` | 38 | 0 | `backend\apps\accounts\models\permission.py` |
| `permission_student` | 25 | 1 | `backend\apps\accounts\models\permission.py` |
| `roles` | 11 | 0 | `backend\apps\accounts\models\role.py` |
| `roles_permissions` | 935 | 2 | `backend\apps\accounts\models\role.py` |
| `staff_roles` | 289 | 2 | `backend\apps\accounts\models\role.py` |
| `userlog` | 18,553 | 1 | `backend\apps\accounts\models\session.py` |
| `users` | 7,251 | 0 | `backend\apps\accounts\models\user.py` |
| `users_authentication` | 665 | 0 | `backend\apps\accounts\models\session.py` |

### students (`apps.students`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `disable_reason` | 3 | 0 | `backend\apps\students\models\disable_reason.py` |
| `student_applyleave` | 32 | 2 | `backend\apps\students\models\student_applyleave.py` |
| `student_attendences` | 1,028,060 | 2 | `backend\apps\students\models\student_attendences.py` |
| `student_attendences_hostel` | 6 | 2 | `backend\apps\students\models\student_attendences_hostel.py` |
| `student_attendences_transport` | 0 | 2 | `backend\apps\students\models\student_attendences_transport.py` |
| `student_behaviour` | 1 | 0 | `backend\apps\students\models\student_behaviour.py` |
| `student_doc` | 0 | 0 | `backend\apps\students\models\student_doc.py` |
| `student_edit_fields` | 16 | 0 | `backend\apps\students\models\student_edit_fields.py` |
| `student_fees` | 0 | 2 | `backend\apps\students\models\student_fees.py` |
| `student_fees_deposite` | 2,244 | 3 | `backend\apps\students\models\student_fees_deposite.py` |
| `student_fees_discounts` | 5 | 2 | `backend\apps\students\models\student_fees_discounts.py` |
| `student_fees_master` | 7,476 | 2 | `backend\apps\students\models\student_fees_master.py` |
| `student_fees_processing` | 0 | 4 | `backend\apps\students\models\student_fees_processing.py` |
| `student_incident_comments` | 0 | 1 | `backend\apps\students\models\student_incident_comments.py` |
| `student_incidents` | 321 | 2 | `backend\apps\students\models\student_incidents.py` |
| `student_quiz_status` | 0 | 2 | `backend\apps\students\models\student_quiz_status.py` |
| `student_session` | 8,648 | 7 | `backend\apps\students\models\student_session.py` |
| `student_subject_attendances` | 0 | 3 | `backend\apps\students\models\student_subject_attendances.py` |
| `student_timeline` | 4 | 1 | `backend\apps\students\models\student_timeline.py` |
| `student_transport_fees` | 0 | 3 | `backend\apps\students\models\student_transport_fees.py` |
| `students` | 3,605 | 0 | `backend\apps\students\models\students.py` |

### academics (`apps.academics`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `class_section_times` | 0 | 1 | `backend\apps\academics\models\class_section_times.py` |
| `class_sections` | 94 | 2 | `backend\apps\academics\models\class_sections.py` |
| `class_teacher` | 267 | 4 | `backend\apps\academics\models\class_teacher.py` |
| `classes` | 17 | 0 | `backend\apps\academics\models\classes.py` |
| `daily_assignment` | 15 | 3 | `backend\apps\academics\models\daily_assignment.py` |
| `homework` | 3 | 8 | `backend\apps\academics\models\homework.py` |
| `homework_evaluation` | 0 | 3 | `backend\apps\academics\models\homework_evaluation.py` |
| `lesson` | 42 | 3 | `backend\apps\academics\models\lesson.py` |
| `lesson_plan_forum` | 0 | 3 | `backend\apps\academics\models\lesson_plan_forum.py` |
| `sections` | 15 | 0 | `backend\apps\academics\models\sections.py` |
| `sessions` | 14 | 0 | `backend\apps\academics\models\sessions.py` |
| `subject_group_class_sections` | 202 | 3 | `backend\apps\academics\models\subject_group_class_sections.py` |
| `subject_group_subjects` | 403 | 3 | `backend\apps\academics\models\subject_group_subjects.py` |
| `subject_groups` | 51 | 1 | `backend\apps\academics\models\subject_groups.py` |
| `subject_groups1` | 0 | 0 | `backend\apps\academics\models\subject_groups1.py` |
| `subject_syllabus` | 4 | 4 | `backend\apps\academics\models\subject_syllabus.py` |
| `subject_timetable` | 4,953 | 6 | `backend\apps\academics\models\subject_timetable.py` |
| `subjects` | 30 | 0 | `backend\apps\academics\models\subjects.py` |
| `submit_assignment` | 0 | 2 | `backend\apps\academics\models\submit_assignment.py` |
| `topic` | 57 | 2 | `backend\apps\academics\models\topic.py` |
| `video_tutorial` | 0 | 1 | `backend\apps\academics\models\video_tutorial.py` |
| `video_tutorial_class_sections` | 0 | 2 | `backend\apps\academics\models\video_tutorial_class_sections.py` |

### staff (`apps.staff`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `conference_staff` | 0 | 2 | `backend\apps\staff\models\conference_staff.py` |
| `cyc_staff_payroll` | 4 | 0 | `backend\apps\staff\models\cyc_staff_payroll.py` |
| `cyc_staff_payroll_increment` | 3 | 0 | `backend\apps\staff\models\cyc_staff_payroll_increment.py` |
| `department` | 21 | 0 | `backend\apps\staff\models\department.py` |
| `gmeet_staff` | 0 | 2 | `backend\apps\staff\models\gmeet_staff.py` |
| `staff` | 289 | 2 | `backend\apps\staff\models\staff.py` |
| `staff_attendance` | 0 | 2 | `backend\apps\staff\models\staff_attendance.py` |
| `staff_attendance_type` | 5 | 0 | `backend\apps\staff\models\staff_attendance_type.py` |
| `staff_designation` | 19 | 0 | `backend\apps\staff\models\staff_designation.py` |
| `staff_id_card` | 2 | 0 | `backend\apps\staff\models\staff_id_card.py` |
| `staff_leave_details` | 690 | 2 | `backend\apps\staff\models\staff_leave_details.py` |
| `staff_leave_request` | 2 | 3 | `backend\apps\staff\models\staff_leave_request.py` |
| `staff_payroll` | 0 | 0 | `backend\apps\staff\models\staff_payroll.py` |
| `staff_payslip` | 0 | 1 | `backend\apps\staff\models\staff_payslip.py` |
| `staff_rating` | 78 | 1 | `backend\apps\staff\models\staff_rating.py` |
| `staff_timeline` | 0 | 1 | `backend\apps\staff\models\staff_timeline.py` |

### attendance (`apps.attendance`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `attendence_type` | 6 | 0 | `backend\apps\attendance\models\attendence_type.py` |

### fees (`apps.fees`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `expense_head` | 3 | 0 | `backend\apps\fees\models\expense_head.py` |
| `expenses` | 0 | 1 | `backend\apps\fees\models\expenses.py` |
| `fee_groups` | 11 | 0 | `backend\apps\fees\models\fee_groups.py` |
| `fee_groups_feetype` | 65 | 4 | `backend\apps\fees\models\fee_groups_feetype.py` |
| `fee_receipt_no` | 0 | 0 | `backend\apps\fees\models\fee_receipt_no.py` |
| `fee_session_groups` | 35 | 2 | `backend\apps\fees\models\fee_session_groups.py` |
| `feemasters` | 0 | 3 | `backend\apps\fees\models\feemasters.py` |
| `fees_discounts` | 1 | 1 | `backend\apps\fees\models\fees_discounts.py` |
| `fees_reminder` | 4 | 0 | `backend\apps\fees\models\fees_reminder.py` |
| `feetype` | 4 | 0 | `backend\apps\fees\models\feetype.py` |
| `gateway_ins` | 0 | 1 | `backend\apps\fees\models\gateway_ins.py` |
| `gateway_ins_response` | 0 | 1 | `backend\apps\fees\models\gateway_ins_response.py` |
| `income` | 0 | 1 | `backend\apps\fees\models\income.py` |
| `income_head` | 4 | 0 | `backend\apps\fees\models\income_head.py` |
| `offline_fees_payments` | 60 | 5 | `backend\apps\fees\models\offline_fees_payments.py` |
| `payment_settings` | 1 | 0 | `backend\apps\fees\models\payment_settings.py` |

### examinations (`apps.examinations`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `cbse_exam_assessment_types` | 15 | 1 | `backend\apps\examinations\models\cbse_exam_assessment_types.py` |
| `cbse_exam_assessments` | 10 | 0 | `backend\apps\examinations\models\cbse_exam_assessments.py` |
| `cbse_exam_class_sections` | 676 | 2 | `backend\apps\examinations\models\cbse_exam_class_sections.py` |
| `cbse_exam_grades` | 2 | 0 | `backend\apps\examinations\models\cbse_exam_grades.py` |
| `cbse_exam_grades_range` | 16 | 1 | `backend\apps\examinations\models\cbse_exam_grades_range.py` |
| `cbse_exam_observations` | 12 | 0 | `backend\apps\examinations\models\cbse_exam_observations.py` |
| `cbse_exam_student_subject_rank` | 0 | 3 | `backend\apps\examinations\models\cbse_exam_student_subject_rank.py` |
| `cbse_exam_students` | 23,305 | 2 | `backend\apps\examinations\models\cbse_exam_students.py` |
| `cbse_exam_timetable` | 654 | 2 | `backend\apps\examinations\models\cbse_exam_timetable.py` |
| `cbse_exam_timetable_assessment_types` | 816 | 2 | `backend\apps\examinations\models\cbse_exam_timetable_assessment_types.py` |
| `cbse_exam_timetable_grade` | 4,600 | 0 | `backend\apps\examinations\models\cbse_exam_timetable_grade.py` |
| `cbse_exams` | 108 | 4 | `backend\apps\examinations\models\cbse_exams.py` |
| `cbse_marksheet_type` | 4 | 0 | `backend\apps\examinations\models\cbse_marksheet_type.py` |
| `cbse_observation_class_section` | 0 | 0 | `backend\apps\examinations\models\cbse_observation_class_section.py` |
| `cbse_observation_parameters` | 4 | 0 | `backend\apps\examinations\models\cbse_observation_parameters.py` |
| `cbse_observation_subparameter` | 33 | 2 | `backend\apps\examinations\models\cbse_observation_subparameter.py` |
| `cbse_observation_term_student_subparameter` | 17,809 | 3 | `backend\apps\examinations\models\cbse_observation_term_student_subparameter.py` |
| `cbse_observation_terms` | 18 | 3 | `backend\apps\examinations\models\cbse_observation_terms.py` |
| `cbse_student_exam_ranks` | 240 | 2 | `backend\apps\examinations\models\cbse_student_exam_ranks.py` |
| `cbse_student_subject_marks` | 169,901 | 4 | `backend\apps\examinations\models\cbse_student_subject_marks.py` |
| `cbse_student_subject_result` | 0 | 0 | `backend\apps\examinations\models\cbse_student_subject_result.py` |
| `cbse_student_template_rank` | 0 | 2 | `backend\apps\examinations\models\cbse_student_template_rank.py` |
| `cbse_template` | 25 | 3 | `backend\apps\examinations\models\cbse_template.py` |
| `cbse_template_class_sections` | 142 | 2 | `backend\apps\examinations\models\cbse_template_class_sections.py` |
| `cbse_template_term_exams` | 68 | 3 | `backend\apps\examinations\models\cbse_template_term_exams.py` |
| `cbse_template_terms` | 24 | 2 | `backend\apps\examinations\models\cbse_template_terms.py` |
| `cbse_terms` | 13 | 0 | `backend\apps\examinations\models\cbse_terms.py` |
| `exam_group_class_batch_exam_students` | 111 | 3 | `backend\apps\examinations\models\exam_group_class_batch_exam_students.py` |
| `exam_group_class_batch_exam_subjects` | 2 | 2 | `backend\apps\examinations\models\exam_group_class_batch_exam_subjects.py` |
| `exam_group_class_batch_exams` | 2 | 2 | `backend\apps\examinations\models\exam_group_class_batch_exams.py` |
| `exam_group_exam_connections` | 0 | 2 | `backend\apps\examinations\models\exam_group_exam_connections.py` |
| `exam_group_exam_results` | 0 | 3 | `backend\apps\examinations\models\exam_group_exam_results.py` |
| `exam_group_students` | 0 | 3 | `backend\apps\examinations\models\exam_group_students.py` |
| `exam_groups` | 3 | 0 | `backend\apps\examinations\models\exam_groups.py` |
| `exam_schedules` | 0 | 2 | `backend\apps\examinations\models\exam_schedules.py` |
| `exams` | 0 | 1 | `backend\apps\examinations\models\exams.py` |
| `grades` | 0 | 0 | `backend\apps\examinations\models\grades.py` |
| `mark_divisions` | 3 | 0 | `backend\apps\examinations\models\mark_divisions.py` |
| `onlineexam` | 0 | 1 | `backend\apps\examinations\models\onlineexam.py` |
| `onlineexam_attempts` | 0 | 1 | `backend\apps\examinations\models\onlineexam_attempts.py` |
| `onlineexam_questions` | 0 | 3 | `backend\apps\examinations\models\onlineexam_questions.py` |
| `onlineexam_student_results` | 0 | 2 | `backend\apps\examinations\models\onlineexam_student_results.py` |
| `onlineexam_students` | 0 | 2 | `backend\apps\examinations\models\onlineexam_students.py` |
| `questions` | 0 | 6 | `backend\apps\examinations\models\questions.py` |
| `template_marksheets` | 2 | 0 | `backend\apps\examinations\models\template_marksheets.py` |

### library (`apps.library`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `book_issues` | 0 | 2 | `backend\apps\library\models\book_issues.py` |
| `books` | 0 | 0 | `backend\apps\library\models\books.py` |
| `libarary_members` | 0 | 0 | `backend\apps\library\models\libarary_members.py` |

### transport (`apps.transport`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `pickup_point` | 24 | 0 | `backend\apps\transport\models\pickup_point.py` |
| `route_pickup_point` | 0 | 2 | `backend\apps\transport\models\route_pickup_point.py` |
| `transport_feemaster` | 0 | 1 | `backend\apps\transport\models\transport_feemaster.py` |
| `transport_route` | 24 | 0 | `backend\apps\transport\models\transport_route.py` |
| `vehicle_routes` | 1 | 2 | `backend\apps\transport\models\vehicle_routes.py` |
| `vehicles` | 1 | 0 | `backend\apps\transport\models\vehicles.py` |

### hostel (`apps.hostel`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `hostel` | 2 | 0 | `backend\apps\hostel\models\hostel.py` |
| `hostel_rooms` | 5 | 2 | `backend\apps\hostel\models\hostel_rooms.py` |

### admissions (`apps.admissions`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `online_admission_custom_field_value` | 0 | 1 | `backend\apps\admissions\models\online_admission_custom_field_value.py` |
| `online_admission_fields` | 0 | 0 | `backend\apps\admissions\models\online_admission_fields.py` |
| `online_admission_payment` | 0 | 1 | `backend\apps\admissions\models\online_admission_payment.py` |
| `online_admissions` | 0 | 4 | `backend\apps\admissions\models\online_admissions.py` |

### lms (`apps.lms`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `course_category` | 1 | 0 | `backend\apps\lms\models\course_category.py` |
| `course_lesson_quiz_order` | 0 | 1 | `backend\apps\lms\models\course_lesson_quiz_order.py` |
| `course_progress` | 0 | 3 | `backend\apps\lms\models\course_progress.py` |
| `course_quiz_answer` | 0 | 3 | `backend\apps\lms\models\course_quiz_answer.py` |
| `course_quiz_question` | 0 | 1 | `backend\apps\lms\models\course_quiz_question.py` |
| `course_rating` | 0 | 0 | `backend\apps\lms\models\course_rating.py` |
| `online_course_class_sections` | 4 | 2 | `backend\apps\lms\models\online_course_class_sections.py` |
| `online_course_lesson` | 0 | 1 | `backend\apps\lms\models\online_course_lesson.py` |
| `online_course_payment` | 0 | 0 | `backend\apps\lms\models\online_course_payment.py` |
| `online_course_processing_payment` | 0 | 0 | `backend\apps\lms\models\online_course_processing_payment.py` |
| `online_course_quiz` | 0 | 2 | `backend\apps\lms\models\online_course_quiz.py` |
| `online_course_section` | 0 | 1 | `backend\apps\lms\models\online_course_section.py` |
| `online_course_settings` | 0 | 0 | `backend\apps\lms\models\online_course_settings.py` |
| `online_courses` | 1 | 1 | `backend\apps\lms\models\online_courses.py` |

### settings (`apps.settings`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `aws_s3_settings` | 0 | 0 | `backend\apps\settings\models\aws_s3_settings.py` |
| `behaviour_settings` | 1 | 0 | `backend\apps\settings\models\behaviour_settings.py` |
| `categories` | 4 | 0 | `backend\apps\settings\models\categories.py` |
| `currencies` | 179 | 0 | `backend\apps\settings\models\currencies.py` |
| `custom_field_values` | 13,320 | 1 | `backend\apps\settings\models\custom_field_values.py` |
| `custom_fields` | 9 | 0 | `backend\apps\settings\models\custom_fields.py` |
| `filetypes` | 1 | 0 | `backend\apps\settings\models\filetypes.py` |
| `languages` | 77 | 0 | `backend\apps\settings\models\languages.py` |
| `positions` | 0 | 0 | `backend\apps\settings\models\positions.py` |
| `print_headerfooter` | 4 | 0 | `backend\apps\settings\models\print_headerfooter.py` |
| `qr_code_settings` | 1 | 0 | `backend\apps\settings\models\qr_code_settings.py` |
| `reference` | 6 | 0 | `backend\apps\settings\models\reference.py` |
| `room_types` | 2 | 0 | `backend\apps\settings\models\room_types.py` |
| `sch_settings` | 1 | 0 | `backend\apps\settings\models\sch_settings.py` |
| `school_houses` | 4 | 0 | `backend\apps\settings\models\school_houses.py` |
| `sidebar_menus` | 33 | 1 | `backend\apps\settings\models\sidebar_menus.py` |
| `sidebar_sub_menus` | 208 | 2 | `backend\apps\settings\models\sidebar_sub_menus.py` |
| `source` | 6 | 0 | `backend\apps\settings\models\source.py` |

### communications (`apps.communications`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `chat_connections` | 0 | 2 | `backend\apps\communications\models\chat_connections.py` |
| `chat_messages` | 0 | 2 | `backend\apps\communications\models\chat_messages.py` |
| `chat_users` | 0 | 4 | `backend\apps\communications\models\chat_users.py` |
| `conference_sections` | 0 | 2 | `backend\apps\communications\models\conference_sections.py` |
| `conferences` | 0 | 2 | `backend\apps\communications\models\conferences.py` |
| `conferences_history` | 0 | 3 | `backend\apps\communications\models\conferences_history.py` |
| `email_attachments` | 0 | 1 | `backend\apps\communications\models\email_attachments.py` |
| `email_config` | 1 | 0 | `backend\apps\communications\models\email_config.py` |
| `email_template` | 0 | 0 | `backend\apps\communications\models\email_template.py` |
| `email_template_attachment` | 0 | 0 | `backend\apps\communications\models\email_template_attachment.py` |
| `gmeet` | 0 | 3 | `backend\apps\communications\models\gmeet.py` |
| `gmeet_history` | 0 | 3 | `backend\apps\communications\models\gmeet_history.py` |
| `gmeet_sections` | 0 | 2 | `backend\apps\communications\models\gmeet_sections.py` |
| `gmeet_settings` | 0 | 0 | `backend\apps\communications\models\gmeet_settings.py` |
| `messages` | 101 | 0 | `backend\apps\communications\models\messages.py` |
| `notification_setting` | 33 | 0 | `backend\apps\communications\models\notification_setting.py` |
| `read_notification` | 1,106 | 3 | `backend\apps\communications\models\read_notification.py` |
| `send_notification` | 10 | 1 | `backend\apps\communications\models\send_notification.py` |
| `sms_config` | 2 | 0 | `backend\apps\communications\models\sms_config.py` |
| `sms_template` | 31 | 0 | `backend\apps\communications\models\sms_template.py` |
| `zoom_settings` | 0 | 0 | `backend\apps\communications\models\zoom_settings.py` |

### cms (`apps.cms`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `events` | 22 | 1 | `backend\apps\cms\models\events.py` |
| `front_cms_media_gallery` | 0 | 0 | `backend\apps\cms\models\front_cms_media_gallery.py` |
| `front_cms_menu_items` | 0 | 1 | `backend\apps\cms\models\front_cms_menu_items.py` |
| `front_cms_menus` | 2 | 0 | `backend\apps\cms\models\front_cms_menus.py` |
| `front_cms_page_contents` | 0 | 1 | `backend\apps\cms\models\front_cms_page_contents.py` |
| `front_cms_pages` | 29 | 0 | `backend\apps\cms\models\front_cms_pages.py` |
| `front_cms_program_photos` | 0 | 1 | `backend\apps\cms\models\front_cms_program_photos.py` |
| `front_cms_programs` | 0 | 0 | `backend\apps\cms\models\front_cms_programs.py` |
| `front_cms_settings` | 1 | 0 | `backend\apps\cms\models\front_cms_settings.py` |

### inventory (`apps.inventory`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `item` | 0 | 3 | `backend\apps\inventory\models\item.py` |
| `item_category` | 3 | 0 | `backend\apps\inventory\models\item_category.py` |
| `item_issue` | 0 | 4 | `backend\apps\inventory\models\item_issue.py` |
| `item_stock` | 0 | 3 | `backend\apps\inventory\models\item_stock.py` |
| `item_store` | 2 | 0 | `backend\apps\inventory\models\item_store.py` |
| `item_supplier` | 0 | 0 | `backend\apps\inventory\models\item_supplier.py` |

### front_office (`apps.front_office`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `complaint` | 0 | 0 | `backend\apps\front_office\models\complaint.py` |
| `complaint_type` | 0 | 0 | `backend\apps\front_office\models\complaint_type.py` |
| `dispatch_receive` | 5 | 0 | `backend\apps\front_office\models\dispatch_receive.py` |
| `enquiry` | 1 | 3 | `backend\apps\front_office\models\enquiry.py` |
| `enquiry_type` | 0 | 0 | `backend\apps\front_office\models\enquiry_type.py` |
| `visitors_book` | 0 | 2 | `backend\apps\front_office\models\visitors_book.py` |
| `visitors_purpose` | 1 | 0 | `backend\apps\front_office\models\visitors_purpose.py` |

### documents (`apps.documents`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `certificates` | 1 | 0 | `backend\apps\documents\models\certificates.py` |
| `content_types` | 3 | 0 | `backend\apps\documents\models\content_types.py` |
| `id_card` | 0 | 0 | `backend\apps\documents\models\id_card.py` |
| `template_admitcards` | 4 | 0 | `backend\apps\documents\models\template_admitcards.py` |

### shared (`apps.shared`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `content_for` | 0 | 2 | `backend\apps\shared\models\content_for.py` |
| `contents` | 0 | 3 | `backend\apps\shared\models\contents.py` |
| `follow_up` | 0 | 2 | `backend\apps\shared\models\follow_up.py` |
| `share_content_for` | 0 | 5 | `backend\apps\shared\models\share_content_for.py` |
| `share_contents` | 0 | 1 | `backend\apps\shared\models\share_contents.py` |
| `share_upload_contents` | 0 | 2 | `backend\apps\shared\models\share_upload_contents.py` |
| `upload_contents` | 5 | 2 | `backend\apps\shared\models\upload_contents.py` |

### alumni (`apps.alumni`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `alumni_events` | 1 | 2 | `backend\apps\alumni\models\alumni_events.py` |
| `alumni_students` | 0 | 1 | `backend\apps\alumni\models\alumni_students.py` |

### hr (`apps.staff`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `leave_types` | 3 | 0 | `backend\apps\staff\models\leave_types.py` |
| `payslip_allowance` | 0 | 2 | `backend\apps\staff\models\payslip_allowance.py` |

### cyc_extensions (`apps.cyc_extensions`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `cy_ptm_time_slot` | 0 | 0 | `backend\apps\cyc_extensions\models\cy_ptm_time_slot.py` |
| `cy_vehicle_ticket` | 0 | 0 | `backend\apps\cyc_extensions\models\cy_vehicle_ticket.py` |
| `cyc_additional_section_teacher` | 1 | 0 | `backend\apps\cyc_extensions\models\cyc_additional_section_teacher.py` |
| `cyc_advance_exam_group` | 6 | 0 | `backend\apps\cyc_extensions\models\cyc_advance_exam_group.py` |
| `cyc_biometric_events` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_biometric_events.py` |
| `cyc_campaign` | 2 | 0 | `backend\apps\cyc_extensions\models\cyc_campaign.py` |
| `cyc_campaign_time` | 36 | 0 | `backend\apps\cyc_extensions\models\cyc_campaign_time.py` |
| `cyc_class_coordinator` | 10 | 0 | `backend\apps\cyc_extensions\models\cyc_class_coordinator.py` |
| `cyc_classes_grouping` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_classes_grouping.py` |
| `cyc_entries` | 2,343 | 2 | `backend\apps\cyc_extensions\models\cyc_entries.py` |
| `cyc_entryitems` | 4,686 | 2 | `backend\apps\cyc_extensions\models\cyc_entryitems.py` |
| `cyc_entrytypes` | 4 | 0 | `backend\apps\cyc_extensions\models\cyc_entrytypes.py` |
| `cyc_fee_head_ledger` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_fee_head_ledger.py` |
| `cyc_fuel_refill` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_fuel_refill.py` |
| `cyc_groups` | 38 | 1 | `backend\apps\cyc_extensions\models\cyc_groups.py` |
| `cyc_holiday` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_holiday.py` |
| `cyc_hostel_room_bed` | 9 | 0 | `backend\apps\cyc_extensions\models\cyc_hostel_room_bed.py` |
| `cyc_leads` | 4 | 0 | `backend\apps\cyc_extensions\models\cyc_leads.py` |
| `cyc_leads_counsellor` | 4 | 0 | `backend\apps\cyc_extensions\models\cyc_leads_counsellor.py` |
| `cyc_leads_followup` | 14 | 0 | `backend\apps\cyc_extensions\models\cyc_leads_followup.py` |
| `cyc_leads_followup_status` | 6 | 0 | `backend\apps\cyc_extensions\models\cyc_leads_followup_status.py` |
| `cyc_ledgers` | 117 | 0 | `backend\apps\cyc_extensions\models\cyc_ledgers.py` |
| `cyc_logs` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_logs.py` |
| `cyc_ptm` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_ptm.py` |
| `cyc_ptm_attendance` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_ptm_attendance.py` |
| `cyc_ptm_schedule` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_ptm_schedule.py` |
| `cyc_scheme_and_scholarship` | 5 | 0 | `backend\apps\cyc_extensions\models\cyc_scheme_and_scholarship.py` |
| `cyc_scheme_and_scholarship_feetype` | 2 | 0 | `backend\apps\cyc_extensions\models\cyc_scheme_and_scholarship_feetype.py` |
| `cyc_scheme_and_scholarship_student` | 3 | 0 | `backend\apps\cyc_extensions\models\cyc_scheme_and_scholarship_student.py` |
| `cyc_scheme_and_scholarship_value` | 1 | 0 | `backend\apps\cyc_extensions\models\cyc_scheme_and_scholarship_value.py` |
| `cyc_student_addon_fee` | 1 | 0 | `backend\apps\cyc_extensions\models\cyc_student_addon_fee.py` |
| `cyc_tags` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_tags.py` |
| `cyc_vehicle_parts_info` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_vehicle_parts_info.py` |
| `cyc_vehicle_rto_info` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_vehicle_rto_info.py` |
| `cyc_vehicle_services` | 0 | 0 | `backend\apps\cyc_extensions\models\cyc_vehicle_services.py` |

### system (`apps.system`)

| Table | Rows | FKs | Model |
|-------|------|-----|-------|
| `face_authentication` | 4 | 0 | `backend\apps\system\models\face_authentication.py` |
| `general_calls` | 0 | 0 | `backend\apps\system\models\general_calls.py` |
| `geofence_events` | 0 | 0 | `backend\apps\system\models\geofence_events.py` |
| `geofences` | 0 | 0 | `backend\apps\system\models\geofences.py` |
| `guest` | 0 | 0 | `backend\apps\system\models\guest.py` |
| `logs` | 132,892 | 0 | `backend\apps\system\models\logs.py` |
| `migrations` | 0 | 0 | `backend\apps\system\models\migrations.py` |
| `multi_branch` | 0 | 0 | `backend\apps\system\models\multi_branch.py` |
