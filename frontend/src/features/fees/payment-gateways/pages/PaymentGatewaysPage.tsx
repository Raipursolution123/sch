import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { usePaymentGateways } from '@hooks/usePaymentGateways';
import type { PaymentGateway } from '@app-types/fees/payment-gateway';
import { ModuleListPack } from '@workflow-packs';

const columns: DataTableColumn<PaymentGateway>[] = [
  {
    id: 'payment_type',
    header: 'Gateway',
    cellClassName: 'font-medium',
    cell: (r) => r.payment_type,
  },
  {
    id: 'mode',
    header: 'Mode',
    cell: (r) => (r.gateway_mode === 1 ? 'Live' : 'Test'),
  },
  {
    id: 'username',
    header: 'API username',
    cellClassName: 'text-muted-foreground',
    cell: (r) => r.api_username ?? '—',
  },
  {
    id: 'secret',
    header: 'API secret',
    cellClassName: 'font-mono text-xs text-muted-foreground',
    cell: (r) => r.api_secret_key ?? '—',
  },
  {
    id: 'account',
    header: 'Account',
    cell: (r) => r.account_no ?? '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge isActive={r.is_active === 'yes' ? 'yes' : 'no'} />,
  },
];

export function PaymentGatewaysPage() {
  const { data, isLoading, isError, error, refetch } = usePaymentGateways();

  return (
    <ModuleListPack
      title="Payment Gateways"
      description="Configured fee payment gateways (secrets are masked)."
      isLoading={isLoading}
      loadingMessage="Loading payment gateways..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No payment gateways"
      emptyDescription="Gateway settings are managed in the database / legacy admin."
    >
      <DataTable data={data ?? []} columns={columns} getRowKey={(row) => row.id} />
    </ModuleListPack>
  );
}
