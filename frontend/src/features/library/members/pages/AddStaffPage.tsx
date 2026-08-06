import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCreateLibraryMember, useLibraryMembers } from '@hooks/useLibrary';
import type { LibraryMember } from '@app-types/library';
import { ModuleListPack } from '@workflow-packs';

const staffSchema = z.object({
  library_card_no: z.string().optional(),
  member_type: z.enum(['staff', 'teacher']),
  member_id: z.string().min(1, 'Staff/Teacher ID is required'),
});

type StaffFormValues = z.infer<typeof staffSchema>;

export function AddStaffPage() {
  const [search, setSearch] = useState('');
  const { data: members = [], isLoading, isError, error, refetch } = useLibraryMembers();
  const createMemberMutation = useCreateLibraryMember();
  const [open, setOpen] = useState(false);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      library_card_no: '',
      member_type: 'staff',
      member_id: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      library_card_no: '',
      member_type: 'staff',
      member_id: '',
    });
  }, [open, form]);

  const staffMembers = useMemo(() => {
    const list = members.filter((m) => m.member_type === 'staff' || m.member_type === 'teacher');
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (m) =>
        m.library_card_no?.toLowerCase().includes(term) ||
        String(m.member_id).toLowerCase().includes(term) ||
        m.member_type?.toLowerCase().includes(term),
    );
  }, [members, search]);

  const columns: DataTableColumn<LibraryMember>[] = [
    {
      id: 'member_id',
      header: 'Staff/Teacher ID',
      cellClassName: 'font-medium',
      cell: (row) => row.member_id || '—',
    },
    {
      id: 'member_type',
      header: 'Role',
      cell: (row) => {
        const type = row.member_type || '—';
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      id: 'library_card_no',
      header: 'Library Card No',
      cell: (row) => row.library_card_no || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.is_active === 'yes' ? (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const addAction = (
    <PermissionButton
      permission="library.issue.view"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <UserPlus className="h-4 w-4" aria-hidden="true" />
      Add Staff Member
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Staff & Teacher Library Members"
        description="Manage and search staff or teacher memberships in the library."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Search" htmlFor="staff-search">
              <Input
                id="staff-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Card no, ID or type…"
                className="w-64"
              />
            </FormField>
            {addAction}
          </div>
        }
        isLoading={isLoading}
        loadingMessage="Loading staff members..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && staffMembers.length === 0}
        emptyTitle="No staff members found"
        emptyDescription="Add a staff or teacher to the library to issue books."
        emptyAction={addAction}
      >
        <DataTable
          data={staffMembers}
          columns={columns}
          getRowKey={(row) => row.id}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Staff/Teacher Member"
        onSubmit={form.handleSubmit((values) => {
          createMemberMutation.mutate(
            {
              library_card_no: values.library_card_no?.trim() || null,
              member_type: values.member_type,
              member_id: Number(values.member_id),
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMemberMutation.isPending}
      >
        <FormErrorSummary errors={form.formState.errors} />
        <FormSelectField
          control={form.control}
          name="member_type"
          label="Role Type"
          required
          options={[
            { value: 'staff', label: 'Staff' },
            { value: 'teacher', label: 'Teacher' },
          ]}
        />
        <FormTextField
          control={form.control}
          name="member_id"
          label="Staff / Teacher ID"
          required
        />
        <FormTextField
          control={form.control}
          name="library_card_no"
          label="Library Card Number"
        />
      </EntityFormDialog>
    </>
  );
}
