"""Shared academic-structure domain errors."""


class AcademicStructureError(Exception):
    default_message = "Academic structure operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class AcademicStructureNotFoundError(AcademicStructureError):
    default_message = "Record not found."


class AcademicStructureValidationError(AcademicStructureError):
    default_message = "Invalid academic structure data."


class AcademicStructureInUseError(AcademicStructureError):
    default_message = "Cannot modify record while it is in use."
