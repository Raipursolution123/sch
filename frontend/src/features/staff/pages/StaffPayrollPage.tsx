import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormNumberField,
  FormSelectField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { SettingsCard } from '@components/forms/SettingsCard';
import { Select } from '@components/ui/select';
import { useStaff } from '@hooks/useStaff';
import {
  useCreateStaffPayScale,
  useCreateStaffPayslip,
  useDeleteStaffPayScale,
  useDeleteStaffPayslip,
  useStaffPayScales,
  useStaffPayslips,
  useUpdateStaffPayScale,
} from '@hooks/useStaffPayroll';
import type { StaffPayScale, StaffPayslip } from '@app-types/staff/payroll';
import { formatAmount } from '@utils/format';
import { todayIsoDate } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

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
] as const;

const scaleSchema = z.object({
  pay_scale: z.string().trim().min(1, 'Pay scale is required'),
  grade: z.string().optional(),
  basic_salary: z.number().min(0, 'Must be 0 or greater'),
  is_active: z.boolean(),
});
type ScaleFormValues = z.infer<typeof scaleSchema>;

const payslipSchema = z.object({
  staff_id: z.number().min(1, 'Staff is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().trim().min(4, 'Year is required'),
  basic: z.number().min(0).optional(),
  total_allowance: z.number().min(0).optional(),
  total_deduction: z.number().min(0).optional(),
  leave_deduction: z.number().min(0).optional(),
  tax: z.string().optional(),
  payment_mode: z.string().optional(),
  payment_date: z.string().optional(),
  remark: z.string().optional(),
});
type PayslipFormValues = z.infer<typeof payslipSchema>;

const scaleColumns: DataTableColumn<StaffPayScale>[] = [
  { id: 'pay_scale', header: 'Pay scale', cellClassName: 'font-medium', cell: (r) => r.pay_scale },
  { id: 'grade', header: 'Grade', cell: (r) => r.grade || '—' },
  {
    id: 'basic',
    header: 'Basic',
    cellClassName: 'tabular-nums',
    cell: (r) => formatAmount(r.basic_salary),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 'yes' ? 'Active' : 'Inactive'),
  },
];

