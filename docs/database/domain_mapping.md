# db_current — Domain / App Mapping

Permanent architecture reference for database-first Django app organization.

**Rules:**
- One Django app per business domain (not per table).
- All models use exact `db_table` names from `db_current`.
- Existing tables: `managed = False`.
- New tables (if approved): `managed = True`.

**Total tables:** 280  
**Domains identified:** 20

## accounts

**Table count:** 10

- `captcha` → **accounts** _(rows: 6, FKs: 0)_
- `notification_roles` → **accounts** _(rows: 83, FKs: 2)_
- `permission_category` → **accounts** _(rows: 301, FKs: 1)_
- `permission_group` → **accounts** _(rows: 38, FKs: 0)_
- `permission_student` → **accounts** _(rows: 25, FKs: 1)_
- `roles` → **accounts** _(rows: 11, FKs: 0)_
- `roles_permissions` → **accounts** _(rows: 935, FKs: 2)_
- `userlog` → **accounts** _(rows: 18553, FKs: 1)_
- `users` → **accounts** _(rows: 7251, FKs: 0)_
- `users_authentication` → **accounts** _(rows: 665, FKs: 0)_

## settings

**Table count:** 9

- `aws_s3_settings` → **settings** _(rows: 0, FKs: 0)_
- `behaviour_settings` → **settings** _(rows: 1, FKs: 0)_
- `categories` → **settings** _(rows: 4, FKs: 0)_
- `custom_field_values` → **settings** _(rows: 13320, FKs: 1)_
- `custom_fields` → **settings** _(rows: 9, FKs: 0)_
- `languages` → **settings** _(rows: 77, FKs: 0)_
- `sch_settings` → **settings** _(rows: 1, FKs: 0)_
- `school_houses` → **settings** _(rows: 4, FKs: 0)_
- `sessions` → **settings** _(rows: 14, FKs: 0)_

## academics

**Table count:** 18

- `class_section_times` → **academics** _(rows: 0, FKs: 1)_
- `class_sections` → **academics** _(rows: 94, FKs: 2)_
- `class_teacher` → **academics** _(rows: 267, FKs: 4)_
- `classes` → **academics** _(rows: 17, FKs: 0)_
- `department` → **academics** _(rows: 21, FKs: 0)_
- `homework` → **academics** _(rows: 3, FKs: 8)_
- `homework_evaluation` → **academics** _(rows: 0, FKs: 3)_
- `lesson` → **academics** _(rows: 42, FKs: 3)_
- `lesson_plan_forum` → **academics** _(rows: 0, FKs: 3)_
- `sections` → **academics** _(rows: 15, FKs: 0)_
- `subject_group_class_sections` → **academics** _(rows: 202, FKs: 3)_
- `subject_group_subjects` → **academics** _(rows: 403, FKs: 3)_
- `subject_groups` → **academics** _(rows: 51, FKs: 1)_
- `subject_groups1` → **academics** _(rows: 0, FKs: 0)_
- `subject_syllabus` → **academics** _(rows: 4, FKs: 4)_
- `subject_timetable` → **academics** _(rows: 4953, FKs: 6)_
- `subjects` → **academics** _(rows: 30, FKs: 0)_
- `topic` → **academics** _(rows: 57, FKs: 2)_

## students

**Table count:** 21

- `disable_reason` → **students** _(rows: 3, FKs: 0)_
- `student_applyleave` → **students** _(rows: 32, FKs: 2)_
- `student_attendences` → **students** _(rows: 1028060, FKs: 2)_
- `student_attendences_hostel` → **students** _(rows: 6, FKs: 2)_
- `student_attendences_transport` → **students** _(rows: 0, FKs: 2)_
- `student_behaviour` → **students** _(rows: 1, FKs: 0)_
- `student_doc` → **students** _(rows: 0, FKs: 0)_
- `student_edit_fields` → **students** _(rows: 16, FKs: 0)_
- `student_fees` → **students** _(rows: 0, FKs: 2)_
- `student_fees_deposite` → **students** _(rows: 2244, FKs: 3)_
- `student_fees_discounts` → **students** _(rows: 5, FKs: 2)_
- `student_fees_master` → **students** _(rows: 7476, FKs: 2)_
- `student_fees_processing` → **students** _(rows: 0, FKs: 4)_
- `student_incident_comments` → **students** _(rows: 0, FKs: 1)_
- `student_incidents` → **students** _(rows: 321, FKs: 2)_
- `student_quiz_status` → **students** _(rows: 0, FKs: 2)_
- `student_session` → **students** _(rows: 8648, FKs: 7)_
- `student_subject_attendances` → **students** _(rows: 0, FKs: 3)_
- `student_timeline` → **students** _(rows: 4, FKs: 1)_
- `student_transport_fees` → **students** _(rows: 0, FKs: 3)_
- `students` → **students** _(rows: 3605, FKs: 0)_

