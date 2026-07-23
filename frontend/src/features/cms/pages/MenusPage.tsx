import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useAddCmsMenuItem,
  useCmsMenus,
  useCreateCmsMenu,
  useDeleteCmsMenu,
  useDeleteCmsMenuItem,
  useUpdateCmsMenu,
} from '@hooks/useCms';
import type { CmsMenu, CmsMenuItem } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const menuSchema = z.object({
  menu: z.string().trim().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});
type MenuFormValues = z.infer<typeof menuSchema>;

const itemSchema = z.object({
  menu: z.string().trim().min(1, 'Label is required'),
  page_id: z.number().optional(),
  ext_url_link: z.string().optional(),
  weight: z.number().optional(),
});
type ItemFormValues = z.infer<typeof itemSchema>;

const columns: DataTableColumn<CmsMenu>[] = [
  { id: 'menu', header: 'Menu', cellClassName: 'font-medium', cell: (r) => r.menu },
  { id: 'slug', header: 'Slug', cell: (r) => r.slug || '—' },
  {
    id: 'items',
    header: 'Items',
    cellClassName: 'tabular-nums',
    cell: (r) => r.items?.length ?? 0,
  },
];

export function MenusPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsMenus();
  const createMutation = useCreateCmsMenu();
  const updateMutation = useUpdateCmsMenu();
  const deleteMutation = useDeleteCmsMenu();
  const addItemMutation = useAddCmsMenuItem();
  const deleteItemMutation = useDeleteCmsMenuItem();

  const [open, setOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [selected, setSelected] = useState<CmsMenu | null>(null);
  const [itemMenu, setItemMenu] = useState<CmsMenu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsMenu | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ menu: CmsMenu; item: CmsMenuItem } | null>(null);

  const menuForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { menu: '', slug: '', description: '' },
  });
  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { menu: '', page_id: 0, ext_url_link: '', weight: 0 },
  });

  useEffect(() => {
    if (!open) return;
    menuForm.reset(
      selected
        ? {
            menu: selected.menu,
            slug: selected.slug || '',
            description: selected.description || '',
          }
        : { menu: '', slug: '', description: '' },
    );
  }, [open, selected, menuForm]);

  useEffect(() => {
    if (!itemOpen) return;
    itemForm.reset({ menu: '', page_id: 0, ext_url_link: '', weight: 0 });
  }, [itemOpen, itemForm]);

  const addAction = (
    <PermissionButton
      permission="cms.menus.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Menu
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Menus"
      description="Manage front CMS navigation menus and items."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading menus..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No menus"
      emptyDescription="Create a menu, then add items."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.menus.create"
              variant="ghost"
              size="sm"
              onClick={() => {
                setItemMenu(row);
                setItemOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="cms.menus.edit"
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
              permission="cms.menus.delete"
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

      {data.some((m) => (m.items?.length ?? 0) > 0) && (
        <div className="mt-8 space-y-6">
          {data
            .filter((m) => (m.items?.length ?? 0) > 0)
            .map((menu) => (
              <section key={menu.id} className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {menu.menu} items
                </h2>
                <DataTable
                  data={menu.items}
                  columns={[
                    {
                      id: 'label',
                      header: 'Label',
                      cellClassName: 'font-medium',
                      cell: (r) => r.menu,
                    },
                    { id: 'slug', header: 'Slug', cell: (r) => r.slug || '—' },
                    {
                      id: 'weight',
                      header: 'Weight',
                      cellClassName: 'tabular-nums',
                      cell: (r) => r.weight,
                    },
                  ]}
                  getRowKey={(r) => r.id}
                  actions={(item) => (
                    <PermissionButton
                      permission="cms.menus.delete"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteItem({ menu, item })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </PermissionButton>
                  )}
                />
              </section>
            ))}
        </div>
      )}

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Menu' : 'Add Menu'}
        onSubmit={menuForm.handleSubmit((values) => {
          const payload = {
            menu: values.menu.trim(),
            slug: values.slug?.trim() || undefined,
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
        <FormErrorSummary errors={menuForm.formState.errors} />
        <FormTextField control={menuForm.control} name="menu" label="Name" required />
        <FormTextField control={menuForm.control} name="slug" label="Slug" />
        <FormTextareaField control={menuForm.control} name="description" label="Description" />
      </EntityFormDialog>

      <EntityFormDialog
        open={itemOpen}
        onOpenChange={setItemOpen}
        title={`Add item to ${itemMenu?.menu ?? 'menu'}`}
        onSubmit={itemForm.handleSubmit((values) => {
          if (!itemMenu) return;
          addItemMutation.mutate(
            {
              menuId: itemMenu.id,
              payload: {
                menu: values.menu.trim(),
                page_id: values.page_id || 0,
                ext_url_link: values.ext_url_link?.trim() || '',
                weight: values.weight ?? 0,
              },
            },
            { onSuccess: () => setItemOpen(false) },
          );
        })}
        isLoading={addItemMutation.isPending}
      >
        <FormErrorSummary errors={itemForm.formState.errors} />
        <FormTextField control={itemForm.control} name="menu" label="Label" required />
        <FormNumberField control={itemForm.control} name="page_id" label="Page ID" />
        <FormTextField control={itemForm.control} name="ext_url_link" label="External URL" />
        <FormNumberField control={itemForm.control} name="weight" label="Weight" />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete menu?"
        description={`Remove “${deleteTarget?.menu ?? ''}” and its items.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
      <ConfirmDialog
        open={deleteItem !== null}
        onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete menu item?"
        description={`Remove “${deleteItem?.item.menu ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteItem) return;
          deleteItemMutation.mutate(
            { menuId: deleteItem.menu.id, itemId: deleteItem.item.id },
            { onSuccess: () => setDeleteItem(null) },
          );
        }}
        isLoading={deleteItemMutation.isPending}
      />
    </ModuleListPack>
  );
}
