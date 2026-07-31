import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';

import {
  useVisitorPurposes,
  useCreateVisitorPurpose,
  useUpdateVisitorPurpose,
  useDeleteVisitorPurpose,
} from '@hooks/usePhoneCallPurpose';

import {
  useComplaintTypes,
  useCreateComplaintType,
  useUpdateComplaintType,
  useDeleteComplaintType,
  useSources,
  useCreateSource,
  useUpdateSource,
  useDeleteSource,
  useReferences,
  useCreateReference,
  useUpdateReference,
  useDeleteReference,
} from '@hooks/useSetupFrontOffice';

import type { VisitorPurpose } from '@app-types/front-office/phone-call-purpose';
import type { ComplaintType, Source, Reference } from '@app-types/front-office/setup';

export function SetupFrontOfficePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Setup Front Office</h1>
        <p className="text-sm text-muted-foreground">
          Configure visitor purposes, complaint types, sources, and reference channels.
        </p>
      </div>

      <Tabs defaultValue="purpose" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="purpose">Visitor Purpose</TabsTrigger>
          <TabsTrigger value="complaint-type">Complaint Type</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="purpose" className="mt-0">
          <VisitorPurposeTab />
        </TabsContent>
        <TabsContent value="complaint-type" className="mt-0">
          <ComplaintTypeTab />
        </TabsContent>
        <TabsContent value="source" className="mt-0">
          <SourceTab />
        </TabsContent>
        <TabsContent value="reference" className="mt-0">
          <ReferenceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// -------------------------------------------------------------
// Visitor Purpose Tab
// -------------------------------------------------------------
const purposeSchema = z.object({
  visitors_purpose: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});
type PurposeFormValues = z.infer<typeof purposeSchema>;

function VisitorPurposeTab() {
  const { data = [], isLoading, isError, error, refetch } = useVisitorPurposes();
  const createMutation = useCreateVisitorPurpose();
  const updateMutation = useUpdateVisitorPurpose();
  const deleteMutation = useDeleteVisitorPurpose();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<VisitorPurpose | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitorPurpose | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<PurposeFormValues>({
    resolver: zodResolver(purposeSchema),
    defaultValues: { visitors_purpose: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            visitors_purpose: selected.visitors_purpose || selected.name,
            description: selected.description || '',
          }
        : { visitors_purpose: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.setup_font_office.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Purpose
    </PermissionButton>
  );

  const columns: DataTableColumn<VisitorPurpose>[] = [
    {
      id: 'name',
      header: 'Purpose',
      cellClassName: 'font-medium',
      cell: (r) => r.visitors_purpose || r.name,
    },
    { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Visitor Purpose"
        description="Maintain visit purpose options used in the visitor book."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading visitor purposes..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No visitor purposes"
        emptyDescription="Add purposes such as Meeting, Admission enquiry, or Delivery."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.setup_font_office.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="front_office.setup_font_office.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Visitor Purpose' : 'Add Visitor Purpose'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            visitors_purpose: values.visitors_purpose,
            description: values.description?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="visitors_purpose" label="Purpose" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Visitor Purpose?"
        description={`Remove “${deleteTarget?.visitors_purpose || deleteTarget?.name || ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// -------------------------------------------------------------
// Complaint Type Tab
// -------------------------------------------------------------
const complaintTypeSchema = z.object({
  complaint_type: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});
type ComplaintTypeFormValues = z.infer<typeof complaintTypeSchema>;

function ComplaintTypeTab() {
  const { data = [], isLoading, isError, error, refetch } = useComplaintTypes();
  const createMutation = useCreateComplaintType();
  const updateMutation = useUpdateComplaintType();
  const deleteMutation = useDeleteComplaintType();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ComplaintType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComplaintType | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<ComplaintTypeFormValues>({
    resolver: zodResolver(complaintTypeSchema),
    defaultValues: { complaint_type: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            complaint_type: selected.complaint_type,
            description: selected.description || '',
          }
        : { complaint_type: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.setup_font_office.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Complaint Type
    </PermissionButton>
  );

  const columns: DataTableColumn<ComplaintType>[] = [
    {
      id: 'name',
      header: 'Complaint Type',
      cellClassName: 'font-medium',
      cell: (r) => r.complaint_type,
    },
    { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Complaint Type"
        description="Maintain categories for sorting system complaints."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading complaint types..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No complaint types"
        emptyDescription="Add complaint types such as Infrastructure, Academics, or Management."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.setup_font_office.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="front_office.setup_font_office.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Complaint Type' : 'Add Complaint Type'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            complaint_type: values.complaint_type,
            description: values.description?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="complaint_type" label="Complaint Type" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Complaint Type?"
        description={`Remove “${deleteTarget?.complaint_type || ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// -------------------------------------------------------------
// Source Tab
// -------------------------------------------------------------
const sourceSchema = z.object({
  source: z.string().trim().min(1, 'Source name is required'),
  description: z.string().optional(),
});
type SourceFormValues = z.infer<typeof sourceSchema>;

function SourceTab() {
  const { data = [], isLoading, isError, error, refetch } = useSources();
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource();
  const deleteMutation = useDeleteSource();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Source | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<SourceFormValues>({
    resolver: zodResolver(sourceSchema),
    defaultValues: { source: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            source: selected.source,
            description: selected.description || '',
          }
        : { source: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.setup_font_office.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Source
    </PermissionButton>
  );

  const columns: DataTableColumn<Source>[] = [
    {
      id: 'name',
      header: 'Source',
      cellClassName: 'font-medium',
      cell: (r) => r.source,
    },
    { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Source"
        description="Maintain channels/leads sources such as Advertisement, Website, or Referral."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading sources..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No sources"
        emptyDescription="Add lead sources to track student and parent inquiries."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.setup_font_office.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="front_office.setup_font_office.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Source' : 'Add Source'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            source: values.source,
            description: values.description?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="source" label="Source" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Source?"
        description={`Remove “${deleteTarget?.source || ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// -------------------------------------------------------------
// Reference Tab
// -------------------------------------------------------------
const referenceSchema = z.object({
  reference: z.string().trim().min(1, 'Reference name is required'),
  description: z.string().optional(),
});
type ReferenceFormValues = z.infer<typeof referenceSchema>;

function ReferenceTab() {
  const { data = [], isLoading, isError, error, refetch } = useReferences();
  const createMutation = useCreateReference();
  const updateMutation = useUpdateReference();
  const deleteMutation = useDeleteReference();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Reference | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reference | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceSchema),
    defaultValues: { reference: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            reference: selected.reference,
            description: selected.description || '',
          }
        : { reference: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.setup_font_office.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Reference
    </PermissionButton>
  );

  const columns: DataTableColumn<Reference>[] = [
    {
      id: 'name',
      header: 'Reference',
      cellClassName: 'font-medium',
      cell: (r) => r.reference,
    },
    { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Reference"
        description="Maintain reference items for visitor entries."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading references..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No references"
        emptyDescription="Add references to record how visitors heard about the institution."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.setup_font_office.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="front_office.setup_font_office.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Reference' : 'Add Reference'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            reference: values.reference,
            description: values.description?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="reference" label="Reference" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Reference?"
        description={`Remove “${deleteTarget?.reference || ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
