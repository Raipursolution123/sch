import { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { ModuleListPack } from '@workflow-packs';
import {
  useApproveStaffRating,
  useDeclineStaffRating,
  useDeleteStaffRating,
  useStaffRatings,
} from '@hooks/useStaffRatings';
import type { StaffRating } from '@services/api/staff-ratings.service';

export function StaffRatingsPage() {
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StaffRating | null>(null);

  const { data = [], isLoading, isError, error, refetch } = useStaffRatings(statusFilter);
  const approveMutation = useApproveStaffRating();
  const declineMutation = useDeclineStaffRating();
  const deleteMutation = useDeleteStaffRating();

  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      row.staff_name.toLowerCase().includes(q) ||
      row.comment.toLowerCase().includes(q) ||
      row.role.toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<StaffRating>[] = [
    {
      id: 'staff',
      header: 'Teacher',
      cellClassName: 'font-medium',
      cell: (r) => r.staff_name,
    },
    { id: 'rate', header: 'Rating', cell: (r) => `${r.rate}/5` },
    { id: 'comment', header: 'Comment', cell: (r) => r.comment || '—' },
    { id: 'role', header: 'From', cell: (r) => r.role || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (r.status === 1 ? 'Approved' : 'Declined'),
    },
    { id: 'date', header: 'Date', cell: (r) => r.entrydt || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Teachers Rating"
        description="Review and approve teacher ratings submitted by students and parents."
        isLoading={isLoading}
        loadingMessage="Loading ratings..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No ratings"
        emptyDescription="Teacher ratings from the portal will appear here for review."
      >
        <div className="mb-4 max-w-xs">
          <FormField label="Filter by status">
            <Select
              value={statusFilter === '' ? '' : String(statusFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setStatusFilter(v === '' ? '' : Number(v));
              }}
              options={[
                { value: '', label: 'All' },
                { value: '1', label: 'Approved' },
                { value: '0', label: 'Declined' },
              ]}
            />
          </FormField>
        </div>
        <DataTable
          data={filtered}
          columns={columns}
          getRowKey={(r) => r.id}
          searchValue={search}
          onSearchChange={setSearch}
          actions={(row) => (
            <>
              {row.status !== 1 && (
                <PermissionButton
                  permission="staff.edit"
                  variant="ghost"
                  size="sm"
                  title="Approve"
                  onClick={() => approveMutation.mutate(row.id)}
                >
                  <Check className="h-4 w-4 text-emerald-600" />
                </PermissionButton>
              )}
              {row.status !== 0 && (
                <PermissionButton
                  permission="staff.edit"
                  variant="ghost"
                  size="sm"
                  title="Decline"
                  onClick={() => declineMutation.mutate(row.id)}
                >
                  <X className="h-4 w-4 text-amber-600" />
                </PermissionButton>
              )}
              <PermissionButton
                permission="staff.delete"
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete rating"
        description={
          deleteTarget ? `Delete rating for ${deleteTarget.staff_name}? This cannot be undone.` : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </>
  );
}
