# Cross-Domain Dependency Report

**Source:** `db_current` foreign key metadata + domain classification

## Implementation order (recommended)

1. accounts
2. settings (sch_settings, sessions already in academics)
3. academics (core done)
4. staff (done)
5. students (done)
6. attendance (done)
7. fees (done)
8. examinations (done)
9. library
10. transport
11. hostel
12. admissions
13. lms
14. communications / cms / cyc_extensions

## Domain summary

### accounts

**Tables:** 11
**Depends on:** `class_sections`, `send_notification`, `staff`
**Referenced by:** `content_for`, `events`, `share_content_for`, `sidebar_menus`, `sidebar_sub_menus`

### students

**Tables:** 20
**Depends on:** `attendence_type`, `classes`, `fee_groups_feetype`, `fee_session_groups`, `feemasters`, `fees_discounts`, `gateway_ins`, `hostel_rooms`, `online_course_quiz`, `route_pickup_point`, `sections`, `sessions`
 (+4 more)
**Referenced by:** `alumni_students`, `cbse_exam_student_subject_rank`, `cbse_exam_students`, `cbse_observation_term_student_subparameter`, `cbse_student_exam_ranks`, `cbse_student_template_rank`, `chat_users`, `conferences_history`, `course_progress`, `course_quiz_answer`, `daily_assignment`, `exam_group_class_batch_exam_students`
 (+10 more)

### academics

**Tables:** 5
**Referenced by:** `alumni_events`, `cbse_exam_class_sections`, `cbse_exam_student_subject_rank`, `cbse_exam_timetable`, `cbse_exams`, `cbse_observation_terms`, `cbse_template`, `cbse_template_class_sections`, `class_section_times`, `class_teacher`, `conference_sections`, `contents`
 (+29 more)

### staff

**Tables:** 16
**Depends on:** `conferences`, `gmeet`, `leave_types`
**Referenced by:** `chat_users`, `class_teacher`, `conferences`, `conferences_history`, `contents`, `daily_assignment`, `enquiry`, `follow_up`, `gmeet`, `gmeet_history`, `homework`, `item_issue`
 (+17 more)

### attendance

**Tables:** 1
**Referenced by:** `student_attendences`, `student_attendences_hostel`, `student_attendences_transport`, `student_subject_attendances`

### fees

**Tables:** 8
**Depends on:** `classes`, `sessions`
**Referenced by:** `offline_fees_payments`, `student_fees`, `student_fees_deposite`, `student_fees_discounts`, `student_fees_master`, `student_fees_processing`

### examinations

**Tables:** 41
**Depends on:** `class_sections`, `questions`, `sessions`, `student_session`, `students`, `subjects`

### library

**Tables:** 2
**Depends on:** `libarary_members`

### transport

**Tables:** 5
**Depends on:** `pickup_point`, `sessions`
**Referenced by:** `student_session`, `student_transport_fees`

### admissions

**Tables:** 4
**Depends on:** `categories`, `class_sections`, `custom_fields`, `hostel_rooms`, `school_houses`
**Referenced by:** `gateway_ins`

### lms

**Tables:** 14
**Depends on:** `class_sections`, `staff`, `students`
**Referenced by:** `student_quiz_status`
