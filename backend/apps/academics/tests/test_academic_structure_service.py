from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.academic_structure_exceptions import (
    AcademicStructureInUseError,
    AcademicStructureNotFoundError,
    AcademicStructureValidationError,
)
from apps.academics.services.class_section_service import ClassSectionService
from apps.academics.services.class_service import ClassService
from apps.academics.services.section_service import SectionService


@pytest.fixture
def section_service():
    return SectionService()


@pytest.fixture
def class_service():
    return ClassService()


@pytest.fixture
def mapping_service():
    return ClassSectionService()


def test_create_section_normalizes_name(section_service):
    with patch("apps.academics.services.section_service.Sections") as model:
        with patch(
            "apps.academics.services.section_service.selectors.section_to_dict",
            return_value={"id": 1, "section_name": "A", "is_active": "yes"},
        ):
            model.objects.filter.return_value.exists.return_value = False
            created = MagicMock(id=1, section="A", is_active="yes")
            model.objects.create.return_value = created
            result = section_service.create_section("  A  ")
    assert result["section_name"] == "A"
    assert model.objects.create.call_args.kwargs["is_active"] == "yes"


def test_create_section_duplicate_raises(section_service):
    with patch("apps.academics.services.section_service.Sections") as model:
        model.objects.filter.return_value.exists.return_value = True
        with pytest.raises(AcademicStructureValidationError):
            section_service.create_section("A")


def test_deactivate_section_blocked_by_mapping(section_service):
    section = MagicMock(id=3, section="A", is_active="yes")
    with patch(
        "apps.academics.services.section_service.selectors.get_section_by_id",
        return_value=section,
    ):
        with patch(
            "apps.academics.services.section_service.has_active_class_section_for_section",
            return_value=True,
        ):
            with pytest.raises(AcademicStructureInUseError):
                section_service.deactivate_section(3)


def test_deactivate_section_blocked_by_students(section_service):
    section = MagicMock(id=3, section="A", is_active="yes")
    with patch(
        "apps.academics.services.section_service.selectors.get_section_by_id",
        return_value=section,
    ):
        with patch(
            "apps.academics.services.section_service.has_active_class_section_for_section",
            return_value=False,
        ):
            with patch(
                "apps.academics.services.section_service.has_active_students_for_section",
                return_value=True,
            ):
                with pytest.raises(AcademicStructureInUseError):
                    section_service.deactivate_section(3)


def test_get_class_not_found(class_service):
    with patch(
        "apps.academics.services.class_service.selectors.get_class_by_id",
        return_value=None,
    ):
        with pytest.raises(AcademicStructureNotFoundError):
            class_service.get_class(99)


def test_deactivate_class_soft(class_service):
    class_obj = MagicMock(id=5, class_field="Class 1", is_active="yes")
    with patch(
        "apps.academics.services.class_service.selectors.get_class_by_id",
        return_value=class_obj,
    ):
        with patch(
            "apps.academics.services.class_service.has_active_class_section_for_class",
            return_value=False,
        ):
            with patch(
                "apps.academics.services.class_service.has_active_students_for_class",
                return_value=False,
            ):
                class_service.deactivate_class(5)
    assert class_obj.is_active == "no"
    class_obj.save.assert_called_once()


def test_create_mapping_reactivates_inactive(mapping_service):
    existing = MagicMock(id=7, class_id=1, section_id=2, is_active="no")
    with patch(
        "apps.academics.services.class_section_service.Classes"
    ) as classes_model:
        with patch(
            "apps.academics.services.class_section_service.Sections"
        ) as sections_model:
            classes_model.objects.filter.return_value.exists.return_value = True
            sections_model.objects.filter.return_value.exists.return_value = True
            with patch(
                "apps.academics.services.class_section_service.selectors.get_mapping_by_pair",
                return_value=existing,
            ):
                with patch(
                    "apps.academics.services.class_section_service.selectors.mapping_to_dict",
                    return_value={"id": 7, "is_active": "yes"},
                ):
                    result = mapping_service.create_mapping(
                        {"class_id": 1, "section_id": 2, "is_active": "yes"}
                    )
    assert existing.is_active == "yes"
    existing.save.assert_called_once()
    assert result["is_active"] == "yes"


def test_create_mapping_duplicate_active_raises(mapping_service):
    existing = MagicMock(id=7, class_id=1, section_id=2, is_active="yes")
    with patch(
        "apps.academics.services.class_section_service.Classes"
    ) as classes_model:
        with patch(
            "apps.academics.services.class_section_service.Sections"
        ) as sections_model:
            classes_model.objects.filter.return_value.exists.return_value = True
            sections_model.objects.filter.return_value.exists.return_value = True
            with patch(
                "apps.academics.services.class_section_service.selectors.get_mapping_by_pair",
                return_value=existing,
            ):
                with pytest.raises(AcademicStructureValidationError):
                    mapping_service.create_mapping(
                        {"class_id": 1, "section_id": 2, "is_active": "yes"}
                    )


def test_deactivate_mapping_blocked_by_students(mapping_service):
    mapping = MagicMock(id=9, class_id=1, section_id=2, is_active="yes")
    with patch(
        "apps.academics.services.class_section_service.selectors.get_mapping_by_id",
        return_value=mapping,
    ):
        with patch(
            "apps.academics.services.class_section_service.has_active_students_for_mapping",
            return_value=True,
        ):
            with pytest.raises(AcademicStructureInUseError):
                mapping_service.deactivate_mapping(9)