## staff

**Table count:** 16

- `conference_staff` → **staff** _(rows: 0, FKs: 2)_
- `cyc_staff_payroll` → **staff** _(rows: 4, FKs: 0)_
- `cyc_staff_payroll_increment` → **staff** _(rows: 3, FKs: 0)_
- `gmeet_staff` → **staff** _(rows: 0, FKs: 2)_
- `staff` → **staff** _(rows: 289, FKs: 2)_
- `staff_attendance` → **staff** _(rows: 0, FKs: 2)_
- `staff_attendance_type` → **staff** _(rows: 5, FKs: 0)_
- `staff_designation` → **staff** _(rows: 19, FKs: 0)_
- `staff_id_card` → **staff** _(rows: 2, FKs: 0)_
- `staff_leave_details` → **staff** _(rows: 690, FKs: 2)_
- `staff_leave_request` → **staff** _(rows: 2, FKs: 3)_
- `staff_payroll` → **staff** _(rows: 0, FKs: 0)_
- `staff_payslip` → **staff** _(rows: 0, FKs: 1)_
- `staff_rating` → **staff** _(rows: 78, FKs: 1)_
- `staff_roles` → **staff** _(rows: 289, FKs: 2)_
- `staff_timeline` → **staff** _(rows: 0, FKs: 1)_

## attendance

**Table count:** 1

- `attendence_type` → **attendance** _(rows: 6, FKs: 0)_

## fees

**Table count:** 16

- `expense_head` → **fees** _(rows: 3, FKs: 0)_
- `expenses` → **fees** _(rows: 0, FKs: 1)_
- `fee_groups` → **fees** _(rows: 11, FKs: 0)_
- `fee_groups_feetype` → **fees** _(rows: 65, FKs: 4)_
- `fee_receipt_no` → **fees** _(rows: 0, FKs: 0)_
- `fee_session_groups` → **fees** _(rows: 35, FKs: 2)_
- `feemasters` → **fees** _(rows: 0, FKs: 3)_
- `fees_discounts` → **fees** _(rows: 1, FKs: 1)_
- `fees_reminder` → **fees** _(rows: 4, FKs: 0)_
- `feetype` → **fees** _(rows: 4, FKs: 0)_
- `gateway_ins` → **fees** _(rows: 0, FKs: 1)_
- `gateway_ins_response` → **fees** _(rows: 0, FKs: 1)_
- `income` → **fees** _(rows: 0, FKs: 1)_
- `income_head` → **fees** _(rows: 4, FKs: 0)_
- `offline_fees_payments` → **fees** _(rows: 60, FKs: 5)_
- `payment_settings` → **fees** _(rows: 1, FKs: 0)_

## examinations

**Table count:** 29

