class AdmissionsError(Exception):
    default_message = "Admissions operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class AdmissionsValidationError(AdmissionsError):
    default_message = "Invalid admissions data."


class AdmissionsNotFoundError(AdmissionsError):
    default_message = "Admissions record not found."


class AdmissionsConflictError(AdmissionsError):
    default_message = "Admissions data conflicts with an existing record."
