class SessionError(Exception):
    """Base session domain error."""

    default_message = "Session operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class SessionNotFoundError(SessionError):
    default_message = "Session not found."


class SessionValidationError(SessionError):
    default_message = "Invalid session data."


class SessionInUseError(SessionError):
    def __init__(self, message=None, references=None):
        super().__init__(message or "Cannot delete session in use.")
        self.references = references or []


class SessionCurrentError(SessionError):
    default_message = (
        "Cannot delete the current active session. Activate another session first."
    )


class SessionLastError(SessionError):
    default_message = "Cannot delete the last academic session."