- `cbse_exam_assessment_types` → **examinations** _(rows: 15, FKs: 1)_
- `cbse_exam_assessments` → **examinations** _(rows: 10, FKs: 0)_
- `cbse_exam_class_sections` → **examinations** _(rows: 676, FKs: 2)_
- `cbse_exam_grades` → **examinations** _(rows: 2, FKs: 0)_
- `cbse_exam_grades_range` → **examinations** _(rows: 16, FKs: 1)_
- `cbse_exam_observations` → **examinations** _(rows: 12, FKs: 0)_
- `cbse_exam_student_subject_rank` → **examinations** _(rows: 0, FKs: 3)_
- `cbse_exam_students` → **examinations** _(rows: 23305, FKs: 2)_
- `cbse_exam_timetable` → **examinations** _(rows: 654, FKs: 2)_
- `cbse_exam_timetable_assessment_types` → **examinations** _(rows: 816, FKs: 2)_
- `cbse_exam_timetable_grade` → **examinations** _(rows: 4600, FKs: 0)_
- `cbse_exams` → **examinations** _(rows: 108, FKs: 4)_
- `exam_group_class_batch_exam_students` → **examinations** _(rows: 111, FKs: 3)_
- `exam_group_class_batch_exam_subjects` → **examinations** _(rows: 2, FKs: 2)_
- `exam_group_class_batch_exams` → **examinations** _(rows: 2, FKs: 2)_
- `exam_group_exam_connections` → **examinations** _(rows: 0, FKs: 2)_
- `exam_group_exam_results` → **examinations** _(rows: 0, FKs: 3)_
- `exam_group_students` → **examinations** _(rows: 0, FKs: 3)_
- `exam_groups` → **examinations** _(rows: 3, FKs: 0)_
- `exam_schedules` → **examinations** _(rows: 0, FKs: 2)_
- `exams` → **examinations** _(rows: 0, FKs: 1)_
- `grades` → **examinations** _(rows: 0, FKs: 0)_
- `onlineexam` → **examinations** _(rows: 0, FKs: 1)_
- `onlineexam_attempts` → **examinations** _(rows: 0, FKs: 1)_
- `onlineexam_questions` → **examinations** _(rows: 0, FKs: 3)_
- `onlineexam_student_results` → **examinations** _(rows: 0, FKs: 2)_
- `onlineexam_students` → **examinations** _(rows: 0, FKs: 2)_
- `questions` → **examinations** _(rows: 0, FKs: 6)_
- `template_marksheets` → **examinations** _(rows: 2, FKs: 0)_

## library

**Table count:** 3

- `book_issues` → **library** _(rows: 0, FKs: 2)_
- `books` → **library** _(rows: 0, FKs: 0)_
- `libarary_members` → **library** _(rows: 0, FKs: 0)_

## transport

**Table count:** 6

- `pickup_point` → **transport** _(rows: 24, FKs: 0)_
- `route_pickup_point` → **transport** _(rows: 0, FKs: 2)_
- `transport_feemaster` → **transport** _(rows: 0, FKs: 1)_
- `transport_route` → **transport** _(rows: 24, FKs: 0)_
- `vehicle_routes` → **transport** _(rows: 1, FKs: 2)_
- `vehicles` → **transport** _(rows: 1, FKs: 0)_

## hostel

**Table count:** 2

- `hostel` → **hostel** _(rows: 2, FKs: 0)_
- `hostel_rooms` → **hostel** _(rows: 5, FKs: 2)_

## hr

**Table count:** 2

- `leave_types` → **hr** _(rows: 3, FKs: 0)_
- `payslip_allowance` → **hr** _(rows: 0, FKs: 2)_

## alumni

**Table count:** 2

- `alumni_events` → **alumni** _(rows: 1, FKs: 2)_
- `alumni_students` → **alumni** _(rows: 0, FKs: 1)_

## communications

**Table count:** 19

- `chat_connections` → **communications** _(rows: 0, FKs: 2)_
- `chat_messages` → **communications** _(rows: 0, FKs: 2)_
- `chat_users` → **communications** _(rows: 0, FKs: 4)_
- `conference_sections` → **communications** _(rows: 0, FKs: 2)_
- `conferences` → **communications** _(rows: 0, FKs: 2)_
- `conferences_history` → **communications** _(rows: 0, FKs: 3)_
- `email_attachments` → **communications** _(rows: 0, FKs: 1)_
- `email_config` → **communications** _(rows: 1, FKs: 0)_
- `email_template` → **communications** _(rows: 0, FKs: 0)_
- `email_template_attachment` → **communications** _(rows: 0, FKs: 0)_
- `gmeet` → **communications** _(rows: 0, FKs: 3)_
- `gmeet_history` → **communications** _(rows: 0, FKs: 3)_
- `gmeet_sections` → **communications** _(rows: 0, FKs: 2)_
- `gmeet_settings` → **communications** _(rows: 0, FKs: 0)_
- `messages` → **communications** _(rows: 101, FKs: 0)_
- `notification_setting` → **communications** _(rows: 33, FKs: 0)_
- `sms_config` → **communications** _(rows: 2, FKs: 0)_
- `sms_template` → **communications** _(rows: 31, FKs: 0)_
- `zoom_settings` → **communications** _(rows: 0, FKs: 0)_

## cms

**Table count:** 9

