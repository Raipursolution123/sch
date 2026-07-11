"""Attendance domain errors."""


class AttendanceError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class AttendanceNotFoundError(AttendanceError):
    def __init__(self, message: str = "Record not found."):
        super().__init__(message)


class AttendanceValidationError(AttendanceError):
    pass
