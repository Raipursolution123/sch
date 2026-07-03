import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { CurrencyFormDialog } from '@features/settings/currency/components/CurrencyFormDialog';
import { CurrenciesTable } from '@features/settings/currency/components/CurrenciesTable';
import type { CurrencyFormValues } from '@features/settings/currency/schemas/currency.schema';
import {
  useActivateCurrency,
  useCreateCurrency,
  useCurrencies,
  useDeleteCurrency,
  useUpdateCurrency,
} from '@hooks/useCurrencies';
import type { Currency } from '@app-types/settings/currency';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: CurrencyFormValues) {
  return {
    name: values.name,
    short_name: values.short_name,
    symbol: values.symbol,
    base_price: values.base_price,
    is_active: values.is_active,
  };
}

export function CurrencyPage() {
  const { data: currencies, isLoading, isError, error, refetch } = useCurrencies();
  const createMutation = useCreateCurrency();
  const updateMutation = useUpdateCurrency();
  const activateMutation = useActivateCurrency();
  const deleteMutation = useDeleteCurrency();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [activateTarget, setActivateTarget] = useState<Currency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedCurrency(null);
  };

  const handleFormSubmit = (values: CurrencyFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedCurrency) {
      updateMutation.mutate({ id: selectedCurrency.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency"
        description="Manage currencies and set the default active currency for the school."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Currency
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading currencies..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load currencies'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && currencies?.length === 0 && (
        <EmptyState
          title="No currencies configured"
          description="Add your first currency to enable fee and financial modules."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Currency
            </Button>
          }
        />
      )}

      {!isLoading && !isError && currencies && currencies.length > 0 && (
        <CurrenciesTable
          currencies={currencies}
          onEdit={(currency) => {
            setSelectedCurrency(currency);
            setDialogMode('edit');
          }}
          onActivate={setActivateTarget}
          onDelete={setDeleteTarget}
        />
      )}

      <CurrencyFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        currency={dialogMode === 'edit' ? selectedCurrency : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={Boolean(activateTarget)}
        onOpenChange={(open) => {
          if (!open) setActivateTarget(null);
        }}
        title="Set active currency?"
        description={
          activateTarget
            ? `Set ${activateTarget.short_name} (${activateTarget.symbol}) as the school default currency?`
            : ''
        }
        confirmLabel="Activate"
        onConfirm={() => {
          if (!activateTarget) return;
          activateMutation.mutate(activateTarget.id, {
            onSuccess: () => setActivateTarget(null),
          });
        }}
        isLoading={activateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete currency?"
        description={
          deleteTarget
            ? `Permanently delete ${deleteTarget.short_name} (${deleteTarget.name})? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
