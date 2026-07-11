"""Subject domain errors."""


class SubjectError(Exception):
    default_message = "Subject operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class SubjectNotFoundError(SubjectError):
    default_message = "Subject not found."


class SubjectValidationError(SubjectError):
    default_message = "Invalid subject data."


class SubjectInUseError(SubjectError):
    default_message = "Cannot modify subject while it is in use."
