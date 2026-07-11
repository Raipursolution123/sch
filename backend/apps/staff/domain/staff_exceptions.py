"""Staff domain errors."""


class StaffError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class StaffNotFoundError(StaffError):
    def __init__(self, message: str = "Staff not found."):
        super().__init__(message)


class StaffValidationError(StaffError):
    pass


class StaffConflictError(StaffError):
    pass


class StaffDocumentError(StaffError):
    pass
