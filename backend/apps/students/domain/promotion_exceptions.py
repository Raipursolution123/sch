"""Student promotion domain errors."""


class PromotionError(Exception):
    default_message = "Promotion operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class PromotionValidationError(PromotionError):
    default_message = "Invalid promotion data."


class PromotionNotFoundError(PromotionError):
    default_message = "Promotion source not found."
