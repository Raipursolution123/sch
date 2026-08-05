import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const FINANCE_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Chart of accounts', path: ROUTES.finance.chartOfAccounts },
  { label: 'Fee mapper', path: ROUTES.finance.mapper },
  { label: 'Journal entries', path: ROUTES.finance.entries },
  { label: 'Ledger groups', path: ROUTES.finance.groups },
  { label: 'Ledgers', path: ROUTES.finance.ledgers },
  { label: 'Reports', path: ROUTES.finance.reports },
  { label: 'Trial balance', path: ROUTES.finance.trialBalance },
  { label: 'Balance sheet', path: ROUTES.finance.balanceSheet },
  { label: 'Profit & loss', path: ROUTES.finance.profitLoss },
  { label: 'Ledger statement', path: ROUTES.finance.ledgerStatement },
  { label: 'Ledger entries', path: ROUTES.finance.ledgerEntries },
  { label: 'Reconciliation', path: ROUTES.finance.reconciliation },
];

export function FinanceModuleLayout() {
  return <ModuleSubNavLayout title="Finance" nav={FINANCE_MODULE_NAV} />;
}
