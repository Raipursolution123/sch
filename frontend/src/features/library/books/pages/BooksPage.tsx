import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateLibraryBook,
  useDeleteLibraryBook,
  useLibraryBooks,
  useUpdateLibraryBook,
} from '@hooks/useLibrary';
import type { LibraryBook } from '@app-types/library';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  book_title: z.string().trim().min(1, 'Title is required'),
  book_no: z.string().trim().min(1, 'Book number is required'),
  isbn_no: z.string().trim().min(1, 'ISBN is required'),
  rack_no: z.string().trim().min(1, 'Rack number is required'),
  author: z.string().optional(),
  publish: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional(),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<LibraryBook>[] = [
  {
    id: 'title',
    header: 'Title',
    cellClassName: 'font-medium',
    cell: (row) => row.book_title,
  },
  { id: 'book_no', header: 'Book No', cell: (row) => row.book_no },
  {
    id: 'author',
    header: 'Author',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.author || '—',
  },
  { id: 'rack', header: 'Rack', cell: (row) => row.rack_no },
  {
    id: 'qty',
    header: 'Qty',
    cellClassName: 'tabular-nums',
    cell: (row) => row.qty ?? '—',
  },
  {
    id: 'available',
    header: 'Available',
    cell: (row) => <StatusBadge isActive={row.available === 'yes' ? 'yes' : 'no'} />,
  },
];

export function BooksPage() {
  const [search, setSearch] = useState('');
  const { data: books = [], isLoading, isError, error, refetch } = useLibraryBooks(search);
  const createMutation = useCreateLibraryBook();
  const updateMutation = useUpdateLibraryBook();
  const deleteMutation = useDeleteLibraryBook();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LibraryBook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryBook | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      book_title: '',
      book_no: '',
      isbn_no: '',
      rack_no: '',
      author: '',
      publish: '',
      category: '',
      subject: '',
      qty: 1,
      description: '',
    },
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (selected) {
      reset({
        book_title: selected.book_title,
        book_no: selected.book_no,
        isbn_no: selected.isbn_no,
        rack_no: selected.rack_no,
        author: selected.author ?? '',
        publish: selected.publish ?? '',
        category: selected.category ?? '',
        subject: selected.subject ?? '',
        qty: selected.qty ?? 1,
        description: selected.description ?? '',
      });
      return;
    }
    reset({
      book_title: '',
      book_no: '',
      isbn_no: '',
      rack_no: '',
      author: '',
      publish: '',
      category: '',
      subject: '',
      qty: 1,
      description: '',
    });
  }, [dialogOpen, selected, reset]);

  const openCreate = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      book_title: values.book_title,
      book_no: values.book_no,
      isbn_no: values.isbn_no,
      rack_no: values.rack_no,
      author: values.author?.trim() || null,
      publish: values.publish?.trim() || null,
      category: values.category?.trim() || null,
      subject: values.subject?.trim() || null,
      qty: values.qty,
      description: values.description?.trim() || null,
    };
    if (selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  const addAction = (
    <PermissionButton permission="library.books.create" onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Book
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Book List"
        description="Manage the school library catalog."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Search" htmlFor="books-search">
              <Input
                id="books-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, number, ISBN, author…"
                className="w-64"
              />
            </FormField>
            {addAction}
          </div>
        }
        isLoading={isLoading}
        loadingMessage="Loading books..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && books.length === 0}
        emptyTitle="No books yet"
        emptyDescription="Add the first book to start the catalog."
        emptyAction={addAction}
      >
        <DataTable
          data={books}
          columns={columns}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="library.books.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setDialogOpen(true);
                }}
                aria-label={`Edit ${row.book_title}`}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="library.books.delete"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.book_title}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? 'Edit Book' : 'Add Book'}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={errors} />
        <FormTextField control={control} name="book_title" label="Title" required />
        <FormTextField control={control} name="book_no" label="Book No" required />
        <FormTextField control={control} name="isbn_no" label="ISBN" required />
        <FormTextField control={control} name="rack_no" label="Rack No" required />
        <FormTextField control={control} name="author" label="Author" />
        <FormTextField control={control} name="publish" label="Publisher" />
        <FormTextField control={control} name="category" label="Category" />
        <FormTextField control={control} name="subject" label="Subject" />
        <FormNumberField control={control} name="qty" label="Quantity" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete book?"
        description={`Remove “${deleteTarget?.book_title ?? ''}” from the catalog.`}
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
