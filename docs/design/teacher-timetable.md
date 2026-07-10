# Design: Teacher Timetable

**Status:** IMPLEMENTED  

**Slice:** Read-only weekly staff timetable view  
**Module:** `academics`  
**Legacy screen:** `admin/timetable/mytimetable`  
**Legacy permission:** `teachers_time_table` (module `academics`)  
**Route (new):** `/academics/teacher-timetable`  
**API (new):** `GET /api/v1/academics/timetable/teacher/?session_id=&staff_id=`

---

## 1. Executive summary

Teacher Timetable exposes a **read-only weekly grid** of `subject_timetable` rows filtered by **session + staff**. Admins pick any active teacher; data is the same periods created in Class Timetable.

**Depends on (done):** Sessions, Staff, Class Timetable periods.

**Out of scope:** CRUD (use Class Timetable), student portal view, print/export.

---

## 2. Decisions (approved)

| # | Decision | Locked |
|---|----------|--------|
| **A** | Fine-grained FE `teacher_timetable.view` only | **Yes** |
| **B** | Reuse `subject_timetable` + `period_to_dict` enrichment | **Yes** |
| **C** | Admin staff picker (no auth staff self-link yet) | **Yes** |
| **D** | Read-only weekly grid (class-section + subject + room) | **Yes** |
| **E** | Separate nav item + route from class timetable | **Yes** |

---

## 3. API

`GET /academics/timetable/teacher/?session_id=<required>&staff_id=<required>`

- Permission: `HasLegacyPrivilege` → `teachers_time_table` / `can_view`
- Response: `{ periods: TimetablePeriod[] }` (same shape as class grid entries)

---

## 4. Implementation checklist

- [x] `list_staff_periods` in timetable service + selector
- [x] `TeacherTimetableView` endpoint
- [x] FE page at `/academics/teacher-timetable`
- [x] Nav + `teacher_timetable.view` permission mapping
- [x] Unit tests
