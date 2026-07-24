class InventoryError(Exception):
    default_message = "Inventory operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class InventoryValidationError(InventoryError):
    default_message = "Invalid inventory data."


class InventoryNotFoundError(InventoryError):
    default_message = "Inventory record not found."


class InventoryConflictError(InventoryError):
    default_message = "Inventory data conflicts with an existing record."
