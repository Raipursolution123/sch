class NotificationError(Exception):
    def __init__(self, message: str = "Notification operation failed."):
        self.message = message
        super().__init__(message)


class NotificationNotFoundError(NotificationError):
    pass


class NotificationValidationError(NotificationError):
    pass
