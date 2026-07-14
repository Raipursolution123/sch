import { Pencil } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { FeeReminder } from '@app-types/fees/fee-reminder';

interface FeeRemindersTableProps {
  reminders: FeeReminder[];
  onEdit: (reminder: FeeReminder) => void;
}

const columns: DataTableColumn<FeeReminder>[] = [
  {
    id: 'type',
    header: 'Type',
    cellClassName: 'font-medium capitalize',
    cell: (row) => row.reminder_type ?? '—',
  },
  {
    id: 'day',
    header: 'Days',
    cellClassName: 'tabular-nums',
    cell: (row) => row.day ?? '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function FeeRemindersTable({ reminders, onEdit }: FeeRemindersTableProps) {
  return (
    <DataTable
      data={reminders}
      columns={columns}
      getRowKey={(reminder) => reminder.id}
      actions={(reminder) => (
        <PermissionButton
          permission="fees.manage"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(reminder)}
          aria-label={`Edit ${reminder.reminder_type ?? 'reminder'}`}
        >
          <Pencil className="h-4 w-4" />
        </PermissionButton>
      )}
    />
  );
}
