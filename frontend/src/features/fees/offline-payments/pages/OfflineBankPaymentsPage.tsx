import { useMemo, useState, type FormEvent } from 'react';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { OfflineBankPaymentsTable } from '@features/fees/offline-payments/components/OfflineBankPaymentsTable';
import {
  useApproveOfflineBankPayment,
  useOfflineBankPayments,
  useRejectOfflineBankPayment,
} from '@hooks/useOfflineBankPayments';
import type {
  OfflineBankPayment,
  OfflineBankPaymentStatus,
} from '@app-types/fees/offline-bank-payment';
import { formatAmount } from '@utils/format';
import { todayIsoDate } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

type ActionMode = 'approve' | 'reject' | null;

export function OfflineBankPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OfflineBankPaymentStatus | 'all'>('pending');
  const [fromDate, setFromDate] = useState(daysAgoIso(90));
  const [toDate, setToDate] = useState(todayIsoDate());
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const filters = useMemo(
    () => ({
      status,
      from_date: fromDate,
      to_date: toDate,
      ...(query.trim() ? { q: query.trim() } : {}),
      page,
    }),
    [status, fromDate, toDate, query, page],
  );

  const { data, isLoading, isError, error, refetch } = useOfflineBankPayments(filters);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const approveMutation = useApproveOfflineBankPayment();
  const rejectMutation = useRejectOfflineBankPayment();

  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [selected, setSelected] = useState<OfflineBankPayment | null>(null);
  const [reply, setReply] = useState('');

  const closeAction = () => {
    setActionMode(null);
    setSelected(null);
    setReply('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !actionMode) return;
    if (actionMode === 'approve') {
      approveMutation.mutate(
        { id: selected.id, payload: { reply: reply.trim() || undefined } },
        { onSuccess: closeAction },
      );
      return;
    }
    rejectMutation.mutate(
      { id: selected.id, payload: { reply: reply.trim() || 'Rejected' } },
      { onSuccess: closeAction },
    );
  };

  const isActionLoading = approveMutation.isPending || rejectMutation.isPending;

  return (
    <ModuleListPack
      title="Offline Bank Payments"
      description="Review bank transfer submissions from parents/students. Approving posts the amount to the student fee ledger."
      isLoading={isLoading}
      loadingMessage="Loading offline payments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No offline payments"
      emptyDescription="Pending bank transfer submissions will appear here for approval."
      actions={
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <FormField label="Status" htmlFor="obp-status">
            <Select
              id="obp-status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as OfflineBankPaymentStatus | 'all');
              }}
            />
          </FormField>
          <FormField label="From" htmlFor="obp-from">
            <Input
              id="obp-from"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
            />
          </FormField>
          <FormField label="To" htmlFor="obp-to">
            <Input
              id="obp-to"
              type="date"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
            />
          </FormField>
          <FormField label="Search" htmlFor="obp-q">
            <Input
              id="obp-q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, admission, ref…"
              className="w-56"
            />
          </FormField>
        </form>
      }
      footer={
        <EntityFormDialog
          open={Boolean(actionMode && selected)}
          onOpenChange={(open) => {
            if (!open) closeAction();
          }}
          isEdit
          isLoading={isActionLoading}
          title={actionMode === 'approve' ? 'Approve payment' : 'Reject payment'}
          description={
            selected
              ? `${formatAmount(selected.amount)} for ${selected.full_name || 'student'} (${selected.reference || 'no reference'}).${
                  actionMode === 'approve'
                    ? ' Approving posts a bank-transfer payment to the student fee ledger.'
                    : ''
                }`
              : undefined
          }
          submitLabel={actionMode === 'approve' ? 'Approve' : 'Reject'}
          onSubmit={handleSubmit}
          size="sm"
        >
          <FormField
            label={actionMode === 'reject' ? 'Rejection note' : 'Note (optional)'}
            htmlFor="obp-reply"
          >
            <Textarea
              id="obp-reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                actionMode === 'reject' ? 'Reason for rejection' : 'Optional reply to parent'
              }
              rows={3}
            />
          </FormField>
        </EntityFormDialog>
      }
    >
      <OfflineBankPaymentsTable
        rows={rows}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        onApprove={(row) => {
          setSelected(row);
          setReply('');
          setActionMode('approve');
        }}
        onReject={(row) => {
          setSelected(row);
          setReply('');
          setActionMode('reject');
        }}
      />
    </ModuleListPack>
  );
}
