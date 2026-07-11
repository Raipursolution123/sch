# Complete Navigation & Sitemap

**Source:** `sidebar_menus` / `sidebar_sub_menus` (DB-driven), `main_menu_array()` (canonical map), `layout/student/header.php` (portal nav), controller inventory.

**Gates on every admin screen:** `permission_group.is_active` (module) + `rbac->hasPrivilege(category, can_view|can_add|can_edit|can_delete)` + `Admin_Controller` session.

Live sidebar row order is in your DB (`sidebar_display=1`). Structure below matches Smart School defaults + this project's custom extensions.

## Navigation architecture

```
Sidebar (DB)
  └── Main Menu (permission_group module)
        └── Sub Menu (url route)
              └── Screen(s) (controller/methods — some hidden sub-screens)
                    ├── Permission: permission_category + action
                    ├── Tables: primary data store
                    ├── Purpose
                    ├── CRUD
                    └── Dependencies
```

**Quick Links mega-menu** (`top_sidemenu.php`): all menus where `sidebar_display ≠ 1` but still permitted.

---

## ADMIN STAFF PORTAL

### 1. Dashboard (top bar — not a sidebar leaf)

| Screen | Permission | Tables | Purpose | CRUD | Dependencies |
|--------|------------|--------|---------|------|--------------|
| Admin Dashboard | `dashboard`, can_view | student_fees_deposite, expenses, income, student_session, staff | KPI widgets, fee/expense charts | Read | Active session, staff login |

**URL:** `admin/admin/dashboard`

---

### 2. Front Office — Module: `front_office`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD | Dependencies |
|----------|--------|-----|------------|--------|---------|------|--------------|
| Admission Enquiry | Enquiry List / Add / Edit | admin/enquiry | admission_enquiry | enquiry, enquiry_type, follow_up, reference | Pre-admission leads | CRUD | Classes, sessions |
| Visitor Book | Visitors | admin/visitors | visitor_book | visitors_book, visitors_purpose | Gate visitor log | CRUD | Staff |
| Phone Call Log | General Calls | admin/generalcall | phone_call_log | general_calls | Inbound/outbound call log | CRUD | — |
| Postal Dispatch | Dispatch | admin/dispatch | postal_dispatch | dispatch_receive | Outgoing mail | CRUD | — |
| Postal Receive | Receive | admin/receive | postal_receive | dispatch_receive | Incoming mail | CRUD | — |
| Complaint | Complaints | admin/complaint | complaint | complaint, complaint_type | Grievance tracking | CRUD | Staff, students |
| Setup | Visitor Purpose | admin/visitorspurpose | setup_front_office | visitors_purpose | Purpose master | CRUD | — |

---

### 3. Student Information — Module: `student_information`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD | Dependencies |
|----------|--------|-----|------------|--------|---------|------|--------------|
| Student Details | Search / Create / View / Edit | student/search | student | students, student_session, users, categories, student_doc | Core student registry | CRUD | Classes, sections, sessions |
| Import Students | | student/import | import_student | students, users | Bulk import | Create | Classes |
| Multi Class | | student/multiclass | multi_class_student | student_session | Multiple class enrollments | Update | Sessions |
| Disabled Students | | student/disablestudentslist | disable_student | students, disable_reason | Inactive students | Read/Update | — |
| Online Admission | Pending Applications | admin/onlinestudent | online_admission | online_admissions, online_admission_* | Review web applications | Read/Update/Approve | Classes, sessions |
| Student Categories | Category Master | category/index | student_categories | categories | Category codes | CRUD | — |
| Student House | House Master | admin/schoolhouse | student_houses | school_houses | House grouping | CRUD | — |
| Disable Reason | Reason Master | admin/disable_reason | disable_reason | disable_reason | Deactivation reasons | CRUD | — |

**Hidden sub-screens:** student/create, student/view/{id}, student/edit/{id}, student/bulkmail, credential send, barcode, timeline, fees shortcut from student profile.

---

