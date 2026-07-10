"""Dependency checks for classes / sections / class_sections."""

from apps.academics.models import ClassSections
from apps.students.models import StudentSession


def has_active_class_section_for_section(section_id: int) -> bool:
    return ClassSections.objects.filter(section_id=section_id, is_active="yes").exists()


def has_active_class_section_for_class(class_id: int) -> bool:
    return ClassSections.objects.filter(class_id=class_id, is_active="yes").exists()


def has_active_students_for_section(section_id: int) -> bool:
    return StudentSession.objects.filter(
        section_id=section_id, is_active="yes"
    ).exists()


def has_active_students_for_class(class_id: int) -> bool:
    return StudentSession.objects.filter(class_id=class_id, is_active="yes").exists()


def has_active_students_for_mapping(class_id: int, section_id: int) -> bool:
    return StudentSession.objects.filter(
        class_id=class_id, section_id=section_id, is_active="yes"
    ).exists()
