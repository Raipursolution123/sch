class GeneralSettingsError(Exception):
    """Base general settings domain error."""

    default_message = "General settings operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class SchSettingsNotFoundError(GeneralSettingsError):
    default_message = "School settings not configured."


class GeneralSettingsValidationError(GeneralSettingsError):
    default_message = "Invalid general settings data."


class GeneralSettingsReadOnlyError(GeneralSettingsError):
    default_message = "Field is read-only."