### 4. Fees Collection — Module: `fees_collection`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD | Dependencies |
|----------|--------|-----|------------|--------|---------|------|--------------|
| Collect Fees | Fee Collection | studentfee/index | collect_fees | student_fees_master, student_fees_deposite, fee_groups_feetype | Collect & receipt | Create/Read | student_session, fee assignment |
| Add Fee (per student) | | studentfee/addfee/{ssid} | collect_fees | student_fees_deposite, fee_receipt_no | Single-student collection | Create | Schemes, transport |
| Search Due Fees | | studentfee/feesearch | search_due_fees | student_fees_master | Outstanding search | Read | Sessions |
| Search Payment | | studentfee/searchpayment | search_fees_payment | student_fees_deposite | Payment history | Read | — |
| Fees Master | Fee Group Assignment | admin/feemaster | fees_master | fee_session_groups, fee_groups, fee_groups_feetype | Session fee structure | CRUD | Sessions, classes |
| Assign to Students | | admin/feemaster/assign/{id} | fees_group_assign | student_fees_master | Map fees to students | Create | Students enrolled |
| Fees Group | Fee Groups | admin/feegroup | fees_group | fee_groups | Fee group names | CRUD | Sessions |
| Fees Type | Fee Types | admin/feetype | feetype | feetype, fee_groups_feetype | Fee head codes | CRUD | Fee groups |
| Fees Discount | Discount Plans | admin/feediscount | fees_discount | fees_discounts, student_fees_discounts | Manual discounts | CRUD | Students |
| Fees Carry Forward | Carry Forward | admin/feesforward | fees_forward | student_fees_master | Prior session balance | Create | Prior session data |
| Fees Reminder | Reminder Settings | admin/feereminder/setting | fees_reminder | fees_reminder | Auto SMS/email rules | Update | SMS config |
| Offline Bank Payments | Offline Payments | admin/offlinepayment | offline_bank_payments | offline_fees_payments | Bank deposit approval | Read/Update | Payment settings |

**Hidden (custom — not sidebar):**

| Screen | URL | Permission | Tables | Purpose |
|--------|-----|------------|--------|---------|
| Scheme & Scholarship Setup | admin/feemaster/scheme_and_scholarship | fees_master | cyc_scheme_and_scholarship*, fee_groups_feetype | Concession schemes |
| Apply/Approve Scheme | admin/feemaster/apply_scheme_scholarship | fees_master | cyc_scheme_and_scholarship_student | Student scheme approval |
| Positive Fee Adjustment | admin/feemaster/positive_fee_adjustment | fees_master | cyc_student_addon_fee | Ad-hoc fee lines |
| Print Receipt | studentfee/printFeesByName (AJAX) | collect_fees | student_fees_deposite | Receipt print |
| Group Receipt Print | studentfee/printFeesByGroupArray | collect_fees | student_fees_deposite | Multi-fee receipt |

---

### 5. Income — Module: `income`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Add Income | Income List | admin/income | income | income, income_head | Non-fee income | CRUD |
| Income Head | Income Heads | admin/incomehead | income_head | income_head | Income categories | CRUD |

---

### 6. Expense — Module: `expense`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Add Expense | Expense List | admin/expense | expense | expenses, expense_head | School expenses | CRUD |
| Expense Head | Expense Heads | admin/expensehead | expense_head | expense_head | Expense categories | CRUD |

---

### 7. Examinations — Module: `examination`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Exam Group | Exam Groups | admin/examgroup | exam_group | exam_groups, exam_group_* | Exam structure | CRUD |
| Exam Schedule | Schedule | admin/exam_schedule | exam_schedule | exam_schedules | Timetable of exams | CRUD |
| Exam Result | Results Entry | admin/examresult | exam_result | exam_group_exam_results | Marks entry | CRUD |
| Admit Card | Admit Card Templates | admin/admitcard | admit_card | template_admitcards | Admit card design | CRUD |
| Marksheet | Marksheet Templates | admin/marksheet | marksheet | template_marksheets | Marksheet design | CRUD |
| Marks Grade | Grades | admin/grade | marks_grade | grades | Grade scale | CRUD |
| Marks Division | Divisions | admin/marksdivision | marks_division | mark_divisions | Result divisions | CRUD |

---

### 8. Attendance — Module: `student_attendance`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Approve Leave | Leave Approval | admin/approve_leave | approve_leave | student_applyleave | Student leave workflow | Update |
| Student Attendance | Daily Attendance | admin/stuattendence | student_attendance | student_attendences | Class attendance | CRUD |
| Subject Attendance | Subject-wise | admin/subjectattendence | subject_attendance | student_subject_attendances | Period attendance | CRUD |

---

### 9. Online Examinations — Module: `online_examination`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Online Exam | Exam Setup | admin/onlineexam | online_examination | onlineexam, onlineexam_* | Online tests | CRUD |
| Question Bank | Questions | admin/question | question_bank | questions, onlineexam_questions | MCQ bank | CRUD |

---