const payslipColumns: DataTableColumn<StaffPayslip>[] = [
  {
    id: 'staff',
    header: 'Staff',
    cellClassName: 'font-medium',
    cell: (r) => (
      <div>
        <span>{r.staff_name || '—'}</span>
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
    id: 'net',
    header: 'Net salary',
    cellClassName: 'tabular-nums',
    cell: (r) => formatAmount(r.net_salary),
  },
  { id: 'status', header: 'Status', cell: (r) => r.status || '—' },
  { id: 'mode', header: 'Mode', cell: (r) => r.payment_mode || '—' },
];

export function StaffPayrollPage() {
  const {
    data: scales = [],
    isLoading: scalesLoading,
    isError: scalesError,
    error: scalesErr,
    refetch: refetchScales,
  } = useStaffPayScales();
  const {
    data: payslips = [],
    isLoading: payslipsLoading,
    isError: payslipsError,
    error: payslipsErr,
    refetch: refetchPayslips,
  } = useStaffPayslips();
  const { data: staffPage } = useStaff(1);
  const staffOptions = useMemo(
    () =>
      (staffPage?.results ?? [])
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: `${s.full_name} (${s.employee_id})`,
        })),
    [staffPage?.results],
  );

  const createScale = useCreateStaffPayScale();
  const updateScale = useUpdateStaffPayScale();
  const deleteScale = useDeleteStaffPayScale();
  const createPayslip = useCreateStaffPayslip();
  const deletePayslip = useDeleteStaffPayslip();

  const [scaleOpen, setScaleOpen] = useState(false);
  const [selectedScale, setSelectedScale] = useState<StaffPayScale | null>(null);
  const [deleteScaleTarget, setDeleteScaleTarget] = useState<StaffPayScale | null>(null);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [deletePayslipTarget, setDeletePayslipTarget] = useState<StaffPayslip | null>(null);

  const currentYear = String(new Date().getFullYear());
  const currentMonth = MONTHS[new Date().getMonth()];

  const scaleForm = useForm<ScaleFormValues>({
    resolver: zodResolver(scaleSchema),
    defaultValues: { pay_scale: '', grade: '', basic_salary: 0, is_active: true },
  });
  const payslipForm = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipSchema),
    defaultValues: {
      staff_id: 0,
      month: currentMonth,
      year: currentYear,
      basic: undefined,
      total_allowance: 0,
      total_deduction: 0,
      leave_deduction: 0,
      tax: '0',
      payment_mode: 'cash',
      payment_date: todayIsoDate(),
      remark: '',
    },
  });

  useEffect(() => {
    if (!scaleOpen) return;
    scaleForm.reset(
      selectedScale
        ? {
            pay_scale: selectedScale.pay_scale,
            grade: selectedScale.grade || '',
            basic_salary: selectedScale.basic_salary,
            is_active: selectedScale.is_active === 'yes',
          }
        : { pay_scale: '', grade: '', basic_salary: 0, is_active: true },
    );
  }, [scaleOpen, selectedScale, scaleForm]);

  useEffect(() => {
    if (!payslipOpen) return;
    payslipForm.reset({
      staff_id: 0,
      month: currentMonth,
      year: currentYear,
      basic: undefined,
      total_allowance: 0,
      total_deduction: 0,
      leave_deduction: 0,
      tax: '0',
      payment_mode: 'cash',
      payment_date: todayIsoDate(),
      remark: '',
    });
  }, [payslipOpen, payslipForm, currentMonth, currentYear]);

  const addScaleAction = (
    <PermissionButton
      permission="staff.payroll.create"
      onClick={() => {
        setSelectedScale(null);
        setScaleOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add pay scale
    </PermissionButton>
  );

  const addPayslipAction = (
    <PermissionButton
      permission="staff.payroll.create"
      onClick={() => setPayslipOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Generate payslip
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Payroll"
        description="Manage pay scales and generate monthly staff payslips."
        actions={
          <div className="flex flex-wrap gap-2">
            {addScaleAction}
            {addPayslipAction}
          </div>
        }
        isLoading={scalesLoading || payslipsLoading}
        loadingMessage="Loading payroll..."
        isError={scalesError || payslipsError}
        error={scalesErr || payslipsErr}
        onRetry={() => {
          void refetchScales();
          void refetchPayslips();
        }}
        isEmpty={false}
      >
        <div className="space-y-8">
          <SettingsCard
            title="Pay scales"
            description="Salary bands used as reference when generating payslips."
            action={addScaleAction}
          >
            {scales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pay scales yet.</p>
            ) : (
              <DataTable
                data={scales}
                columns={scaleColumns}
                getRowKey={(r) => r.id}
                actions={(row) => (
                  <>
                    <PermissionButton
                      permission="staff.payroll.edit"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedScale(row);
                        setScaleOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </PermissionButton>
                    <PermissionButton
                      permission="staff.payroll.delete"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteScaleTarget(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </PermissionButton>
                  </>
                )}
              />
            )}
          </SettingsCard>

          <SettingsCard
            title="Payslips"
            description="Generated salary slips for staff."
            action={addPayslipAction}
          >
            {payslips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payslips generated yet.</p>
            ) : (
              <DataTable
                data={payslips}
                columns={payslipColumns}
                getRowKey={(r) => r.id}
                actions={(row) => (
                  <PermissionButton
                    permission="staff.payroll.delete"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletePayslipTarget(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </PermissionButton>
                )}
              />
            )}
          </SettingsCard>
        </div>
      </ModuleListPack>

      <EntityFormDialog
        open={scaleOpen}
        onOpenChange={setScaleOpen}
        title={selectedScale ? 'Edit pay scale' : 'Add pay scale'}
        onSubmit={scaleForm.handleSubmit((values) => {
          const payload = {
            pay_scale: values.pay_scale,
            grade: values.grade?.trim() || '',
            basic_salary: values.basic_salary,
            is_active: (values.is_active ? 'yes' : 'no') as 'yes' | 'no',
          };
          if (selectedScale) {
            updateScale.mutate(
              { id: selectedScale.id, payload },
              { onSuccess: () => setScaleOpen(false) },
            );
            return;
          }
          createScale.mutate(payload, { onSuccess: () => setScaleOpen(false) });
        })}
        isLoading={createScale.isPending || updateScale.isPending}
      >
        <FormErrorSummary errors={scaleForm.formState.errors} />
        <FormTextField control={scaleForm.control} name="pay_scale" label="Pay scale" required />
        <FormTextField control={scaleForm.control} name="grade" label="Grade" />
        <FormNumberField
          control={scaleForm.control}
          name="basic_salary"
          label="Basic salary"
          required
        />
        <FormSwitchField control={scaleForm.control} name="is_active" label="Active" />
      </EntityFormDialog>

      <EntityFormDialog
        open={payslipOpen}
        onOpenChange={setPayslipOpen}
        title="Generate payslip"
        onSubmit={payslipForm.handleSubmit((values) => {
          createPayslip.mutate(
            {
              staff_id: values.staff_id,
              month: values.month,
              year: values.year,
              basic: values.basic,
              total_allowance: values.total_allowance ?? 0,
              total_deduction: values.total_deduction ?? 0,
              leave_deduction: values.leave_deduction ?? 0,
              tax: values.tax || '0',
              payment_mode: values.payment_mode || 'cash',
              payment_date: values.payment_date || todayIsoDate(),
              remark: values.remark?.trim() || '',
            },
            { onSuccess: () => setPayslipOpen(false) },
          );
        })}
        isLoading={createPayslip.isPending}
      >
        <FormErrorSummary errors={payslipForm.formState.errors} />
        <Controller
          control={payslipForm.control}
          name="staff_id"
          render={({ field, fieldState }) => (
            <FormField
              label="Staff"
              htmlFor="payslip_staff"
              error={fieldState.error?.message}
              required
            >
              <Select
                id="payslip_staff"
                options={staffOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Select staff"
              />
            </FormField>
          )}
        />
        <FormSelectField
          control={payslipForm.control}
          name="month"
          label="Month"
          required
          options={MONTHS.map((m) => ({ value: m, label: m }))}
        />
        <FormTextField control={payslipForm.control} name="year" label="Year" required />
        <FormNumberField
          control={payslipForm.control}
          name="basic"
          label="Basic (optional — uses staff basic if blank)"
        />
        <FormNumberField control={payslipForm.control} name="total_allowance" label="Allowances" />
        <FormNumberField control={payslipForm.control} name="total_deduction" label="Deductions" />
        <FormNumberField
          control={payslipForm.control}
          name="leave_deduction"
          label="Leave deduction"
        />
        <FormTextField control={payslipForm.control} name="tax" label="Tax" />
        <FormSelectField
          control={payslipForm.control}
          name="payment_mode"
          label="Payment mode"
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'bank', label: 'Bank' },
            { value: 'cheque', label: 'Cheque' },
          ]}
        />
        <FormTextField
          control={payslipForm.control}
          name="payment_date"
          label="Payment date"
          type="date"
        />
        <FormTextareaField control={payslipForm.control} name="remark" label="Remark" />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteScaleTarget !== null}
        onOpenChange={(v) => !v && setDeleteScaleTarget(null)}
        title="Delete pay scale?"
        description={`Remove “${deleteScaleTarget?.pay_scale ?? ''}”. Deactivate it first if deletion is blocked.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteScaleTarget) return;
          deleteScale.mutate(deleteScaleTarget.id, { onSuccess: () => setDeleteScaleTarget(null) });
        }}
        isLoading={deleteScale.isPending}
      />
      <ConfirmDialog
        open={deletePayslipTarget !== null}
        onOpenChange={(v) => !v && setDeletePayslipTarget(null)}
        title="Delete payslip?"
        description={
          deletePayslipTarget
            ? `Delete payslip for ${deletePayslipTarget.staff_name} (${deletePayslipTarget.month} ${deletePayslipTarget.year})?`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deletePayslipTarget) return;
          deletePayslip.mutate(deletePayslipTarget.id, {
            onSuccess: () => setDeletePayslipTarget(null),
          });
        }}
        isLoading={deletePayslip.isPending}
      />
    </>
  );
}
