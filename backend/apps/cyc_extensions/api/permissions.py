"""Shared legacy RBAC constants for finance / cyc_extensions APIs."""

from rest_framework.permissions import IsAuthenticated

from core.permissions.legacy_privilege import HasLegacyPrivilege

FINANCE_MODULE = "account_finance"

FinanceIsAuthenticated = [IsAuthenticated, HasLegacyPrivilege]
