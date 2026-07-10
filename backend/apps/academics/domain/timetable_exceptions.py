"""Timetable domain errors."""


class TimetableError(Exception):
    default_message = "Timetable operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class TimetableNotFoundError(TimetableError):
    default_message = "Timetable period not found."


class TimetableValidationError(TimetableError):
    default_message = "Invalid timetable data."


class TimetableConflictError(TimetableError):
    default_message = "Timetable period conflicts with an existing entry."


class TimetableInUseError(TimetableError):
    default_message = "Cannot delete timetable period while it is in use."
