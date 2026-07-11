from django.db import models

from apps.students.models.disable_reason import DisableReason
from apps.students.models.student_applyleave import StudentApplyleave
from apps.students.models.student_attendences import StudentAttendences
from apps.students.models.student_attendences_hostel import StudentAttendencesHostel
from apps.students.models.student_attendences_transport import (
    StudentAttendencesTransport,
)
from apps.students.models.student_behaviour import StudentBehaviour
from apps.students.models.student_doc import StudentDoc
from apps.students.models.student_edit_fields import StudentEditFields
from apps.students.models.student_fees import StudentFees
from apps.students.models.student_fees_deposite import StudentFeesDeposite
from apps.students.models.student_fees_discounts import StudentFeesDiscounts
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_fees_processing import StudentFeesProcessing
from apps.students.models.student_incident_comments import StudentIncidentComments
from apps.students.models.student_incidents import StudentIncidents
from apps.students.models.student_quiz_status import StudentQuizStatus
from apps.students.models.student_session import StudentSession
from apps.students.models.student_subject_attendances import StudentSubjectAttendances
from apps.students.models.student_timeline import StudentTimeline
from apps.students.models.student_transport_fees import StudentTransportFees
from apps.students.models.students import Students

__all__ = [
    "DisableReason",
    "StudentApplyleave",
    "StudentAttendences",
    "StudentAttendencesHostel",
    "StudentAttendencesTransport",
    "StudentBehaviour",
    "StudentDoc",
    "StudentEditFields",
    "StudentFees",
    "StudentFeesDeposite",
    "StudentFeesDiscounts",
    "StudentFeesMaster",
    "StudentFeesProcessing",
    "StudentIncidentComments",
    "StudentIncidents",
    "StudentQuizStatus",
    "StudentSession",
    "StudentSubjectAttendances",
    "StudentTimeline",
    "StudentTransportFees",
    "Students",
]
