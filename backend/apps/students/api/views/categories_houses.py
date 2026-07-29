from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.models.categories import Categories
from apps.settings.models.school_houses import SchoolHouses
from apps.students.models.students import Students
from common.responses.api import APIResponse

MODULE = "student_information"


class StudentCategoriesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cats = Categories.objects.all().order_by("-id")
            data = [
                {
                    "id": c.id,
                    "category": c.category or f"Category #{c.id}",
                    "is_active": c.is_active or "yes",
                    "created_at": c.created_at,
                }
                for c in cats
            ]
            return APIResponse.success(
                data=data, message="Categories retrieved successfully."
            )
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        try:
            category_name = str(request.data.get("category") or "").strip()
            if not category_name:
                return APIResponse.error(
                    message="Category name is required.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            c = Categories.objects.create(
                category=category_name,
                is_active="yes",
                created_at=timezone.now(),
            )
            return APIResponse.success(
                data={"id": c.id, "category": c.category},
                message="Category created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )


class StudentCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            category_name = str(request.data.get("category") or "").strip()
            c = Categories.objects.filter(pk=pk).first()
            if not c:
                return APIResponse.error(
                    message="Category not found.", status_code=status.HTTP_404_NOT_FOUND
                )
            if category_name:
                c.category = category_name
                c.save()
            return APIResponse.success(message="Category updated successfully.")
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, pk):
        try:
            c = Categories.objects.filter(pk=pk).first()
            if c:
                c.delete()
            return APIResponse.success(message="Category deleted successfully.")
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )


class StudentHousesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            houses = SchoolHouses.objects.all().order_by("-id")
            data = [
                {
                    "id": h.id,
                    "house_name": h.house_name or f"House #{h.id}",
                    "description": h.description or "",
                    "is_active": h.is_active or "yes",
                }
                for h in houses
            ]
            return APIResponse.success(
                data=data, message="Houses retrieved successfully."
            )
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        try:
            house_name = str(request.data.get("house_name") or "").strip()
            description = str(request.data.get("description") or "").strip()
            if not house_name:
                return APIResponse.error(
                    message="House name is required.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            h = SchoolHouses.objects.create(
                house_name=house_name,
                description=description,
                is_active="yes",
            )
            return APIResponse.success(
                data={"id": h.id, "house_name": h.house_name},
                message="House created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )


class StudentHouseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            house_name = str(request.data.get("house_name") or "").strip()
            description = str(request.data.get("description") or "").strip()
            h = SchoolHouses.objects.filter(pk=pk).first()
            if not h:
                return APIResponse.error(
                    message="House not found.", status_code=status.HTTP_404_NOT_FOUND
                )
            if house_name:
                h.house_name = house_name
            if description is not None:
                h.description = description
            h.save()
            return APIResponse.success(message="House updated successfully.")
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, pk):
        try:
            h = SchoolHouses.objects.filter(pk=pk).first()
            if h:
                h.delete()
            return APIResponse.success(message="House deleted successfully.")
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )


class StudentImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            students_data = request.data.get("students", [])
            imported_count = 0
            for item in students_data:
                first_name = str(
                    item.get("firstname") or item.get("first_name") or ""
                ).strip()
                admission_no = str(item.get("admission_no") or "").strip()
                if first_name and admission_no:
                    Students.objects.create(
                        firstname=first_name,
                        lastname=str(
                            item.get("lastname") or item.get("last_name") or ""
                        ).strip(),
                        admission_no=admission_no,
                        gender=str(item.get("gender") or "male").lower(),
                        is_active="yes",
                    )
                    imported_count += 1
            return APIResponse.success(
                data={"imported_count": imported_count},
                message=f"Successfully imported {imported_count} students.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return APIResponse.error(
                message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
            )
