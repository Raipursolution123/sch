import { useState } from 'react';
import { Plus, Edit2, Trash2, Home } from 'lucide-react';
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

export interface SchoolHouseItem {
  id: number;
  house_name: string;
  description: string;
  is_active: string;
}

export function StudentHousesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SchoolHouseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolHouseItem | null>(null);
  const [houseName, setHouseName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery<SchoolHouseItem[]>({
    queryKey: ['student-houses'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: SchoolHouseItem[] }>(
        API_ENDPOINTS.students.houses,
      );
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { house_name: string; description: string }) => {
      await apiClient.post(API_ENDPOINTS.students.houses, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-houses'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { house_name: string; description: string };
    }) => {
      await apiClient.put(API_ENDPOINTS.students.houseDetail(id), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-houses'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(API_ENDPOINTS.students.houseDetail(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-houses'] });
      setDeleteTarget(null);
    },
  });

  const openCreateDialog = () => {
    setSelectedRecord(null);
    setHouseName('');
    setDescription('');
    setDialogOpen(true);
  };

  const openEditDialog = (item: SchoolHouseItem) => {
    setSelectedRecord(item);
    setHouseName(item.house_name);
    setDescription(item.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      updateMutation.mutate({
        id: selectedRecord.id,
        payload: { house_name: houseName, description },
      });
    } else {
      createMutation.mutate({ house_name: houseName, description });
    }
  };

  const houses = data || [];

  const addAction = (
    <Button onClick={openCreateDialog} className="gap-1">
      <Plus className="h-4 w-4" />
      Add House
    </Button>
  );

  return (
    <ModuleListPack
      title="Student Houses"
      description="Define school houses for student grouping and extracurricular activities."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading student houses..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && houses.length === 0}
      emptyTitle="No Student Houses configured"
      emptyDescription="Create house rules to organize sports & inter-house competitions."
      emptyAction={addAction}
      footer={
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedRecord ? 'Edit House' : 'Add Student House'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <FormField label="House Name" htmlFor="house_name" required>
                  <Input
                    id="house_name"
                    placeholder="e.g. Red House, Blue House, Gandhi House"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Description" htmlFor="house_desc">
                  <Input
                    id="house_desc"
                    placeholder="House motto or extra description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
            title="Delete House"
            description={deleteTarget ? `Delete house "${deleteTarget.house_name}"?` : ''}
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
              <TableHead>House ID</TableHead>
              <TableHead>House Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {houses.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span>{item.house_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.description || '—'}
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
