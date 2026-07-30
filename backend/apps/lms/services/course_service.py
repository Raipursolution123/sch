from django.utils import timezone
from django.utils.text import slugify
from apps.lms.models.online_courses import OnlineCourses
from apps.lms.api.serializers.course_serializers import CourseSerializer
from apps.lms.domain.lms_exceptions import CourseNotFoundError, CourseValidationError


class CourseService:
    def list_courses(self):
        """Retrieve all active courses, ordered by latest."""
        return OnlineCourses.objects.all().order_by("-id")

    def get_course(self, pk: int) -> dict:
        """Retrieve a single course by ID."""
        try:
            course = OnlineCourses.objects.get(pk=pk)
            return CourseSerializer(course).data
        except OnlineCourses.DoesNotExist:
            raise CourseNotFoundError(pk)

    def create_course(self, data: dict, user_id: int) -> dict:
        """Create a new course."""
        serializer = CourseSerializer(data=data)
        if not serializer.is_valid():
            raise CourseValidationError(str(serializer.errors))

        title = serializer.validated_data.get("title", "")
        slug = slugify(title)
        
        # In a full implementation, we might ensure slug uniqueness.
        # For MVP, we will append the user ID or a timestamp if needed, 
        # or simply rely on the default slugifier.

        staff_id = None
        if user_id:
            from apps.staff.models.staff import Staff
            staff = Staff.objects.filter(user_id=user_id).first()
            if staff:
                staff_id = staff.id

        course = serializer.save(
            slug=slug,
            url=slug,
            category_id=0,  # Default for MVP
            created_by=staff_id,
            created_date=timezone.now(),
            updated_date=timezone.now(),
        )
        return CourseSerializer(course).data

    def update_course(self, pk: int, data: dict) -> dict:
        """Update an existing course."""
        try:
            course = OnlineCourses.objects.get(pk=pk)
        except OnlineCourses.DoesNotExist:
            raise CourseNotFoundError(pk)

        serializer = CourseSerializer(course, data=data, partial=True)
        if not serializer.is_valid():
            raise CourseValidationError(str(serializer.errors))

        # Update slug if title changed
        if "title" in serializer.validated_data:
            title = serializer.validated_data["title"]
            course.slug = slugify(title)
            course.url = course.slug

        course.updated_date = timezone.now()
        updated_course = serializer.save()
        return CourseSerializer(updated_course).data

    def delete_course(self, pk: int) -> None:
        """Delete a course."""
        try:
            course = OnlineCourses.objects.get(pk=pk)
            course.delete()
        except OnlineCourses.DoesNotExist:
            raise CourseNotFoundError(pk)
