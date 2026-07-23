from unittest.mock import patch

import pytest

from apps.examinations.domain.examination_exceptions import ExaminationValidationError
from apps.examinations.services.online_exam_service import (
    OnlineExamService,
    QuestionBankService,
)


def test_question_requires_class_id():
    with pytest.raises(ExaminationValidationError, match="class_id"):
        QuestionBankService().create(
            {"question_type": "singlechoice", "question": "Q?"}, staff_id=1
        )


def test_question_requires_type():
    with pytest.raises(ExaminationValidationError, match="question_type"):
        QuestionBankService().create({"class_id": 1, "question": "Q?"}, staff_id=1)


def test_online_exam_requires_session():
    with pytest.raises(ExaminationValidationError, match="session_id"):
        OnlineExamService().create({"exam": "Midterm"})


def test_online_exam_requires_name():
    with patch(
        "apps.examinations.services.online_exam_service.Sessions.objects"
    ) as sessions:
        sessions.filter.return_value.exists.return_value = True
        with pytest.raises(ExaminationValidationError, match="exam name"):
            OnlineExamService().create({"session_id": 1, "exam": " "})


def test_add_questions_empty():
    with pytest.raises(ExaminationValidationError, match="at least one"):
        OnlineExamService().add_questions(9, [])


def test_assign_students_empty():
    with pytest.raises(ExaminationValidationError, match="at least one"):
        OnlineExamService().assign_students(9, [])
