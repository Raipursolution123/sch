import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCreateLibraryMember, useLibraryMembers } from '@hooks/useLibrary';
import type { LibraryMember } from '@app-types/library';
import { ModuleListPack } from '@workflow-packs';

const studentSchema = z.object({
  library_card_no: z.string().optional(),
  member_id: z.string().min(1, 'Student ID is required'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function AddStudentPage() {
  const [search, setSearch] = useState('');
  const { data: members = [], isLoading, isError, error, refetch } = useLibraryMembers();
  const createMemberMutation = useCreateLibraryMember();
  const [open, setOpen] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      library_card_no: '',
      member_id: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      library_card_no: '',
      member_id: '',
    });
  }, [open, form]);

  const studentMembers = useMemo(() => {
    const list = members.filter((m) => m.member_type === 'student');
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (m) =>
        m.library_card_no?.toLowerCase().includes(term) ||
        String(m.member_id).toLowerCase().includes(term),
    );
  }, [members, search]);

  const columns: DataTableColumn<LibraryMember>[] = [
    {
      id: 'member_id',
      header: 'Student ID',
      cellClassName: 'font-medium',
      cell: (row) => row.member_id || '—',
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
      Add Student
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Student Library Members"
        description="Manage and search student memberships in the library."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Search" htmlFor="student-search">
              <Input
                id="student-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Card no or student ID…"
                className="w-64"
              />
            </FormField>
            {addAction}
          </div>
        }
        isLoading={isLoading}
        loadingMessage="Loading student members..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && studentMembers.length === 0}
        emptyTitle="No student members found"
        emptyDescription="Add a student to the library to issue books."
        emptyAction={addAction}
      >
        <DataTable
          data={studentMembers}
          columns={columns}
          getRowKey={(row) => row.id}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Student Member"
        onSubmit={form.handleSubmit((values) => {
          createMemberMutation.mutate(
            {
              library_card_no: values.library_card_no?.trim() || null,
              member_type: 'student',
              member_id: Number(values.member_id),
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMemberMutation.isPending}
      >
        <FormErrorSummary errors={form.formState.errors} />
        <FormTextField
          control={form.control}
          name="member_id"
          label="Student ID"
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
