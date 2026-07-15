class HostelError(Exception):
    default_message = "Hostel operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class HostelValidationError(HostelError):
    default_message = "Invalid hostel data."


class HostelNotFoundError(HostelError):
    default_message = "Hostel record not found."


class HostelConflictError(HostelError):
    default_message = "Hostel data conflicts with an existing record."
