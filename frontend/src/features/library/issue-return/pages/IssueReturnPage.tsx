import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookPlus, Undo2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormDateField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useBookIssues,
  useCreateLibraryMember,
  useIssueBook,
  useLibraryBooks,
  useLibraryMembers,
  useReturnBook,
} from '@hooks/useLibrary';
import type { BookIssue } from '@app-types/library';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

const issueSchema = z.object({
  book_id: z.string().min(1, 'Book is required'),
  member_id: z.string().min(1, 'Member is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  duereturn_date: z.string().optional(),
});

const memberSchema = z.object({
  library_card_no: z.string().optional(),
  member_type: z.enum(['student', 'staff', 'teacher']),
  member_id: z.string().min(1, 'Student/Staff ID is required'),
});

type IssueFormValues = z.infer<typeof issueSchema>;
type MemberFormValues = z.infer<typeof memberSchema>;

const today = new Date().toISOString().slice(0, 10);

export function IssueReturnPage() {
  const [status, setStatus] = useState('open');
  const [search, setSearch] = useState('');
  const { data: issues = [], isLoading, isError, error, refetch } = useBookIssues(status, search);
  const { data: books = [] } = useLibraryBooks();
  const { data: members = [] } = useLibraryMembers();
  const issueMutation = useIssueBook();
  const returnMutation = useReturnBook();
  const createMemberMutation = useCreateLibraryMember();

  const [issueOpen, setIssueOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<BookIssue | null>(null);

  const issueForm = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      book_id: '',
      member_id: '',
      issue_date: today,
      duereturn_date: '',
    },
  });

  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      library_card_no: '',
      member_type: 'student',
      member_id: '',
    },
  });

  useEffect(() => {
    if (!issueOpen) return;
    issueForm.reset({
      book_id: '',
      member_id: '',
      issue_date: today,
      duereturn_date: '',
    });
  }, [issueOpen, issueForm]);

  useEffect(() => {
    if (!memberOpen) return;
    memberForm.reset({
      library_card_no: '',
      member_type: 'student',
      member_id: '',
    });
  }, [memberOpen, memberForm]);

  const bookOptions = useMemo(
    () =>
      books.map((b) => ({
        value: String(b.id),
        label: `${b.book_title} (${b.book_no})`,
      })),
    [books],
  );

  const memberOptions = useMemo(
    () =>
      members.map((m) => ({
        value: String(m.id),
        label: `${m.library_card_no || `Member #${m.id}`} · ${m.member_type || '—'}`,
      })),
    [members],
  );

  const columns: DataTableColumn<BookIssue>[] = [
    {
      id: 'book',
      header: 'Book',
      cellClassName: 'font-medium',
      cell: (row) => row.book_title || `Book #${row.book_id}`,
    },
    {
      id: 'book_no',
      header: 'Book No',
      cell: (row) => row.book_no || '—',
    },
    {
      id: 'member',
      header: 'Member',
      cell: (row) => row.library_card_no || (row.member_id ? `#${row.member_id}` : '—'),
    },
    {
      id: 'issue_date',
      header: 'Issued',
      cell: (row) => (row.issue_date ? formatDate(row.issue_date) : '—'),
    },
    {
      id: 'due',
      header: 'Due',
      cell: (row) => (row.duereturn_date ? formatDate(row.duereturn_date) : '—'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.is_returned ? (
          <Badge variant="secondary">Returned</Badge>
        ) : (
          <Badge variant="outline">Open</Badge>
        ),
    },
  ];

  const issueAction = (
    <PermissionButton
      permission="library.issue.view"
      onClick={() => setIssueOpen(true)}
      className="gap-1"
    >
      <BookPlus className="h-4 w-4" aria-hidden="true" />
      Issue Book
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Issue & Return"
      description="Circulate books to library members and record returns."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Status" htmlFor="issue-status">
            <Select
              id="issue-status"
              className="w-40"
              value={status}
              onValueChange={setStatus}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'returned', label: 'Returned' },
                { value: 'all', label: 'All' },
              ]}
            />
          </FormField>
          <FormField label="Search" htmlFor="issue-search">
            <Input
              id="issue-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Book or card…"
              className="w-56"
            />
          </FormField>
          <PermissionButton
            permission="library.issue.view"
            variant="outline"
            onClick={() => setMemberOpen(true)}
          >
            Add member
          </PermissionButton>
          {issueAction}
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading issues..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && issues.length === 0}
      emptyTitle="No issues found"
      emptyDescription="Issue a book to a library member to start circulation."
      emptyAction={issueAction}
    >
      <DataTable
        data={issues}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) =>
          row.is_returned ? null : (
            <PermissionButton
              permission="library.issue.view"
              variant="ghost"
              size="sm"
              onClick={() => setReturnTarget(row)}
              aria-label={`Return ${row.book_title || 'book'}`}
              className="gap-1"
            >
              <Undo2 className="h-4 w-4" />
              Return
            </PermissionButton>
          )
        }
      />

      <EntityFormDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        title="Issue Book"
        onSubmit={issueForm.handleSubmit((values) => {
          issueMutation.mutate(
            {
              book_id: Number(values.book_id),
              member_id: Number(values.member_id),
              issue_date: values.issue_date,
              duereturn_date: values.duereturn_date?.trim() || null,
            },
            { onSuccess: () => setIssueOpen(false) },
          );
        })}
        isLoading={issueMutation.isPending}
      >
        <FormErrorSummary errors={issueForm.formState.errors} />
        <FormSelectField
          control={issueForm.control}
          name="book_id"
          label="Book"
          required
          options={bookOptions}
          placeholder="Select book"
        />
        <FormSelectField
          control={issueForm.control}
          name="member_id"
          label="Member"
          required
          options={memberOptions}
          placeholder="Select member"
        />
        <FormDateField control={issueForm.control} name="issue_date" label="Issue date" required />
        <FormDateField control={issueForm.control} name="duereturn_date" label="Due date" />
      </EntityFormDialog>

      <EntityFormDialog
        open={memberOpen}
        onOpenChange={setMemberOpen}
        title="Add Library Member"
        onSubmit={memberForm.handleSubmit((values) => {
          createMemberMutation.mutate(
            {
              library_card_no: values.library_card_no?.trim() || null,
              member_type: values.member_type,
              member_id: Number(values.member_id),
            },
            { onSuccess: () => setMemberOpen(false) },
          );
        })}
        isLoading={createMemberMutation.isPending}
      >
        <FormErrorSummary errors={memberForm.formState.errors} />
        <FormSelectField
          control={memberForm.control}
          name="member_type"
          label="Member type"
          required
          options={[
            { value: 'student', label: 'Student' },
            { value: 'staff', label: 'Staff' },
            { value: 'teacher', label: 'Teacher' },
          ]}
        />
        <FormTextField
          control={memberForm.control}
          name="member_id"
          label="Student / Staff ID"
          required
        />
        <FormTextField
          control={memberForm.control}
          name="library_card_no"
          label="Library card no"
        />
      </EntityFormDialog>

      <ConfirmDialog
        open={returnTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReturnTarget(null);
        }}
        title="Return book?"
        description={`Mark “${returnTarget?.book_title ?? 'this book'}” as returned.`}
        confirmLabel="Return"
        onConfirm={() => {
          if (!returnTarget) return;
          returnMutation.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) });
        }}
        isLoading={returnMutation.isPending}
      />
    </ModuleListPack>
  );
}
