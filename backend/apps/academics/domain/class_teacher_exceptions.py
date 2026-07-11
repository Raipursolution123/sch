"""Class teacher domain errors."""


class ClassTeacherError(Exception):
    default_message = "Class teacher operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class ClassTeacherNotFoundError(ClassTeacherError):
    default_message = "Class teacher assignment not found."


class ClassTeacherValidationError(ClassTeacherError):
    default_message = "Invalid class teacher data."
