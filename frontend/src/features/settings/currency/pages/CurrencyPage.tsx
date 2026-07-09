import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
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
import { ModuleListPack } from '@workflow-packs';

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
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useCurrencies(page);
  const currencies = data?.results;
  const totalCount = data?.count || 0;
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

  const addCurrencyAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Currency
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Currency"
      description="Manage currencies and set the default active currency for the school."
      actions={addCurrencyAction}
      isLoading={isLoading}
      loadingMessage="Loading currencies..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && currencies?.length === 0}
      emptyTitle="No currencies configured"
      emptyDescription="Add your first currency to enable fee and financial modules."
      emptyAction={addCurrencyAction}
      footer={
        <>
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
        </>
      }
    >
      <CurrenciesTable
        currencies={currencies ?? []}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        onEdit={(currency) => {
          setSelectedCurrency(currency);
          setDialogMode('edit');
        }}
        onActivate={setActivateTarget}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
