"""Fees setup domain errors."""


class FeeError(Exception):
    default_message = "Fee operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class FeeValidationError(FeeError):
    default_message = "Invalid fee data."


class FeeNotFoundError(FeeError):
    default_message = "Fee record not found."


class FeeConflictError(FeeError):
    default_message = "Fee data conflicts with an existing record."
