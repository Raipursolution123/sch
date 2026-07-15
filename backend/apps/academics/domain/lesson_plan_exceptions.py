class LessonPlanError(Exception):
    """Base exception for lesson plan domain errors."""
    pass


class LessonPlanValidationError(LessonPlanError):
    """Raised when lesson plan data is invalid."""
    pass


class LessonPlanNotFoundError(LessonPlanError):
    """Raised when a lesson plan resource is not found."""
    pass
