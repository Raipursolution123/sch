# Students Domain — Model Mapping Plan

**App:** `apps.students`  
**Status:** Complete (21/21 tables mapped)  
**All models:** `managed = False`

| Table | Model class | Model file | Status |
|-------|-------------|------------|--------|
| `students` | `Students` | `models/students.py` | Mapped |
| `student_session` | `StudentSession` | `models/student_session.py` | Mapped |
| `disable_reason` | `DisableReason` | `models/disable_reason.py` | Mapped |
| `student_applyleave` | `StudentApplyleave` | `models/student_applyleave.py` | Mapped |
| `student_attendences` | `StudentAttendences` | `models/student_attendences.py` | Mapped |
| `student_attendences_hostel` | `StudentAttendencesHostel` | `models/student_attendences_hostel.py` | Mapped |
| `student_attendences_transport` | `StudentAttendencesTransport` | `models/student_attendences_transport.py` | Mapped |
| `student_behaviour` | `StudentBehaviour` | `models/student_behaviour.py` | Mapped |
| `student_doc` | `StudentDoc` | `models/student_doc.py` | Mapped |
| `student_edit_fields` | `StudentEditFields` | `models/student_edit_fields.py` | Mapped |
| `student_fees` | `StudentFees` | `models/student_fees.py` | Mapped |
| `student_fees_deposite` | `StudentFeesDeposite` | `models/student_fees_deposite.py` | Mapped |
| `student_fees_discounts` | `StudentFeesDiscounts` | `models/student_fees_discounts.py` | Mapped |
| `student_fees_master` | `StudentFeesMaster` | `models/student_fees_master.py` | Mapped |
| `student_fees_processing` | `StudentFeesProcessing` | `models/student_fees_processing.py` | Mapped |
| `student_incidents` | `StudentIncidents` | `models/student_incidents.py` | Mapped |
| `student_incident_comments` | `StudentIncidentComments` | `models/student_incident_comments.py` | Mapped |
| `student_quiz_status` | `StudentQuizStatus` | `models/student_quiz_status.py` | Mapped |
| `student_subject_attendances` | `StudentSubjectAttendances` | `models/student_subject_attendances.py` | Mapped |
| `student_timeline` | `StudentTimeline` | `models/student_timeline.py` | Mapped |
| `student_transport_fees` | `StudentTransportFees` | `models/student_transport_fees.py` | Mapped |

**Excluded (admissions app):** `online_admissions`, `online_admission_*`

Regenerate: `python backend/scripts/generate_students_models.py`
