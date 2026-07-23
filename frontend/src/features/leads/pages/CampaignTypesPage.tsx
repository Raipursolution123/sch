import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useLeadSources, useRenameLeadSource } from '@hooks/useLeads';
import type { LeadSource } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  new: z.string().trim().min(1, 'New name is required'),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<LeadSource>[] = [
  { id: 'source', header: 'Source / Type', cellClassName: 'font-medium', cell: (r) => r.source },
  {
    id: 'count',
    header: 'Leads',
    cellClassName: 'tabular-nums',
    cell: (r) => r.count,
  },
];

export function CampaignTypesPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeadSources();
  const renameMutation = useRenameLeadSource();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LeadSource | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ new: selected?.source || '' });
  }, [open, selected, reset]);

  return (
    <ModuleListPack
      title="Campaign Types"
      description="Distinct lead sources used as campaign types. Rename updates all matching leads."
      isLoading={isLoading}
      loadingMessage="Loading sources..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No sources yet"
      emptyDescription="Sources appear when leads are tagged with a source value."
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.source}
        actions={(row) => (
          <PermissionButton
            permission="leads.sources.edit"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelected(row);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Rename source"
        onSubmit={handleSubmit((values) => {
          if (!selected) return;
          renameMutation.mutate(
            { old: selected.source, new: values.new.trim() },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={renameMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <p className="text-sm text-muted-foreground">
          Renaming “{selected?.source}” updates {selected?.count ?? 0} lead(s).
        </p>
        <FormTextField control={control} name="new" label="New name" required />
      </EntityFormDialog>
    </ModuleListPack>
  );
}
