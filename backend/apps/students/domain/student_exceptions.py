"""Student admission and enrollment domain errors."""


class StudentError(Exception):
    default_message = "Student operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class StudentValidationError(StudentError):
    default_message = "Invalid student data."


class StudentNotFoundError(StudentError):
    default_message = "Student not found."


class StudentConflictError(StudentError):
    default_message = "Student data conflicts with an existing record."
