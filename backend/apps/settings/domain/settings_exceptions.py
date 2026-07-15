"""Settings domain errors for languages and currencies."""


class SettingsError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class SettingsNotFoundError(SettingsError):
    def __init__(self, message: str = "Record not found."):
        super().__init__(message)


class SettingsValidationError(SettingsError):
    pass


class SettingsConflictError(SettingsError):
    pass
