class TransportError(Exception):
    default_message = "Transport operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class TransportValidationError(TransportError):
    default_message = "Invalid transport data."


class TransportNotFoundError(TransportError):
    default_message = "Transport record not found."


class TransportConflictError(TransportError):
    default_message = "Transport data conflicts with an existing record."
