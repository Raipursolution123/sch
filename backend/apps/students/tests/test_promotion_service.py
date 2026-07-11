from unittest.mock import MagicMock, patch

import pytest

from apps.students.domain.promotion_exceptions import (
    PromotionNotFoundError,
    PromotionValidationError,
)
from apps.students.services.promotion_service import PromotionService


@pytest.fixture
def service():
    return PromotionService()


def test_preview_same_session_raises(service):
    with pytest.raises(PromotionValidationError, match="different"):
        service.preview(1, 10, 20, 1, 11, 20)


def test_preview_counts_eligible_and_skipped(service):
    enrollment = MagicMock(
        id=100,
        student_id=5,
        session_id=1,
        class_id=10,
        section_id=20,
    )
    active_student = MagicMock(
        id=5, firstname="Rahul", middlename=None, lastname="Sharma", is_active="yes"
    )
    inactive_student = MagicMock(
        id=6, firstname="Inactive", middlename=None, lastname="Kid", is_active="no"
    )
    enrollment2 = MagicMock(
        id=101,
        student_id=6,
        session_id=1,
        class_id=10,
        section_id=20,
    )

    with patch.object(service, "_validate_scope", return_value=99):
        with patch(
            "apps.students.services.promotion_service.selectors.list_source_enrollments",
            return_value=[enrollment, enrollment2],
        ):
            with patch(
                "apps.students.services.promotion_service.selectors.students_by_ids",
                return_value={5: active_student, 6: inactive_student},
            ):
                with patch(
                    "apps.students.services.promotion_service.selectors.target_student_ids",
                    return_value={5},
                ):
                    with patch(
                        "apps.students.services.promotion_service.selectors.has_active_fees",
                        return_value=False,
                    ):
                        with patch(
                            "apps.students.services.promotion_service.selectors.class_label",
                            return_value="Class 5",
                        ):
                            with patch(
                                "apps.students.services.promotion_service."
                                "selectors.section_label",
                                return_value="A",
                            ):
                                result = service.preview(1, 10, 20, 2, 11, 20)

    assert result["eligible_count"] == 0
    assert result["already_in_target_count"] == 1
    assert result["inactive_skipped_count"] == 1
    assert len(result["students"]) == 2


def test_execute_creates_target_and_deactivates_source(service):
    source = MagicMock(
        id=100,
        student_id=5,
        session_id=1,
        class_id=10,
        section_id=20,
        subject_group_id=None,
        vehroute_id=1,
        route_pickup_point_id=2,
        hostel_room_id=3,
        transport_fees=100.0,
        fees_discount=0.0,
        default_login=0,
        is_active="yes",
        is_alumni=0,
    )
    student = MagicMock(id=5, is_active="yes")
    created = MagicMock(id=200)

    with patch.object(service, "_validate_scope", return_value=99):
        with patch(
            "apps.students.services.promotion_service.selectors.list_source_enrollments",
            return_value=[source],
        ):
            with patch(
                "apps.students.services.promotion_service.selectors.students_by_ids",
                return_value={5: student},
            ):
                with patch(
                    "apps.students.services.promotion_service.selectors.target_student_ids",
                    return_value=set(),
                ):
                    with patch(
                        "apps.students.services.promotion_service.get_current_session_id",
                        return_value=2,
                    ):
                        with patch(
                            "apps.students.services.promotion_service.transaction.atomic"
                        ):
                            with patch(
                                "apps.students.services.promotion_service.StudentSession"
                            ) as model:
                                model.objects.create.return_value = created
                                result = service.execute(
                                    {
                                        "from_session_id": 1,
                                        "from_class_id": 10,
                                        "from_section_id": 20,
                                        "to_session_id": 2,
                                        "to_class_id": 11,
                                        "to_section_id": 20,
                                        "deactivate_source": True,
                                        "mark_alumni": False,
                                    }
                                )

    assert result["promoted_count"] == 1
    assert result["skipped_count"] == 0
    create_kwargs = model.objects.create.call_args.kwargs
    assert create_kwargs["session_id"] == 2
    assert create_kwargs["student_id"] == 5
    assert create_kwargs["is_active"] == "yes"
    assert source.is_active == "no"
    source.save.assert_called_once()


def test_execute_skips_duplicate_target_enrollment(service):
    source = MagicMock(
        id=100,
        student_id=5,
        session_id=1,
        class_id=10,
        section_id=20,
        default_login=0,
    )
    student = MagicMock(id=5, is_active="yes")

    with patch.object(service, "_validate_scope", return_value=99):
        with patch(
            "apps.students.services.promotion_service.selectors.list_source_enrollments",
            return_value=[source],
        ):
            with patch(
                "apps.students.services.promotion_service.selectors.students_by_ids",
                return_value={5: student},
            ):
                with patch(
                    "apps.students.services.promotion_service.selectors.target_student_ids",
                    return_value={5},
                ):
                    with patch(
                        "apps.students.services.promotion_service.get_current_session_id",
                        return_value=None,
                    ):
                        with patch(
                            "apps.students.services.promotion_service.transaction.atomic"
                        ):
                            with patch(
                                "apps.students.services.promotion_service.StudentSession"
                            ) as model:
                                result = service.execute(
                                    {
                                        "from_session_id": 1,
                                        "from_class_id": 10,
                                        "from_section_id": 20,
                                        "to_session_id": 2,
                                        "to_class_id": 11,
                                        "to_section_id": 20,
                                    }
                                )

    assert result["promoted_count"] == 0
    assert result["skipped_count"] == 1
    model.objects.create.assert_not_called()


def test_validate_scope_missing_session_raises(service):
    with patch("apps.students.services.promotion_service.Sessions") as sessions_model:
        sessions_model.objects.filter.return_value.exists.return_value = False
        with pytest.raises(PromotionNotFoundError):
            service._validate_scope(1, 10, 20, 2, 11, 20)