- `events` → **cms** _(rows: 22, FKs: 1)_
- `front_cms_media_gallery` → **cms** _(rows: 0, FKs: 0)_
- `front_cms_menu_items` → **cms** _(rows: 0, FKs: 1)_
- `front_cms_menus` → **cms** _(rows: 2, FKs: 0)_
- `front_cms_page_contents` → **cms** _(rows: 0, FKs: 1)_
- `front_cms_pages` → **cms** _(rows: 29, FKs: 0)_
- `front_cms_program_photos` → **cms** _(rows: 0, FKs: 1)_
- `front_cms_programs` → **cms** _(rows: 0, FKs: 0)_
- `front_cms_settings` → **cms** _(rows: 1, FKs: 0)_

## inventory

**Table count:** 6

- `item` → **inventory** _(rows: 0, FKs: 3)_
- `item_category` → **inventory** _(rows: 3, FKs: 0)_
- `item_issue` → **inventory** _(rows: 0, FKs: 4)_
- `item_stock` → **inventory** _(rows: 0, FKs: 3)_
- `item_store` → **inventory** _(rows: 2, FKs: 0)_
- `item_supplier` → **inventory** _(rows: 0, FKs: 0)_

## front_office

**Table count:** 7

- `complaint` → **front_office** _(rows: 0, FKs: 0)_
- `complaint_type` → **front_office** _(rows: 0, FKs: 0)_
- `dispatch_receive` → **front_office** _(rows: 5, FKs: 0)_
- `enquiry` → **front_office** _(rows: 1, FKs: 3)_
- `enquiry_type` → **front_office** _(rows: 0, FKs: 0)_
- `visitors_book` → **front_office** _(rows: 0, FKs: 2)_
- `visitors_purpose` → **front_office** _(rows: 1, FKs: 0)_

## documents

**Table count:** 3

- `certificates` → **documents** _(rows: 1, FKs: 0)_
- `content_types` → **documents** _(rows: 3, FKs: 0)_
- `id_card` → **documents** _(rows: 0, FKs: 0)_

## shared

**Table count:** 4

- `follow_up` → **shared** _(rows: 0, FKs: 2)_
- `share_content_for` → **shared** _(rows: 0, FKs: 5)_
- `share_contents` → **shared** _(rows: 0, FKs: 1)_
- `share_upload_contents` → **shared** _(rows: 0, FKs: 2)_

## unclassified

**Table count:** 97

