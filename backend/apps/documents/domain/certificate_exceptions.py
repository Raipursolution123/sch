class CertificateError(Exception):
    default_message = "Certificate operation failed."

    def __init__(self, message=None):
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class CertificateValidationError(CertificateError):
    default_message = "Invalid certificate data."


class CertificateNotFoundError(CertificateError):
    default_message = "Certificate record not found."
