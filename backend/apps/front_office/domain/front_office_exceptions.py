class FrontOfficeError(Exception):
    default_message = "Front office operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class FrontOfficeValidationError(FrontOfficeError):
    default_message = "Invalid front office data."


class FrontOfficeNotFoundError(FrontOfficeError):
    default_message = "Front office record not found."


class FrontOfficeConflictError(FrontOfficeError):
    default_message = "Front office data conflicts with an existing record."
