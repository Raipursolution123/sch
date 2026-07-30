class LMSError(Exception):
    """Base exception for LMS module."""
    pass


class CourseNotFoundError(LMSError):
    def __init__(self, course_id: int):
        self.course_id = course_id
        super().__init__(f"Course with ID {course_id} not found.")


class CourseValidationError(LMSError):
    def __init__(self, message: str):
        super().__init__(message)