### 10. Lesson Plan — Module: `lesson_plan`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Syllabus Status | Status Dashboard | admin/syllabus/status | manage_syllabus_status | subject_syllabus, lesson | Progress tracking | Read |
| Lesson Plan | Lessons / Topics | admin/lessonplan/lesson | lesson_plan | lesson, topic, lesson_plan_forum | Curriculum planning | CRUD |

---

### 11. Academics — Module: `academics`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Class Timetable | Timetable | admin/timetable/classreport | class_timetable | subject_timetable | Weekly schedule | CRUD |
| Teachers Timetable | Teacher TT | admin/timetable/mytimetable | teachers_time_table | subject_timetable | Staff schedule view | Read |
| Class Teacher | Assign Class Teacher | admin/teacher/assign_class_teacher | assign_class_teacher | class_teacher | Class in-charge | CRUD |
| Promote Students | Session Transfer | admin/stdtransfer | promote_student | student_session | Year-end promotion | Create |
| Subject Group | Subject Groups | admin/subjectgroup | subject_group | subject_groups, subject_group_* | Grouped subjects | CRUD |
| Subjects | Subject Master | admin/subject | subject | subjects | Subject list | CRUD |
| Class | Classes | classes/index | class | classes, class_sections | Class structure | CRUD |
| Sections | Sections | sections/index | section | sections | Section list | CRUD |

**Modern route mapping (new ERP):** Sessions → `/academics/sessions`; Classes → `/academics/classes`; etc.

---

### 12. Human Resource — Module: `human_resource`

| Permission keys | Screens |
|-----------------|---------|
| staff | Staff Directory |
| staff_attendance | Staff Attendance |
| staff_payroll | Payroll |
| approve_leave_request | Staff Leave |
| leave_types | Leave Types |
| department | Departments |
| designation | Designations |

---

### 13. Communicate — Module: `communicate`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Notice Board | Notices | admin/notification | notice_board | send_notification, read_notification | Announcements | CRUD |
| Send Email / SMS | Compose | admin/mailsms/compose | email_sms | messages, email_*, sms_* | Bulk communication | Create |
| Bulk Email to Students | Bulk Mail | student/bulkmail | email_sms | students, users | Mass email | Create |

---

### 14. Download Center — Module: `download_center`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Content Type | Types | admin/contenttype | upload_content | content_types | File categories | CRUD |
| Upload Content | Content List | admin/content/list | upload_content | upload_contents, share_* | Study materials | CRUD |
| Video Tutorial | Videos | admin/video_tutorial | video_tutorial | video_tutorial, video_tutorial_class_sections | Video library | CRUD |

---

### 15. Homework — Module: `homework`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Homework | Assignments | homework/index | homework | homework, homework_evaluation | Daily homework | CRUD |
| Daily Assignment | Daily Tasks | homework/dailyassignment | daily_assignment | daily_assignment, submit_assignment | Short assignments | CRUD |

---

### 16. Library — Module: `library`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Book List | Books | admin/book | books | books | Catalog | CRUD |
| Issue / Return | Members / Issue | admin/member | issue_return | book_issues, libarary_members | Circulation | CRUD |

---

### 17. Inventory — Module: `inventory`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Issue Item | Issue | admin/issueitem | issue_item | item_issue | Stock issue to staff | CRUD |
| Add Item Stock | Stock In | admin/itemstock | item_stock | item_stock | Stock receipt | CRUD |
| Item | Item Master | admin/item | item | item | SKU list | CRUD |
| Item Category | Categories | admin/itemcategory | item_category | item_category | Classification | CRUD |
| Item Store | Stores | admin/itemstore | item_store | item_store | Store locations | CRUD |
| Item Supplier | Suppliers | admin/itemsupplier | item_supplier | item_supplier | Vendor master | CRUD |

---

### 18. Transport — Module: `transport`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Transport Fees | Fee Master | admin/transport/feemaster | transport_fees | transport_feemaster, student_transport_fees | Route fees | CRUD |
| Pickup Point | Pickup Points | admin/pickuppoint | pickup_point | pickup_point, route_pickup_point | Stop master | CRUD |
| Routes | Routes | admin/route | routes | transport_route | Route definition | CRUD |
| Vehicles | Vehicle Fleet | admin/vehicle | vehicle | vehicles, cyc_vehicle_* | Fleet registry | CRUD |
| Assign Vehicle | Vehicle Routes | admin/vehroute | assign_vehicle | vehicle_routes, vehroute | Route-vehicle map | CRUD |

---

