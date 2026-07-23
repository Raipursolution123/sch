import { Link } from 'react-router-dom';
import { useFinanceReportsIndex } from '@hooks/useFinanceReports';
import { ROUTES } from '@constants/routes';
import { ModuleListPack } from '@workflow-packs';

const REPORT_LINKS: Array<{ label: string; description: string; path: string }> = [
  {
    label: 'Trial Balance',
    description: 'Debit and credit totals by ledger for a date range.',
    path: ROUTES.finance.trialBalance,
  },
  {
    label: 'Balance Sheet',
    description: 'Assets and liabilities as of a date.',
    path: ROUTES.finance.balanceSheet,
  },
  {
    label: 'Profit & Loss',
    description: 'Income and expenses for a period.',
    path: ROUTES.finance.profitLoss,
  },
  {
    label: 'Ledger Statement',
    description: 'Running balance for a single ledger.',
    path: ROUTES.finance.ledgerStatement,
  },
  {
    label: 'Ledger Entries',
    description: 'Journal lines filtered by ledger and dates.',
    path: ROUTES.finance.ledgerEntries,
  },
  {
    label: 'Reconciliation',
    description: 'Mark bank/cash ledger items as reconciled.',
    path: ROUTES.finance.reconciliation,
  },
];

export function FinanceReportsHubPage() {
  const { isLoading, isError, error, refetch } = useFinanceReportsIndex();

  return (
    <ModuleListPack
      title="Financial Reports"
      description="Account finance reports for trial balance, balance sheet, P&L, and ledgers."
      isLoading={isLoading}
      loadingMessage="Loading reports..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={false}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_LINKS.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
            >
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </ModuleListPack>
  );
}
