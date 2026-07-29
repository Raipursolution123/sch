import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Layers, Upload, CheckCircle2 } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/api-endpoints';

export interface StudentCategoryItem {
  id: number;
  category: string;
  is_active: string;
}

export function StudentCategoriesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentCategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentCategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery<StudentCategoryItem[]>({
    queryKey: ['student-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: StudentCategoryItem[] }>(
        API_ENDPOINTS.students.categories,
      );
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { category: string }) => {
      await apiClient.post(API_ENDPOINTS.students.categories, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-categories'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { category: string } }) => {
      await apiClient.put(API_ENDPOINTS.students.categoryDetail(id), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-categories'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(API_ENDPOINTS.students.categoryDetail(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-categories'] });
      setDeleteTarget(null);
    },
  });

  const openCreateDialog = () => {
    setSelectedRecord(null);
    setCategoryName('');
    setDialogOpen(true);
  };

  const openEditDialog = (item: StudentCategoryItem) => {
    setSelectedRecord(item);
    setCategoryName(item.category);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, payload: { category: categoryName } });
    } else {
      createMutation.mutate({ category: categoryName });
    }
  };

  const categories = data || [];

  const addAction = (
    <Button onClick={openCreateDialog} className="gap-1">
      <Plus className="h-4 w-4" />
      Add Category
    </Button>
  );

  return (
    <ModuleListPack
      title="Student Categories"
      description="Manage student admission categories (General, OBC, SC, ST, etc.)."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading student categories..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && categories.length === 0}
      emptyTitle="No Student Categories configured"
      emptyDescription="Create categories to classify students during admission."
      emptyAction={addAction}
      footer={
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedRecord ? 'Edit Category' : 'Add Student Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <FormField label="Category Name" htmlFor="cat_name" required>
                  <Input
                    id="cat_name"
                    placeholder="e.g. General, OBC, SC, ST"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </FormField>
                <DialogFooter className="gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {selectedRecord ? 'Update' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete Category"
            description={deleteTarget ? `Delete category "${deleteTarget.category}"?` : ''}
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id);
            }}
          />
        </>
      }
    >
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>{item.category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ModuleListPack>
  );
}
