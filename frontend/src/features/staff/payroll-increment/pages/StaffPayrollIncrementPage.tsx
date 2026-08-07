import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import {
  useCreateStaffPayrollIncrement,
  useStaffPayrollIncrements,
} from '@hooks/useStaffPayrollIncrement';
import { useStaff } from '@hooks/useStaff';
import type { StaffPayrollIncrement } from '@services/api/staff-payroll-increment.service';
import { ModuleListPack } from '@workflow-packs';
import { formatDate } from '@utils/format';

const formSchema = z.object({
  staff_id: z.number().min(1, 'Select a staff member'),
  increment: z.coerce.number().positive('Increment must be greater than zero'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(1, 'Year is required'),
});

type FormValues = z.infer<typeof formSchema>;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function statusVariant(status: string) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

export function StaffPayrollIncrementPage() {
  const now = new Date();
  const [createOpen, setCreateOpen] = useState(false);
  const { data = [], isLoading, isError, error, refetch } = useStaffPayrollIncrements();
  const { data: staffPage } = useStaff(1);
  const staff = staffPage?.results ?? [];
  const createMutation = useCreateStaffPayrollIncrement();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      staff_id: 0,
      increment: 0,
      month: MONTHS[now.getMonth()],
      year: String(now.getFullYear()),
    },
  });

  const staffOptions = useMemo(
    () =>
      staff
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: `${s.full_name} (${s.employee_id})`,
        })),
    [staff],
  );

  const columns: DataTableColumn<StaffPayrollIncrement>[] = [
    {
      id: 'staff',
      header: 'Staff',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <span>{row.staff_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{row.employee_id || '—'}</p>
        </div>
      ),
    },
    { id: 'period', header: 'Period', cell: (row) => `${row.month} ${row.year}` },
    {
      id: 'basic',
      header: 'Basic salary',
      cellClassName: 'tabular-nums',
      cell: (row) => row.basic_salary.toLocaleString(),
    },
    {
      id: 'increment',
      header: 'Increment',
      cellClassName: 'tabular-nums',
      cell: (row) => row.increment.toLocaleString(),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={statusVariant(row.status)} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'date',
      header: 'Requested',
      cellClassName: 'text-muted-foreground',
      cell: (row) => formatDate(row.date),
    },
  ];

  const addAction = (
    <PermissionButton
      permission="staff.create"
      onClick={() => setCreateOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      New Increment
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Payroll Increment"
        description="Request salary increments for staff members."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading payroll increments..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No increment requests"
        emptyDescription="Create a payroll increment request for a staff member."
        emptyAction={addAction}
      >
        <DataTable data={data} columns={columns} getRowKey={(row) => row.id} />
      </ModuleListPack>

      <EntityFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) return;
          reset({
            staff_id: staffOptions[0] ? Number(staffOptions[0].value) : 0,
            increment: 0,
            month: MONTHS[now.getMonth()],
            year: String(now.getFullYear()),
          });
        }}
        title="New payroll increment"
        description="Submit an increment request for approval."
        onSubmit={handleSubmit((values) =>
          createMutation.mutate(
            {
              staff_id: values.staff_id,
              increment: values.increment,
              month: values.month,
              year: values.year,
            },
            { onSuccess: () => setCreateOpen(false) },
          ),
        )}
        isLoading={createMutation.isPending}
        submitLabel="Submit"
      >
        <FormErrorSummary errors={errors} />
        <Controller
          control={control}
          name="staff_id"
          render={({ field, fieldState }) => (
            <FormField
              label="Staff"
              htmlFor="increment_staff"
              error={fieldState.error?.message}
              required
            >
              <Select
                id="increment_staff"
                options={staffOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Select staff"
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="increment"
          render={({ field, fieldState }) => (
            <FormField
              label="Increment amount"
              htmlFor="increment_amount"
              error={fieldState.error?.message}
              required
            >
              <Input
                id="increment_amount"
                type="number"
                min={0}
                step="0.01"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="month"
          render={({ field, fieldState }) => (
            <FormField
              label="Month"
              htmlFor="increment_month"
              error={fieldState.error?.message}
              required
            >
              <Select
                id="increment_month"
                options={MONTHS.map((month) => ({ value: month, label: month }))}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="year"
          render={({ field, fieldState }) => (
            <FormField
              label="Year"
              htmlFor="increment_year"
              error={fieldState.error?.message}
              required
            >
              <Input
                id="increment_year"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormField>
          )}
        />
      </EntityFormDialog>
    </>
  );
}
