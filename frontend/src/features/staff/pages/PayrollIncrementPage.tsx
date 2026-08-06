import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSelectField, FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useStaff } from '@hooks/useStaff';
import {
  useCreateStaffPayrollIncrement,
  useDeleteStaffPayrollIncrement,
  useStaffPayrollIncrements,
} from '@hooks/useStaffPayrollIncrement';
import type { StaffPayrollIncrement } from '@app-types/staff/payroll-increment';
import { ModuleListPack } from '@workflow-packs';
import { formatAmount } from '@utils/format';

const MONTHS = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];

const schema = z.object({
  staff_id: z.string().min(1, 'Staff is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().trim().min(4, 'Year is required'),
  increment: z.number().min(1, 'Increment must be greater than zero'),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<StaffPayrollIncrement>[] = [
  {
    id: 'staff',
    header: 'Staff Name',
    cellClassName: 'font-medium',
    cell: (r) => (
      <div>
        <span>{r.staff_name}</span>
        <p className="text-xs font-normal text-muted-foreground">{r.employee_id}</p>
      </div>
    ),
  },
  {
    id: 'period',
    header: 'Period',
    cell: (r) => `${r.month} ${r.year}`,
  },
  {
    id: 'basic_salary',
    header: 'Basic Salary',
    cellClassName: 'tabular-nums',
    cell: (r) => formatAmount(r.basic_salary),
  },
  {
    id: 'increment',
    header: 'Increment Amount',
    cellClassName: 'tabular-nums text-success font-medium',
    cell: (r) => `+ ${formatAmount(r.increment)}`,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
          r.status === 'approved'
            ? 'bg-success/15 text-success'
            : r.status === 'rejected'
              ? 'bg-destructive/15 text-destructive'
              : 'bg-warning/15 text-warning'
        }`}
      >
        {r.status}
      </span>
    ),
  },
];

export function PayrollIncrementPage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffPayrollIncrements();
  const createMutation = useCreateStaffPayrollIncrement();
  const deleteMutation = useDeleteStaffPayrollIncrement();

  const { data: staffPage } = useStaff(1);
  const staffOptions = useMemo(
    () =>
      (staffPage?.results ?? [])
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: `${s.name} ${s.surname || ''} (${s.employee_id || s.id})`,
        })),
    [staffPage?.results],
  );

  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffPayrollIncrement | null>(null);

  const currentYear = String(new Date().getFullYear());
  const currentMonth = MONTHS[new Date().getMonth()].value;

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { staff_id: '', month: currentMonth, year: currentYear, increment: 0 },
  });

  useEffect(() => {
    if (!open) return;
    reset({ staff_id: '', month: currentMonth, year: currentYear, increment: 0 });
  }, [open, currentMonth, currentYear, reset]);

  const addAction = (
    <PermissionButton
      permission="staff.payroll.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Request Increment
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Payroll Increments"
        description="Request and track salary increments for staff members."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading payroll increments..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No increments"
        emptyDescription="Create increment requests for staff payroll."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.pi_id}
          actions={(row) => (
            <>
              {row.status === 'pending' && (
                <PermissionButton
                  permission="staff.payroll.delete"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </PermissionButton>
              )}
            </>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Request Payroll Increment"
        onSubmit={handleSubmit((values) => {
          createMutation.mutate(
            {
              staff_id: Number(values.staff_id),
              month: values.month,
              year: values.year,
              increment: values.increment,
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="staff_id"
          label="Staff Member"
          options={staffOptions}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormSelectField
            control={control}
            name="month"
            label="Month"
            options={MONTHS}
            required
          />
          <FormTextField
            control={control}
            name="year"
            label="Year"
            required
          />
        </div>
        <FormNumberField
          control={control}
          name="increment"
          label="Increment Amount"
          min={1}
          required
        />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete increment request?"
        description={`Are you sure you want to delete the pending payroll increment request for ${deleteTarget?.staff_name}?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.pi_id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
