# db_current — Complete Table Inventory

**Database:** `db_current`  
**Generated:** 2026-06-25 12:49 UTC  
**Total tables:** 280

## Summary

| Table | PK | Rows | Suggested App | FK Count | Depends On | Referenced By |
|-------|-----|------|---------------|----------|------------|---------------|
| `alumni_events` | `id` | 1 | alumni | 2 | classes, sessions | — |
| `alumni_students` | `id` | 0 | alumni | 1 | students | — |
| `attendence_type` | `id` | 6 | attendance | 0 | — | student_attendences, student_attendences_hostel, student_attendences_transport (+1) |
| `aws_s3_settings` | `id` | 0 | settings | 0 | — | — |
| `behaviour_settings` | `id` | 1 | settings | 0 | — | — |
| `book_issues` | `id` | 0 | library | 2 | books, libarary_members | — |
| `books` | `id` | 0 | library | 0 | — | book_issues |
| `captcha` | `id` | 6 | accounts | 0 | — | — |
| `categories` | `id` | 4 | settings | 0 | — | online_admissions |
| `cbse_exam_assessment_types` | `id` | 15 | examinations | 1 | cbse_exam_assessments | cbse_exam_timetable_assessment_types, cbse_student_subject_marks |
| `cbse_exam_assessments` | `id` | 10 | examinations | 0 | — | cbse_exam_assessment_types, cbse_exams |
| `cbse_exam_class_sections` | `id` | 676 | examinations | 2 | cbse_exams, class_sections | — |
| `cbse_exam_grades` | `id` | 2 | examinations | 0 | — | cbse_exam_grades_range, cbse_exams |
| `cbse_exam_grades_range` | `id` | 16 | examinations | 1 | cbse_exam_grades | — |
| `cbse_exam_observations` | `id` | 12 | examinations | 0 | — | cbse_observation_subparameter, cbse_observation_terms |
| `cbse_exam_student_subject_rank` | `id` | 0 | examinations | 3 | cbse_template, student_session, subjects | — |
| `cbse_exam_students` | `id` | 23305 | examinations | 2 | cbse_exams, student_session | cbse_student_subject_marks |
| `cbse_exam_timetable` | `id` | 654 | examinations | 2 | cbse_exams, subjects | cbse_exam_timetable_assessment_types, cbse_student_subject_marks |
| `cbse_exam_timetable_assessment_types` | `id` | 816 | examinations | 2 | cbse_exam_assessment_types, cbse_exam_timetable | cbse_student_subject_marks |
| `cbse_exam_timetable_grade` | `tg_id` | 4600 | examinations | 0 | — | — |
| `cbse_exams` | `id` | 108 | examinations | 4 | cbse_exam_assessments, cbse_exam_grades, cbse_terms (+1) | cbse_exam_class_sections, cbse_exam_students, cbse_exam_timetable (+4) |
| `cbse_marksheet_type` | `id` | 4 | unclassified | 0 | — | — |
| `cbse_observation_class_section` | `id` | 0 | unclassified | 0 | — | — |
| `cbse_observation_parameters` | `id` | 4 | unclassified | 0 | — | cbse_observation_subparameter |
| `cbse_observation_subparameter` | `id` | 33 | unclassified | 2 | cbse_exam_observations, cbse_observation_parameters | cbse_observation_term_student_subparameter |
| `cbse_observation_term_student_subparameter` | `id` | 17809 | unclassified | 3 | cbse_observation_subparameter, cbse_observation_terms, student_session | — |
| `cbse_observation_terms` | `id` | 18 | unclassified | 3 | cbse_exam_observations, cbse_terms, sessions | cbse_observation_term_student_subparameter |
| `cbse_student_exam_ranks` | `id` | 240 | unclassified | 2 | cbse_exams, student_session | — |
| `cbse_student_subject_marks` | `id` | 169901 | unclassified | 4 | cbse_exam_assessment_types, cbse_exam_students, cbse_exam_timetable (+1) | — |
| `cbse_student_subject_result` | `id` | 0 | unclassified | 0 | — | — |
| `cbse_student_template_rank` | `id` | 0 | unclassified | 2 | cbse_template, student_session | — |
| `cbse_template` | `id` | 25 | unclassified | 3 | cbse_exams, sessions | cbse_exam_student_subject_rank, cbse_student_template_rank, cbse_template_class_sections (+2) |
| `cbse_template_class_sections` | `id` | 142 | unclassified | 2 | cbse_template, class_sections | — |
| `cbse_template_term_exams` | `id` | 68 | unclassified | 3 | cbse_exams, cbse_template, cbse_template_terms | — |
| `cbse_template_terms` | `id` | 24 | unclassified | 2 | cbse_template, cbse_terms | cbse_template_term_exams |
| `cbse_terms` | `id` | 13 | unclassified | 0 | — | cbse_exams, cbse_observation_terms, cbse_template_terms |
| `certificates` | `id` | 1 | documents | 0 | — | — |
| `chat_connections` | `id` | 0 | communications | 2 | chat_users | chat_messages |
| `chat_messages` | `id` | 0 | communications | 2 | chat_connections, chat_users | — |
| `chat_users` | `id` | 0 | communications | 4 | staff, students | chat_connections, chat_connections, chat_messages |
| `class_section_times` | `id` | 0 | academics | 1 | class_sections | — |
| `class_sections` | `id` | 94 | academics | 2 | classes, sections | cbse_exam_class_sections, cbse_template_class_sections, class_section_times (+10) |
| `class_teacher` | `id` | 267 | academics | 4 | classes, sections, sessions (+1) | — |
| `classes` | `id` | 17 | academics | 0 | — | alumni_events, class_sections, class_teacher (+7) |
| `complaint` | `id` | 0 | front_office | 0 | — | — |
| `complaint_type` | `id` | 0 | front_office | 0 | — | — |
| `conference_sections` | `id` | 0 | communications | 2 | class_sections, conferences | — |
| `conference_staff` | `id` | 0 | staff | 2 | conferences, staff | — |
| `conferences` | `id` | 0 | communications | 2 | staff | conference_sections, conference_staff, conferences_history |
| `conferences_history` | `id` | 0 | communications | 3 | conferences, staff, students | — |
| `content_for` | `id` | 0 | unclassified | 2 | contents, users | — |
| `content_types` | `id` | 3 | documents | 0 | — | upload_contents |
| `contents` | `id` | 0 | unclassified | 3 | class_sections, classes, staff | content_for |
| `course_category` | `id` | 1 | unclassified | 0 | — | — |
| `course_lesson_quiz_order` | `id` | 0 | unclassified | 1 | online_course_section | — |
| `course_progress` | `id` | 0 | unclassified | 3 | online_course_section, online_courses, students | — |
| `course_quiz_answer` | `id` | 0 | unclassified | 3 | course_quiz_question, online_course_quiz, students | — |
| `course_quiz_question` | `id` | 0 | unclassified | 1 | online_course_quiz | course_quiz_answer |
| `course_rating` | `id` | 0 | unclassified | 0 | — | — |
| `currencies` | `id` | 179 | unclassified | 0 | — | — |
| `custom_field_values` | `id` | 13320 | settings | 1 | custom_fields | — |
| `custom_fields` | `id` | 9 | settings | 0 | — | custom_field_values, online_admission_custom_field_value |
| `cy_ptm_time_slot` | `pts_id` | 0 | unclassified | 0 | — | — |
| `cy_vehicle_ticket` | `vt_id` | 0 | unclassified | 0 | — | — |
| `cyc_additional_section_teacher` | `at_id` | 1 | unclassified | 0 | — | — |
| `cyc_advance_exam_group` | `exam_group_id` | 6 | unclassified | 0 | — | — |
| `cyc_biometric_events` | `id` | 0 | unclassified | 0 | — | — |
| `cyc_campaign` | `c_id` | 2 | unclassified | 0 | — | — |
| `cyc_campaign_time` | `ct_id` | 36 | unclassified | 0 | — | — |
| `cyc_class_coordinator` | `cc_id` | 10 | unclassified | 0 | — | — |
| `cyc_classes_grouping` | `cg_id` | 0 | unclassified | 0 | — | — |
| `cyc_entries` | `id` | 2343 | unclassified | 2 | cyc_entrytypes, cyc_tags | cyc_entryitems |
| `cyc_entryitems` | `id` | 4686 | unclassified | 2 | cyc_entries, cyc_ledgers | — |
| `cyc_entrytypes` | `id` | 4 | unclassified | 0 | — | cyc_entries |
| `cyc_fee_head_ledger` | `fhl_id` | 0 | unclassified | 0 | — | — |
| `cyc_fuel_refill` | `fr_id` | 0 | unclassified | 0 | — | — |
| `cyc_groups` | `id` | 38 | unclassified | 1 | cyc_groups | cyc_groups |
| `cyc_holiday` | `id` | 0 | unclassified | 0 | — | — |
| `cyc_hostel_room_bed` | `id` | 9 | unclassified | 0 | — | — |
| `cyc_leads` | `l_id` | 4 | unclassified | 0 | — | — |
| `cyc_leads_counsellor` | `lc_id` | 4 | unclassified | 0 | — | — |
| `cyc_leads_followup` | `f_id` | 14 | unclassified | 0 | — | — |
| `cyc_leads_followup_status` | `fws_id` | 6 | unclassified | 0 | — | — |
| `cyc_ledgers` | `id` | 117 | unclassified | 0 | — | cyc_entryitems |
| `cyc_logs` | `id` | 0 | unclassified | 0 | — | — |
| `cyc_ptm` | `ptm_id` | 0 | unclassified | 0 | — | — |
| `cyc_ptm_attendance` | `ptma_id` | 0 | unclassified | 0 | — | — |
| `cyc_ptm_schedule` | `ptms_id` | 0 | unclassified | 0 | — | — |
| `cyc_scheme_and_scholarship` | `ss_id` | 5 | unclassified | 0 | — | — |
| `cyc_scheme_and_scholarship_feetype` | `ssvft_id` | 2 | unclassified | 0 | — | — |
| `cyc_scheme_and_scholarship_student` | `sss_id` | 3 | unclassified | 0 | — | — |
| `cyc_scheme_and_scholarship_value` | `ssv_id` | 1 | unclassified | 0 | — | — |
| `cyc_staff_payroll` | `id` | 4 | staff | 0 | — | — |
| `cyc_staff_payroll_increment` | `pi_id` | 3 | staff | 0 | — | — |
| `cyc_student_addon_fee` | `af_id` | 1 | unclassified | 0 | — | — |
| `cyc_tags` | `id` | 0 | unclassified | 0 | — | cyc_entries |
| `cyc_vehicle_parts_info` | `vp_id` | 0 | unclassified | 0 | — | — |
| `cyc_vehicle_rto_info` | `vr_id` | 0 | unclassified | 0 | — | — |
| `cyc_vehicle_services` | `srv_id` | 0 | unclassified | 0 | — | — |
| `daily_assignment` | `id` | 15 | unclassified | 3 | staff, student_session, subject_group_subjects | — |
| `department` | `id` | 21 | academics | 0 | — | staff |
| `disable_reason` | `id` | 3 | students | 0 | — | — |
| `dispatch_receive` | `id` | 5 | front_office | 0 | — | — |
| `email_attachments` | `id` | 0 | communications | 1 | messages | — |
| `email_config` | `id` | 1 | communications | 0 | — | — |
| `email_template` | `id` | 0 | communications | 0 | — | — |
| `email_template_attachment` | `id` | 0 | communications | 0 | — | — |
| `enquiry` | `id` | 1 | front_office | 3 | classes, staff | follow_up |
| `enquiry_type` | `id` | 0 | front_office | 0 | — | — |
| `events` | `id` | 22 | cms | 1 | roles | — |
| `exam_group_class_batch_exam_students` | `id` | 111 | examinations | 3 | exam_group_class_batch_exams, student_session, students | exam_group_exam_results |
| `exam_group_class_batch_exam_subjects` | `id` | 2 | examinations | 2 | exam_group_class_batch_exams, subjects | exam_group_exam_results |
| `exam_group_class_batch_exams` | `id` | 2 | examinations | 2 | exam_groups, sessions | exam_group_class_batch_exam_students, exam_group_class_batch_exam_subjects, exam_group_exam_connections |
| `exam_group_exam_connections` | `id` | 0 | examinations | 2 | exam_group_class_batch_exams, exam_groups | — |
| `exam_group_exam_results` | `id` | 0 | examinations | 3 | exam_group_class_batch_exam_students, exam_group_class_batch_exam_subjects, exam_group_students | — |
| `exam_group_students` | `id` | 0 | examinations | 3 | exam_groups, student_session, students | exam_group_exam_results |
| `exam_groups` | `id` | 3 | examinations | 0 | — | exam_group_class_batch_exams, exam_group_exam_connections, exam_group_students |
| `exam_schedules` | `id` | 0 | examinations | 2 | exams, sessions | — |
| `exams` | `id` | 0 | examinations | 1 | sessions | exam_schedules |
| `expense_head` | `id` | 3 | fees | 0 | — | expenses |
| `expenses` | `id` | 0 | fees | 1 | expense_head | — |
| `face_authentication` | `fa_id` | 4 | unclassified | 0 | — | — |
| `fee_groups` | `id` | 11 | fees | 0 | — | fee_groups_feetype, fee_session_groups |
| `fee_groups_feetype` | `id` | 65 | fees | 4 | fee_groups, fee_session_groups, feetype (+1) | offline_fees_payments, student_fees_deposite, student_fees_processing |
| `fee_receipt_no` | `id` | 0 | fees | 0 | — | — |
| `fee_session_groups` | `id` | 35 | fees | 2 | fee_groups, sessions | fee_groups_feetype, student_fees_master |
| `feemasters` | `id` | 0 | fees | 3 | classes, feetype, sessions | student_fees |
| `fees_discounts` | `id` | 1 | fees | 1 | sessions | student_fees_discounts |
| `fees_reminder` | `id` | 4 | fees | 0 | — | — |
| `feetype` | `id` | 4 | fees | 0 | — | fee_groups_feetype, feemasters |
| `filetypes` | `id` | 1 | unclassified | 0 | — | — |
| `follow_up` | `id` | 0 | shared | 2 | enquiry, staff | — |
| `front_cms_media_gallery` | `id` | 0 | cms | 0 | — | — |
| `front_cms_menu_items` | `id` | 0 | cms | 1 | front_cms_menus | — |
| `front_cms_menus` | `id` | 2 | cms | 0 | — | front_cms_menu_items |
| `front_cms_page_contents` | `id` | 0 | cms | 1 | front_cms_pages | — |
| `front_cms_pages` | `id` | 29 | cms | 0 | — | front_cms_page_contents |
| `front_cms_program_photos` | `id` | 0 | cms | 1 | front_cms_programs | — |
| `front_cms_programs` | `id` | 0 | cms | 0 | — | front_cms_program_photos |
| `front_cms_settings` | `id` | 1 | cms | 0 | — | — |
| `gateway_ins` | `id` | 0 | fees | 1 | online_admissions | gateway_ins_response, student_fees_processing |
| `gateway_ins_response` | `id` | 0 | fees | 1 | gateway_ins | — |
| `general_calls` | `id` | 0 | unclassified | 0 | — | — |
| `geofence_events` | `ge_id` | 0 | unclassified | 0 | — | — |
| `geofences` | `geo_id` | 0 | unclassified | 0 | — | — |
| `gmeet` | `id` | 0 | communications | 3 | sessions, staff | gmeet_history, gmeet_sections, gmeet_staff |
| `gmeet_history` | `id` | 0 | communications | 3 | gmeet, staff, students | — |
| `gmeet_sections` | `id` | 0 | communications | 2 | class_sections, gmeet | — |
| `gmeet_settings` | `id` | 0 | communications | 0 | — | — |
| `gmeet_staff` | `id` | 0 | staff | 2 | gmeet, staff | — |
| `grades` | `id` | 0 | examinations | 0 | — | — |
| `guest` | `id` | 0 | unclassified | 0 | — | — |
| `homework` | `id` | 3 | academics | 8 | classes, sections, sessions (+3) | homework_evaluation, submit_assignment |
| `homework_evaluation` | `id` | 0 | academics | 3 | homework, student_session, students | — |
| `hostel` | `id` | 2 | hostel | 0 | — | hostel_rooms |
| `hostel_rooms` | `id` | 5 | hostel | 2 | hostel, room_types | online_admissions, student_session |
| `id_card` | `id` | 0 | documents | 0 | — | — |
| `income` | `id` | 0 | fees | 1 | income_head | — |
| `income_head` | `id` | 4 | fees | 0 | — | income |
| `item` | `id` | 0 | inventory | 3 | item_category, item_store, item_supplier | item_issue, item_stock |
| `item_category` | `id` | 3 | inventory | 0 | — | item, item_issue |
| `item_issue` | `id` | 0 | inventory | 4 | item, item_category, staff | — |
| `item_stock` | `id` | 0 | inventory | 3 | item, item_store, item_supplier | — |
| `item_store` | `id` | 2 | inventory | 0 | — | item, item_stock |
| `item_supplier` | `id` | 0 | inventory | 0 | — | item, item_stock |
| `languages` | `id` | 77 | settings | 0 | — | — |
| `leave_types` | `id` | 3 | hr | 0 | — | staff_leave_details, staff_leave_request |
| `lesson` | `id` | 42 | academics | 3 | sessions, subject_group_class_sections, subject_group_subjects | topic |
| `lesson_plan_forum` | `id` | 0 | academics | 3 | staff, students, subject_syllabus | — |
| `libarary_members` | `id` | 0 | library | 0 | — | book_issues |
| `logs` | `id` | 132892 | unclassified | 0 | — | — |
| `mark_divisions` | `id` | 3 | unclassified | 0 | — | — |
| `messages` | `id` | 101 | communications | 0 | — | email_attachments |
| `migrations` | `None` | 0 | unclassified | 0 | — | — |
| `multi_branch` | `id` | 0 | unclassified | 0 | — | — |
| `notification_roles` | `id` | 83 | accounts | 2 | roles, send_notification | — |
| `notification_setting` | `id` | 33 | communications | 0 | — | — |
| `offline_fees_payments` | `id` | 60 | fees | 5 | fee_groups_feetype, staff, student_fees_master (+2) | — |
| `online_admission_custom_field_value` | `id` | 0 | unclassified | 1 | custom_fields | — |
| `online_admission_fields` | `id` | 0 | unclassified | 0 | — | — |
| `online_admission_payment` | `id` | 0 | unclassified | 1 | online_admissions | — |
| `online_admissions` | `id` | 0 | unclassified | 4 | categories, class_sections, hostel_rooms (+1) | gateway_ins, online_admission_payment |
| `online_course_class_sections` | `id` | 4 | unclassified | 2 | class_sections, online_courses | — |
| `online_course_lesson` | `id` | 0 | unclassified | 1 | online_course_section | — |
| `online_course_payment` | `id` | 0 | unclassified | 0 | — | — |
| `online_course_processing_payment` | `id` | 0 | unclassified | 0 | — | — |
| `online_course_quiz` | `id` | 0 | unclassified | 2 | online_course_section, staff | course_quiz_answer, course_quiz_question, student_quiz_status |
| `online_course_section` | `id` | 0 | unclassified | 1 | online_courses | course_lesson_quiz_order, course_progress, online_course_lesson (+1) |
| `online_course_settings` | `id` | 0 | unclassified | 0 | — | — |
| `online_courses` | `id` | 1 | unclassified | 1 | staff | course_progress, online_course_class_sections, online_course_section |
| `onlineexam` | `id` | 0 | examinations | 1 | sessions | onlineexam_questions, onlineexam_students |
| `onlineexam_attempts` | `id` | 0 | examinations | 1 | onlineexam_students | — |
| `onlineexam_questions` | `id` | 0 | examinations | 3 | onlineexam, questions, sessions | onlineexam_student_results |
| `onlineexam_student_results` | `id` | 0 | examinations | 2 | onlineexam_questions, onlineexam_students | — |
| `onlineexam_students` | `id` | 0 | examinations | 2 | onlineexam, student_session | onlineexam_attempts, onlineexam_student_results |
| `payment_settings` | `id` | 1 | fees | 0 | — | — |
| `payslip_allowance` | `id` | 0 | hr | 2 | staff, staff_payslip | — |
| `permission_category` | `id` | 301 | accounts | 1 | permission_group | roles_permissions |
| `permission_group` | `id` | 38 | accounts | 0 | — | permission_category, permission_student, sidebar_menus (+1) |
| `permission_student` | `id` | 25 | accounts | 1 | permission_group | — |
| `pickup_point` | `id` | 24 | transport | 0 | — | route_pickup_point |
| `positions` | `id` | 0 | unclassified | 0 | — | — |
| `print_headerfooter` | `id` | 4 | unclassified | 0 | — | — |
| `qr_code_settings` | `id` | 1 | unclassified | 0 | — | — |
| `questions` | `id` | 0 | examinations | 6 | class_sections, classes, sections (+2) | onlineexam_questions |
| `read_notification` | `id` | 1106 | unclassified | 3 | send_notification, staff, students | — |
| `reference` | `id` | 6 | unclassified | 0 | — | — |
| `roles` | `id` | 11 | accounts | 0 | — | events, notification_roles, roles_permissions (+1) |
| `roles_permissions` | `id` | 935 | accounts | 2 | permission_category, roles | — |
| `room_types` | `id` | 2 | unclassified | 0 | — | hostel_rooms |
| `route_pickup_point` | `id` | 0 | transport | 2 | pickup_point, transport_route | student_session, student_transport_fees |
| `sch_settings` | `id` | 1 | settings | 0 | — | — |
| `school_houses` | `id` | 4 | settings | 0 | — | online_admissions |
| `sections` | `id` | 15 | academics | 0 | — | class_sections, class_teacher, homework (+3) |
| `send_notification` | `id` | 10 | unclassified | 1 | staff | notification_roles, read_notification |
| `sessions` | `id` | 14 | settings | 0 | — | alumni_events, cbse_exams, cbse_observation_terms (+22) |
| `share_content_for` | `id` | 0 | shared | 5 | class_sections, share_contents, staff (+2) | — |
| `share_contents` | `id` | 0 | shared | 1 | staff | share_content_for, share_upload_contents |
| `share_upload_contents` | `id` | 0 | shared | 2 | share_contents, upload_contents | — |
| `sidebar_menus` | `id` | 33 | unclassified | 1 | permission_group | sidebar_sub_menus |
| `sidebar_sub_menus` | `id` | 208 | unclassified | 2 | permission_group, sidebar_menus | — |
| `sms_config` | `id` | 2 | communications | 0 | — | — |
| `sms_template` | `id` | 31 | communications | 0 | — | — |
| `source` | `id` | 6 | unclassified | 0 | — | — |
| `staff` | `id` | 289 | staff | 2 | department, staff_designation | chat_users, chat_users, class_teacher (+43) |
| `staff_attendance` | `id` | 0 | staff | 2 | staff, staff_attendance_type | — |
| `staff_attendance_type` | `id` | 5 | staff | 0 | — | staff_attendance |
| `staff_designation` | `id` | 19 | staff | 0 | — | staff |
| `staff_id_card` | `id` | 2 | staff | 0 | — | — |
| `staff_leave_details` | `id` | 690 | staff | 2 | leave_types, staff | — |
| `staff_leave_request` | `id` | 2 | staff | 3 | leave_types, staff | — |
| `staff_payroll` | `id` | 0 | staff | 0 | — | — |
| `staff_payslip` | `id` | 0 | staff | 1 | staff | payslip_allowance |
| `staff_rating` | `id` | 78 | staff | 1 | staff | — |
| `staff_roles` | `id` | 289 | staff | 2 | roles, staff | — |
| `staff_timeline` | `id` | 0 | staff | 1 | staff | — |
| `student_applyleave` | `id` | 32 | students | 2 | staff, student_session | — |
| `student_attendences` | `id` | 1028060 | students | 2 | attendence_type, student_session | — |
| `student_attendences_hostel` | `id` | 6 | students | 2 | attendence_type, student_session | — |
| `student_attendences_transport` | `id` | 0 | students | 2 | attendence_type, student_session | — |
| `student_behaviour` | `id` | 1 | students | 0 | — | student_incidents |
| `student_doc` | `id` | 0 | students | 0 | — | — |
| `student_edit_fields` | `id` | 16 | students | 0 | — | — |
| `student_fees` | `id` | 0 | students | 2 | feemasters, student_session | — |
| `student_fees_deposite` | `id` | 2244 | students | 3 | fee_groups_feetype, student_fees_master, student_transport_fees | — |
| `student_fees_discounts` | `id` | 5 | students | 2 | fees_discounts, student_session | — |
| `student_fees_master` | `id` | 7476 | students | 2 | fee_session_groups, student_session | offline_fees_payments, student_fees_deposite, student_fees_processing |
| `student_fees_processing` | `id` | 0 | students | 4 | fee_groups_feetype, gateway_ins, student_fees_master (+1) | — |
| `student_incident_comments` | `id` | 0 | students | 1 | student_incidents | — |
| `student_incidents` | `id` | 321 | students | 2 | student_behaviour, students | student_incident_comments |
| `student_quiz_status` | `id` | 0 | students | 2 | online_course_quiz, students | — |
| `student_session` | `id` | 8648 | students | 7 | classes, hostel_rooms, route_pickup_point (+4) | cbse_exam_student_subject_rank, cbse_exam_students, cbse_observation_term_student_subparameter (+18) |
| `student_subject_attendances` | `id` | 0 | students | 3 | attendence_type, student_session, subject_timetable | — |
| `student_timeline` | `id` | 4 | students | 1 | students | — |
| `student_transport_fees` | `id` | 0 | students | 3 | route_pickup_point, student_session, transport_feemaster | offline_fees_payments, student_fees_deposite, student_fees_processing |
| `students` | `id` | 3605 | students | 0 | — | alumni_students, chat_users, chat_users (+15) |
| `subject_group_class_sections` | `id` | 202 | academics | 3 | class_sections, sessions, subject_groups | lesson |
| `subject_group_subjects` | `id` | 403 | academics | 3 | sessions, subject_groups, subjects | daily_assignment, homework, lesson (+1) |
| `subject_groups` | `id` | 51 | academics | 1 | sessions | subject_group_class_sections, subject_group_subjects, subject_timetable |
| `subject_groups1` | `id` | 0 | academics | 0 | — | — |
| `subject_syllabus` | `id` | 4 | academics | 4 | sessions, staff, topic | lesson_plan_forum |
| `subject_timetable` | `id` | 4953 | academics | 6 | classes, sections, sessions (+3) | student_subject_attendances |
| `subjects` | `id` | 30 | academics | 0 | — | cbse_exam_student_subject_rank, cbse_exam_timetable, exam_group_class_batch_exam_subjects (+4) |
| `submit_assignment` | `id` | 0 | unclassified | 2 | homework, students | — |
| `template_admitcards` | `id` | 4 | unclassified | 0 | — | — |
| `template_marksheets` | `id` | 2 | examinations | 0 | — | — |
| `topic` | `id` | 57 | academics | 2 | lesson, sessions | subject_syllabus |
| `transport_feemaster` | `id` | 0 | transport | 1 | sessions | student_transport_fees |
| `transport_route` | `id` | 24 | transport | 0 | — | route_pickup_point, vehicle_routes |
| `upload_contents` | `id` | 5 | unclassified | 2 | content_types, staff | share_upload_contents |
| `userlog` | `id` | 18553 | accounts | 1 | class_sections | — |
| `users` | `id` | 7251 | accounts | 0 | — | content_for, share_content_for |
| `users_authentication` | `id` | 665 | accounts | 0 | — | — |
| `vehicle_routes` | `id` | 1 | transport | 2 | transport_route, vehicles | student_session |
| `vehicles` | `id` | 1 | transport | 0 | — | vehicle_routes |
| `video_tutorial` | `id` | 0 | unclassified | 1 | staff | video_tutorial_class_sections |
| `video_tutorial_class_sections` | `id` | 0 | unclassified | 2 | class_sections, video_tutorial | — |
| `visitors_book` | `id` | 0 | front_office | 2 | staff, student_session | — |
| `visitors_purpose` | `id` | 1 | front_office | 0 | — | — |
| `zoom_settings` | `id` | 0 | communications | 0 | — | — |