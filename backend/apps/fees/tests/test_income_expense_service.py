import pytest

from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.services.income_expense_service import (
    ExpenseHeadService,
    ExpenseService,
    IncomeHeadService,
    IncomeService,
)


def test_income_head_requires_category():
    with pytest.raises(FeeValidationError, match="Income category"):
        IncomeHeadService().create({"income_category": "  "})


def test_expense_head_requires_category():
    with pytest.raises(FeeValidationError, match="Expense category"):
        ExpenseHeadService().create({"exp_category": ""})


def test_income_requires_name():
    with pytest.raises(FeeValidationError, match="Income name"):
        IncomeService().create({"name": " ", "amount": 10})


def test_income_rejects_negative_amount():
    with pytest.raises(FeeValidationError, match="Amount"):
        IncomeService().create({"name": "Grant", "amount": -1})


def test_expense_rejects_negative_amount():
    with pytest.raises(FeeValidationError, match="Amount"):
        ExpenseService().create({"name": "Rent", "amount": -5})
