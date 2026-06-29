-- School ERP frozen schema (structure only)
-- Generated from docs/db_current.sql

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

CREATE TABLE `alumni_events` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `event_for` varchar(100) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section` varchar(255) NOT NULL,
  `from_date` datetime NOT NULL,
  `to_date` datetime NOT NULL,
  `note` text NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `is_active` int(11) NOT NULL,
  `event_notification_message` text NOT NULL,
  `show_onwebsite` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `alumni_students` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `current_email` varchar(255) NOT NULL,
  `current_phone` varchar(255) NOT NULL,
  `occupation` text NOT NULL,
  `address` text NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `attendence_type` (
  `id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `key_value` varchar(50) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `aws_s3_settings` (
  `id` int(11) NOT NULL,
  `api_key` varchar(250) DEFAULT NULL,
  `api_secret` varchar(250) DEFAULT NULL,
  `bucket_name` varchar(250) DEFAULT NULL,
  `region` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `behaviour_settings` (
  `id` int(11) NOT NULL,
  `comment_option` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `book_title` varchar(100) NOT NULL,
  `book_no` varchar(50) NOT NULL,
  `isbn_no` varchar(100) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `claases` varchar(44) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `rack_no` varchar(100) NOT NULL,
  `publish` varchar(100) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `perunitcost` float(10,2) DEFAULT NULL,
  `postdate` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `available` varchar(10) DEFAULT 'yes',
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `duereturn_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `is_returned` int(11) DEFAULT 0,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `captcha` (
  `id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `status` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exams` (
  `id` int(11) NOT NULL,
  `total_working_days` int(11) DEFAULT 0,
  `cbse_term_id` int(11) DEFAULT NULL,
  `cbse_term_group_id` int(11) DEFAULT NULL,
  `cbse_exam_assessment_id` int(11) DEFAULT NULL,
  `cbse_exam_grade_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `exam_code` varchar(200) DEFAULT NULL,
  `session_id` int(11) NOT NULL,
  `description` mediumtext NOT NULL,
  `combined_ew` int(11) DEFAULT NULL,
  `is_publish` int(1) NOT NULL,
  `is_active` int(1) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `use_exam_roll_no` int(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `promote_class` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_assessments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_assessment_types` (
  `id` int(11) NOT NULL,
  `cbse_exam_assessment_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `maximum_marks` float NOT NULL,
  `pass_percentage` float NOT NULL,
  `description` mediumtext NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `scholastic_area` int(11) DEFAULT NULL,
  `is_for_grade` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_class_sections` (
  `id` int(11) NOT NULL,
  `cbse_exam_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_grades` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_grades_range` (
  `id` int(11) NOT NULL,
  `cbse_exam_grade_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `minimum_percentage` float NOT NULL,
  `maximum_percentage` float NOT NULL,
  `description` mediumtext NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_observations` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_students` (
  `id` int(11) NOT NULL,
  `cbse_exam_id` int(11) NOT NULL,
  `student_session_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `roll_no` varchar(20) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `total_present_days` int(11) DEFAULT NULL,
  `delete_student_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `room_number` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_student_subject_rank` (
  `id` int(11) NOT NULL,
  `cbse_template_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `rank_percentage` float(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_timetable` (
  `id` int(11) NOT NULL,
  `cbse_exam_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  `duration` int(11) NOT NULL,
  `room_no` varchar(255) NOT NULL,
  `is_written` int(1) NOT NULL DEFAULT 1,
  `written_maximum_marks` float NOT NULL,
  `is_practical` int(1) NOT NULL,
  `practical_maximum_mark` float DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `scholastic_area` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_timetable_assessment_types` (
  `id` int(11) NOT NULL,
  `cbse_exam_timetable_id` int(11) DEFAULT NULL,
  `cbse_exam_assessment_type_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_exam_timetable_grade` (
  `tg_id` int(11) NOT NULL,
  `cbse_exam_timetable_id` int(11) NOT NULL,
  `cbse_exam_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `grade_value` varchar(44) NOT NULL,
  `grade_min_per` int(11) NOT NULL,
  `grade_max_per` int(11) NOT NULL,
  `grade_desc` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cbse_marksheet_type` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `short_code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_observation_class_section` (
  `id` int(11) NOT NULL,
  `cbse_observation_parameter_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_observation_parameters` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_observation_subparameter` (
  `id` int(11) NOT NULL,
  `cbse_exam_observation_id` int(11) NOT NULL,
  `cbse_observation_parameter_id` int(11) NOT NULL,
  `maximum_marks` float NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_observation_terms` (
  `id` int(11) NOT NULL,
  `cbse_exam_observation_id` int(11) NOT NULL,
  `cbse_term_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_observation_term_student_subparameter` (
  `id` int(11) NOT NULL,
  `cbse_ovservation_term_id` int(11) DEFAULT NULL,
  `cbse_observation_subparameter_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `obtain_marks` float(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_student_exam_ranks` (
  `id` int(11) NOT NULL,
  `cbse_exam_id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `rank_percentage` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_student_subject_marks` (
  `id` int(11) NOT NULL,
  `cbse_exam_timetable_assessment_type_id` int(11) NOT NULL,
  `cbse_exam_timetable_id` int(11) DEFAULT NULL,
  `cbse_exam_student_id` int(11) DEFAULT NULL,
  `cbse_exam_assessment_type_id` int(11) DEFAULT NULL,
  `is_absent` int(1) NOT NULL DEFAULT 0,
  `marks` float(10,2) DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `marks_grade` varchar(44) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_student_subject_result` (
  `id` int(11) NOT NULL,
  `cbse_exam_timetable_id` int(11) DEFAULT NULL,
  `cbse_exam_student_id` int(11) DEFAULT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_student_template_rank` (
  `id` int(11) NOT NULL,
  `cbse_template_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `rank` int(20) DEFAULT NULL,
  `rank_percentage` float(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_template` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `orientation` varchar(1) NOT NULL DEFAULT 'P',
  `description` varchar(255) NOT NULL,
  `gradeexam_id` int(11) DEFAULT NULL,
  `remarkexam_id` int(11) DEFAULT NULL,
  `is_weightage` varchar(10) NOT NULL,
  `marksheet_type` varchar(50) NOT NULL,
  `created_by` int(11) NOT NULL,
  `header_image` varbinary(500) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `left_logo` varchar(200) DEFAULT NULL,
  `right_logo` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `session_id` int(11) NOT NULL,
  `left_sign` varchar(200) DEFAULT NULL,
  `middle_sign` varchar(200) DEFAULT NULL,
  `right_sign` varchar(200) DEFAULT NULL,
  `background_img` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `content_footer` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `is_name` int(1) DEFAULT 1,
  `is_father_name` int(1) DEFAULT 1,
  `is_mother_name` int(1) DEFAULT 1,
  `exam_session` int(1) DEFAULT 1,
  `is_admission_no` int(1) DEFAULT 1,
  `is_division` int(1) NOT NULL DEFAULT 1,
  `is_roll_no` int(1) DEFAULT 1,
  `is_photo` int(1) DEFAULT 1,
  `is_class` int(1) NOT NULL DEFAULT 0,
  `is_section` int(1) NOT NULL DEFAULT 0,
  `is_dob` int(1) DEFAULT 1,
  `is_remark` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_template_class_sections` (
  `id` int(11) NOT NULL,
  `cbse_template_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_template_terms` (
  `id` int(11) NOT NULL,
  `cbse_template_id` int(11) NOT NULL,
  `cbse_term_id` int(11) NOT NULL,
  `weightage` float NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_template_term_exams` (
  `id` int(11) NOT NULL,
  `cbse_template_term_id` int(11) DEFAULT NULL,
  `cbse_exam_id` int(11) NOT NULL,
  `cbse_template_id` int(11) NOT NULL,
  `weightage` float NOT NULL DEFAULT 100,
  `combined_weightage` int(11) DEFAULT NULL,
  `exclude_total` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cbse_terms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `term_code` varchar(100) NOT NULL,
  `description` mediumtext NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `certificate_name` varchar(100) NOT NULL,
  `certificate_text` text NOT NULL,
  `left_header` varchar(100) NOT NULL,
  `center_header` varchar(100) NOT NULL,
  `right_header` varchar(100) NOT NULL,
  `left_footer` varchar(100) NOT NULL,
  `right_footer` varchar(100) NOT NULL,
  `center_footer` varchar(100) NOT NULL,
  `background_image` varchar(100) DEFAULT NULL,
  `created_for` tinyint(1) NOT NULL COMMENT '1 = staff, 2 = students',
  `status` tinyint(1) NOT NULL,
  `header_height` int(11) NOT NULL,
  `content_height` int(11) NOT NULL,
  `footer_height` int(11) NOT NULL,
  `content_width` int(11) NOT NULL,
  `enable_student_image` tinyint(1) NOT NULL COMMENT '0=no,1=yes',
  `enable_image_height` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `chat_connections` (
  `id` int(11) NOT NULL,
  `chat_user_one` int(11) NOT NULL,
  `chat_user_two` int(11) NOT NULL,
  `ip` varchar(30) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `chat_user_id` int(11) NOT NULL,
  `ip` varchar(30) NOT NULL,
  `time` int(11) NOT NULL,
  `is_first` int(11) DEFAULT 0,
  `is_read` int(11) NOT NULL DEFAULT 0,
  `chat_connection_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `chat_users` (
  `id` int(11) NOT NULL,
  `user_type` varchar(20) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `create_staff_id` int(11) DEFAULT NULL,
  `create_student_id` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `class` varchar(60) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 9999,
  `is_hedu_program` varchar(10) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `class_sections` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `class_section_times` (
  `id` int(11) NOT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `class_teacher` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `complaint` (
  `id` int(11) NOT NULL,
  `complaint_type` varchar(255) NOT NULL,
  `source` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(15) NOT NULL,
  `email` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `action_taken` varchar(200) NOT NULL,
  `assigned` varchar(50) NOT NULL,
  `note` text NOT NULL,
  `image` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `complaint_type` (
  `id` int(11) NOT NULL,
  `complaint_type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `conferences` (
  `id` int(11) NOT NULL,
  `purpose` varchar(20) NOT NULL DEFAULT 'class',
  `staff_id` int(11) DEFAULT NULL,
  `created_id` int(10) NOT NULL,
  `title` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `subject` varchar(50) DEFAULT NULL,
  `class_id` int(10) DEFAULT NULL,
  `section_id` int(10) DEFAULT NULL,
  `session_id` int(10) NOT NULL,
  `host_video` int(1) NOT NULL DEFAULT 1,
  `client_video` int(1) NOT NULL DEFAULT 1,
  `description` varchar(50) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `return_response` text DEFAULT NULL,
  `api_type` varchar(30) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `conferences_history` (
  `id` int(11) NOT NULL,
  `conference_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `total_hit` int(10) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `conference_sections` (
  `id` int(11) NOT NULL,
  `conference_id` int(11) DEFAULT NULL,
  `cls_section_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `conference_staff` (
  `id` int(11) NOT NULL,
  `conference_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `contents` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_public` varchar(10) DEFAULT 'No',
  `class_id` int(11) DEFAULT NULL,
  `cls_sec_id` int(11) DEFAULT NULL,
  `file` varchar(250) DEFAULT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `content_for` (
  `id` int(11) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `content_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `content_types` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_category` (
  `id` int(11) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_lesson_quiz_order` (
  `id` int(11) NOT NULL,
  `type` varchar(10) DEFAULT NULL,
  `course_section_id` int(11) DEFAULT NULL,
  `lesson_quiz_id` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_progress` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(1) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `course_section_id` int(11) DEFAULT NULL,
  `lesson_quiz_id` int(11) DEFAULT NULL,
  `lesson_quiz_type` int(11) DEFAULT NULL COMMENT '1 lesson, 2 quiz'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_quiz_answer` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `course_quiz_id` int(11) DEFAULT NULL,
  `course_quiz_question_id` int(11) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_quiz_question` (
  `id` int(11) NOT NULL,
  `course_quiz_id` int(11) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `option_1` varchar(255) DEFAULT NULL,
  `option_2` varchar(255) DEFAULT NULL,
  `option_3` varchar(255) DEFAULT NULL,
  `option_4` varchar(255) DEFAULT NULL,
  `option_5` varchar(255) DEFAULT NULL,
  `correct_answer` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `course_rating` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `rating` varchar(200) NOT NULL,
  `review` text NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `currencies` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `short_name` varchar(100) DEFAULT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `base_price` varchar(10) NOT NULL DEFAULT '1',
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `custom_fields` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `belong_to` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `bs_column` int(11) DEFAULT NULL,
  `validation` int(11) DEFAULT 0,
  `field_values` text DEFAULT NULL,
  `show_table` varchar(100) DEFAULT NULL,
  `visible_on_table` int(11) NOT NULL,
  `weight` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `custom_field_values` (
  `id` int(11) NOT NULL,
  `belong_table_id` int(11) DEFAULT NULL,
  `custom_field_id` int(11) DEFAULT NULL,
  `field_value` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `cyc_additional_section_teacher` (
  `at_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `session_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_advance_exam_group` (
  `exam_group_id` int(11) NOT NULL,
  `group_title` varchar(255) NOT NULL,
  `group_code` varchar(255) NOT NULL,
  `group_description` text NOT NULL,
  `group_term` int(11) NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_biometric_events` (
  `id` int(11) NOT NULL,
  `link_to` varchar(44) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` varchar(44) NOT NULL,
  `event_card_id` varchar(255) NOT NULL,
  `event_timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_campaign` (
  `c_id` int(11) NOT NULL,
  `c_title` varchar(255) NOT NULL,
  `c_description` text NOT NULL,
  `c_date` date NOT NULL,
  `c_by` int(11) NOT NULL,
  `c_manager` int(11) NOT NULL,
  `c_manager_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`c_manager_data`)),
  `c_status` varchar(44) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_campaign_time` (
  `ct_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `type` varchar(44) NOT NULL,
  `duration` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_classes_grouping` (
  `cg_id` int(11) NOT NULL,
  `group_id` varchar(100) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `subject_group_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `session_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_class_coordinator` (
  `cc_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_entries` (
  `id` bigint(20) NOT NULL,
  `tag_id` bigint(20) DEFAULT NULL,
  `entrytype_id` bigint(20) NOT NULL,
  `number` bigint(20) DEFAULT NULL,
  `date` date NOT NULL,
  `dr_total` decimal(25,2) NOT NULL DEFAULT 0.00,
  `cr_total` decimal(25,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) NOT NULL,
  `transaction_id` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_entryitems` (
  `id` bigint(20) NOT NULL,
  `entry_id` bigint(20) NOT NULL,
  `ledger_id` bigint(20) NOT NULL,
  `amount` decimal(25,2) NOT NULL DEFAULT 0.00,
  `dc` char(1) NOT NULL,
  `reconciliation_date` date DEFAULT NULL,
  `narration` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_entrytypes` (
  `id` bigint(20) NOT NULL,
  `label` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `base_type` int(11) NOT NULL DEFAULT 0,
  `numbering` int(11) NOT NULL DEFAULT 1,
  `prefix` varchar(255) NOT NULL,
  `suffix` varchar(255) NOT NULL,
  `zero_padding` int(11) NOT NULL DEFAULT 0,
  `restriction_bankcash` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_fee_head_ledger` (
  `fhl_id` int(11) NOT NULL,
  `ledger_id` int(11) NOT NULL,
  `head_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_fuel_refill` (
  `fr_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `fuel_price` double NOT NULL,
  `fuel_quantity` double NOT NULL,
  `total_cost` double NOT NULL,
  `date` date NOT NULL,
  `entry_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_groups` (
  `id` bigint(20) NOT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `affects_gross` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_holiday` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_hostel_room_bed` (
  `id` int(11) NOT NULL,
  `hostel_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `room_number` varchar(44) NOT NULL,
  `bed_code` varchar(44) NOT NULL,
  `bed_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_leads` (
  `l_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `is_student_admitted` int(11) NOT NULL COMMENT '1 = yes, 0 = no',
  `student_id` int(11) DEFAULT NULL,
  `l_name` varchar(255) NOT NULL,
  `l_father_name` varchar(255) NOT NULL,
  `l_class` varchar(44) NOT NULL,
  `l_address` text NOT NULL,
  `l_phone_number` varchar(255) NOT NULL,
  `l_taken_status` int(11) NOT NULL DEFAULT 0 COMMENT '1 = yes, 0 = no',
  `taken_by` int(11) DEFAULT NULL,
  `current_agent` int(11) DEFAULT NULL,
  `l_reverse_status` int(11) NOT NULL DEFAULT 0 COMMENT '1 = yes, 0 = no',
  `l_taken_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `l_reverse_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `l_follow_up_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `l_status` varchar(255) NOT NULL DEFAULT 'Open',
  `is_closed` int(11) NOT NULL DEFAULT 0 COMMENT '1 = yes, 0 = no',
  `closed_date` date NOT NULL,
  `closed_by` int(11) DEFAULT NULL,
  `l_manager` int(11) NOT NULL,
  `l_manager_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`l_manager_data`)),
  `l_date` date NOT NULL,
  `l_mother_name` varchar(255) DEFAULT NULL,
  `l_location` varchar(255) DEFAULT NULL,
  `l_qualification` varchar(255) DEFAULT NULL,
  `l_alternative_phone` varchar(255) DEFAULT NULL,
  `l_email` varchar(255) DEFAULT NULL,
  `l_source` varchar(255) DEFAULT NULL,
  `l_resources` varchar(100) DEFAULT NULL,
  `individual_status` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_leads_counsellor` (
  `lc_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_leads_followup` (
  `f_id` int(11) NOT NULL,
  `c_id` int(11) DEFAULT NULL,
  `l_id` int(11) NOT NULL,
  `followup_date` date NOT NULL,
  `followup_time` time NOT NULL,
  `next_followup_date` date NOT NULL,
  `next_followup_time` time NOT NULL,
  `followup_remark` text NOT NULL,
  `call_status` varchar(44) NOT NULL,
  `followup_by` int(11) NOT NULL,
  `followup_status` int(11) DEFAULT 0,
  `followup_priority` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_leads_followup_status` (
  `fws_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_ledgers` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `op_balance` decimal(25,2) NOT NULL DEFAULT 0.00,
  `op_balance_dc` char(1) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `reconciliation` int(11) NOT NULL DEFAULT 0,
  `feetype_id` int(11) DEFAULT NULL,
  `fee_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fee_types`)),
  `is_link_to_transport_fee` int(11) NOT NULL,
  `income_head_id` int(11) DEFAULT NULL,
  `expenses_head_id` int(11) DEFAULT NULL,
  `is_link_to_payroll` int(11) DEFAULT NULL,
  `notes` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_logs` (
  `id` bigint(20) NOT NULL,
  `date` datetime NOT NULL,
  `level` int(11) NOT NULL,
  `host_ip` varchar(25) NOT NULL,
  `user_id` varchar(25) NOT NULL,
  `url` varchar(255) NOT NULL,
  `user_agent` varchar(300) NOT NULL,
  `message` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_ptm` (
  `ptm_id` int(11) NOT NULL,
  `ptm_title` text NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `remark` text NOT NULL,
  `host_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_ptm_attendance` (
  `ptma_id` int(11) NOT NULL,
  `ptm_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `feedback_score` int(11) NOT NULL,
  `feedback_remark` text NOT NULL,
  `parents_complain` text NOT NULL,
  `special_case` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_ptm_schedule` (
  `ptms_id` int(11) NOT NULL,
  `ptm_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_from` varchar(44) NOT NULL,
  `time_to` varchar(44) NOT NULL,
  `room` int(11) NOT NULL,
  `remark` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_scheme_and_scholarship` (
  `ss_id` int(11) NOT NULL,
  `ss_name` varchar(255) NOT NULL,
  `ss_type` varchar(255) NOT NULL,
  `ss_applicable_on` varchar(255) NOT NULL,
  `ss_status` int(11) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  `created_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_scheme_and_scholarship_feetype` (
  `ssvft_id` int(11) NOT NULL,
  `ss_id` int(11) NOT NULL,
  `feetype_id` int(11) NOT NULL,
  `ssvft_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_scheme_and_scholarship_student` (
  `sss_id` int(11) NOT NULL,
  `ss_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `applied_on` date NOT NULL,
  `applied_by` int(11) NOT NULL,
  `applied_status` int(11) NOT NULL COMMENT '0 = pending, 1 = approved, 2 = rejected'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_scheme_and_scholarship_value` (
  `ssv_id` int(11) NOT NULL,
  `ss_id` int(11) NOT NULL,
  `fee_concession_type` varchar(255) NOT NULL,
  `fee_concession` float NOT NULL,
  `applicable_class` int(11) DEFAULT NULL,
  `ssv_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_staff_payroll` (
  `id` int(11) NOT NULL,
  `employee_id` double DEFAULT NULL,
  `payroll_type` varchar(44) NOT NULL,
  `payroll_title` varchar(255) NOT NULL,
  `payroll_amount` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_staff_payroll_increment` (
  `pi_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `month` varchar(44) DEFAULT NULL,
  `year` varchar(44) DEFAULT NULL,
  `basic_salary` double NOT NULL,
  `increment` double NOT NULL,
  `date` date NOT NULL,
  `entry_by` int(11) NOT NULL,
  `status` varchar(44) NOT NULL DEFAULT 'pending',
  `action_by` int(11) NOT NULL,
  `action_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_student_addon_fee` (
  `af_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `amount` double NOT NULL,
  `remark` text NOT NULL,
  `date` date NOT NULL,
  `entry_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_tags` (
  `id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `color` char(6) NOT NULL,
  `background` char(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cyc_vehicle_parts_info` (
  `vp_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `battery_number` varchar(255) NOT NULL,
  `battery_amp` varchar(255) NOT NULL,
  `battery_warranty` date NOT NULL,
  `tyre_number` varchar(255) NOT NULL,
  `tyre_size` varchar(255) NOT NULL,
  `tool_box` varchar(255) NOT NULL,
  `cctv` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_vehicle_rto_info` (
  `vr_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `permit_number` varchar(255) NOT NULL,
  `permit_upto` date NOT NULL,
  `fitness_upto` date NOT NULL,
  `road_tax_upto` date NOT NULL,
  `insurance_company` varchar(255) NOT NULL,
  `insurance_upto` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cyc_vehicle_services` (
  `srv_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `vendor` varchar(255) NOT NULL,
  `service_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`service_details`)),
  `total_cost` double NOT NULL,
  `date` date NOT NULL,
  `entry_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cy_ptm_time_slot` (
  `pts_id` int(11) NOT NULL,
  `ptm_id` int(11) NOT NULL,
  `time_from` varchar(44) NOT NULL,
  `time_to` varchar(44) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cy_vehicle_ticket` (
  `vt_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `ticket_type` varchar(44) NOT NULL,
  `ticket_description` text NOT NULL,
  `ticket_date` date NOT NULL,
  `ticket_by` int(11) NOT NULL,
  `ticket_status` varchar(44) NOT NULL,
  `ticket_updates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `daily_assignment` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) NOT NULL,
  `subject_group_subject_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `evaluated_by` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `remark` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `department_name` varchar(200) NOT NULL,
  `is_active` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `disable_reason` (
  `id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `dispatch_receive` (
  `id` int(11) NOT NULL,
  `reference_no` varchar(50) NOT NULL,
  `to_title` varchar(100) NOT NULL,
  `type` varchar(10) NOT NULL,
  `address` varchar(500) NOT NULL,
  `note` varchar(500) NOT NULL,
  `from_title` varchar(200) NOT NULL,
  `date` date DEFAULT NULL,
  `image` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `email_attachments` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `directory` varchar(255) NOT NULL,
  `attachment` varchar(255) NOT NULL,
  `attachment_name` varchar(200) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `email_config` (
  `id` int(10) UNSIGNED NOT NULL,
  `email_type` varchar(100) DEFAULT NULL,
  `smtp_server` varchar(100) DEFAULT NULL,
  `smtp_port` varchar(100) DEFAULT NULL,
  `smtp_username` varchar(100) DEFAULT NULL,
  `smtp_password` varchar(100) DEFAULT NULL,
  `ssl_tls` varchar(100) DEFAULT NULL,
  `smtp_auth` varchar(10) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `email_template` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `email_template_attachment` (
  `id` int(11) NOT NULL,
  `email_template_id` int(11) NOT NULL,
  `attachment` varchar(100) NOT NULL,
  `attachment_name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `enquiry` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `reference` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(500) NOT NULL,
  `follow_up_date` date NOT NULL,
  `note` text NOT NULL,
  `source` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `assigned` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `no_of_child` varchar(11) DEFAULT NULL,
  `status` varchar(100) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `referral_staff` varchar(44) DEFAULT NULL,
  `is_converted_to_admission` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `enquiry_type` (
  `id` int(11) NOT NULL,
  `enquiry_type` varchar(100) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `event_title` varchar(200) NOT NULL,
  `event_description` text NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_color` varchar(200) NOT NULL,
  `event_for` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `is_active` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `sesion_id` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `exam_type` varchar(250) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_class_batch_exams` (
  `id` int(11) NOT NULL,
  `exam` varchar(250) DEFAULT NULL,
  `passing_percentage` float(10,2) DEFAULT NULL,
  `session_id` int(11) NOT NULL,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `exam_group_id` int(11) DEFAULT NULL,
  `use_exam_roll_no` int(11) NOT NULL DEFAULT 1,
  `is_publish` int(11) DEFAULT 0,
  `is_rank_generated` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_class_batch_exam_students` (
  `id` int(11) NOT NULL,
  `exam_group_class_batch_exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_session_id` int(11) NOT NULL,
  `roll_no` int(11) DEFAULT NULL,
  `teacher_remark` text DEFAULT NULL,
  `rank` int(11) NOT NULL DEFAULT 0,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_class_batch_exam_subjects` (
  `id` int(11) NOT NULL,
  `exam_group_class_batch_exams_id` int(11) DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `date_from` date NOT NULL,
  `time_from` time NOT NULL,
  `duration` varchar(50) NOT NULL,
  `room_no` varchar(100) DEFAULT NULL,
  `max_marks` float(10,2) DEFAULT NULL,
  `min_marks` float(10,2) DEFAULT NULL,
  `credit_hours` float(10,2) DEFAULT 0.00,
  `date_to` datetime DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_exam_connections` (
  `id` int(11) NOT NULL,
  `exam_group_id` int(11) DEFAULT NULL,
  `exam_group_class_batch_exams_id` int(11) DEFAULT NULL,
  `exam_weightage` float(10,2) DEFAULT 0.00,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_exam_results` (
  `id` int(11) NOT NULL,
  `exam_group_class_batch_exam_student_id` int(11) NOT NULL,
  `exam_group_class_batch_exam_subject_id` int(11) DEFAULT NULL,
  `exam_group_student_id` int(11) DEFAULT NULL,
  `attendence` varchar(10) DEFAULT NULL,
  `get_marks` float(10,2) DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_group_students` (
  `id` int(11) NOT NULL,
  `exam_group_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `exam_schedules` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `teacher_subject_id` int(11) DEFAULT NULL,
  `date_of_exam` date DEFAULT NULL,
  `start_to` varchar(50) DEFAULT NULL,
  `end_from` varchar(50) DEFAULT NULL,
  `room_no` varchar(50) DEFAULT NULL,
  `full_marks` int(11) DEFAULT NULL,
  `passing_marks` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `exp_head_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `invoice_no` varchar(200) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `amount` float(10,2) DEFAULT NULL,
  `documents` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'yes',
  `is_deleted` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `expense_head` (
  `id` int(11) NOT NULL,
  `exp_category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'yes',
  `is_deleted` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `face_authentication` (
  `fa_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `image` text NOT NULL,
  `belong_to` varchar(44) NOT NULL,
  `face_features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`face_features`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feemasters` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `feetype_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `amount` float(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fees_discounts` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(100) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `percentage` float(10,2) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fees_reminder` (
  `id` int(11) NOT NULL,
  `reminder_type` varchar(10) DEFAULT NULL,
  `day` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `feetype` (
  `id` int(11) NOT NULL,
  `is_system` int(11) NOT NULL DEFAULT 0,
  `feecategory_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `code` varchar(100) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fee_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `is_system` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fee_groups_feetype` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `fee_session_group_id` int(11) DEFAULT NULL,
  `fee_groups_id` int(11) DEFAULT NULL,
  `feetype_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `fine_type` varchar(50) NOT NULL DEFAULT 'none',
  `due_date` date DEFAULT NULL,
  `fine_percentage` float(10,2) NOT NULL DEFAULT 0.00,
  `fine_amount` float(10,2) NOT NULL DEFAULT 0.00,
  `collection_type` int(11) NOT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fee_receipt_no` (
  `id` int(11) NOT NULL,
  `payment` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `fee_session_groups` (
  `id` int(11) NOT NULL,
  `fee_groups_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `class_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `filetypes` (
  `id` int(11) NOT NULL,
  `file_extension` text DEFAULT NULL,
  `file_mime` text DEFAULT NULL,
  `file_size` int(11) NOT NULL,
  `image_extension` text DEFAULT NULL,
  `image_mime` text DEFAULT NULL,
  `image_size` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `follow_up` (
  `id` int(11) NOT NULL,
  `enquiry_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `next_date` date NOT NULL,
  `response` text NOT NULL,
  `note` text NOT NULL,
  `followup_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_media_gallery` (
  `id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `image` varchar(300) DEFAULT NULL,
  `thumb_path` varchar(300) DEFAULT NULL,
  `dir_path` varchar(300) DEFAULT NULL,
  `img_name` varchar(300) DEFAULT NULL,
  `thumb_name` varchar(300) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `file_type` varchar(100) NOT NULL,
  `file_size` varchar(100) NOT NULL,
  `vid_url` text NOT NULL,
  `vid_title` varchar(250) NOT NULL,
  `is_it_award` int(11) NOT NULL,
  `is_it_form` int(11) NOT NULL,
  `is_it_notice` int(11) NOT NULL,
  `is_it_order` int(11) NOT NULL,
  `is_it_report` int(11) NOT NULL,
  `content_description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_menus` (
  `id` int(11) NOT NULL,
  `menu` varchar(100) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `open_new_tab` int(11) NOT NULL DEFAULT 0,
  `ext_url` text NOT NULL,
  `ext_url_link` text NOT NULL,
  `publish` int(11) NOT NULL DEFAULT 0,
  `content_type` varchar(10) NOT NULL DEFAULT 'manual',
  `is_active` varchar(10) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_menu_items` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `menu` varchar(100) DEFAULT NULL,
  `page_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `ext_url` text DEFAULT NULL,
  `open_new_tab` int(11) DEFAULT 0,
  `ext_url_link` text DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `publish` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` varchar(10) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_pages` (
  `id` int(11) NOT NULL,
  `page_type` varchar(10) NOT NULL DEFAULT 'manual',
  `is_homepage` int(11) DEFAULT 0,
  `title` varchar(250) DEFAULT NULL,
  `url` varchar(250) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keyword` text DEFAULT NULL,
  `feature_image` varchar(200) NOT NULL,
  `description` longtext DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `publish` int(11) DEFAULT 0,
  `sidebar` int(11) DEFAULT 0,
  `is_active` varchar(10) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_page_contents` (
  `id` int(11) NOT NULL,
  `page_id` int(11) DEFAULT NULL,
  `content_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_programs` (
  `id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `event_start` date DEFAULT NULL,
  `event_end` date DEFAULT NULL,
  `event_venue` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(10) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `meta_title` text NOT NULL,
  `meta_description` text NOT NULL,
  `meta_keyword` text NOT NULL,
  `feature_image` text NOT NULL,
  `publish_date` date DEFAULT NULL,
  `publish` varchar(10) DEFAULT '0',
  `sidebar` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_program_photos` (
  `id` int(11) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `media_gallery_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `front_cms_settings` (
  `id` int(11) NOT NULL,
  `theme` varchar(50) DEFAULT NULL,
  `is_active_rtl` int(11) DEFAULT 0,
  `is_active_front_cms` int(11) DEFAULT 0,
  `is_active_sidebar` int(11) DEFAULT 0,
  `logo` varchar(200) DEFAULT NULL,
  `contact_us_email` varchar(100) DEFAULT NULL,
  `complain_form_email` varchar(100) DEFAULT NULL,
  `sidebar_options` text NOT NULL,
  `whatsapp_url` varchar(255) NOT NULL,
  `fb_url` varchar(200) NOT NULL,
  `twitter_url` varchar(200) NOT NULL,
  `youtube_url` varchar(200) NOT NULL,
  `google_plus` varchar(200) NOT NULL,
  `instagram_url` varchar(200) NOT NULL,
  `pinterest_url` varchar(200) NOT NULL,
  `linkedin_url` varchar(200) NOT NULL,
  `google_analytics` text DEFAULT NULL,
  `footer_text` varchar(500) DEFAULT NULL,
  `cookie_consent` varchar(255) NOT NULL,
  `fav_icon` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gateway_ins` (
  `id` int(11) NOT NULL,
  `online_admission_id` int(11) DEFAULT NULL,
  `gateway_name` varchar(50) NOT NULL,
  `module_type` varchar(255) NOT NULL,
  `unique_id` varchar(255) NOT NULL,
  `parameter_details` mediumtext NOT NULL,
  `payment_status` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gateway_ins_response` (
  `id` int(11) NOT NULL,
  `gateway_ins_id` int(11) DEFAULT NULL,
  `posted_data` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `general_calls` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(12) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(500) NOT NULL,
  `follow_up_date` date NOT NULL,
  `call_duration` varchar(50) NOT NULL,
  `note` text NOT NULL,
  `call_type` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `geofences` (
  `geo_id` int(11) NOT NULL,
  `geo_name` varchar(128) NOT NULL,
  `geo_description` varchar(128) DEFAULT NULL,
  `geo_area` varchar(4096) NOT NULL,
  `geo_vehicles` varchar(256) NOT NULL,
  `geo_createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `geo_modifieddate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `geofence_events` (
  `ge_id` int(11) NOT NULL,
  `ge_v_id` varchar(11) NOT NULL,
  `ge_geo_id` varchar(11) NOT NULL,
  `ge_event` varchar(256) NOT NULL,
  `ge_timestamp` varchar(100) NOT NULL,
  `ge_created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `gmeet` (
  `id` int(11) NOT NULL,
  `purpose` varchar(20) NOT NULL DEFAULT 'class',
  `staff_id` int(11) DEFAULT NULL,
  `created_id` int(11) NOT NULL,
  `title` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'manual',
  `api_data` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `subject` varchar(50) DEFAULT NULL,
  `url` text NOT NULL,
  `session_id` int(11) NOT NULL,
  `description` varchar(50) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gmeet_history` (
  `id` int(11) NOT NULL,
  `gmeet_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `total_hit` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gmeet_sections` (
  `id` int(11) NOT NULL,
  `gmeet_id` int(11) NOT NULL,
  `cls_section_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gmeet_settings` (
  `id` int(11) NOT NULL,
  `api_key` varchar(200) DEFAULT NULL,
  `api_secret` varchar(200) DEFAULT NULL,
  `use_api` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `gmeet_staff` (
  `id` int(11) NOT NULL,
  `gmeet_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `exam_type` varchar(250) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `point` float(10,1) DEFAULT NULL,
  `mark_from` float(10,2) DEFAULT NULL,
  `mark_upto` float(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `guest` (
  `id` int(11) NOT NULL,
  `guest_name` varchar(200) NOT NULL,
  `guest_unique_id` varchar(200) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `mobileno` varchar(100) NOT NULL,
  `password` varchar(200) NOT NULL,
  `dob` varchar(200) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `note` text NOT NULL,
  `address` varchar(200) NOT NULL,
  `guest_image` varchar(200) NOT NULL,
  `verification_code` varchar(200) NOT NULL,
  `created_at` date NOT NULL,
  `is_active` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `homework` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `subject_group_subject_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `homework_date` date NOT NULL,
  `submit_date` date NOT NULL,
  `marks` float(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `assigned_to_house` int(11) DEFAULT NULL,
  `assigned_to_president` int(11) DEFAULT NULL,
  `create_date` date NOT NULL,
  `evaluation_date` date DEFAULT NULL,
  `document` varchar(200) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `evaluated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `homework_evaluation` (
  `id` int(11) NOT NULL,
  `homework_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `marks` float(10,2) DEFAULT NULL,
  `note` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `hostel` (
  `id` int(11) NOT NULL,
  `hostel_name` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `intake` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `hostel_incharge` varchar(44) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `meal_type` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `hostel_rooms` (
  `id` int(11) NOT NULL,
  `hostel_id` int(11) DEFAULT NULL,
  `room_type_id` int(11) DEFAULT NULL,
  `room_no` varchar(200) DEFAULT NULL,
  `no_of_bed` int(11) DEFAULT NULL,
  `cost_per_bed` float(10,2) DEFAULT 0.00,
  `cost_term` varchar(44) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `fee_title` varchar(44) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `id_card` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `school_name` varchar(100) NOT NULL,
  `school_address` varchar(500) NOT NULL,
  `background` varchar(100) NOT NULL,
  `logo` varchar(100) NOT NULL,
  `sign_image` varchar(100) NOT NULL,
  `enable_vertical_card` int(11) NOT NULL DEFAULT 0,
  `header_color` varchar(100) NOT NULL,
  `enable_admission_no` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_student_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_class` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_fathers_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_mothers_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_address` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_phone` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_dob` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_blood_group` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_student_barcode` tinyint(4) NOT NULL DEFAULT 1 COMMENT '0=disable,1=enable',
  `status` tinyint(1) NOT NULL COMMENT '0=disable,1=enable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `income` (
  `id` int(11) NOT NULL,
  `income_head_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `invoice_no` varchar(200) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `amount` float(10,2) DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'yes',
  `documents` varchar(255) DEFAULT NULL,
  `is_deleted` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `income_head` (
  `id` int(11) NOT NULL,
  `income_category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` varchar(255) NOT NULL DEFAULT 'yes',
  `is_deleted` varchar(255) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item` (
  `id` int(11) NOT NULL,
  `item_category_id` int(11) DEFAULT NULL,
  `item_store_id` int(11) DEFAULT NULL,
  `item_supplier_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(100) NOT NULL,
  `item_photo` varchar(225) DEFAULT NULL,
  `description` text NOT NULL,
  `quantity` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item_category` (
  `id` int(11) NOT NULL,
  `item_category` varchar(255) NOT NULL,
  `is_active` varchar(255) NOT NULL DEFAULT 'yes',
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item_issue` (
  `id` int(11) NOT NULL,
  `issue_type` varchar(15) DEFAULT NULL,
  `issue_to` int(11) NOT NULL,
  `issue_by` int(11) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `item_category_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `issue_category` varchar(44) NOT NULL,
  `note` text NOT NULL,
  `is_returned` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` varchar(10) DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item_stock` (
  `id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `store_id` int(11) DEFAULT NULL,
  `symbol` varchar(10) NOT NULL DEFAULT '+',
  `quantity` int(11) DEFAULT NULL,
  `purchase_price` float(10,2) NOT NULL,
  `date` date NOT NULL,
  `attachment` varchar(250) DEFAULT NULL,
  `description` text NOT NULL,
  `is_active` varchar(10) DEFAULT 'yes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item_store` (
  `id` int(11) NOT NULL,
  `item_store` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `item_supplier` (
  `id` int(11) NOT NULL,
  `item_supplier` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `contact_person_name` varchar(255) NOT NULL,
  `contact_person_phone` varchar(255) NOT NULL,
  `contact_person_email` varchar(255) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `languages` (
  `id` int(11) NOT NULL,
  `language` varchar(50) DEFAULT NULL,
  `short_code` varchar(255) NOT NULL,
  `country_code` varchar(255) NOT NULL,
  `is_rtl` int(11) NOT NULL,
  `is_deleted` varchar(10) NOT NULL DEFAULT 'yes',
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `type` varchar(200) NOT NULL,
  `is_active` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `lesson` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `subject_group_subject_id` int(11) NOT NULL,
  `subject_group_class_sections_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `lesson_plan_forum` (
  `id` int(11) NOT NULL,
  `subject_syllabus_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL COMMENT 'staff,student',
  `staff_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `created_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `libarary_members` (
  `id` int(11) NOT NULL,
  `library_card_no` varchar(50) DEFAULT NULL,
  `member_type` varchar(50) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `record_id` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `agent` varchar(50) DEFAULT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `mark_divisions` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `percentage_from` float(10,2) DEFAULT NULL,
  `percentage_to` float(10,2) DEFAULT NULL,
  `is_active` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `template_id` varchar(100) DEFAULT NULL,
  `email_template_id` int(11) DEFAULT NULL,
  `sms_template_id` int(11) DEFAULT NULL,
  `send_through` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `send_mail` varchar(10) DEFAULT '0',
  `send_sms` varchar(10) DEFAULT '0',
  `is_group` varchar(10) DEFAULT '0',
  `is_individual` varchar(10) DEFAULT '0',
  `is_class` int(11) NOT NULL DEFAULT 0,
  `is_schedule` int(11) NOT NULL,
  `sent` int(11) DEFAULT NULL,
  `schedule_date_time` datetime DEFAULT NULL,
  `group_list` text DEFAULT NULL,
  `user_list` text DEFAULT NULL,
  `schedule_class` int(11) DEFAULT NULL,
  `schedule_section` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `migrations` (
  `version` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `multi_branch` (
  `id` int(11) NOT NULL,
  `branch_name` varchar(200) DEFAULT NULL,
  `branch_url` varchar(500) NOT NULL,
  `hostname` varchar(200) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `database_name` varchar(200) DEFAULT NULL,
  `directory_path` varchar(500) DEFAULT NULL,
  `is_verified` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `notification_roles` (
  `id` int(11) NOT NULL,
  `send_notification_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `notification_setting` (
  `id` int(11) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `is_mail` varchar(10) DEFAULT '0',
  `is_sms` varchar(10) DEFAULT '0',
  `is_notification` int(11) NOT NULL DEFAULT 0,
  `display_notification` int(11) NOT NULL DEFAULT 0,
  `display_sms` int(11) NOT NULL DEFAULT 1,
  `is_student_recipient` int(11) DEFAULT NULL,
  `is_guardian_recipient` int(11) DEFAULT NULL,
  `is_staff_recipient` int(11) DEFAULT NULL,
  `display_student_recipient` int(11) DEFAULT NULL,
  `display_guardian_recipient` int(11) DEFAULT NULL,
  `display_staff_recipient` int(11) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `template_id` varchar(100) NOT NULL,
  `template` longtext NOT NULL,
  `variables` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `offline_fees_payments` (
  `id` int(11) NOT NULL,
  `invoice_id` varchar(50) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `student_fees_master_id` int(11) DEFAULT NULL,
  `fee_groups_feetype_id` int(11) DEFAULT NULL,
  `student_transport_fee_id` int(11) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `bank_from` varchar(200) DEFAULT NULL,
  `bank_account_transferred` varchar(200) DEFAULT NULL,
  `reference` varchar(200) DEFAULT NULL,
  `amount` float(10,2) DEFAULT NULL,
  `submit_date` datetime DEFAULT NULL,
  `approve_date` datetime DEFAULT NULL,
  `attachment` text DEFAULT NULL,
  `reply` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `is_active` varchar(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `alt_mobile_no` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `onlineexam` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `exam` text DEFAULT NULL,
  `attempt` int(11) NOT NULL,
  `exam_from` datetime DEFAULT NULL,
  `exam_to` datetime DEFAULT NULL,
  `is_quiz` int(11) NOT NULL DEFAULT 0,
  `auto_publish_date` datetime DEFAULT NULL,
  `time_from` time DEFAULT NULL,
  `time_to` time DEFAULT NULL,
  `duration` time NOT NULL,
  `passing_percentage` float NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `publish_result` int(11) NOT NULL DEFAULT 0,
  `answer_word_count` int(11) NOT NULL DEFAULT -1,
  `is_active` varchar(1) DEFAULT '0',
  `is_marks_display` int(11) NOT NULL DEFAULT 0,
  `is_neg_marking` int(11) NOT NULL DEFAULT 0,
  `is_random_question` int(11) NOT NULL DEFAULT 0,
  `is_rank_generated` int(11) NOT NULL DEFAULT 0,
  `publish_exam_notification` int(11) NOT NULL,
  `publish_result_notification` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `onlineexam_attempts` (
  `id` int(11) NOT NULL,
  `onlineexam_student_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `onlineexam_questions` (
  `id` int(11) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `onlineexam_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `marks` float(10,2) NOT NULL DEFAULT 0.00,
  `neg_marks` float(10,2) DEFAULT 0.00,
  `is_active` varchar(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `onlineexam_students` (
  `id` int(11) NOT NULL,
  `onlineexam_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `is_attempted` int(11) NOT NULL DEFAULT 0,
  `rank` int(11) DEFAULT 0,
  `quiz_attempted` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `onlineexam_student_results` (
  `id` int(11) NOT NULL,
  `onlineexam_student_id` int(11) NOT NULL,
  `onlineexam_question_id` int(11) NOT NULL,
  `select_option` longtext DEFAULT NULL,
  `marks` float(10,2) NOT NULL DEFAULT 0.00,
  `remark` text DEFAULT NULL,
  `attachment_name` text DEFAULT NULL,
  `attachment_upload_name` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_admissions` (
  `id` int(11) NOT NULL,
  `admission_no` varchar(100) DEFAULT NULL,
  `roll_no` varchar(100) DEFAULT NULL,
  `reference_no` varchar(50) NOT NULL,
  `admission_date` date DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `middlename` varchar(255) NOT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `rte` varchar(20) NOT NULL DEFAULT 'No',
  `image` varchar(255) DEFAULT NULL,
  `mobileno` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `cast` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `route_id` int(11) NOT NULL,
  `school_house_id` int(11) DEFAULT NULL,
  `blood_group` varchar(200) NOT NULL,
  `vehroute_id` int(11) NOT NULL,
  `hostel_room_id` int(11) DEFAULT NULL,
  `adhar_no` varchar(100) DEFAULT NULL,
  `samagra_id` varchar(100) DEFAULT NULL,
  `bank_account_no` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(100) DEFAULT NULL,
  `guardian_is` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `father_phone` varchar(100) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `mother_phone` varchar(100) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `guardian_relation` varchar(100) DEFAULT NULL,
  `guardian_phone` varchar(100) DEFAULT NULL,
  `guardian_occupation` varchar(150) NOT NULL,
  `guardian_address` text DEFAULT NULL,
  `guardian_email` varchar(100) NOT NULL,
  `father_pic` varchar(255) NOT NULL,
  `mother_pic` varchar(255) NOT NULL,
  `guardian_pic` varchar(255) NOT NULL,
  `is_enroll` int(11) DEFAULT 0,
  `previous_school` text DEFAULT NULL,
  `height` varchar(100) NOT NULL,
  `weight` varchar(100) NOT NULL,
  `note` text NOT NULL,
  `form_status` int(11) NOT NULL,
  `paid_status` int(11) NOT NULL,
  `measurement_date` date DEFAULT NULL,
  `app_key` text DEFAULT NULL,
  `document` text DEFAULT NULL,
  `submit_date` date DEFAULT NULL,
  `disable_at` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_admission_custom_field_value` (
  `id` int(11) NOT NULL,
  `belong_table_id` int(11) DEFAULT NULL,
  `custom_field_id` int(11) DEFAULT NULL,
  `field_value` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_admission_fields` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_admission_payment` (
  `id` int(11) NOT NULL,
  `online_admission_id` int(11) NOT NULL,
  `paid_amount` float(10,2) NOT NULL,
  `payment_mode` varchar(50) NOT NULL,
  `payment_type` varchar(100) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `note` varchar(100) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(200) NOT NULL,
  `url` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `outcomes` text DEFAULT NULL,
  `course_thumbnail` varchar(100) DEFAULT NULL,
  `course_provider` varchar(100) DEFAULT NULL,
  `course_url` varchar(255) DEFAULT NULL,
  `video_id` text DEFAULT NULL,
  `price` float(10,2) NOT NULL DEFAULT 0.00,
  `discount` float(10,2) NOT NULL DEFAULT 0.00,
  `free_course` tinyint(1) DEFAULT NULL COMMENT '0=paid,1=free',
  `view_count` int(11) DEFAULT NULL,
  `front_side_visibility` varchar(10) NOT NULL DEFAULT 'yes',
  `status` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp(),
  `updated_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_class_sections` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_lesson` (
  `id` int(11) NOT NULL,
  `course_section_id` int(11) DEFAULT NULL,
  `lesson_title` varchar(255) DEFAULT NULL,
  `lesson_type` varchar(20) DEFAULT NULL,
  `thumbnail` varchar(100) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `attachment` varchar(200) DEFAULT NULL,
  `video_provider` varchar(20) DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `video_id` varchar(50) DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_payment` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `online_courses_id` int(11) DEFAULT NULL,
  `course_name` varchar(255) DEFAULT NULL,
  `actual_price` float(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` float(10,2) NOT NULL DEFAULT 0.00,
  `payment_mode` varchar(50) DEFAULT NULL,
  `payment_type` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_processing_payment` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `online_courses_id` int(11) DEFAULT NULL,
  `course_name` varchar(255) DEFAULT NULL,
  `actual_price` float(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` float(10,2) NOT NULL DEFAULT 0.00,
  `payment_mode` varchar(50) DEFAULT NULL,
  `payment_type` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `gateway_ins_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_quiz` (
  `id` int(11) NOT NULL,
  `course_section_id` int(11) DEFAULT NULL,
  `quiz_title` varchar(255) DEFAULT NULL,
  `quiz_instruction` text DEFAULT NULL,
  `created_by` int(10) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_section` (
  `id` int(11) NOT NULL,
  `online_course_id` int(11) DEFAULT NULL,
  `section_title` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `online_course_settings` (
  `id` int(11) NOT NULL,
  `guest_prefix` varchar(50) NOT NULL,
  `guest_id_start_from` int(11) NOT NULL,
  `guest_login` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `payment_settings` (
  `id` int(11) NOT NULL,
  `payment_type` varchar(200) NOT NULL,
  `api_username` varchar(200) DEFAULT NULL,
  `api_secret_key` varchar(200) NOT NULL,
  `salt` varchar(200) NOT NULL,
  `api_publishable_key` varchar(200) NOT NULL,
  `api_password` varchar(200) DEFAULT NULL,
  `api_signature` varchar(200) DEFAULT NULL,
  `api_email` varchar(200) DEFAULT NULL,
  `paypal_demo` varchar(100) NOT NULL,
  `account_no` varchar(200) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `gateway_mode` int(11) NOT NULL COMMENT '0 Testing, 1 live',
  `paytm_website` varchar(255) NOT NULL,
  `paytm_industrytype` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `payslip_allowance` (
  `id` int(11) NOT NULL,
  `payslip_id` int(11) NOT NULL,
  `allowance_type` varchar(200) NOT NULL,
  `amount` float NOT NULL,
  `staff_id` int(11) NOT NULL,
  `cal_type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `permission_category` (
  `id` int(11) NOT NULL,
  `perm_group_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `short_code` varchar(100) DEFAULT NULL,
  `enable_view` int(11) DEFAULT 0,
  `enable_add` int(11) DEFAULT 0,
  `enable_edit` int(11) DEFAULT 0,
  `enable_delete` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `permission_group` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `short_code` varchar(100) NOT NULL,
  `is_active` int(11) DEFAULT 0,
  `system` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `permission_student` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `short_code` varchar(100) NOT NULL,
  `system` int(11) NOT NULL,
  `student` int(11) NOT NULL,
  `parent` int(11) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `pickup_point` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `latitude` varchar(100) DEFAULT NULL,
  `longitude` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `v_id` int(11) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `altitude` double DEFAULT NULL,
  `speed` double DEFAULT NULL,
  `bearing` double DEFAULT NULL,
  `accuracy` int(11) DEFAULT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `traccar_pos_id` varchar(100) DEFAULT NULL,
  `battery_level` varchar(100) DEFAULT NULL,
  `motion` varchar(256) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `print_headerfooter` (
  `id` int(11) NOT NULL,
  `print_type` varchar(255) NOT NULL,
  `header_image` varchar(255) NOT NULL,
  `footer_content` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `qr_code_settings` (
  `id` int(11) NOT NULL,
  `camera_type` varchar(15) DEFAULT NULL,
  `auto_attendance` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `lesson_name` varchar(255) DEFAULT NULL,
  `question_type` varchar(100) NOT NULL,
  `level` varchar(10) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `question_parts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`question_parts`)),
  `question` text DEFAULT NULL,
  `opt_a` text DEFAULT NULL,
  `opt_b` text DEFAULT NULL,
  `opt_c` text DEFAULT NULL,
  `opt_d` text DEFAULT NULL,
  `opt_e` text DEFAULT NULL,
  `correct` text DEFAULT NULL,
  `qscore` int(11) DEFAULT NULL,
  `descriptive_word_limit` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `qpart_1` int(11) NOT NULL,
  `qpart_2` int(11) NOT NULL,
  `qpart_3` int(11) NOT NULL,
  `qpart_4` int(11) NOT NULL,
  `qpart_5` int(11) NOT NULL,
  `is_it_offline` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `read_notification` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `notification_id` int(11) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `reference` (
  `id` int(11) NOT NULL,
  `reference` varchar(100) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `slug` varchar(150) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `is_system` int(11) NOT NULL DEFAULT 0,
  `is_superadmin` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `roles_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `perm_cat_id` int(11) DEFAULT NULL,
  `can_view` int(11) DEFAULT NULL,
  `can_add` int(11) DEFAULT NULL,
  `can_edit` int(11) DEFAULT NULL,
  `can_delete` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_central` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `room_types` (
  `id` int(11) NOT NULL,
  `room_type` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `route_pickup_point` (
  `id` int(11) NOT NULL,
  `transport_route_id` int(11) NOT NULL,
  `pickup_point_id` int(11) NOT NULL,
  `fees` float(10,2) DEFAULT 0.00,
  `destination_distance` float(10,1) DEFAULT 0.0,
  `pickup_time` time DEFAULT NULL,
  `order_number` float NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `school_houses` (
  `id` int(11) NOT NULL,
  `house_name` varchar(200) NOT NULL,
  `description` varchar(400) NOT NULL,
  `house_incharge` int(11) DEFAULT NULL,
  `house_president` int(11) DEFAULT NULL,
  `is_active` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sch_settings` (
  `id` int(11) NOT NULL,
  `base_url` varchar(500) DEFAULT NULL,
  `folder_path` text DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `biometric` int(11) DEFAULT 0,
  `biometric_device` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `lang_id` int(11) DEFAULT NULL,
  `languages` varchar(500) NOT NULL,
  `dise_code` varchar(50) DEFAULT NULL,
  `date_format` varchar(50) NOT NULL,
  `time_format` varchar(255) NOT NULL,
  `currency` varchar(50) NOT NULL,
  `currency_symbol` varchar(50) NOT NULL,
  `is_rtl` varchar(10) DEFAULT 'disabled',
  `is_duplicate_fees_invoice` varchar(100) DEFAULT '0',
  `collect_back_date_fees` int(11) NOT NULL,
  `single_page_print` int(11) DEFAULT 0,
  `timezone` varchar(30) DEFAULT 'UTC',
  `session_id` int(11) DEFAULT NULL,
  `cron_secret_key` varchar(100) NOT NULL,
  `currency_place` varchar(50) NOT NULL DEFAULT 'before_number',
  `currency_format` varchar(20) DEFAULT NULL,
  `class_teacher` varchar(100) NOT NULL,
  `start_month` varchar(40) NOT NULL,
  `attendence_type` int(11) NOT NULL DEFAULT 0,
  `low_attendance_limit` float(10,2) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `admin_logo` varchar(255) NOT NULL,
  `admin_small_logo` varchar(255) NOT NULL,
  `admin_login_page_background` varchar(255) NOT NULL,
  `user_login_page_background` varchar(255) NOT NULL,
  `theme` varchar(200) NOT NULL DEFAULT 'default.jpg',
  `fee_due_days` int(11) DEFAULT 0,
  `adm_auto_insert` int(11) NOT NULL DEFAULT 1,
  `adm_prefix` varchar(50) NOT NULL DEFAULT 'ssadm19/20',
  `adm_start_from` varchar(11) NOT NULL,
  `adm_no_digit` int(11) NOT NULL DEFAULT 6,
  `adm_update_status` int(11) NOT NULL DEFAULT 0,
  `staffid_auto_insert` int(11) NOT NULL DEFAULT 1,
  `staffid_prefix` varchar(100) NOT NULL DEFAULT 'staffss/19/20',
  `staffid_start_from` varchar(50) NOT NULL,
  `staffid_no_digit` int(11) NOT NULL DEFAULT 6,
  `staffid_update_status` int(11) NOT NULL DEFAULT 0,
  `is_active` varchar(255) DEFAULT 'no',
  `online_admission` int(11) DEFAULT 0,
  `online_admission_payment` varchar(50) NOT NULL,
  `online_admission_amount` float NOT NULL,
  `online_admission_instruction` text NOT NULL,
  `online_admission_conditions` text NOT NULL,
  `online_admission_application_form` varchar(255) DEFAULT NULL,
  `exam_result` int(11) NOT NULL,
  `is_blood_group` int(11) NOT NULL DEFAULT 1,
  `is_student_house` int(11) NOT NULL DEFAULT 1,
  `roll_no` int(11) NOT NULL DEFAULT 1,
  `category` int(11) NOT NULL,
  `religion` int(11) NOT NULL DEFAULT 1,
  `cast` int(11) NOT NULL DEFAULT 1,
  `mobile_no` int(11) NOT NULL DEFAULT 1,
  `student_email` int(11) NOT NULL DEFAULT 1,
  `admission_date` int(11) NOT NULL DEFAULT 1,
  `auto_roll_number` varchar(100) DEFAULT NULL,
  `lastname` int(11) NOT NULL,
  `middlename` int(11) NOT NULL DEFAULT 1,
  `student_photo` int(11) NOT NULL DEFAULT 1,
  `student_height` int(11) NOT NULL DEFAULT 1,
  `student_weight` int(11) NOT NULL DEFAULT 1,
  `measurement_date` int(11) NOT NULL DEFAULT 1,
  `father_name` int(11) NOT NULL DEFAULT 1,
  `father_phone` int(11) NOT NULL DEFAULT 1,
  `father_occupation` int(11) NOT NULL DEFAULT 1,
  `father_pic` int(11) NOT NULL DEFAULT 1,
  `mother_name` int(11) NOT NULL DEFAULT 1,
  `mother_phone` int(11) NOT NULL DEFAULT 1,
  `mother_occupation` int(11) NOT NULL DEFAULT 1,
  `mother_pic` int(11) NOT NULL DEFAULT 1,
  `guardian_name` int(11) NOT NULL,
  `guardian_relation` int(11) NOT NULL DEFAULT 1,
  `guardian_phone` int(11) NOT NULL,
  `guardian_email` int(11) NOT NULL DEFAULT 1,
  `guardian_pic` int(11) NOT NULL DEFAULT 1,
  `guardian_occupation` int(11) NOT NULL,
  `guardian_address` int(11) NOT NULL DEFAULT 1,
  `current_address` int(11) NOT NULL DEFAULT 1,
  `permanent_address` int(11) NOT NULL DEFAULT 1,
  `route_list` int(11) NOT NULL DEFAULT 1,
  `hostel_id` int(11) NOT NULL DEFAULT 1,
  `bank_account_no` int(11) NOT NULL DEFAULT 1,
  `ifsc_code` int(11) NOT NULL,
  `bank_name` int(11) NOT NULL,
  `national_identification_no` int(11) NOT NULL DEFAULT 1,
  `local_identification_no` int(11) NOT NULL DEFAULT 1,
  `rte` int(11) NOT NULL DEFAULT 1,
  `previous_school_details` int(11) NOT NULL DEFAULT 1,
  `student_note` int(11) NOT NULL DEFAULT 1,
  `upload_documents` int(11) NOT NULL DEFAULT 1,
  `student_barcode` int(11) NOT NULL DEFAULT 1,
  `staff_designation` int(11) NOT NULL DEFAULT 1,
  `staff_department` int(11) NOT NULL DEFAULT 1,
  `staff_last_name` int(11) NOT NULL DEFAULT 1,
  `staff_father_name` int(11) NOT NULL DEFAULT 1,
  `staff_mother_name` int(11) NOT NULL DEFAULT 1,
  `staff_date_of_joining` int(11) NOT NULL DEFAULT 1,
  `staff_phone` int(11) NOT NULL DEFAULT 1,
  `staff_emergency_contact` int(11) NOT NULL DEFAULT 1,
  `staff_marital_status` int(11) NOT NULL DEFAULT 1,
  `staff_photo` int(11) NOT NULL DEFAULT 1,
  `staff_current_address` int(11) NOT NULL DEFAULT 1,
  `staff_permanent_address` int(11) NOT NULL DEFAULT 1,
  `staff_qualification` int(11) NOT NULL DEFAULT 1,
  `staff_work_experience` int(11) NOT NULL DEFAULT 1,
  `staff_note` int(11) NOT NULL DEFAULT 1,
  `staff_epf_no` int(11) NOT NULL DEFAULT 1,
  `staff_basic_salary` int(11) NOT NULL DEFAULT 1,
  `staff_contract_type` int(11) NOT NULL DEFAULT 1,
  `staff_work_shift` int(11) NOT NULL DEFAULT 1,
  `staff_work_location` int(11) NOT NULL DEFAULT 1,
  `staff_leaves` int(11) NOT NULL DEFAULT 1,
  `staff_account_details` int(11) NOT NULL DEFAULT 1,
  `staff_social_media` int(11) NOT NULL DEFAULT 1,
  `staff_upload_documents` int(11) NOT NULL DEFAULT 1,
  `staff_barcode` int(11) NOT NULL DEFAULT 1,
  `staff_notification_email` varchar(50) NOT NULL,
  `mobile_api_url` tinytext NOT NULL,
  `app_primary_color_code` varchar(20) DEFAULT NULL,
  `app_secondary_color_code` varchar(20) DEFAULT NULL,
  `admin_mobile_api_url` tinytext NOT NULL,
  `admin_app_primary_color_code` varchar(20) NOT NULL,
  `admin_app_secondary_color_code` varchar(20) NOT NULL,
  `app_logo` varchar(250) DEFAULT NULL,
  `zoom_api_key` varchar(100) DEFAULT NULL,
  `zoom_api_secret` varchar(100) DEFAULT NULL,
  `student_profile_edit` int(11) NOT NULL DEFAULT 0,
  `start_week` varchar(10) NOT NULL,
  `day_off` varchar(44) DEFAULT NULL,
  `my_question` int(11) NOT NULL,
  `superadmin_restriction` varchar(20) NOT NULL,
  `student_timeline` varchar(20) NOT NULL,
  `calendar_event_reminder` int(11) DEFAULT NULL,
  `event_reminder` varchar(20) NOT NULL,
  `student_login` varchar(100) DEFAULT NULL,
  `parent_login` varchar(100) DEFAULT NULL,
  `student_panel_login` int(11) NOT NULL DEFAULT 1,
  `parent_panel_login` int(11) NOT NULL DEFAULT 1,
  `is_student_feature_lock` int(11) NOT NULL DEFAULT 0,
  `maintenance_mode` int(11) NOT NULL DEFAULT 0,
  `lock_grace_period` int(11) NOT NULL DEFAULT 0,
  `is_offline_fee_payment` int(11) NOT NULL DEFAULT 0,
  `google_map_api` text DEFAULT NULL,
  `scan_code_type` varchar(44) NOT NULL,
  `offline_bank_payment_instruction` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `letter_head` text NOT NULL,
  `is_online_payment_lock` int(11) DEFAULT NULL,
  `online_payment_charges_percent` float DEFAULT NULL,
  `test` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `section` varchar(60) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `send_notification` (
  `id` int(11) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `date` date DEFAULT NULL,
  `attachment` varchar(500) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `visible_student` varchar(10) NOT NULL DEFAULT 'no',
  `visible_staff` varchar(10) NOT NULL DEFAULT 'no',
  `visible_parent` varchar(10) NOT NULL DEFAULT 'no',
  `created_by` varchar(60) DEFAULT NULL,
  `created_id` int(11) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `session` varchar(60) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `share_contents` (
  `id` int(11) NOT NULL,
  `send_to` varchar(50) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `share_date` date DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `share_content_for` (
  `id` int(11) NOT NULL,
  `group_id` varchar(20) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `user_parent_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `share_content_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `share_upload_contents` (
  `id` int(11) NOT NULL,
  `upload_content_id` int(11) DEFAULT NULL,
  `share_content_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sidebar_menus` (
  `id` int(11) NOT NULL,
  `permission_group_id` int(11) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `menu` varchar(500) DEFAULT NULL,
  `activate_menu` varchar(100) DEFAULT NULL,
  `lang_key` varchar(250) NOT NULL,
  `system_level` int(11) DEFAULT 0,
  `level` int(11) DEFAULT NULL,
  `sidebar_display` int(11) DEFAULT 0,
  `access_permissions` text DEFAULT NULL,
  `is_active` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sidebar_sub_menus` (
  `id` int(11) NOT NULL,
  `sidebar_menu_id` int(11) DEFAULT NULL,
  `menu` varchar(500) DEFAULT NULL,
  `key` varchar(500) DEFAULT NULL,
  `lang_key` varchar(250) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `access_permissions` varchar(1000) DEFAULT NULL,
  `permission_group_id` int(11) DEFAULT NULL,
  `activate_controller` varchar(100) DEFAULT NULL COMMENT 'income',
  `activate_methods` varchar(500) DEFAULT NULL COMMENT 'index,edit',
  `addon_permission` varchar(100) DEFAULT NULL,
  `is_active` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sms_config` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `api_id` varchar(100) NOT NULL,
  `authkey` varchar(100) NOT NULL,
  `senderid` varchar(100) NOT NULL,
  `contact` text DEFAULT NULL,
  `username` varchar(150) DEFAULT NULL,
  `url` varchar(150) DEFAULT NULL,
  `password` varchar(150) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'disabled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `sms_template` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `source` (
  `id` int(11) NOT NULL,
  `source` varchar(100) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(200) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `currency_id` int(11) DEFAULT 0,
  `department` int(11) DEFAULT NULL,
  `designation` int(11) DEFAULT NULL,
  `qualification` varchar(200) NOT NULL,
  `work_exp` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `surname` varchar(200) NOT NULL,
  `father_name` varchar(200) NOT NULL,
  `mother_name` varchar(200) NOT NULL,
  `contact_no` varchar(200) NOT NULL,
  `emergency_contact_no` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `dob` date NOT NULL,
  `marital_status` varchar(100) NOT NULL,
  `date_of_joining` date DEFAULT NULL,
  `date_of_leaving` date DEFAULT NULL,
  `local_address` varchar(300) NOT NULL,
  `permanent_address` varchar(200) NOT NULL,
  `note` varchar(200) NOT NULL,
  `image` varchar(200) NOT NULL,
  `password` varchar(250) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `account_title` varchar(200) NOT NULL,
  `bank_account_no` varchar(200) NOT NULL,
  `bank_name` varchar(200) NOT NULL,
  `ifsc_code` varchar(200) NOT NULL,
  `bank_branch` varchar(100) NOT NULL,
  `payscale` varchar(200) NOT NULL,
  `basic_salary` int(11) DEFAULT NULL,
  `epf_no` varchar(200) NOT NULL,
  `contract_type` varchar(100) NOT NULL,
  `shift` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `facebook` varchar(200) NOT NULL,
  `twitter` varchar(200) NOT NULL,
  `linkedin` varchar(200) NOT NULL,
  `instagram` varchar(200) NOT NULL,
  `resume` varchar(200) NOT NULL,
  `joining_letter` varchar(200) NOT NULL,
  `resignation_letter` varchar(200) NOT NULL,
  `other_document_name` varchar(200) NOT NULL,
  `other_document_file` varchar(200) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_active` int(11) NOT NULL,
  `direct_manager` int(11) DEFAULT NULL,
  `is_house_incharge` int(11) NOT NULL DEFAULT 0,
  `verification_code` varchar(100) NOT NULL,
  `zoom_api_key` varchar(100) DEFAULT NULL,
  `zoom_api_secret` varchar(100) DEFAULT NULL,
  `biometric_device_id` varchar(255) DEFAULT NULL,
  `disable_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_attendance` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `staff_id` int(11) NOT NULL,
  `staff_attendance_type_id` int(11) NOT NULL,
  `biometric_attendence` int(11) DEFAULT 0,
  `biometric_device_data` text DEFAULT NULL,
  `remark` varchar(200) NOT NULL,
  `is_active` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_attendance_type` (
  `id` int(11) NOT NULL,
  `type` varchar(200) NOT NULL,
  `key_value` varchar(200) NOT NULL,
  `is_active` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_designation` (
  `id` int(11) NOT NULL,
  `designation` varchar(200) NOT NULL,
  `is_active` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_id_card` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `school_name` varchar(255) NOT NULL,
  `school_address` varchar(255) NOT NULL,
  `background` varchar(100) NOT NULL,
  `logo` varchar(100) NOT NULL,
  `sign_image` varchar(100) NOT NULL,
  `header_color` varchar(100) NOT NULL,
  `enable_vertical_card` int(11) NOT NULL DEFAULT 0,
  `enable_staff_role` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_staff_id` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_staff_department` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_designation` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_fathers_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_mothers_name` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_date_of_joining` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_permanent_address` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_staff_dob` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_staff_phone` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `enable_staff_barcode` tinyint(1) NOT NULL COMMENT '0=disable,1=enable',
  `status` tinyint(1) NOT NULL COMMENT '0=disable,1=enable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_leave_details` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `alloted_leave` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_leave_request` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `leave_from` date NOT NULL,
  `leave_to` date NOT NULL,
  `leave_days` int(11) NOT NULL,
  `employee_remark` varchar(200) NOT NULL,
  `admin_remark` varchar(200) NOT NULL,
  `status` varchar(50) NOT NULL,
  `applied_by` int(11) DEFAULT NULL,
  `document_file` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_payroll` (
  `id` int(11) NOT NULL,
  `basic_salary` int(11) NOT NULL,
  `pay_scale` varchar(200) NOT NULL,
  `grade` varchar(50) NOT NULL,
  `is_active` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_payslip` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `basic` float(10,2) NOT NULL,
  `total_allowance` float(10,2) NOT NULL,
  `total_deduction` float(10,2) NOT NULL,
  `leave_deduction` int(11) NOT NULL,
  `tax` varchar(200) NOT NULL,
  `net_salary` float(10,2) NOT NULL,
  `status` varchar(100) NOT NULL,
  `month` varchar(200) NOT NULL,
  `year` varchar(200) NOT NULL,
  `payment_mode` varchar(200) NOT NULL,
  `linked_ledger_bank` int(11) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(44) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `remark` varchar(200) NOT NULL,
  `generated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_modes` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_rating` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `rate` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(255) NOT NULL,
  `status` int(11) NOT NULL COMMENT '0 decline, 1 Approve',
  `entrydt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_roles` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `staff_timeline` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `timeline_date` date NOT NULL,
  `description` varchar(300) NOT NULL,
  `document` varchar(200) NOT NULL,
  `status` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `admission_no` varchar(100) DEFAULT NULL,
  `roll_no` bigint(100) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `rte` varchar(20) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `mobileno` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `cast` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `category_id` varchar(100) DEFAULT NULL,
  `school_house_id` int(11) DEFAULT NULL,
  `blood_group` varchar(200) NOT NULL,
  `hostel_room_id` int(11) DEFAULT NULL,
  `room_bed_id` int(11) DEFAULT NULL,
  `adhar_no` varchar(100) DEFAULT NULL,
  `samagra_id` varchar(100) DEFAULT NULL,
  `bank_account_no` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(100) DEFAULT NULL,
  `guardian_is` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `father_phone` varchar(100) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `mother_phone` varchar(100) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `guardian_relation` varchar(100) DEFAULT NULL,
  `guardian_phone` varchar(100) DEFAULT NULL,
  `guardian_occupation` varchar(150) NOT NULL,
  `guardian_address` text DEFAULT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `father_pic` varchar(200) NOT NULL,
  `mother_pic` varchar(200) NOT NULL,
  `guardian_pic` varchar(200) NOT NULL,
  `father_aadhar` varchar(50) DEFAULT NULL,
  `mother_aadhar` varchar(50) DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'yes',
  `previous_school` text DEFAULT NULL,
  `height` varchar(100) NOT NULL,
  `weight` varchar(100) NOT NULL,
  `measurement_date` date DEFAULT NULL,
  `dis_reason` int(11) NOT NULL,
  `note` varchar(200) DEFAULT NULL,
  `dis_note` text NOT NULL,
  `app_key` text DEFAULT NULL,
  `parent_app_key` text DEFAULT NULL,
  `disable_at` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `face_auth` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_applyleave` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `apply_date` date NOT NULL,
  `status` int(11) NOT NULL,
  `docs` varchar(200) DEFAULT NULL,
  `reason` text NOT NULL,
  `approve_by` int(11) DEFAULT NULL,
  `approve_date` date DEFAULT NULL,
  `request_type` int(11) NOT NULL COMMENT '0 student,1 staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_attendences` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `biometric_attendence` int(11) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  `attendence_type_id` int(11) DEFAULT NULL,
  `remark` varchar(200) NOT NULL,
  `biometric_device_data` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_attendences_hostel` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `biometric_attendence` int(11) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  `attendence_type_id` int(11) DEFAULT NULL,
  `remark` varchar(200) NOT NULL,
  `biometric_device_data` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_attendences_transport` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `biometric_attendence` int(11) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  `attendence_type_id` int(11) DEFAULT NULL,
  `remark` varchar(200) NOT NULL,
  `biometric_device_data` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_behaviour` (
  `id` int(11) NOT NULL,
  `point` int(11) NOT NULL,
  `description` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_doc` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `doc` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_edit_fields` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_fees` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `feemaster_id` int(11) DEFAULT NULL,
  `amount` float(10,2) DEFAULT NULL,
  `amount_discount` float(10,2) NOT NULL,
  `amount_fine` float(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `payment_mode` varchar(50) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_fees_deposite` (
  `id` int(11) NOT NULL,
  `student_fees_master_id` int(11) DEFAULT NULL,
  `fee_groups_feetype_id` int(11) DEFAULT NULL,
  `student_transport_fee_id` int(11) DEFAULT NULL,
  `amount_detail` text DEFAULT NULL,
  `file` text DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_fees_discounts` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `fees_discount_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'assigned',
  `payment_id` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_fees_master` (
  `id` int(11) NOT NULL,
  `is_system` int(11) NOT NULL DEFAULT 0,
  `student_session_id` int(11) DEFAULT NULL,
  `fee_session_group_id` int(11) DEFAULT NULL,
  `amount` float(10,2) DEFAULT 0.00,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_fees_processing` (
  `id` int(11) NOT NULL,
  `gateway_ins_id` int(11) NOT NULL,
  `fee_category` varchar(255) NOT NULL,
  `student_fees_master_id` int(11) DEFAULT NULL,
  `fee_groups_feetype_id` int(11) DEFAULT NULL,
  `student_transport_fee_id` int(11) DEFAULT NULL,
  `amount_detail` text DEFAULT NULL,
  `is_active` varchar(10) NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_incidents` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `incident_id` int(11) NOT NULL,
  `assign_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_incident_comments` (
  `id` int(11) NOT NULL,
  `student_incident_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_quiz_status` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `guest_id` int(1) DEFAULT NULL,
  `course_quiz_id` int(11) DEFAULT NULL,
  `total_question` int(11) DEFAULT NULL,
  `correct_answer` int(11) DEFAULT NULL,
  `wrong_answer` int(11) DEFAULT NULL,
  `not_answer` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL COMMENT '1-completed,0-incomplete	',
  `created_date` timestamp NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_session` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subject_group_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `batch_period_id` int(11) DEFAULT NULL,
  `program_period_course_id` int(11) DEFAULT NULL,
  `hostel_room_id` int(11) DEFAULT NULL,
  `vehroute_id` int(11) DEFAULT NULL,
  `route_pickup_point_id` int(11) DEFAULT NULL,
  `transport_fees` float(10,2) NOT NULL DEFAULT 0.00,
  `fees_discount` float(10,2) NOT NULL DEFAULT 0.00,
  `is_leave` int(11) NOT NULL DEFAULT 0,
  `is_active` varchar(255) DEFAULT 'no',
  `is_alumni` int(11) NOT NULL,
  `default_login` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_subject_attendances` (
  `id` int(11) NOT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `subject_timetable_id` int(11) DEFAULT NULL,
  `attendence_type_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_timeline` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `timeline_date` date NOT NULL,
  `description` text NOT NULL,
  `document` varchar(200) DEFAULT NULL,
  `status` varchar(200) NOT NULL,
  `created_student_id` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `student_transport_fees` (
  `id` int(11) NOT NULL,
  `transport_feemaster_id` int(11) NOT NULL,
  `student_session_id` int(11) NOT NULL,
  `route_pickup_point_id` int(11) NOT NULL,
  `generated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `linked_class` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `parent_subject_group_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_groups1` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `parent_subject_group_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_group_class_sections` (
  `id` int(11) NOT NULL,
  `subject_group_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_group_subjects` (
  `id` int(11) NOT NULL,
  `subject_group_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_syllabus` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_for` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_from` varchar(255) NOT NULL,
  `time_to` varchar(255) NOT NULL,
  `presentation` text NOT NULL,
  `attachment` text NOT NULL,
  `lacture_youtube_url` varchar(255) NOT NULL,
  `lacture_video` varchar(255) NOT NULL,
  `sub_topic` text NOT NULL,
  `teaching_method` text NOT NULL,
  `general_objectives` text NOT NULL,
  `previous_knowledge` text NOT NULL,
  `comprehensive_questions` text NOT NULL,
  `status` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `subject_timetable` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subject_group_id` int(11) DEFAULT NULL,
  `subject_group_subject_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `day` varchar(20) DEFAULT NULL,
  `time_from` varchar(20) DEFAULT NULL,
  `time_to` varchar(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `room_no` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `submit_assignment` (
  `id` int(11) NOT NULL,
  `homework_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `docs` varchar(225) NOT NULL,
  `file_name` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `template_admitcards` (
  `id` int(11) NOT NULL,
  `template` varchar(250) DEFAULT NULL,
  `heading` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `left_logo` varchar(200) DEFAULT NULL,
  `right_logo` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `sign` varchar(200) DEFAULT NULL,
  `background_img` varchar(200) DEFAULT NULL,
  `is_letter_head` int(11) NOT NULL,
  `is_name` int(11) NOT NULL DEFAULT 1,
  `is_father_name` int(11) NOT NULL DEFAULT 1,
  `is_mother_name` int(11) NOT NULL DEFAULT 1,
  `is_dob` int(11) NOT NULL DEFAULT 1,
  `is_admission_no` int(11) NOT NULL DEFAULT 1,
  `is_roll_no` int(11) NOT NULL DEFAULT 1,
  `is_address` int(11) NOT NULL DEFAULT 1,
  `is_gender` int(11) NOT NULL DEFAULT 1,
  `is_photo` int(11) NOT NULL,
  `is_class` int(11) NOT NULL DEFAULT 0,
  `is_section` int(11) NOT NULL DEFAULT 0,
  `content_footer` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `template_marksheets` (
  `id` int(11) NOT NULL,
  `header_image` varchar(200) DEFAULT NULL,
  `template` varchar(200) DEFAULT NULL,
  `heading` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `left_logo` varchar(200) DEFAULT NULL,
  `right_logo` varchar(200) DEFAULT NULL,
  `exam_name` varchar(200) DEFAULT NULL,
  `school_name` varchar(200) DEFAULT NULL,
  `exam_center` varchar(200) DEFAULT NULL,
  `left_sign` varchar(200) DEFAULT NULL,
  `middle_sign` varchar(200) DEFAULT NULL,
  `right_sign` varchar(200) DEFAULT NULL,
  `exam_session` int(11) DEFAULT 1,
  `is_name` int(11) DEFAULT 1,
  `is_father_name` int(11) DEFAULT 1,
  `is_mother_name` int(11) DEFAULT 1,
  `is_dob` int(11) DEFAULT 1,
  `is_admission_no` int(11) DEFAULT 1,
  `is_roll_no` int(11) DEFAULT 1,
  `is_photo` int(11) DEFAULT 1,
  `is_division` int(11) NOT NULL DEFAULT 1,
  `is_rank` int(11) NOT NULL DEFAULT 0,
  `is_customfield` int(11) NOT NULL,
  `background_img` varchar(200) DEFAULT NULL,
  `date` varchar(20) DEFAULT NULL,
  `is_class` int(11) NOT NULL DEFAULT 0,
  `is_teacher_remark` int(11) NOT NULL DEFAULT 1,
  `is_section` int(11) NOT NULL DEFAULT 0,
  `content` text DEFAULT NULL,
  `content_footer` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `topic` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `complete_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `transport_feemaster` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `month` varchar(50) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `fine_amount` float(10,2) DEFAULT 0.00,
  `fine_type` varchar(50) DEFAULT NULL,
  `fine_percentage` float(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `transport_route` (
  `id` int(11) NOT NULL,
  `route_title` varchar(100) DEFAULT NULL,
  `route_from` varchar(255) DEFAULT NULL,
  `route_to` varchar(255) DEFAULT NULL,
  `route_distance` double DEFAULT NULL,
  `no_of_vehicle` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `is_active` varchar(255) DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `upload_contents` (
  `id` int(11) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `image` varchar(300) DEFAULT NULL,
  `thumb_path` varchar(300) DEFAULT NULL,
  `dir_path` varchar(300) DEFAULT NULL,
  `real_name` text NOT NULL,
  `img_name` varchar(300) DEFAULT NULL,
  `thumb_name` varchar(300) DEFAULT NULL,
  `file_type` varchar(100) NOT NULL,
  `mime_type` text NOT NULL,
  `file_size` varchar(100) NOT NULL,
  `vid_url` text NOT NULL,
  `vid_title` varchar(250) NOT NULL,
  `upload_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `userlog` (
  `id` int(11) NOT NULL,
  `user` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `ipaddress` varchar(100) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `login_datetime` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `childs` text NOT NULL,
  `role` varchar(30) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `currency_id` int(11) DEFAULT 0,
  `verification_code` varchar(200) NOT NULL,
  `is_active` varchar(255) DEFAULT 'yes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `users_authentication` (
  `id` int(11) NOT NULL,
  `users_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `expired_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `vehicle_no` varchar(20) DEFAULT NULL,
  `vehicle_model` varchar(100) NOT NULL DEFAULT 'None',
  `vehicle_base_average` double DEFAULT NULL,
  `vehicle_photo` varchar(255) DEFAULT NULL,
  `manufacture_year` varchar(4) DEFAULT NULL,
  `registration_number` varchar(50) NOT NULL,
  `chasis_number` varchar(100) NOT NULL,
  `max_seating_capacity` varchar(255) NOT NULL,
  `driver_name` varchar(50) DEFAULT NULL,
  `driver_licence` varchar(50) NOT NULL DEFAULT 'None',
  `driver_contact` varchar(20) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `swap_with` varchar(44) NOT NULL,
  `swap_till` date NOT NULL,
  `swap_status` int(11) NOT NULL,
  `swap_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`swap_history`)),
  `v_name` varchar(255) NOT NULL,
  `v_color` varchar(255) NOT NULL,
  `v_group` varchar(255) NOT NULL,
  `v_api_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `vehicle_routes` (
  `id` int(11) NOT NULL,
  `route_id` int(11) DEFAULT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `video_tutorial` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `vid_title` text DEFAULT NULL,
  `description` text NOT NULL,
  `thumb_path` varchar(500) DEFAULT NULL,
  `dir_path` varchar(500) DEFAULT NULL,
  `img_name` varchar(300) NOT NULL,
  `thumb_name` varchar(300) NOT NULL,
  `video_link` varchar(100) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `video_tutorial_class_sections` (
  `id` int(11) NOT NULL,
  `video_tutorial_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `created_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `visitors_book` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `student_session_id` int(11) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `purpose` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact` varchar(12) NOT NULL,
  `id_proof` varchar(50) NOT NULL,
  `no_of_people` int(11) NOT NULL,
  `date` date NOT NULL,
  `in_time` varchar(20) NOT NULL,
  `out_time` varchar(20) NOT NULL,
  `note` text NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `meeting_with` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `visitors_purpose` (
  `id` int(11) NOT NULL,
  `visitors_purpose` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `zoom_settings` (
  `id` int(11) NOT NULL,
  `zoom_api_key` varchar(200) DEFAULT NULL,
  `zoom_api_secret` varchar(200) DEFAULT NULL,
  `use_teacher_api` int(1) DEFAULT 1,
  `use_zoom_app` int(1) DEFAULT 1,
  `use_zoom_app_user` int(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE `alumni_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `class_id` (`class_id`);

ALTER TABLE `alumni_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

ALTER TABLE `attendence_type`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `aws_s3_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `behaviour_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `book_issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `member_id` (`member_id`);

ALTER TABLE `captcha`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cbse_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_term_id` (`cbse_term_id`),
  ADD KEY `cbse_exam_grade_id` (`cbse_exam_grade_id`),
  ADD KEY `cbse_exam_assessment_id` (`cbse_exam_assessment_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_exam_code` (`exam_code`);

ALTER TABLE `cbse_exam_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

ALTER TABLE `cbse_exam_assessment_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_assessment_id` (`cbse_exam_assessment_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_code` (`code`);

ALTER TABLE `cbse_exam_class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`),
  ADD KEY `cbse_exam_id` (`cbse_exam_id`);

ALTER TABLE `cbse_exam_grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

ALTER TABLE `cbse_exam_grades_range`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_grade_id` (`cbse_exam_grade_id`),
  ADD KEY `idx_name` (`name`);

ALTER TABLE `cbse_exam_observations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

ALTER TABLE `cbse_exam_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_id` (`cbse_exam_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `cbse_exam_student_subject_rank`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_template_id` (`cbse_template_id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_rank` (`rank`);

ALTER TABLE `cbse_exam_timetable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_id` (`cbse_exam_id`),
  ADD KEY `subject_id` (`subject_id`);

ALTER TABLE `cbse_exam_timetable_assessment_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_timetable_id` (`cbse_exam_timetable_id`),
  ADD KEY `cbse_exam_assessment_type_id` (`cbse_exam_assessment_type_id`);

ALTER TABLE `cbse_exam_timetable_grade`
  ADD PRIMARY KEY (`tg_id`);

ALTER TABLE `cbse_marksheet_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_short_code` (`short_code`);

ALTER TABLE `cbse_observation_class_section`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cbse_observation_parameters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

ALTER TABLE `cbse_observation_subparameter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_observation_parameter_id_ibfk_1` (`cbse_observation_parameter_id`),
  ADD KEY `cbse_exam_observation_id_ibfk_1` (`cbse_exam_observation_id`);

ALTER TABLE `cbse_observation_terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_term_id` (`cbse_term_id`),
  ADD KEY `cbse_ovservation_terms_ibfk_3` (`session_id`),
  ADD KEY `cbse_exam_observations_ibfk_1` (`cbse_exam_observation_id`);

ALTER TABLE `cbse_observation_term_student_subparameter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_observation_term_student_subparameter_ibfk_1` (`cbse_ovservation_term_id`),
  ADD KEY `cbse_observation_subparameter_id` (`cbse_observation_subparameter_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `cbse_student_exam_ranks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_id` (`cbse_exam_id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `idx_rank` (`rank`),
  ADD KEY `idx_rank_percentage` (`rank_percentage`);

ALTER TABLE `cbse_student_subject_marks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_exam_timetable_id` (`cbse_exam_timetable_id`),
  ADD KEY `cbse_exam_student_id` (`cbse_exam_student_id`),
  ADD KEY `cbse_exam_assessment_type_id` (`cbse_exam_assessment_type_id`),
  ADD KEY `cbse_exam_timetable_assessment_type_ibfk_4` (`cbse_exam_timetable_assessment_type_id`);

ALTER TABLE `cbse_student_subject_result`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cbse_student_template_rank`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `cbse_template_id` (`cbse_template_id`),
  ADD KEY `idx_rank` (`rank`),
  ADD KEY `idx_rank_percentage` (`rank_percentage`);

ALTER TABLE `cbse_template`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_template_ibfk_3` (`session_id`),
  ADD KEY `cbse_template_ibfk_1` (`gradeexam_id`),
  ADD KEY `cbse_template_ibfk_2` (`remarkexam_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_marksheet_type` (`marksheet_type`),
  ADD KEY `idx_exam_name` (`exam_name`),
  ADD KEY `idx_school_name` (`school_name`);

ALTER TABLE `cbse_template_class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_template_id` (`cbse_template_id`),
  ADD KEY `class_section_id` (`class_section_id`);

ALTER TABLE `cbse_template_terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_template_id` (`cbse_template_id`),
  ADD KEY `cbse_term_id` (`cbse_term_id`),
  ADD KEY `idx_weightage` (`weightage`);

ALTER TABLE `cbse_template_term_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cbse_template_term_id` (`cbse_template_term_id`),
  ADD KEY `cbse_template_term_exams_ibfk_3` (`cbse_exam_id`),
  ADD KEY `cbse_template_term_exams_ibfk_4` (`cbse_template_id`),
  ADD KEY `idx_weightage` (`weightage`);

ALTER TABLE `cbse_terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_term_code` (`term_code`);

ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `chat_connections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_user_one` (`chat_user_one`),
  ADD KEY `chat_user_two` (`chat_user_two`);

ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_user_id` (`chat_user_id`),
  ADD KEY `chat_connection_id` (`chat_connection_id`);

ALTER TABLE `chat_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `create_staff_id` (`create_staff_id`),
  ADD KEY `create_student_id` (`create_student_id`);

ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`);

ALTER TABLE `class_section_times`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`);

ALTER TABLE `class_teacher`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `staff_id` (`staff_id`);

ALTER TABLE `complaint`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `complaint_type`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `conferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conferences_ibfk_1` (`staff_id`),
  ADD KEY `conferences_ibfk_2` (`created_id`);

ALTER TABLE `conferences_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conferences_history_ibfk_1` (`conference_id`),
  ADD KEY `conferences_history_ibfk_2` (`staff_id`),
  ADD KEY `conferences_history_ibfk_3` (`student_id`);

ALTER TABLE `conference_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conference_sections_ibfk_1` (`conference_id`),
  ADD KEY `conference_sections_ibfk_2` (`cls_section_id`);

ALTER TABLE `conference_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conference_staff_ibfk_1` (`conference_id`),
  ADD KEY `conference_staff_ibfk_2` (`staff_id`);

ALTER TABLE `contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `cls_sec_id` (`cls_sec_id`);

ALTER TABLE `content_for`
  ADD PRIMARY KEY (`id`),
  ADD KEY `content_id` (`content_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `content_types`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `course_category`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `course_lesson_quiz_order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`course_section_id`);

ALTER TABLE `course_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_section_id` (`course_section_id`);

ALTER TABLE `course_quiz_answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `quiz_id` (`course_quiz_id`),
  ADD KEY `question_id` (`course_quiz_question_id`);

ALTER TABLE `course_quiz_question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_quiz_id` (`course_quiz_id`);

ALTER TABLE `course_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_id` (`course_id`);

ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `custom_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_belong_to` (`belong_to`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_visible_on_table` (`visible_on_table`),
  ADD KEY `idx_weight` (`weight`);

ALTER TABLE `custom_fields` ADD FULLTEXT KEY `idx_field_values` (`field_values`);

--
-- Indexes for table `custom_field_values`
--
ALTER TABLE `custom_field_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_field_id` (`custom_field_id`),
  ADD KEY `idx_belong_table_id` (`belong_table_id`),
  ADD KEY `idx_field_value` (`field_value`);

ALTER TABLE `cyc_additional_section_teacher`
  ADD PRIMARY KEY (`at_id`);

ALTER TABLE `cyc_advance_exam_group`
  ADD PRIMARY KEY (`exam_group_id`);

ALTER TABLE `cyc_biometric_events`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cyc_campaign`
  ADD PRIMARY KEY (`c_id`);

ALTER TABLE `cyc_campaign_time`
  ADD PRIMARY KEY (`ct_id`);

ALTER TABLE `cyc_classes_grouping`
  ADD PRIMARY KEY (`cg_id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `class_id` (`class_id`,`section_id`,`class_section_id`,`subject_group_id`,`subject_id`);

ALTER TABLE `cyc_class_coordinator`
  ADD PRIMARY KEY (`cc_id`);

ALTER TABLE `cyc_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD KEY `id` (`id`),
  ADD KEY `tag_id` (`tag_id`),
  ADD KEY `entrytype_id` (`entrytype_id`);

ALTER TABLE `cyc_entryitems`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD KEY `id` (`id`),
  ADD KEY `entry_id` (`entry_id`),
  ADD KEY `ledger_id` (`ledger_id`);

ALTER TABLE `cyc_entrytypes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD UNIQUE KEY `label` (`label`),
  ADD KEY `id` (`id`);

ALTER TABLE `cyc_fee_head_ledger`
  ADD PRIMARY KEY (`fhl_id`),
  ADD KEY `ledger_id` (`ledger_id`,`head_id`);

ALTER TABLE `cyc_fuel_refill`
  ADD PRIMARY KEY (`fr_id`);

ALTER TABLE `cyc_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `id` (`id`),
  ADD KEY `parent_id` (`parent_id`);

ALTER TABLE `cyc_holiday`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cyc_hostel_room_bed`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cyc_leads`
  ADD PRIMARY KEY (`l_id`),
  ADD KEY `student_id` (`student_id`,`taken_by`,`closed_by`);

ALTER TABLE `cyc_leads_counsellor`
  ADD PRIMARY KEY (`lc_id`);

ALTER TABLE `cyc_leads_followup`
  ADD PRIMARY KEY (`f_id`);

ALTER TABLE `cyc_leads_followup_status`
  ADD PRIMARY KEY (`fws_id`);

ALTER TABLE `cyc_ledgers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `id` (`id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `feetype_id` (`feetype_id`);

ALTER TABLE `cyc_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD KEY `id` (`id`);

ALTER TABLE `cyc_ptm`
  ADD PRIMARY KEY (`ptm_id`);

ALTER TABLE `cyc_ptm_attendance`
  ADD PRIMARY KEY (`ptma_id`);

ALTER TABLE `cyc_ptm_schedule`
  ADD PRIMARY KEY (`ptms_id`);

ALTER TABLE `cyc_scheme_and_scholarship`
  ADD PRIMARY KEY (`ss_id`),
  ADD KEY `ss_status` (`ss_status`);

ALTER TABLE `cyc_scheme_and_scholarship_feetype`
  ADD PRIMARY KEY (`ssvft_id`),
  ADD KEY `ss_id` (`ss_id`,`feetype_id`,`ssvft_status`);

ALTER TABLE `cyc_scheme_and_scholarship_student`
  ADD PRIMARY KEY (`sss_id`);

ALTER TABLE `cyc_scheme_and_scholarship_value`
  ADD PRIMARY KEY (`ssv_id`),
  ADD KEY `ss_id` (`ss_id`,`fee_concession_type`,`fee_concession`,`applicable_class`),
  ADD KEY `ssv_status` (`ssv_status`);

ALTER TABLE `cyc_staff_payroll`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`) USING BTREE;

ALTER TABLE `cyc_staff_payroll_increment`
  ADD PRIMARY KEY (`pi_id`);

ALTER TABLE `cyc_student_addon_fee`
  ADD PRIMARY KEY (`af_id`);

ALTER TABLE `cyc_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`id`),
  ADD UNIQUE KEY `title` (`title`),
  ADD KEY `id` (`id`);

ALTER TABLE `cyc_vehicle_parts_info`
  ADD PRIMARY KEY (`vp_id`);

ALTER TABLE `cyc_vehicle_rto_info`
  ADD PRIMARY KEY (`vr_id`);

ALTER TABLE `cyc_vehicle_services`
  ADD PRIMARY KEY (`srv_id`);

ALTER TABLE `cy_ptm_time_slot`
  ADD PRIMARY KEY (`pts_id`);

ALTER TABLE `cy_vehicle_ticket`
  ADD PRIMARY KEY (`vt_id`);

ALTER TABLE `daily_assignment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `evaluated_by` (`evaluated_by`),
  ADD KEY `subject_group_subject_id` (`subject_group_subject_id`);

ALTER TABLE `department`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `disable_reason`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `dispatch_receive`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `email_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

ALTER TABLE `email_config`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `email_template`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `email_template_attachment`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `enquiry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `assigned` (`assigned`),
  ADD KEY `enquiry_ibfk_4` (`class_id`);

ALTER TABLE `enquiry_type`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`);

ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sesion_id` (`sesion_id`);

ALTER TABLE `exam_groups`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `exam_group_class_batch_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_id` (`exam_group_id`),
  ADD KEY `exam_group_class_batch_exams_ibfk_2` (`session_id`);

ALTER TABLE `exam_group_class_batch_exam_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_class_batch_exam_id` (`exam_group_class_batch_exam_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `exam_group_class_batch_exam_subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_class_batch_exams_id` (`exam_group_class_batch_exams_id`),
  ADD KEY `subject_id` (`subject_id`);

ALTER TABLE `exam_group_exam_connections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_id` (`exam_group_id`),
  ADD KEY `exam_group_class_batch_exams_id` (`exam_group_class_batch_exams_id`);

ALTER TABLE `exam_group_exam_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_class_batch_exam_subject_id` (`exam_group_class_batch_exam_subject_id`),
  ADD KEY `exam_group_student_id` (`exam_group_student_id`),
  ADD KEY `exam_group_class_batch_exam_student_id` (`exam_group_class_batch_exam_student_id`);

ALTER TABLE `exam_group_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_group_id` (`exam_group_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `exam_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_subject_id` (`teacher_subject_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `exam_id` (`exam_id`);

ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exp_head_id` (`exp_head_id`);

ALTER TABLE `expense_head`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `face_authentication`
  ADD PRIMARY KEY (`fa_id`);

ALTER TABLE `feemasters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `feetype_id` (`feetype_id`),
  ADD KEY `class_id` (`class_id`);

ALTER TABLE `fees_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `fees_reminder`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `feetype`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `fee_groups`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `fee_groups_feetype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fee_session_group_id` (`fee_session_group_id`),
  ADD KEY `fee_groups_id` (`fee_groups_id`),
  ADD KEY `feetype_id` (`feetype_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `fee_receipt_no`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `fee_session_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fee_groups_id` (`fee_groups_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `filetypes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `follow_up`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enquiry_id` (`enquiry_id`),
  ADD KEY `followup_by` (`followup_by`);

ALTER TABLE `front_cms_media_gallery`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `front_cms_menus`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `front_cms_menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_id` (`menu_id`);

ALTER TABLE `front_cms_pages`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `front_cms_page_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `page_id` (`page_id`);

ALTER TABLE `front_cms_programs`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `front_cms_program_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `program_id` (`program_id`);

ALTER TABLE `front_cms_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `gateway_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `online_admission_id` (`online_admission_id`);

ALTER TABLE `gateway_ins_response`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gateway_ins_id` (`gateway_ins_id`);

ALTER TABLE `general_calls`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `geofences`
  ADD PRIMARY KEY (`geo_id`);

ALTER TABLE `geofence_events`
  ADD PRIMARY KEY (`ge_id`);

ALTER TABLE `gmeet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `created_id` (`created_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `gmeet_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gmeet_id` (`gmeet_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `student_id` (`student_id`);

ALTER TABLE `gmeet_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cls_section_id` (`cls_section_id`),
  ADD KEY `gmeet_id` (`gmeet_id`);

ALTER TABLE `gmeet_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `gmeet_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gmeet_id` (`gmeet_id`),
  ADD KEY `staff_id` (`staff_id`);

ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `guest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `idx_lang_id` (`lang_id`),
  ADD KEY `idx_currency_id` (`currency_id`),
  ADD KEY `idx_email` (`email`);

ALTER TABLE `homework`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_group_subject_id` (`subject_group_subject_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `evaluated_by` (`evaluated_by`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `homework_evaluation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `homework_id` (`homework_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `hostel`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `hostel_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_id` (`hostel_id`),
  ADD KEY `room_type_id` (`room_type_id`);

ALTER TABLE `id_card`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `income_head_id` (`income_head_id`);

ALTER TABLE `income_head`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_category_id` (`item_category_id`),
  ADD KEY `item_store_id` (`item_store_id`),
  ADD KEY `item_supplier_id` (`item_supplier_id`);

ALTER TABLE `item_category`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `item_issue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `item_category_id` (`item_category_id`),
  ADD KEY `issue_to` (`issue_to`),
  ADD KEY `issue_by` (`issue_by`);

ALTER TABLE `item_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `store_id` (`store_id`);

ALTER TABLE `item_store`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `item_supplier`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type` (`type`);

ALTER TABLE `lesson`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `subject_group_subject_id` (`subject_group_subject_id`),
  ADD KEY `subject_group_class_sections_id` (`subject_group_class_sections_id`);

ALTER TABLE `lesson_plan_forum`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_syllabus_id` (`subject_syllabus_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `staff_id` (`staff_id`);

ALTER TABLE `libarary_members`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `mark_divisions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `multi_branch`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `notification_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `send_notification_id` (`send_notification_id`),
  ADD KEY `role_id` (`role_id`);

ALTER TABLE `notification_setting`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `offline_fees_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_fees_master_id` (`student_fees_master_id`),
  ADD KEY `fee_groups_feetype_id` (`fee_groups_feetype_id`),
  ADD KEY `student_transport_fee_id` (`student_transport_fee_id`),
  ADD KEY `offline_fees_payments_ibfk_4` (`approved_by`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `onlineexam`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `onlineexam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `onlineexam_student_id` (`onlineexam_student_id`);

ALTER TABLE `onlineexam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `onlineexam_id` (`onlineexam_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `onlineexam_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `onlineexam_id` (`onlineexam_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `onlineexam_student_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `onlineexam_student_id` (`onlineexam_student_id`),
  ADD KEY `onlineexam_question_id` (`onlineexam_question_id`);

ALTER TABLE `online_admissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `hostel_room_id` (`hostel_room_id`),
  ADD KEY `school_house_id` (`school_house_id`);

ALTER TABLE `online_admission_custom_field_value`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_field_id` (`custom_field_id`);

ALTER TABLE `online_admission_fields`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `online_admission_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `online_admission_id` (`online_admission_id`);

ALTER TABLE `online_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`title`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_category_id` (`category_id`);

ALTER TABLE `online_course_class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `class_section_id` (`class_section_id`);

ALTER TABLE `online_course_lesson`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_section_id` (`course_section_id`) USING BTREE;

ALTER TABLE `online_course_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_online_courses_id` (`online_courses_id`);

ALTER TABLE `online_course_processing_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `online_courses_id` (`online_courses_id`);

ALTER TABLE `online_course_quiz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `course_section_id` (`course_section_id`) USING BTREE;

ALTER TABLE `online_course_section`
  ADD PRIMARY KEY (`id`),
  ADD KEY `online_course_id` (`online_course_id`);

ALTER TABLE `online_course_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `payment_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `payslip_allowance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `payslip_id` (`payslip_id`);

ALTER TABLE `permission_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_short_code` (`short_code`),
  ADD KEY `perm_group_id` (`perm_group_id`);

ALTER TABLE `permission_group`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `permission_student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`);

ALTER TABLE `pickup_point`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `index_user_id` (`v_id`);

ALTER TABLE `print_headerfooter`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `qr_code_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `class_section_id` (`class_section_id`);

ALTER TABLE `read_notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_id` (`notification_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `student_id` (`student_id`);

ALTER TABLE `reference`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `roles_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `perm_cat_id` (`perm_cat_id`);

ALTER TABLE `room_types`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `route_pickup_point`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transport_route_id` (`transport_route_id`),
  ADD KEY `pickup_point_id` (`pickup_point_id`);

ALTER TABLE `school_houses`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `sch_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lang_id` (`lang_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `send_notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_id` (`created_id`);

ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `share_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `share_content_for`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_content_id` (`share_content_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `class_section_id` (`class_section_id`),
  ADD KEY `user_parent_id` (`user_parent_id`);

ALTER TABLE `share_upload_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_content_id` (`upload_content_id`),
  ADD KEY `share_content_id` (`share_content_id`);

ALTER TABLE `sidebar_menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permission_group_id` (`permission_group_id`);

ALTER TABLE `sidebar_sub_menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sidebar_menu_id` (`sidebar_menu_id`),
  ADD KEY `permission_group_id` (`permission_group_id`);

ALTER TABLE `sms_config`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `sms_template`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `source`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `designation` (`designation`),
  ADD KEY `department` (`department`);

ALTER TABLE `staff_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_attendance_staff` (`staff_id`),
  ADD KEY `FK_staff_attendance_staff_attendance_type` (`staff_attendance_type_id`);

ALTER TABLE `staff_attendance_type`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `staff_designation`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `staff_id_card`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `staff_leave_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_leave_details_staff` (`staff_id`),
  ADD KEY `FK_staff_leave_details_leave_types` (`leave_type_id`);

ALTER TABLE `staff_leave_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_leave_request_staff` (`staff_id`),
  ADD KEY `FK_staff_leave_request_leave_types` (`leave_type_id`),
  ADD KEY `applied_by` (`applied_by`);

ALTER TABLE `staff_payroll`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `staff_payslip`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_payslip_staff` (`staff_id`);

ALTER TABLE `staff_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_rating_staff` (`staff_id`);

ALTER TABLE `staff_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `staff_id` (`staff_id`);

ALTER TABLE `staff_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_staff_timeline_staff` (`staff_id`);

ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `student_applyleave`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `approve_by` (`approve_by`);

ALTER TABLE `student_attendences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `attendence_type_id` (`attendence_type_id`);

ALTER TABLE `student_attendences_hostel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `attendence_type_id` (`attendence_type_id`);

ALTER TABLE `student_attendences_transport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendence_type_id` (`attendence_type_id`),
  ADD KEY `student_attendences_transport_ibfk_2` (`student_session_id`);

ALTER TABLE `student_behaviour`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `student_doc`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `student_edit_fields`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `student_fees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `feemaster_id` (`feemaster_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `student_fees_deposite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_fees_master_id` (`student_fees_master_id`),
  ADD KEY `fee_groups_feetype_id` (`fee_groups_feetype_id`),
  ADD KEY `student_transport_fee_id` (`student_transport_fee_id`);

ALTER TABLE `student_fees_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `fees_discount_id` (`fees_discount_id`);

ALTER TABLE `student_fees_master`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `fee_session_group_id` (`fee_session_group_id`);

ALTER TABLE `student_fees_processing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_fees_master_id` (`student_fees_master_id`),
  ADD KEY `fee_groups_feetype_id` (`fee_groups_feetype_id`),
  ADD KEY `student_transport_fee_id` (`student_transport_fee_id`),
  ADD KEY `gateway_ins_id` (`gateway_ins_id`);

ALTER TABLE `student_incidents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_incidents_ibfk_1` (`student_id`),
  ADD KEY `student_incidents_ibfk_2` (`incident_id`);

ALTER TABLE `student_incident_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_incident_comments_ibfk_1` (`student_incident_id`);

ALTER TABLE `student_quiz_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_quiz_id` (`course_quiz_id`) USING BTREE;

ALTER TABLE `student_session`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `student_session_ibfk_5` (`vehroute_id`),
  ADD KEY `hostel_room_id` (`hostel_room_id`),
  ADD KEY `student_session_ibfk_6` (`route_pickup_point_id`);

ALTER TABLE `student_subject_attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendence_type_id` (`attendence_type_id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `subject_timetable_id` (`subject_timetable_id`);

ALTER TABLE `student_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

ALTER TABLE `student_transport_fees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_session_id` (`student_session_id`),
  ADD KEY `route_pickup_point_id` (`route_pickup_point_id`),
  ADD KEY `transport_feemaster_id` (`transport_feemaster_id`);

ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `subject_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `subject_groups1`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `subject_group_class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`),
  ADD KEY `subject_group_id` (`subject_group_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `subject_group_subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_group_id` (`subject_group_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `subject_id` (`subject_id`);

ALTER TABLE `subject_syllabus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `created_for` (`created_for`);

ALTER TABLE `subject_timetable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_group_id` (`subject_group_id`),
  ADD KEY `subject_group_subject_id` (`subject_group_subject_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `submit_assignment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `homework_id` (`homework_id`);

ALTER TABLE `template_admitcards`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `template_marksheets`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `topic`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `lesson_id` (`lesson_id`);

ALTER TABLE `transport_feemaster`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

ALTER TABLE `transport_route`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `upload_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_by` (`upload_by`),
  ADD KEY `upload_contents_ibfk_2` (`content_type_id`);

ALTER TABLE `userlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users_authentication`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `vehicle_routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

ALTER TABLE `video_tutorial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `video_tutorial_class_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_section_id` (`class_section_id`),
  ADD KEY `video_tutorial_id` (`video_tutorial_id`);

ALTER TABLE `visitors_book`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `student_session_id` (`student_session_id`);

ALTER TABLE `visitors_purpose`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `zoom_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `alumni_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `alumni_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `attendence_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `aws_s3_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `behaviour_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `book_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `captcha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `cbse_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

ALTER TABLE `cbse_exam_assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `cbse_exam_assessment_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

ALTER TABLE `cbse_exam_class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3245;

ALTER TABLE `cbse_exam_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `cbse_exam_grades_range`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

ALTER TABLE `cbse_exam_observations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `cbse_exam_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26636;

ALTER TABLE `cbse_exam_student_subject_rank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cbse_exam_timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=711;

ALTER TABLE `cbse_exam_timetable_assessment_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

ALTER TABLE `cbse_exam_timetable_grade`
  MODIFY `tg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4601;

ALTER TABLE `cbse_marksheet_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `cbse_observation_class_section`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cbse_observation_parameters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `cbse_observation_subparameter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

ALTER TABLE `cbse_observation_terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

ALTER TABLE `cbse_observation_term_student_subparameter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30073;

ALTER TABLE `cbse_student_exam_ranks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

ALTER TABLE `cbse_student_subject_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1277649;

ALTER TABLE `cbse_student_subject_result`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cbse_student_template_rank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cbse_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

ALTER TABLE `cbse_template_class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=660;

ALTER TABLE `cbse_template_terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

ALTER TABLE `cbse_template_term_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

ALTER TABLE `cbse_terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `chat_connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

ALTER TABLE `class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

ALTER TABLE `class_section_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `class_teacher`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=326;

ALTER TABLE `complaint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `complaint_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `conferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `conferences_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `conference_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `conference_staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `contents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `content_for`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `content_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `course_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `course_lesson_quiz_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `course_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `course_quiz_answer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `course_quiz_question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `course_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=180;

ALTER TABLE `custom_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `custom_field_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14070;

ALTER TABLE `cyc_additional_section_teacher`
  MODIFY `at_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `cyc_advance_exam_group`
  MODIFY `exam_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `cyc_biometric_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_campaign`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `cyc_campaign_time`
  MODIFY `ct_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

ALTER TABLE `cyc_classes_grouping`
  MODIFY `cg_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_class_coordinator`
  MODIFY `cc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `cyc_entries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2344;

ALTER TABLE `cyc_entryitems`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4687;

ALTER TABLE `cyc_entrytypes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `cyc_fee_head_ledger`
  MODIFY `fhl_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_fuel_refill`
  MODIFY `fr_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

ALTER TABLE `cyc_holiday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_hostel_room_bed`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `cyc_leads`
  MODIFY `l_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

ALTER TABLE `cyc_leads_counsellor`
  MODIFY `lc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `cyc_leads_followup`
  MODIFY `f_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `cyc_leads_followup_status`
  MODIFY `fws_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `cyc_ledgers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

ALTER TABLE `cyc_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_ptm`
  MODIFY `ptm_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_ptm_attendance`
  MODIFY `ptma_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_ptm_schedule`
  MODIFY `ptms_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_scheme_and_scholarship`
  MODIFY `ss_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `cyc_scheme_and_scholarship_feetype`
  MODIFY `ssvft_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `cyc_scheme_and_scholarship_student`
  MODIFY `sss_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `cyc_scheme_and_scholarship_value`
  MODIFY `ssv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `cyc_staff_payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `cyc_staff_payroll_increment`
  MODIFY `pi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

ALTER TABLE `cyc_student_addon_fee`
  MODIFY `af_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `cyc_tags`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_vehicle_parts_info`
  MODIFY `vp_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_vehicle_rto_info`
  MODIFY `vr_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cyc_vehicle_services`
  MODIFY `srv_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cy_ptm_time_slot`
  MODIFY `pts_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cy_vehicle_ticket`
  MODIFY `vt_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `daily_assignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `disable_reason`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `dispatch_receive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `email_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `email_config`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `email_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `email_template_attachment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `enquiry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `enquiry_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `exam_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `exam_group_class_batch_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `exam_group_class_batch_exam_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

ALTER TABLE `exam_group_class_batch_exam_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `exam_group_exam_connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `exam_group_exam_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `exam_group_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `exam_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `expense_head`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `face_authentication`
  MODIFY `fa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `feemasters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `fees_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `fees_reminder`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `feetype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `fee_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `fee_groups_feetype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=602;

ALTER TABLE `fee_receipt_no`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `fee_session_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

ALTER TABLE `filetypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `follow_up`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `front_cms_media_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `front_cms_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `front_cms_menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `front_cms_pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

ALTER TABLE `front_cms_page_contents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `front_cms_programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `front_cms_program_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `front_cms_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `gateway_ins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gateway_ins_response`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `general_calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `geofences`
  MODIFY `geo_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `geofence_events`
  MODIFY `ge_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gmeet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gmeet_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gmeet_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gmeet_staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `guest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `homework`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `homework_evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `hostel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `hostel_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `id_card`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `income_head`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `item_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `item_issue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `item_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `item_store`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `item_supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `languages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `lesson`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

ALTER TABLE `lesson_plan_forum`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `libarary_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132893;

ALTER TABLE `mark_divisions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

ALTER TABLE `multi_branch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notification_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

ALTER TABLE `notification_setting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

ALTER TABLE `offline_fees_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

ALTER TABLE `onlineexam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `onlineexam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `onlineexam_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `onlineexam_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `onlineexam_student_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_admissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_admission_custom_field_value`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_admission_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_admission_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `online_course_class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `online_course_lesson`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_course_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_course_processing_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_course_quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_course_section`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `online_course_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `payment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `payslip_allowance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `permission_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12012;

ALTER TABLE `permission_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1301;

ALTER TABLE `permission_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=901;

ALTER TABLE `pickup_point`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `print_headerfooter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `read_notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1107;

ALTER TABLE `reference`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `roles_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2072;

ALTER TABLE `room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `route_pickup_point`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `school_houses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

ALTER TABLE `send_notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

ALTER TABLE `share_contents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `share_content_for`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `share_upload_contents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `sidebar_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

ALTER TABLE `sidebar_sub_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=254;

ALTER TABLE `sms_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `sms_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

ALTER TABLE `source`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=291;

ALTER TABLE `staff_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_attendance_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `staff_designation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

ALTER TABLE `staff_id_card`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `staff_leave_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=723;

ALTER TABLE `staff_leave_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

ALTER TABLE `staff_payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_payslip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

ALTER TABLE `staff_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=302;

ALTER TABLE `staff_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4269;

ALTER TABLE `student_applyleave`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

ALTER TABLE `student_attendences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1034323;

ALTER TABLE `student_attendences_hostel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `student_attendences_transport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_behaviour`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `student_doc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_edit_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `student_fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_fees_deposite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2295;

ALTER TABLE `student_fees_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `student_fees_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14689;

ALTER TABLE `student_fees_processing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_incidents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=333;

ALTER TABLE `student_incident_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_quiz_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student_session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9345;

ALTER TABLE `student_subject_attendances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `student_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `student_transport_fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

ALTER TABLE `subject_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

ALTER TABLE `subject_groups1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `subject_group_class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

ALTER TABLE `subject_group_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=476;

ALTER TABLE `subject_syllabus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `subject_timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6679;

ALTER TABLE `submit_assignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `template_admitcards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `template_marksheets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

ALTER TABLE `transport_feemaster`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `transport_route`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

ALTER TABLE `upload_contents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `userlog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18552;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8634;

ALTER TABLE `users_authentication`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1105;

ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `vehicle_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `video_tutorial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `video_tutorial_class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `visitors_book`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `visitors_purpose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `zoom_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `alumni_events`
  ADD CONSTRAINT `alumni_events_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumni_events_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

ALTER TABLE `alumni_students`
  ADD CONSTRAINT `alumni_students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `book_issues`
  ADD CONSTRAINT `book_issues_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_issues_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `libarary_members` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exams`
  ADD CONSTRAINT `cbse_exams_ibfk_1` FOREIGN KEY (`cbse_term_id`) REFERENCES `cbse_terms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exams_ibfk_2` FOREIGN KEY (`cbse_exam_grade_id`) REFERENCES `cbse_exam_grades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exams_ibfk_3` FOREIGN KEY (`cbse_exam_assessment_id`) REFERENCES `cbse_exam_assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exams_ibfk_4` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_assessment_types`
  ADD CONSTRAINT `cbse_exam_assessment_types_ibfk_1` FOREIGN KEY (`cbse_exam_assessment_id`) REFERENCES `cbse_exam_assessments` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_class_sections`
  ADD CONSTRAINT `cbse_exam_class_sections_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_class_sections_ibfk_2` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_grades_range`
  ADD CONSTRAINT `cbse_exam_grades_range_ibfk_1` FOREIGN KEY (`cbse_exam_grade_id`) REFERENCES `cbse_exam_grades` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_students`
  ADD CONSTRAINT `cbse_exam_students_ibfk_1` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_students_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_student_subject_rank`
  ADD CONSTRAINT `cbse_exam_student_subject_rank_ibfk_1` FOREIGN KEY (`cbse_template_id`) REFERENCES `cbse_template` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_student_subject_rank_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_student_subject_rank_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_timetable`
  ADD CONSTRAINT `cbse_exam_timetable_ibfk_1` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_timetable_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_exam_timetable_assessment_types`
  ADD CONSTRAINT `cbse_exam_timetable_assessment_types_ibfk_1` FOREIGN KEY (`cbse_exam_timetable_id`) REFERENCES `cbse_exam_timetable` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_exam_timetable_assessment_types_ibfk_2` FOREIGN KEY (`cbse_exam_assessment_type_id`) REFERENCES `cbse_exam_assessment_types` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_observation_subparameter`
  ADD CONSTRAINT `cbse_exam_observation_id_ibfk_1` FOREIGN KEY (`cbse_exam_observation_id`) REFERENCES `cbse_exam_observations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_observation_parameter_id_ibfk_1` FOREIGN KEY (`cbse_observation_parameter_id`) REFERENCES `cbse_observation_parameters` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_observation_terms`
  ADD CONSTRAINT `cbse_exam_observations_ibfk_1` FOREIGN KEY (`cbse_exam_observation_id`) REFERENCES `cbse_exam_observations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_observation_terms_ibfk_2` FOREIGN KEY (`cbse_term_id`) REFERENCES `cbse_terms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_observation_terms_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_observation_term_student_subparameter`
  ADD CONSTRAINT `cbse_observation_term_student_subparameter_ibfk_1` FOREIGN KEY (`cbse_ovservation_term_id`) REFERENCES `cbse_observation_terms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_observation_term_student_subparameter_ibfk_2` FOREIGN KEY (`cbse_observation_subparameter_id`) REFERENCES `cbse_observation_subparameter` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_observation_term_student_subparameter_ibfk_3` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_student_exam_ranks`
  ADD CONSTRAINT `cbse_student_exam_ranks_ibfk_1` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_student_exam_ranks_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_student_subject_marks`
  ADD CONSTRAINT `cbse_exam_timetable_assessment_type_ibfk_4` FOREIGN KEY (`cbse_exam_timetable_assessment_type_id`) REFERENCES `cbse_exam_timetable_assessment_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_student_subject_marks_ibfk_1` FOREIGN KEY (`cbse_exam_timetable_id`) REFERENCES `cbse_exam_timetable` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_student_subject_marks_ibfk_2` FOREIGN KEY (`cbse_exam_student_id`) REFERENCES `cbse_exam_students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_student_subject_marks_ibfk_3` FOREIGN KEY (`cbse_exam_assessment_type_id`) REFERENCES `cbse_exam_assessment_types` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_student_template_rank`
  ADD CONSTRAINT `cbse_student_template_rank_ibfk_1` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_student_template_rank_ibfk_2` FOREIGN KEY (`cbse_template_id`) REFERENCES `cbse_template` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_template`
  ADD CONSTRAINT `cbse_template_ibfk_1` FOREIGN KEY (`gradeexam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cbse_template_ibfk_2` FOREIGN KEY (`remarkexam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cbse_template_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_template_class_sections`
  ADD CONSTRAINT `cbse_template_class_sections_ibfk_1` FOREIGN KEY (`cbse_template_id`) REFERENCES `cbse_template` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_template_class_sections_ibfk_2` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_template_terms`
  ADD CONSTRAINT `cbse_template_terms_ibfk_1` FOREIGN KEY (`cbse_template_id`) REFERENCES `cbse_template` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_template_terms_ibfk_2` FOREIGN KEY (`cbse_term_id`) REFERENCES `cbse_terms` (`id`) ON DELETE CASCADE;

ALTER TABLE `cbse_template_term_exams`
  ADD CONSTRAINT `cbse_template_term_exams_ibfk_1` FOREIGN KEY (`cbse_exam_id`) REFERENCES `cbse_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_template_term_exams_ibfk_2` FOREIGN KEY (`cbse_template_term_id`) REFERENCES `cbse_template_terms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cbse_template_term_exams_ibfk_4` FOREIGN KEY (`cbse_template_id`) REFERENCES `cbse_template` (`id`) ON DELETE CASCADE;

ALTER TABLE `chat_connections`
  ADD CONSTRAINT `chat_connections_ibfk_1` FOREIGN KEY (`chat_user_one`) REFERENCES `chat_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_connections_ibfk_2` FOREIGN KEY (`chat_user_two`) REFERENCES `chat_users` (`id`) ON DELETE CASCADE;

ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`chat_user_id`) REFERENCES `chat_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`chat_connection_id`) REFERENCES `chat_connections` (`id`) ON DELETE CASCADE;

ALTER TABLE `chat_users`
  ADD CONSTRAINT `chat_users_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_users_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_users_ibfk_3` FOREIGN KEY (`create_staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_users_ibfk_4` FOREIGN KEY (`create_student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `class_sections`
  ADD CONSTRAINT `class_sections_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_sections_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `class_section_times`
  ADD CONSTRAINT `class_section_times_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `class_teacher`
  ADD CONSTRAINT `class_teacher_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_teacher_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_teacher_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_teacher_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `conferences`
  ADD CONSTRAINT `conferences_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conferences_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `conferences_history`
  ADD CONSTRAINT `conferences_history_ibfk_1` FOREIGN KEY (`conference_id`) REFERENCES `conferences` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conferences_history_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conferences_history_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `conference_sections`
  ADD CONSTRAINT `conference_sections_ibfk_1` FOREIGN KEY (`conference_id`) REFERENCES `conferences` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conference_sections_ibfk_2` FOREIGN KEY (`cls_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `conference_staff`
  ADD CONSTRAINT `conference_staff_ibfk_1` FOREIGN KEY (`conference_id`) REFERENCES `conferences` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conference_staff_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `contents`
  ADD CONSTRAINT `contents_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contents_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contents_ibfk_3` FOREIGN KEY (`cls_sec_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `content_for`
  ADD CONSTRAINT `content_for_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `content_for_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `course_lesson_quiz_order`
  ADD CONSTRAINT `course_lesson_quiz_order_ibfk_1` FOREIGN KEY (`course_section_id`) REFERENCES `online_course_section` (`id`);

ALTER TABLE `course_progress`
  ADD CONSTRAINT `course_progress_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `online_courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_progress_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_progress_ibfk_3` FOREIGN KEY (`course_section_id`) REFERENCES `online_course_section` (`id`) ON DELETE CASCADE;

ALTER TABLE `course_quiz_answer`
  ADD CONSTRAINT `course_quiz_answer_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_quiz_answer_ibfk_2` FOREIGN KEY (`course_quiz_id`) REFERENCES `online_course_quiz` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_quiz_answer_ibfk_3` FOREIGN KEY (`course_quiz_question_id`) REFERENCES `course_quiz_question` (`id`) ON DELETE CASCADE;

ALTER TABLE `course_quiz_question`
  ADD CONSTRAINT `course_quiz_question_ibfk_1` FOREIGN KEY (`course_quiz_id`) REFERENCES `online_course_quiz` (`id`);

ALTER TABLE `custom_field_values`
  ADD CONSTRAINT `custom_field_values_ibfk_1` FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE;

ALTER TABLE `cyc_entries`
  ADD CONSTRAINT `cyc_entries_fk_check_entrytype_id` FOREIGN KEY (`entrytype_id`) REFERENCES `cyc_entrytypes` (`id`),
  ADD CONSTRAINT `cyc_entries_fk_check_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `cyc_tags` (`id`);

ALTER TABLE `cyc_entryitems`
  ADD CONSTRAINT `cyc_entryitems_fk_check_entry_id` FOREIGN KEY (`entry_id`) REFERENCES `cyc_entries` (`id`),
  ADD CONSTRAINT `cyc_entryitems_fk_check_ledger_id` FOREIGN KEY (`ledger_id`) REFERENCES `cyc_ledgers` (`id`);

ALTER TABLE `cyc_groups`
  ADD CONSTRAINT `cyc_groups_fk_check_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `cyc_groups` (`id`);

ALTER TABLE `daily_assignment`
  ADD CONSTRAINT `daily_assignment_ibfk_1` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `daily_assignment_ibfk_2` FOREIGN KEY (`evaluated_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `daily_assignment_ibfk_3` FOREIGN KEY (`subject_group_subject_id`) REFERENCES `subject_group_subjects` (`id`) ON DELETE CASCADE;

ALTER TABLE `email_attachments`
  ADD CONSTRAINT `email_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

ALTER TABLE `enquiry`
  ADD CONSTRAINT `enquiry_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiry_ibfk_3` FOREIGN KEY (`assigned`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiry_ibfk_4` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_class_batch_exams`
  ADD CONSTRAINT `exam_group_class_batch_exams_ibfk_1` FOREIGN KEY (`exam_group_id`) REFERENCES `exam_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_class_batch_exams_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_class_batch_exam_students`
  ADD CONSTRAINT `exam_group_class_batch_exam_students_ibfk_1` FOREIGN KEY (`exam_group_class_batch_exam_id`) REFERENCES `exam_group_class_batch_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_class_batch_exam_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_class_batch_exam_students_ibfk_3` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_class_batch_exam_subjects`
  ADD CONSTRAINT `exam_group_class_batch_exam_subjects_ibfk_1` FOREIGN KEY (`exam_group_class_batch_exams_id`) REFERENCES `exam_group_class_batch_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_class_batch_exam_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_exam_connections`
  ADD CONSTRAINT `exam_group_exam_connections_ibfk_1` FOREIGN KEY (`exam_group_id`) REFERENCES `exam_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_exam_connections_ibfk_2` FOREIGN KEY (`exam_group_class_batch_exams_id`) REFERENCES `exam_group_class_batch_exams` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_exam_results`
  ADD CONSTRAINT `exam_group_exam_results_ibfk_1` FOREIGN KEY (`exam_group_class_batch_exam_subject_id`) REFERENCES `exam_group_class_batch_exam_subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_exam_results_ibfk_2` FOREIGN KEY (`exam_group_student_id`) REFERENCES `exam_group_students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_exam_results_ibfk_3` FOREIGN KEY (`exam_group_class_batch_exam_student_id`) REFERENCES `exam_group_class_batch_exam_students` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_group_students`
  ADD CONSTRAINT `exam_group_students_ibfk_1` FOREIGN KEY (`exam_group_id`) REFERENCES `exam_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_group_students_ibfk_3` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `exam_schedules`
  ADD CONSTRAINT `exam_schedules_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_schedules_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`exp_head_id`) REFERENCES `expense_head` (`id`) ON DELETE CASCADE;

ALTER TABLE `feemasters`
  ADD CONSTRAINT `feemasters_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feemasters_ibfk_2` FOREIGN KEY (`feetype_id`) REFERENCES `feetype` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feemasters_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

ALTER TABLE `fees_discounts`
  ADD CONSTRAINT `fees_discounts_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `fee_groups_feetype`
  ADD CONSTRAINT `fee_groups_feetype_ibfk_1` FOREIGN KEY (`fee_session_group_id`) REFERENCES `fee_session_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_groups_feetype_ibfk_2` FOREIGN KEY (`fee_groups_id`) REFERENCES `fee_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_groups_feetype_ibfk_3` FOREIGN KEY (`feetype_id`) REFERENCES `feetype` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_groups_feetype_ibfk_4` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `fee_session_groups`
  ADD CONSTRAINT `fee_session_groups_ibfk_1` FOREIGN KEY (`fee_groups_id`) REFERENCES `fee_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_session_groups_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `follow_up`
  ADD CONSTRAINT `follow_up_ibfk_1` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiry` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follow_up_ibfk_2` FOREIGN KEY (`followup_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `front_cms_menu_items`
  ADD CONSTRAINT `front_cms_menu_items_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `front_cms_menus` (`id`) ON DELETE CASCADE;

ALTER TABLE `front_cms_page_contents`
  ADD CONSTRAINT `front_cms_page_contents_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `front_cms_pages` (`id`) ON DELETE CASCADE;

ALTER TABLE `front_cms_program_photos`
  ADD CONSTRAINT `front_cms_program_photos_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `front_cms_programs` (`id`) ON DELETE CASCADE;

ALTER TABLE `gateway_ins`
  ADD CONSTRAINT `gateway_ins_ibfk_1` FOREIGN KEY (`online_admission_id`) REFERENCES `online_admissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `gateway_ins_response`
  ADD CONSTRAINT `gateway_ins_response_ibfk_1` FOREIGN KEY (`gateway_ins_id`) REFERENCES `gateway_ins` (`id`) ON DELETE CASCADE;

ALTER TABLE `gmeet`
  ADD CONSTRAINT `gmeet_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `gmeet_history`
  ADD CONSTRAINT `gmeet_history_ibfk_1` FOREIGN KEY (`gmeet_id`) REFERENCES `gmeet` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_history_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_history_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `gmeet_sections`
  ADD CONSTRAINT `gmeet_sections_ibfk_1` FOREIGN KEY (`cls_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_sections_ibfk_2` FOREIGN KEY (`gmeet_id`) REFERENCES `gmeet` (`id`) ON DELETE CASCADE;

ALTER TABLE `gmeet_staff`
  ADD CONSTRAINT `gmeet_staff_ibfk_1` FOREIGN KEY (`gmeet_id`) REFERENCES `gmeet` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gmeet_staff_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `homework`
  ADD CONSTRAINT `homework_ibfk_1` FOREIGN KEY (`subject_group_subject_id`) REFERENCES `subject_group_subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_4` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_5` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_6` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_7` FOREIGN KEY (`evaluated_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_ibfk_8` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `homework_evaluation`
  ADD CONSTRAINT `homework_evaluation_ibfk_1` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_evaluation_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `homework_evaluation_ibfk_3` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `hostel_rooms`
  ADD CONSTRAINT `hostel_rooms_ibfk_1` FOREIGN KEY (`hostel_id`) REFERENCES `hostel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_rooms_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE;

ALTER TABLE `income`
  ADD CONSTRAINT `income_ibfk_1` FOREIGN KEY (`income_head_id`) REFERENCES `income_head` (`id`) ON DELETE CASCADE;

ALTER TABLE `item`
  ADD CONSTRAINT `item_ibfk_1` FOREIGN KEY (`item_category_id`) REFERENCES `item_category` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_ibfk_2` FOREIGN KEY (`item_store_id`) REFERENCES `item_store` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_ibfk_3` FOREIGN KEY (`item_supplier_id`) REFERENCES `item_supplier` (`id`) ON DELETE CASCADE;

ALTER TABLE `item_issue`
  ADD CONSTRAINT `item_issue_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_issue_ibfk_2` FOREIGN KEY (`item_category_id`) REFERENCES `item_category` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_issue_ibfk_3` FOREIGN KEY (`issue_to`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_issue_ibfk_4` FOREIGN KEY (`issue_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `item_stock`
  ADD CONSTRAINT `item_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_stock_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `item_supplier` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_stock_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `item_store` (`id`) ON DELETE CASCADE;

ALTER TABLE `lesson`
  ADD CONSTRAINT `lesson_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_ibfk_2` FOREIGN KEY (`subject_group_subject_id`) REFERENCES `subject_group_subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_ibfk_3` FOREIGN KEY (`subject_group_class_sections_id`) REFERENCES `subject_group_class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `lesson_plan_forum`
  ADD CONSTRAINT `lesson_plan_forum_ibfk_1` FOREIGN KEY (`subject_syllabus_id`) REFERENCES `subject_syllabus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_plan_forum_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_plan_forum_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `notification_roles`
  ADD CONSTRAINT `notification_roles_ibfk_1` FOREIGN KEY (`send_notification_id`) REFERENCES `send_notification` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `offline_fees_payments`
  ADD CONSTRAINT `offline_fees_payments_ibfk_1` FOREIGN KEY (`student_fees_master_id`) REFERENCES `student_fees_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_fees_payments_ibfk_2` FOREIGN KEY (`fee_groups_feetype_id`) REFERENCES `fee_groups_feetype` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_fees_payments_ibfk_3` FOREIGN KEY (`student_transport_fee_id`) REFERENCES `student_transport_fees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_fees_payments_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_fees_payments_ibfk_5` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `onlineexam`
  ADD CONSTRAINT `onlineexam_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `onlineexam_attempts`
  ADD CONSTRAINT `onlineexam_attempts_ibfk_1` FOREIGN KEY (`onlineexam_student_id`) REFERENCES `onlineexam_students` (`id`) ON DELETE CASCADE;

ALTER TABLE `onlineexam_questions`
  ADD CONSTRAINT `onlineexam_questions_ibfk_1` FOREIGN KEY (`onlineexam_id`) REFERENCES `onlineexam` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `onlineexam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `onlineexam_questions_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `onlineexam_students`
  ADD CONSTRAINT `onlineexam_students_ibfk_1` FOREIGN KEY (`onlineexam_id`) REFERENCES `onlineexam` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `onlineexam_students_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `onlineexam_student_results`
  ADD CONSTRAINT `onlineexam_student_results_ibfk_1` FOREIGN KEY (`onlineexam_student_id`) REFERENCES `onlineexam_students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `onlineexam_student_results_ibfk_2` FOREIGN KEY (`onlineexam_question_id`) REFERENCES `onlineexam_questions` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_admissions`
  ADD CONSTRAINT `online_admissions_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `online_admissions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `online_admissions_ibfk_3` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `online_admissions_ibfk_4` FOREIGN KEY (`school_house_id`) REFERENCES `school_houses` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_admission_custom_field_value`
  ADD CONSTRAINT `online_admission_custom_field_value_ibfk_1` FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_admission_payment`
  ADD CONSTRAINT `online_admission_payment_ibfk_1` FOREIGN KEY (`online_admission_id`) REFERENCES `online_admissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_courses`
  ADD CONSTRAINT `online_courses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_course_class_sections`
  ADD CONSTRAINT `online_course_class_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `online_courses` (`id`),
  ADD CONSTRAINT `online_course_class_sections_ibfk_2` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`);

ALTER TABLE `online_course_lesson`
  ADD CONSTRAINT `online_course_lesson_ibfk_1` FOREIGN KEY (`course_section_id`) REFERENCES `online_course_section` (`id`);

ALTER TABLE `online_course_quiz`
  ADD CONSTRAINT `online_course_quiz_ibfk_1` FOREIGN KEY (`course_section_id`) REFERENCES `online_course_section` (`id`),
  ADD CONSTRAINT `online_course_quiz_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `online_course_section`
  ADD CONSTRAINT `online_course_section_ibfk_1` FOREIGN KEY (`online_course_id`) REFERENCES `online_courses` (`id`);

ALTER TABLE `payslip_allowance`
  ADD CONSTRAINT `payslip_allowance_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payslip_allowance_ibfk_2` FOREIGN KEY (`payslip_id`) REFERENCES `staff_payslip` (`id`) ON DELETE CASCADE;

ALTER TABLE `permission_category`
  ADD CONSTRAINT `permission_category_ibfk_1` FOREIGN KEY (`perm_group_id`) REFERENCES `permission_group` (`id`) ON DELETE CASCADE;

ALTER TABLE `permission_student`
  ADD CONSTRAINT `permission_student_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `permission_group` (`id`) ON DELETE CASCADE;

ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questions_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questions_ibfk_4` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questions_ibfk_5` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questions_ibfk_6` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `read_notification`
  ADD CONSTRAINT `read_notification_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `send_notification` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `read_notification_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `read_notification_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `roles_permissions`
  ADD CONSTRAINT `roles_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `roles_permissions_ibfk_2` FOREIGN KEY (`perm_cat_id`) REFERENCES `permission_category` (`id`) ON DELETE CASCADE;

ALTER TABLE `route_pickup_point`
  ADD CONSTRAINT `route_pickup_point_ibfk_1` FOREIGN KEY (`transport_route_id`) REFERENCES `transport_route` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `route_pickup_point_ibfk_2` FOREIGN KEY (`pickup_point_id`) REFERENCES `pickup_point` (`id`) ON DELETE CASCADE;

ALTER TABLE `send_notification`
  ADD CONSTRAINT `send_notification_ibfk_1` FOREIGN KEY (`created_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `share_contents`
  ADD CONSTRAINT `share_contents_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `share_content_for`
  ADD CONSTRAINT `share_content_for_ibfk_1` FOREIGN KEY (`share_content_id`) REFERENCES `share_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_content_for_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `share_content_for_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`),
  ADD CONSTRAINT `share_content_for_ibfk_4` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`),
  ADD CONSTRAINT `share_content_for_ibfk_5` FOREIGN KEY (`user_parent_id`) REFERENCES `users` (`id`);

ALTER TABLE `share_upload_contents`
  ADD CONSTRAINT `share_upload_contents_ibfk_1` FOREIGN KEY (`upload_content_id`) REFERENCES `upload_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_upload_contents_ibfk_2` FOREIGN KEY (`share_content_id`) REFERENCES `share_contents` (`id`) ON DELETE CASCADE;

ALTER TABLE `sidebar_menus`
  ADD CONSTRAINT `sidebar_menus_ibfk_1` FOREIGN KEY (`permission_group_id`) REFERENCES `permission_group` (`id`) ON DELETE SET NULL;

ALTER TABLE `sidebar_sub_menus`
  ADD CONSTRAINT `sidebar_sub_menus_ibfk_1` FOREIGN KEY (`sidebar_menu_id`) REFERENCES `sidebar_menus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sidebar_sub_menus_ibfk_2` FOREIGN KEY (`permission_group_id`) REFERENCES `permission_group` (`id`) ON DELETE SET NULL;

ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`designation`) REFERENCES `staff_designation` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_ibfk_2` FOREIGN KEY (`department`) REFERENCES `department` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_attendance`
  ADD CONSTRAINT `FK_staff_attendance_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_staff_attendance_staff_attendance_type` FOREIGN KEY (`staff_attendance_type_id`) REFERENCES `staff_attendance_type` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_leave_details`
  ADD CONSTRAINT `FK_staff_leave_details_leave_types` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_staff_leave_details_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_leave_request`
  ADD CONSTRAINT `FK_staff_leave_request_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_leave_request_ibfk_1` FOREIGN KEY (`applied_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_leave_request_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_payslip`
  ADD CONSTRAINT `FK_staff_payslip_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_rating`
  ADD CONSTRAINT `FK_staff_rating_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_roles`
  ADD CONSTRAINT `FK_staff_roles_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_staff_roles_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `staff_timeline`
  ADD CONSTRAINT `FK_staff_timeline_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_applyleave`
  ADD CONSTRAINT `student_applyleave_ibfk_1` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_applyleave_ibfk_2` FOREIGN KEY (`approve_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_attendences`
  ADD CONSTRAINT `student_attendences_ibfk_1` FOREIGN KEY (`attendence_type_id`) REFERENCES `attendence_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendences_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_attendences_hostel`
  ADD CONSTRAINT `student_attendences_hostel_ibfk_1` FOREIGN KEY (`attendence_type_id`) REFERENCES `attendence_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendences_hostel_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_attendences_transport`
  ADD CONSTRAINT `student_attendences_transport_ibfk_1` FOREIGN KEY (`attendence_type_id`) REFERENCES `attendence_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendences_transport_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_fees`
  ADD CONSTRAINT `student_fees_ibfk_1` FOREIGN KEY (`feemaster_id`) REFERENCES `feemasters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_fees_deposite`
  ADD CONSTRAINT `student_fees_deposite_ibfk_1` FOREIGN KEY (`student_transport_fee_id`) REFERENCES `student_transport_fees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_deposite_ibfk_2` FOREIGN KEY (`student_fees_master_id`) REFERENCES `student_fees_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_deposite_ibfk_3` FOREIGN KEY (`fee_groups_feetype_id`) REFERENCES `fee_groups_feetype` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_fees_discounts`
  ADD CONSTRAINT `student_fees_discounts_ibfk_1` FOREIGN KEY (`fees_discount_id`) REFERENCES `fees_discounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_discounts_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_fees_master`
  ADD CONSTRAINT `student_fees_master_ibfk_1` FOREIGN KEY (`fee_session_group_id`) REFERENCES `fee_session_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_master_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_fees_processing`
  ADD CONSTRAINT `student_fees_processing_ibfk_1` FOREIGN KEY (`student_fees_master_id`) REFERENCES `student_fees_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_processing_ibfk_2` FOREIGN KEY (`student_transport_fee_id`) REFERENCES `student_transport_fees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_processing_ibfk_3` FOREIGN KEY (`fee_groups_feetype_id`) REFERENCES `fee_groups_feetype` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_fees_processing_ibfk_4` FOREIGN KEY (`gateway_ins_id`) REFERENCES `gateway_ins` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_incidents`
  ADD CONSTRAINT `student_incidents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_incidents_ibfk_2` FOREIGN KEY (`incident_id`) REFERENCES `student_behaviour` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_incident_comments`
  ADD CONSTRAINT `student_incident_comments_ibfk_1` FOREIGN KEY (`student_incident_id`) REFERENCES `student_incidents` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_quiz_status`
  ADD CONSTRAINT `student_quiz_status_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_quiz_status_ibfk_2` FOREIGN KEY (`course_quiz_id`) REFERENCES `online_course_quiz` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_session`
  ADD CONSTRAINT `student_session_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_session_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_session_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_session_ibfk_4` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_session_ibfk_5` FOREIGN KEY (`vehroute_id`) REFERENCES `vehicle_routes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_session_ibfk_6` FOREIGN KEY (`route_pickup_point_id`) REFERENCES `route_pickup_point` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_session_ibfk_7` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE SET NULL;

ALTER TABLE `student_subject_attendances`
  ADD CONSTRAINT `student_subject_attendances_ibfk_1` FOREIGN KEY (`attendence_type_id`) REFERENCES `attendence_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subject_attendances_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subject_attendances_ibfk_3` FOREIGN KEY (`subject_timetable_id`) REFERENCES `subject_timetable` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_timeline`
  ADD CONSTRAINT `student_timeline_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `student_transport_fees`
  ADD CONSTRAINT `student_transport_fees_ibfk_1` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_transport_fees_ibfk_2` FOREIGN KEY (`route_pickup_point_id`) REFERENCES `route_pickup_point` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_transport_fees_ibfk_3` FOREIGN KEY (`transport_feemaster_id`) REFERENCES `transport_feemaster` (`id`) ON DELETE CASCADE;

ALTER TABLE `subject_groups`
  ADD CONSTRAINT `subject_groups_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `subject_group_class_sections`
  ADD CONSTRAINT `subject_group_class_sections_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_group_class_sections_ibfk_2` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_group_class_sections_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `subject_group_subjects`
  ADD CONSTRAINT `subject_group_subjects_ibfk_1` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_group_subjects_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_group_subjects_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

ALTER TABLE `subject_syllabus`
  ADD CONSTRAINT `subject_syllabus_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topic` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_syllabus_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_syllabus_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_syllabus_ibfk_4` FOREIGN KEY (`created_for`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `subject_timetable`
  ADD CONSTRAINT `subject_timetable_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_timetable_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_timetable_ibfk_3` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_timetable_ibfk_4` FOREIGN KEY (`subject_group_subject_id`) REFERENCES `subject_group_subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_timetable_ibfk_5` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_timetable_ibfk_6` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `submit_assignment`
  ADD CONSTRAINT `submit_assignment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submit_assignment_ibfk_2` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`) ON DELETE CASCADE;

ALTER TABLE `topic`
  ADD CONSTRAINT `topic_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `topic_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`) ON DELETE CASCADE;

ALTER TABLE `transport_feemaster`
  ADD CONSTRAINT `transport_feemaster_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

ALTER TABLE `upload_contents`
  ADD CONSTRAINT `upload_contents_ibfk_1` FOREIGN KEY (`upload_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `upload_contents_ibfk_2` FOREIGN KEY (`content_type_id`) REFERENCES `content_types` (`id`) ON DELETE CASCADE;

ALTER TABLE `userlog`
  ADD CONSTRAINT `userlog_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

ALTER TABLE `vehicle_routes`
  ADD CONSTRAINT `vehicle_routes_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `transport_route` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vehicle_routes_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

ALTER TABLE `video_tutorial`
  ADD CONSTRAINT `video_tutorial_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

ALTER TABLE `video_tutorial_class_sections`
  ADD CONSTRAINT `video_tutorial_class_sections_ibfk_1` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `video_tutorial_class_sections_ibfk_2` FOREIGN KEY (`video_tutorial_id`) REFERENCES `video_tutorial` (`id`) ON DELETE CASCADE;

ALTER TABLE `visitors_book`
  ADD CONSTRAINT `visitors_book_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `visitors_book_ibfk_2` FOREIGN KEY (`student_session_id`) REFERENCES `student_session` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

