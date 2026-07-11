"""Student fee collection domain errors."""

from apps.students.domain.student_exceptions import StudentError


class StudentFeeError(StudentError):
    default_message = "Student fee operation failed."


class StudentFeeNotFoundError(StudentFeeError):
    default_message = "Fee record not found."


class StudentFeeValidationError(StudentFeeError):
    default_message = "Invalid fee data."


class StudentEnrollmentError(StudentFeeError):
    default_message = "Student is not enrolled for the active session."
