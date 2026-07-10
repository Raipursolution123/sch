"""Subject group domain errors."""


class SubjectGroupError(Exception):
    default_message = "Subject group operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class SubjectGroupNotFoundError(SubjectGroupError):
    default_message = "Subject group not found."


class SubjectGroupValidationError(SubjectGroupError):
    default_message = "Invalid subject group data."


class SubjectGroupInUseError(SubjectGroupError):
    default_message = "Cannot modify subject group while it is in use."
