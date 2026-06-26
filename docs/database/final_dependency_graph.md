# Final Dependency Graph

**Generated:** 2026-06-25 14:28 UTC
**Cross-domain FK edges:** 140

## Domain dependency matrix

Rows depend on columns (FK direction: row → column).

| From \ To | accounts | students | academics | staff | attendance | fees | examinations | library | transport | hostel | admissions | lms | settings | communications | cms | inventory | front_office | documents | shared | alumni | hr | cyc_extensions | system |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| accounts | · | · | 1 | 1 | · | · | · | · | · | · | · | · | · | 1 | · | · | · | · | · | · | · | · | · |
| students | · | · | 4 | 1 | 4 | 6 | · | · | 4 | 1 | · | 1 | · | · | · | · | · | · | · | · | · | · | · |
| academics | · | 5 | · | 10 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| staff | · | · | · | · | · | · | · | · | · | · | · | · | · | 2 | · | · | · | · | · | · | 2 | · | · |
| attendance | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| fees | · | 3 | 5 | 1 | · | · | · | · | · | · | 1 | · | · | · | · | · | · | · | · | · | · | · | · |
| examinations | · | 10 | 18 | 1 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| library | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| transport | · | · | 1 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| hostel | · | · | · | · | · | · | · | · | · | · | · | · | 1 | · | · | · | · | · | · | · | · | · | · |
| admissions | · | · | 1 | · | · | · | · | · | · | 1 | · | · | 3 | · | · | · | · | · | · | · | · | · | · |
| lms | · | 2 | 1 | 2 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| settings | 2 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| communications | · | 5 | 3 | 10 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| cms | 1 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| inventory | · | · | · | 2 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| front_office | · | 1 | 1 | 3 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| documents | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| shared | 2 | 1 | 3 | 5 | · | · | · | · | · | · | · | · | · | · | · | · | 1 | 1 | · | · | · | · | · |
| alumni | · | 1 | 2 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| hr | · | · | · | 2 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| cyc_extensions | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| system | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |

## Per-domain external dependencies

### accounts

- **Depends on:** `academics`, `communications`, `staff`
- **Referenced by:** `cms`, `settings`, `shared`

### students

- **Depends on:** `academics`, `attendance`, `fees`, `hostel`, `lms`, `staff`, `transport`
- **Referenced by:** `academics`, `alumni`, `communications`, `examinations`, `fees`, `front_office`, `lms`, `shared`

### academics

- **Depends on:** `staff`, `students`
- **Referenced by:** `accounts`, `admissions`, `alumni`, `communications`, `examinations`, `fees`, `front_office`, `lms`, `shared`, `students`, `transport`

### staff

- **Depends on:** `communications`, `hr`
- **Referenced by:** `academics`, `accounts`, `communications`, `examinations`, `fees`, `front_office`, `hr`, `inventory`, `lms`, `shared`, `students`

### attendance

- **Depends on:** none
- **Referenced by:** `students`

### fees

- **Depends on:** `academics`, `admissions`, `staff`, `students`
- **Referenced by:** `students`

### examinations

- **Depends on:** `academics`, `staff`, `students`
- **Referenced by:** none

### library

- **Depends on:** none
- **Referenced by:** none

### transport

- **Depends on:** `academics`
- **Referenced by:** `students`

### hostel

- **Depends on:** `settings`
- **Referenced by:** `admissions`, `students`

### admissions

- **Depends on:** `academics`, `hostel`, `settings`
- **Referenced by:** `fees`

### lms

- **Depends on:** `academics`, `staff`, `students`
- **Referenced by:** `students`

### settings

- **Depends on:** `accounts`
- **Referenced by:** `admissions`, `hostel`

### communications

- **Depends on:** `academics`, `staff`, `students`
- **Referenced by:** `accounts`, `staff`

### cms

- **Depends on:** `accounts`
- **Referenced by:** none

### inventory

- **Depends on:** `staff`
- **Referenced by:** none

### front_office

- **Depends on:** `academics`, `staff`, `students`
- **Referenced by:** `shared`

### documents

- **Depends on:** none
- **Referenced by:** `shared`

### shared

- **Depends on:** `academics`, `accounts`, `documents`, `front_office`, `staff`, `students`
- **Referenced by:** none

### alumni

- **Depends on:** `academics`, `students`
- **Referenced by:** none

### hr

- **Depends on:** `staff`
- **Referenced by:** `staff`

### cyc_extensions

- **Depends on:** none
- **Referenced by:** none

### system

- **Depends on:** none
- **Referenced by:** none


## Recommended development order

1. accounts → settings (sch_settings, custom_fields)
2. academics (sessions, classes, sections, subjects)
3. staff → students
4. attendance, fees, examinations
5. library, transport, hostel
6. admissions, lms
7. communications, cms, documents, shared
8. inventory, front_office, alumni
9. cyc_extensions (depends on fees, students, staff, academics)
10. system (logs, migrations — read-only)