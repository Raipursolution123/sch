from unittest.mock import patch

import pytest

from apps.students.selectors import student_fee_selectors as selectors


@pytest.fixture
def roster_context():
    return {
        "student_session_ids": [101, 102],
        "class_id": 10,
        "session_id": 3,
    }


def test_batch_fee_totals_for_roster_computes_per_student(roster_context):
    master_lines = {
        101: [
            {
                "student_fees_master_id": 1,
                "assignment_id": 1,
                "fee_group_name": "Tuition",
                "line_id": 11,
                "feetype_id": 1,
                "feetype_code": "T1",
                "feetype_name": "Tuition Fee",
                "amount": 1000,
                "due_date": None,
            }
        ],
        102: [],
    }
    payments = {
        101: [
            {
                "id": "dep-1-1",
                "deposite_id": 1,
                "trans_id": "1",
                "date": "2026-01-01",
                "amount": 400.0,
                "amount_discount": 0.0,
                "amount_fine": 0.0,
                "payment_mode": "Cash",
                "description": "",
                "feetype_name": "Tuition Fee",
                "feetype_id": 1,
                "feetype_code": "T1",
                "fgft_id": 11,
            }
        ]
    }
    class_lines = [
        {
            "student_fees_master_id": None,
            "assignment_id": 2,
            "fee_group_name": "Tuition",
            "line_id": 21,
            "feetype_id": 1,
            "feetype_code": "T1",
            "feetype_name": "Tuition Fee",
            "amount": 800,
            "due_date": None,
        }
    ]

    with (
        patch.object(
            selectors,
            "_fetch_student_fee_master_lines_batch",
            return_value=master_lines,
        ),
        patch.object(selectors, "_fetch_deposite_payments_batch", return_value=payments),
        patch.object(selectors, "_fetch_class_fee_lines", return_value=class_lines),
    ):
        totals = selectors.batch_fee_totals_for_roster(
            roster_context["student_session_ids"],
            roster_context["class_id"],
            roster_context["session_id"],
        )

    assert totals[101]["total_due"] == 1000.0
    assert totals[101]["total_paid"] == 400.0
    assert totals[101]["total_balance"] == 600.0
    assert totals[102]["total_due"] == 800.0
    assert totals[102]["total_paid"] == 0.0
    assert totals[102]["total_balance"] == 800.0


def test_batch_fee_totals_for_roster_empty_ids():
    assert selectors.batch_fee_totals_for_roster([], 1, 1) == {}
