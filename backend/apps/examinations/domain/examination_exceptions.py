"""Examination domain errors."""


class ExaminationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class ExaminationNotFoundError(ExaminationError):
    def __init__(self, message: str = "Record not found."):
        super().__init__(message)


class ExaminationValidationError(ExaminationError):
    pass


class ExaminationConflictError(ExaminationError):
    pass
