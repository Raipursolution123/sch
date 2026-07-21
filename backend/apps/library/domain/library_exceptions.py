class LibraryError(Exception):
    default_message = "Library operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class LibraryValidationError(LibraryError):
    default_message = "Invalid library data."


class LibraryNotFoundError(LibraryError):
    default_message = "Library record not found."


class LibraryConflictError(LibraryError):
    default_message = "Library data conflicts with an existing record."