### 19. Hostel — Module: `hostel`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Hostel Rooms | Rooms | admin/hostelroom | hostel_rooms | hostel_rooms, cyc_hostel_room_bed | Room allocation | CRUD |
| Room Type | Room Types | admin/roomtype | hostel_room_type | room_types | Room categories | CRUD |
| Hostel | Hostels | admin/hostel | hostel | hostel | Building master | CRUD |

---

### 20. Certificate — Module: `certificate`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Certificate | Templates | admin/certificate | certificate | certificates | Certificate designs | CRUD |
| Generate Certificate | Generate | admin/generatecertificate | generate_certificate | students | Print certificates | Read |
| Student ID Card | ID Templates | admin/studentidcard | student_id_card | id_card, student_id_card | ID card design | CRUD |
| Generate ID Card | Print IDs | admin/generateidcard/search | generate_id_card | students | Batch ID print | Read |
| Staff ID Card | Staff Templates | admin/staffidcard | staff_id_card | staff_id_card | Staff ID design | CRUD |
| Generate Staff ID | Print Staff IDs | admin/generatestaffidcard | generate_staff_id_card | staff | Batch print | Read |

---

### 21. Front CMS — Module: `front_cms`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Events | CMS Events | admin/front/events | event | events, front_cms_programs | Public events | CRUD |
| Gallery | Gallery | admin/front/gallery | gallery | front_cms_media_gallery | Photo gallery | CRUD |
| Notice | CMS Notices | admin/front/notice | notice | front_cms_pages | Public notices | CRUD |
| Media Manager | Media | admin/front/media | media_manager | front_cms_media_gallery | File manager | CRUD |
| Pages | CMS Pages | admin/front/page | pages | front_cms_pages, front_cms_page_contents | Website pages | CRUD |
| Menus | Menu Builder | admin/front/menus | menus | front_cms_menus, front_cms_menu_items | Site navigation | CRUD |
| Banner | Banners | admin/front/banner | banner_images | front_cms_settings | Homepage banners | CRUD |

---

### 22. Alumni — Module: `alumni`

| Sub Menu | Screen | URL | Permission | Tables | Purpose | CRUD |
|----------|--------|-----|------------|--------|---------|------|
| Manage Alumni | Alumni List | admin/alumni/alumnilist | manage_alumni | alumni_students, alumni_events | Alumni registry | CRUD |
| Events | Alumni Events | admin/alumni/events | alumni_event | alumni_events | Alumni gatherings | CRUD |

---

### 23. Reports — Module: `reports` + `finance_reports`