- `cbse_marksheet_type` → **unclassified** _(rows: 4, FKs: 0)_
- `cbse_observation_class_section` → **unclassified** _(rows: 0, FKs: 0)_
- `cbse_observation_parameters` → **unclassified** _(rows: 4, FKs: 0)_
- `cbse_observation_subparameter` → **unclassified** _(rows: 33, FKs: 2)_
- `cbse_observation_term_student_subparameter` → **unclassified** _(rows: 17809, FKs: 3)_
- `cbse_observation_terms` → **unclassified** _(rows: 18, FKs: 3)_
- `cbse_student_exam_ranks` → **unclassified** _(rows: 240, FKs: 2)_
- `cbse_student_subject_marks` → **unclassified** _(rows: 169901, FKs: 4)_
- `cbse_student_subject_result` → **unclassified** _(rows: 0, FKs: 0)_
- `cbse_student_template_rank` → **unclassified** _(rows: 0, FKs: 2)_
- `cbse_template` → **unclassified** _(rows: 25, FKs: 3)_
- `cbse_template_class_sections` → **unclassified** _(rows: 142, FKs: 2)_
- `cbse_template_term_exams` → **unclassified** _(rows: 68, FKs: 3)_
- `cbse_template_terms` → **unclassified** _(rows: 24, FKs: 2)_
- `cbse_terms` → **unclassified** _(rows: 13, FKs: 0)_
- `content_for` → **unclassified** _(rows: 0, FKs: 2)_
- `contents` → **unclassified** _(rows: 0, FKs: 3)_
- `course_category` → **unclassified** _(rows: 1, FKs: 0)_
- `course_lesson_quiz_order` → **unclassified** _(rows: 0, FKs: 1)_
- `course_progress` → **unclassified** _(rows: 0, FKs: 3)_
- `course_quiz_answer` → **unclassified** _(rows: 0, FKs: 3)_
- `course_quiz_question` → **unclassified** _(rows: 0, FKs: 1)_
- `course_rating` → **unclassified** _(rows: 0, FKs: 0)_
- `currencies` → **unclassified** _(rows: 179, FKs: 0)_
- `cy_ptm_time_slot` → **unclassified** _(rows: 0, FKs: 0)_
- `cy_vehicle_ticket` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_additional_section_teacher` → **unclassified** _(rows: 1, FKs: 0)_
- `cyc_advance_exam_group` → **unclassified** _(rows: 6, FKs: 0)_
- `cyc_biometric_events` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_campaign` → **unclassified** _(rows: 2, FKs: 0)_
- `cyc_campaign_time` → **unclassified** _(rows: 36, FKs: 0)_
- `cyc_class_coordinator` → **unclassified** _(rows: 10, FKs: 0)_
- `cyc_classes_grouping` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_entries` → **unclassified** _(rows: 2343, FKs: 2)_
- `cyc_entryitems` → **unclassified** _(rows: 4686, FKs: 2)_
- `cyc_entrytypes` → **unclassified** _(rows: 4, FKs: 0)_
- `cyc_fee_head_ledger` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_fuel_refill` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_groups` → **unclassified** _(rows: 38, FKs: 1)_
- `cyc_holiday` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_hostel_room_bed` → **unclassified** _(rows: 9, FKs: 0)_
- `cyc_leads` → **unclassified** _(rows: 4, FKs: 0)_
- `cyc_leads_counsellor` → **unclassified** _(rows: 4, FKs: 0)_
- `cyc_leads_followup` → **unclassified** _(rows: 14, FKs: 0)_
- `cyc_leads_followup_status` → **unclassified** _(rows: 6, FKs: 0)_
- `cyc_ledgers` → **unclassified** _(rows: 117, FKs: 0)_
- `cyc_logs` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_ptm` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_ptm_attendance` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_ptm_schedule` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_scheme_and_scholarship` → **unclassified** _(rows: 5, FKs: 0)_
- `cyc_scheme_and_scholarship_feetype` → **unclassified** _(rows: 2, FKs: 0)_
- `cyc_scheme_and_scholarship_student` → **unclassified** _(rows: 3, FKs: 0)_
- `cyc_scheme_and_scholarship_value` → **unclassified** _(rows: 1, FKs: 0)_
- `cyc_student_addon_fee` → **unclassified** _(rows: 1, FKs: 0)_
- `cyc_tags` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_vehicle_parts_info` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_vehicle_rto_info` → **unclassified** _(rows: 0, FKs: 0)_
- `cyc_vehicle_services` → **unclassified** _(rows: 0, FKs: 0)_
- `daily_assignment` → **unclassified** _(rows: 15, FKs: 3)_
- `face_authentication` → **unclassified** _(rows: 4, FKs: 0)_
- `filetypes` → **unclassified** _(rows: 1, FKs: 0)_
- `general_calls` → **unclassified** _(rows: 0, FKs: 0)_
- `geofence_events` → **unclassified** _(rows: 0, FKs: 0)_
- `geofences` → **unclassified** _(rows: 0, FKs: 0)_
- `guest` → **unclassified** _(rows: 0, FKs: 0)_
- `logs` → **unclassified** _(rows: 132892, FKs: 0)_
- `mark_divisions` → **unclassified** _(rows: 3, FKs: 0)_
- `migrations` → **unclassified** _(rows: 0, FKs: 0)_
- `multi_branch` → **unclassified** _(rows: 0, FKs: 0)_
- `online_admission_custom_field_value` → **unclassified** _(rows: 0, FKs: 1)_
- `online_admission_fields` → **unclassified** _(rows: 0, FKs: 0)_
- `online_admission_payment` → **unclassified** _(rows: 0, FKs: 1)_
- `online_admissions` → **unclassified** _(rows: 0, FKs: 4)_
- `online_course_class_sections` → **unclassified** _(rows: 4, FKs: 2)_
- `online_course_lesson` → **unclassified** _(rows: 0, FKs: 1)_
- `online_course_payment` → **unclassified** _(rows: 0, FKs: 0)_
- `online_course_processing_payment` → **unclassified** _(rows: 0, FKs: 0)_
- `online_course_quiz` → **unclassified** _(rows: 0, FKs: 2)_
- `online_course_section` → **unclassified** _(rows: 0, FKs: 1)_
- `online_course_settings` → **unclassified** _(rows: 0, FKs: 0)_
- `online_courses` → **unclassified** _(rows: 1, FKs: 1)_
- `positions` → **unclassified** _(rows: 0, FKs: 0)_
- `print_headerfooter` → **unclassified** _(rows: 4, FKs: 0)_
- `qr_code_settings` → **unclassified** _(rows: 1, FKs: 0)_
- `read_notification` → **unclassified** _(rows: 1106, FKs: 3)_
- `reference` → **unclassified** _(rows: 6, FKs: 0)_
- `room_types` → **unclassified** _(rows: 2, FKs: 0)_
- `send_notification` → **unclassified** _(rows: 10, FKs: 1)_
- `sidebar_menus` → **unclassified** _(rows: 33, FKs: 1)_
- `sidebar_sub_menus` → **unclassified** _(rows: 208, FKs: 2)_
- `source` → **unclassified** _(rows: 6, FKs: 0)_
- `submit_assignment` → **unclassified** _(rows: 0, FKs: 2)_
- `template_admitcards` → **unclassified** _(rows: 4, FKs: 0)_
- `upload_contents` → **unclassified** _(rows: 5, FKs: 2)_
- `video_tutorial` → **unclassified** _(rows: 0, FKs: 1)_
- `video_tutorial_class_sections` → **unclassified** _(rows: 0, FKs: 2)_

