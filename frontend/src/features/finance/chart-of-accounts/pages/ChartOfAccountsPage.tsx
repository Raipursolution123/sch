import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { ChartOfAccountsTable } from '@features/finance/chart-of-accounts/components/ChartOfAccountsTable';
import { buildChartOfAccountsRows } from '@features/finance/chart-of-accounts/types';
import { useLedgerGroups } from '@hooks/useLedgerGroups';
import { useLedgersList } from '@hooks/useLedgers';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/cn';
import { ModuleListPack } from '@workflow-packs';

const linkButtonClass =
  'inline-flex h-9 items-center justify-center rounded-lg border border-input bg-card px-4 text-sm font-semibold hover:bg-muted';

export function ChartOfAccountsPage() {
  const {
    data: groups = [],
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErr,
    refetch: refetchGroups,
  } = useLedgerGroups();
  const {
    data: ledgersData,
    isLoading: ledgersLoading,
    isError: ledgersError,
    error: ledgersErr,
    refetch: refetchLedgers,
  } = useLedgersList(1, 100);

  const ledgers = ledgersData?.results ?? [];
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () => buildChartOfAccountsRows(groups, ledgers, search),
    [groups, ledgers, search],
  );

  const isLoading = groupsLoading || ledgersLoading;
  const isError = groupsError || ledgersError;
  const error = groupsErr || ledgersErr;

  return (
    <ModuleListPack
      title="Chart of Accounts"
      description="Hierarchical view of ledger groups and ledgers. Use Manage groups / ledgers for create and edit."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Search" htmlFor="coa-search">
            <Input
              id="coa-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Group or ledger name/code…"
              className="w-64"
            />
          </FormField>
          <Link to={ROUTES.finance.groups} className={linkButtonClass}>
            Manage groups
          </Link>
          <Link to={ROUTES.finance.ledgers} className={linkButtonClass}>
            Manage ledgers
          </Link>
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading chart of accounts..."
      isError={isError}
      error={error}
      onRetry={() => {
        void refetchGroups();
        void refetchLedgers();
      }}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No accounts found"
      emptyDescription="Create ledger groups and ledgers to build the chart of accounts."
      emptyAction={
        <Link
          to={ROUTES.finance.groups}
          className={cn(
            linkButtonClass,
            'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          Add ledger group
        </Link>
      }
    >
      <ChartOfAccountsTable rows={rows} />
    </ModuleListPack>
  );
}