| Sub Menu Group | Screens (controller/method) | Permission (typical) | Primary Tables |
|----------------|----------------------------|----------------------|----------------|
| Student Reports | report/studentreport, admission_report, student_profile, sibling_report, guardianreport, class_subject, classsectionreport, student_teacher_ratio, boys_girls_ratio, online_admission_report, logindetailreport, parentlogindetailreport | student_report | students, student_session |
| Attendance Reports | attendencereports/*, report/attendance | attendance_report | student_attendences, staff_attendance |
| Exam Reports | examresult/rankreport, examresult/examinations | exam_result_report | exam_group_* |
| Online Exam Reports | onlineexam/report, report/onlineexam* | online_examination_report | onlineexam_* |
| Finance Reports | financereports/* — due fees, daily collection, income/expense, payroll, online admission fees | finance_report | student_fees_deposite, income, expenses |
| Library Reports | report/library, book/bookissue_returnreport | library_report | books, book_issues |
| Inventory Reports | report/inventory* | inventory_report | item, item_stock |
| HR Reports | report/staff_report, payroll/payrollreport | staff_report | staff, staff_payroll |
| Transport/Hostel | route/studenttransportdetails, hostelroom/studenthosteldetails | transport_report, hostel_report | student_transport_fees, hostel_rooms |
| Homework Reports | homework/homeworkreport, evaluation_report | homework_report | homework |
| Audit / User Log | audit/index, userlog/index | audit_trail, user_log | logs, userlog |
| Lesson Plan Reports | report/lesson_plan, teachersyllabusstatus | lesson_plan_report | lesson, topic |
| Alumni Report | report/alumnireport | alumni_report | alumni_students |

**URL prefix:** `report/*`, `attendencereports/*`, `financereports/*`

---

### 24. System Settings — Module: `system_settings`

| Sub Menu | Screen | URL | Permission | Tables | Purpose |
|----------|--------|-----|------------|--------|---------|
| General Settings | School Settings | schsettings/index | general_setting | sch_settings | Core config |
| Session | Academic Sessions | sessions/index | session_setting | sessions | Year management |
| Notification | Notification Config | admin/notification/setting | notification_setting | notification_setting | Push/email rules |
| SMS Config | SMS Gateway | admin/smsconfig | sms_setting | sms_config | SMS provider |
| Email Config | SMTP | admin/emailconfig | email_setting | email_config | Mail server |
| Payment Methods | Gateways | admin/paymentsettings | payment_methods | payment_settings, gateway_ins | Razorpay etc. |
| Print Header Footer | Receipt headers | admin/print_headerfooter | print_headerfooter | print_headerfooter | Print branding |
| Front CMS Settings | CMS config | admin/frontcms | front_cms_setting | front_cms_settings | Public site |
| Roles & Permissions | Roles | admin/roles | superadmin / roles | roles, roles_permissions | RBAC |
| Backup / Restore | DB Backup | admin/admin/backup | backup | filesystem | Disaster recovery |
| Languages | Language | admin/language | language | languages | i18n |
| Currency | Currency | admin/currency | currency | currencies | Multi-currency |
| Users | User Accounts | admin/users | user_status | users | Portal users |
| Modules | Module Toggle | admin/module | superadmin | permission_group | Feature flags |
| Custom Fields | Custom Fields | admin/customfield | custom_field | custom_fields, custom_field_values | Extra form fields |
| Captcha | Captcha | admin/captcha | captcha_setting | captcha | Bot protection |
| System Fields | Field visibility | admin/systemfield | system_field | sch_settings (flags) | Form field toggles |
| Student Profile Edit | Profile settings | student/profilesetting | student_profile_update | student_edit_fields | Editable fields |
| Online Admission Settings | Admission config | admin/onlineadmission/admissionsetting | online_admission | sch_settings, online_admission_fields | Web admission |
| System Update | Updater | admin/updater | superadmin | — | Version update |
| Sidebar Menu | Menu Editor | admin/sidemenu | sidebar_menu | sidebar_menus, sidebar_sub_menus | Nav config |
| File Types | Allowed files | admin/admin/filetype | superadmin | filetypes | Upload whitelist |

**Hidden settings sub-screens:** schsettings/fees, schsettings/logo, schsettings/attendancetype, schsettings/maintenance, etc.

---

### 25. GMeet Live Classes — Module: `gmeet_live_classes` (addon ssglc)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Live Classes | admin/gmeet | gmeet_live_classes | gmeet, gmeet_* |
| Timetable / Meeting / Reports | admin/gmeet/timetable, meeting, class_report, meeting_report | gmeet_live_classes | gmeet_history |

---

### 26. Zoom Live Classes — Module: `zoom_live_classes` (addon sszlc)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Zoom Classes | admin/conference | zoom_live_classes | conferences, conferences_history |

---

### 27. Behaviour Records — Module: `behaviour_records` (addon)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Student Incidents | behaviour/studentincidents | behaviour_records | student_incidents, student_behaviour |
| Incidents Master | behaviour/incidents | behaviour_records | student_incidents |
| Reports / Settings | behaviour/report/*, setting | behaviour_records | behaviour_settings |

---

### 28. Multi Branch — Module: `multi_branch` (addon)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Branch Overview | admin/multibranch/branch | multi_branch | multi_branch |
| Cross-branch Finance | admin/multibranch/finance | multi_branch | per-branch DBs |

---

### 29. Online Course — Module: `online_course` (addon ssoclc)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Courses | onlinecourse/course | online_course | online_courses, online_course_* |
| Categories | onlinecourse/coursecategory | online_course | course_category |
| Reports | onlinecourse/coursereport/* | online_course | course_progress, online_course_payment |
| Offline Payment | onlinecourse/offlinepayment | offline_payment | online_course_offlinepayment |

---

### 30. CBSE Examination — Module: `cbseexam` (addon sscbse)

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Exams | cbseexam/exam | cbse_exam | cbse_exams, cbse_exam_* (23 tables) |
| Results / Grades / Terms / Templates / Observations / Reports / Settings | cbseexam/* | cbse_exam | cbse_* |

---

### 31. Higher Education — Module: `higher_education`

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| Programs / Batches | cbcs/programs | higher_education | CBCS program tables |

---

### 32. Two Factor Authentication — Module: `two_factor_authentication`

| Screen | URL | Permission | Tables |
|--------|-----|------------|--------|
| 2FA Setup | gauthenticate/setup | two_factor_authentication | addon tables |

---

### 33. Lead Management — Module: `lead_manager` (custom cyc_*)

**No RBAC checks in legacy controller** — any logged-in staff could access if URL known. **New ERP must enforce permissions.**

| Screen | URL | Tables | Purpose | CRUD |
|--------|-----|--------|---------|------|
| All Leads | admin/leads / admin/leads/all_leads | cyc_leads | Lead pipeline | CRUD |
| Campaigns | admin/leads/campaign | cyc_campaign, cyc_campaign_* | Marketing campaigns | CRUD |
| Campaign Types | admin/leads/campaign_type | cyc_campaign_type | Campaign classification | CRUD |
| Promoters | admin/leads/promoters | cyc_leads_promoters | Referral agents | CRUD |
| Follow-up Status | admin/leads/followup_status | cyc_leads_followup_status | Status master | CRUD |
| Follow-ups | admin/leads/leads_follow_up | cyc_leads_followup | Call/meeting log | CRUD |
| View Lead | admin/leads/view_lead/{id} | cyc_leads | Lead detail | Read/Update |
| View Campaign | admin/leads/view_campaign/{id} | cyc_campaign | Campaign detail | Read |
| Brief Reports | admin/leads/brief_reports | cyc_leads | Summary analytics | Read |
| Call Reports | admin/leads/call_reports | cyc_leads_followup | Call metrics | Read |
| Travel Reports | admin/leads/travel_reports | cyc_leads, positions | Geo tracking | Read |
| Promoter Commission | admin/leads/promoter_commission_report | cyc_leads_promoters | Commission calc | Read |
| Print Lead | admin/leads/print_lead/{id} | cyc_leads | Lead printout | Read |
| Import Leads | admin/leads/import_leads | cyc_leads | CSV import | Create |

**Dependencies:** staff, notification_setting (SMS on new lead), GPS/positions table.

---

### 34. Account / Finance (Double-Entry) — Module: `account_finance` (custom)

Not in `main_menu_array()` — accessed via direct URL / custom menu link.

| Screen | URL | Tables | Purpose | CRUD |
|--------|-----|--------|---------|------|
| Chart of Accounts | finance/accounts | cyc_ledgers, cyc_groups | Ledger master | CRUD |
| Account Mapper | finance/accounts/mapper | cyc_fee_head_ledger | Fee head → ledger | Update |
| Journal Entries | finance/entries | cyc_entries, cyc_entryitems, cyc_entrytypes | Double-entry bookkeeping | CRUD |
| Ledger Groups | finance/groups | cyc_groups | Account groups | CRUD |
| Ledgers | finance/ledgers | cyc_ledgers | Individual accounts | CRUD |
| Financial Reports | finance/reports | cyc_* | P&L, Balance Sheet, Trial Balance | Read |

**Dependencies:** Fee collection posts via `addFeeReceiptEntry()` helper; `sch_settings` session.

---

## STUDENT / PARENT PORTAL

**Login:** `/site/userlogin` | Session key: `student` | Gate: `Studentmodule_lib` + `permission_student`

| Sidebar Item | URL | Module Gate | Student Permission | Tables | Purpose | CRUD |
|--------------|-----|-------------|-------------------|--------|---------|------|
| Dashboard | user/user/dashboard | — | — | student_session | Home | Read |
| My Profile | user/user/profile | — | — | students | Profile view/edit | Read/Update |
| Fees | user/user/getfees | fees_collection | fees | student_fees_* | Pay/view fees | Read/Create |
| Online Course | user/studentcourse | online_course | online_course | online_courses | LMS access | Read |
| Zoom Live Classes | user/conference | zoom_live_classes | live_classes | conferences | Join Zoom | Read |
| GMeet Live Class | user/gmeet | gmeet_live_classes | gmeet_live_classes | gmeet | Join GMeet | Read |
| Class Timetable | user/timetable | — | class_timetable | subject_timetable | Personal TT | Read |
| Lesson Plan | user/syllabus | lesson_plan | lesson_plan | lesson, topic | Syllabus view | Read |
| Syllabus Status | user/syllabus/status | — | syllabus_status | subject_syllabus | Progress | Read |
| Homework | user/homework | homework | homework | homework | Assignments | Read/Submit |
| Online Exam | user/onlineexam | online_examination | online_examination | onlineexam_* | Take exams | Read/Create |
| Apply Leave | user/apply_leave | — | apply_leave | student_applyleave | Leave request | Create |
| Visitor Book | user/visitors | — | visitor_book | visitors_book | Log visitors | CRUD |
| Download Center › Contents | user/content/list | download_center | download_center | upload_contents | Downloads | Read |
| Download Center › Videos | user/video_tutorial | download_center | download_center | video_tutorial | Videos | Read |
| Attendance | user/attendence | student_attendance | attendance | student_attendences | View attendance | Read |
| CBSE Exam › Result | user/cbse/exam/result | cbseexam | cbseexam | cbse_* | CBSE results | Read |
| CBSE Exam › Schedule | user/cbse/exam/timetable | cbseexam | cbseexam | cbse_exam_timetable | CBSE schedule | Read |
| Examinations › Schedule | user/examschedule | examinations | examinations | exam_schedules | Exam dates | Read |
| Examinations › Result | user/exam/examresult | examinations | examinations | exam_group_exam_results | Marks view | Read |
| Notice Board | user/notification | — | notice_board | send_notification | Notices | Read |
| Teachers Reviews | user/teacher | — | teachers_rating | staff_rating | Rate teachers | Create |
| Library › Books | user/book | library | library | books | Catalog | Read |
| Library › Issued | user/book/issue | library | library | book_issues | My issues | Read |
| Transport Routes | user/route | transport | transport_routes | transport_route | Route info | Read |
| Hostel Rooms | user/hostelroom | hostel | hostel_rooms | hostel_rooms | Room info | Read |

**Header utilities (not sidebar):** Calendar (`user/calendar`), Chat (`user/chat`), Session switcher, Class switcher (`user/user/choose`), Change password, Language/currency.

**Fee lock mode:** When `is_student_feature_lock` — all pages redirect to fees except payment pages.

**Guest role sidebar:** Profile, Online Course, Purchase History only.

---

## PUBLIC / FRONT PORTAL

**Controller:** Welcome (extends Front_Controller) | No auth required

| Screen | URL | Tables | Purpose |
|--------|-----|--------|---------|
| Homepage | / or welcome/index | front_cms_* | Public website |
| CMS Page | page/{slug} | front_cms_pages | Static pages |
| News/Read | read/{slug} | front_cms_programs | Articles |
| Online Admission Form | online_admission | online_admissions | Apply online |
| Admission Review | welcome/online_admission_review/{ref} | online_admissions | Track application |
| Admission Payment | onlineadmission/checkout | online_admission_payment | Pay admission fee |
| Exam Result (public) | examresult | exam_* | Public result lookup |
| CBSE Exam (public) | cbseexam | cbse_* | Public CBSE lookup |
| Online Course Landing | online_course | online_courses | Course catalog |
| Course Login/Signup | course/* | guest, users | Guest registration |

---

## AUTHENTICATION SCREENS (no sidebar)

| Screen | URL | Tables |
|--------|-----|--------|
| Staff Login | site/login | staff |
| Student/Parent Login | site/userlogin | users, students |
| Staff Forgot Password | site/forgotpassword | staff |
| User Forgot Password | site/ufpassword | users |
| Staff Reset Password | admin/resetpassword/{code} | staff |
| User Reset Password | user/resetpassword/{role}/{code} | users |
| Logout | site/logout | — |
| Unauthorized | admin/admin/unauthorized | — |

---

## HIDDEN / NON-SIDEBAR ADMIN PAGES

| Category | Screens | URL pattern | Why hidden |
|----------|---------|-------------|------------|
| Transaction modals | Collect fee popup, balance fee AJAX | studentfee/geBalanceFee, addfeegrp | Opened from Collect Fees |
| Print views | Fee receipt, admit card, marksheet, ID card | print/* | Post-action render |
| Scheme/Scholarship | Setup, apply, approve | admin/feemaster/scheme_* | Sub-page of Fees Master |
| Lead CRM | All leads screens | admin/leads/* | Custom — not in default sidebar |
| Accounting | Entries, ledgers, reports | finance/* | Custom — not in default sidebar |
| Chat | Internal messaging | admin/chat | No sidebar entry |
| Calendar | School calendar | admin/calendar | Top-bar widget |
| Timeline | Activity feed | admin/timeline | Profile widget |
| Dashboard widgets | Charts AJAX | admin/admin/getCollection* | AJAX endpoints |
| Student profile tabs | Fees, docs, timeline from student view | student/view/* | Tab navigation |
| Multi-branch switch | Branch selector modal | admin/multibranch/branch/switch | Header modal |
| Biometric | Face auth enrollment | apvsi/face_authentication | Integration |
| GPS APIs | Vehicle/staff tracking | apis/*, apiv/* | Mobile integration |
| Cron jobs | Scheduled tasks | cron/index | System |
| Entity API | External integrations | entity/* | API |
| Duplicate controllers | *01.php, Admin2-4, *-old* | various | Legacy backups — not routed |

---

## Complete sitemap (controller tree)

```
/
├── site/                          # Auth (login, logout, reset)
├── welcome/                       # Public CMS + online admission
├── online_admission/              # Payment gateway callbacks
├── course/                        # Public online course + guest signup
│
├── admin/
│   ├── admin/                     # Dashboard, backup, filetype, changepass
│   ├── enquiry, visitors, generalcall, dispatch, receive, complaint
│   ├── onlinestudent, schoolhouse, disable_reason
│   ├── feemaster (+ scheme/scholarship hidden), feegroup, feetype, feediscount
│   ├── feesforward, feereminder, offlinepayment
│   ├── income, incomehead, expense, expensehead
│   ├── examgroup, exam_schedule, examresult, admitcard, marksheet, grade, marksdivision
│   ├── approve_leave, stuattendence, subjectattendence
│   ├── onlineexam, question
│   ├── syllabus, lessonplan
│   ├── timetable, teacher, stdtransfer, subjectgroup, subject
│   ├── staff, staffattendance, payroll, leaverequest, leavetypes, department, designation
│   ├── notification, mailsms
│   ├── contenttype, content, video_tutorial
│   ├── book, member
│   ├── issueitem, itemstock, item, itemcategory, itemstore, itemsupplier
│   ├── transport, pickuppoint, route, vehicle, vehroute
│   ├── hostelroom, roomtype, hostel
│   ├── certificate, generatecertificate, studentidcard, generateidcard, staffidcard, generatestaffidcard
│   ├── front/ (events, gallery, notice, media, page, menus, banner)
│   ├── alumni/
│   ├── gmeet, conference (zoom)
│   ├── roles, users, module, customfield, captcha, systemfield, sidemenu
│   ├── smsconfig, emailconfig, paymentsettings, print_headerfooter, frontcms, onlineadmission, updater
│   ├── leads/                       # CUSTOM — hidden from sidebar
│   ├── multibranch/                 # Addon
│   └── chat, calendar, timeline     # Hidden utilities
│
├── student/                       # Student CRUD (admin context)
├── studentfee/                    # Fee collection
├── classes/, sections/, category/
├── homework/
├── report/                        # 30+ report screens
├── attendencereports/
├── financereports/
├── schsettings/, sessions/
│
├── finance/                       # CUSTOM accounting (hidden)
│   ├── accounts, entries, groups, ledgers, reports
│
├── cbseexam/                      # Addon CBSE module
├── cbcs/                          # Higher education
├── behaviour/                     # Addon behaviour
├── onlinecourse/                  # Addon LMS admin
│
├── user/                          # Student/parent portal
│   ├── user/ (dashboard, profile, fees, choose)
│   ├── timetable, syllabus, homework, onlineexam, apply_leave, visitors
│   ├── content, video_tutorial, attendence, notification, teacher
│   ├── book, route, hostelroom, calendar, chat
│   ├── conference, gmeet, studentcourse
│   ├── cbse/exam/, exam/, examschedule
│   └── gateway/ (payment), offlinepayment
│
├── print/                         # All print templates (hidden)
├── common/                        # AJAX session/class switcher
├── cron/, apis/, apiv/, apvsi/, entity/, app/, resultapi/
└── install/                       # Installer (should be deleted in prod)
```

---

## Module dependency graph (high level)

```
Platform → Auth/RBAC
    ↓
Sessions, sch_settings
    ↓
Classes / Sections → Students (student_session)
    ↓
Fees Collection, Attendance, Examinations
    ↓
Human Resource, Lead CRM, Account Finance (custom)
```

---

## Summary counts

| Area | Visible sidebar items | Hidden screens (approx) |
|------|----------------------|-------------------------|
| Admin modules | ~39 modules, ~120+ submenu links | ~80+ |
| Student portal | 25 sidebar items | ~15 |
| Public portal | 8+ routes | Payment callbacks |
| Custom (Leads + Finance) | 0 in default sidebar | 20+ |
| Total controllers | 324 PHP files | ~50 duplicates/legacy |

---

## New ERP mapping notes

This document describes **legacy capability and business rules**. The new ERP maps capabilities to:

- **Routes:** `frontend/src/constants/routes.ts`
- **Navigation:** `frontend/src/constants/navigation/admin-nav.ts` (modernized grouping)
- **Permissions:** `permission_category` keys on each nav item; enforced via backend RBAC when wired

Legacy URLs (e.g. `admin/feemaster`) are **not** replicated. Business behavior and permission categories are preserved.