## Quick Reference Examples

| Table | Domain |
|-------|--------|
| `books` | library |
| `book_issues` | library |
| `cbse_exams` | examinations |
| `cbse_exam_students` | examinations |
| `students` | students |
| `staff` | staff |
| `users` | accounts |
| `roles` | accounts |
| `roles_permissions` | accounts |

## Unclassified Tables

Tables that need manual domain assignment during implementation:

- `cbse_marksheet_type`
- `cbse_observation_class_section`
- `cbse_observation_parameters`
- `cbse_observation_subparameter`
- `cbse_observation_term_student_subparameter`
- `cbse_observation_terms`
- `cbse_student_exam_ranks`
- `cbse_student_subject_marks`
- `cbse_student_subject_result`
- `cbse_student_template_rank`
- `cbse_template`
- `cbse_template_class_sections`
- `cbse_template_term_exams`
- `cbse_template_terms`
- `cbse_terms`
- `content_for`
- `contents`
- `course_category`
- `course_lesson_quiz_order`
- `course_progress`
- `course_quiz_answer`
- `course_quiz_question`
- `course_rating`
- `currencies`
- `cy_ptm_time_slot`
- `cy_vehicle_ticket`
- `cyc_additional_section_teacher`
- `cyc_advance_exam_group`
- `cyc_biometric_events`
- `cyc_campaign`
- `cyc_campaign_time`
- `cyc_class_coordinator`
- `cyc_classes_grouping`
- `cyc_entries`
- `cyc_entryitems`
- `cyc_entrytypes`
- `cyc_fee_head_ledger`
- `cyc_fuel_refill`
- `cyc_groups`
- `cyc_holiday`
- `cyc_hostel_room_bed`
- `cyc_leads`
- `cyc_leads_counsellor`
- `cyc_leads_followup`
- `cyc_leads_followup_status`
- `cyc_ledgers`
- `cyc_logs`
- `cyc_ptm`
- `cyc_ptm_attendance`
- `cyc_ptm_schedule`
- `cyc_scheme_and_scholarship`
- `cyc_scheme_and_scholarship_feetype`
- `cyc_scheme_and_scholarship_student`
- `cyc_scheme_and_scholarship_value`
- `cyc_student_addon_fee`
- `cyc_tags`
- `cyc_vehicle_parts_info`
- `cyc_vehicle_rto_info`
- `cyc_vehicle_services`
- `daily_assignment`
- `face_authentication`
- `filetypes`
- `general_calls`
- `geofence_events`
- `geofences`
- `guest`
- `logs`
- `mark_divisions`
- `migrations`
- `multi_branch`
- `online_admission_custom_field_value`
- `online_admission_fields`
- `online_admission_payment`
- `online_admissions`
- `online_course_class_sections`
- `online_course_lesson`
- `online_course_payment`
- `online_course_processing_payment`
- `online_course_quiz`
- `online_course_section`
- `online_course_settings`
- `online_courses`
- `positions`
- `print_headerfooter`
- `qr_code_settings`
- `read_notification`
- `reference`
- `room_types`
- `send_notification`
- `sidebar_menus`
- `sidebar_sub_menus`
- `source`
- `submit_assignment`
- `template_admitcards`
- `upload_contents`
- `video_tutorial`
- `video_tutorial_class_sections`