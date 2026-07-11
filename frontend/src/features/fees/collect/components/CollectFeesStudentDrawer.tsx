import { useMemo, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { CollectFeeDialog } from '@features/students/components/CollectFeeDialog';
import { FeeLineStatusBadge } from '@features/students/components/FeeLineStatusBadge';
import { usePayStudentFeeFromCollect, useRevertStudentFeeFromCollect } from '@hooks/useCollectFees';
import { useStudentFees } from '@hooks/useStudentFees';
import type { FeeCollectRosterStudent } from '@app-types/fees/fee-collect';
import type { StudentFeeLine } from '@app-types/students/student-fees';
import { formatAmount, formatDate } from '@utils/format';

interface CollectFeesStudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: FeeCollectRosterStudent | null;
  classId: number;
  sectionId: number;
  sessionName?: string;
  className?: string;
  sectionName?: string;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function CollectFeesStudentDrawer({
  open,
  onOpenChange,
  student,
  classId,
  sectionId,
  sessionName,
  className,
  sectionName,
}: CollectFeesStudentDrawerProps) {
  const studentId = student?.student_id ?? 0;
  const { data: fees, isLoading, isError, error, refetch } = useStudentFees(studentId);
  const payFeeMutation = usePayStudentFeeFromCollect(studentId, classId, sectionId);
  const revertFeeMutation = useRevertStudentFeeFromCollect(studentId, classId, sectionId);

  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [selectedFeeLine, setSelectedFeeLine] = useState<StudentFeeLine | null>(null);

  const lineColumns = useMemo<DataTableColumn<StudentFeeLine>[]>(
    () => [
      {
        id: 'feetype',
        header: 'Fee type',
        cellClassName: 'font-medium',
        cell: (row) => (
          <div>
            <span>{row.feetype_name}</span>
            <p className="text-xs font-normal text-muted-foreground">{row.feetype_code}</p>
          </div>
        ),
      },
      {
        id: 'balance',
        header: 'Balance',
        cellClassName: 'tabular-nums',
        cell: (row) => formatAmount(row.balance),
      },
      {
        id: 'due_date',
        header: 'Due',
        cellClassName: 'text-muted-foreground',
        cell: (row) => formatDate(row.due_date),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <FeeLineStatusBadge status={row.status} />,
      },
      {
        id: 'actions',
        header: '',
        cellClassName: 'text-right',
        cell: (row) =>
          row.status !== 'paid' ? (
            <PermissionButton
              permission="fees.manage"
              variant="outline"
              size="sm"
              disabled={payFeeMutation.isPending}
              onClick={() => {
                setSelectedFeeLine(row);
                setCollectDialogOpen(true);
              }}
            >
              Paid
            </PermissionButton>
          ) : (
            <PermissionButton
              permission="fees.manage"
              variant="outline"
              size="sm"
              disabled={revertFeeMutation.isPending}
              onClick={() => {
                revertFeeMutation.mutate(row.feetype_id);
              }}
            >
              Revert
            </PermissionButton>
          ),
      },
    ],
    [payFeeMutation.isPending, revertFeeMutation],
  );

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-xl">
          <DrawerHeader>
            <DrawerTitle>{student?.full_name ?? 'Collect fees'}</DrawerTitle>
            <DrawerDescription>
              {student?.admission_no}
              {sessionName ? ` · ${sessionName}` : ''}
              {className ? ` · ${className}` : ''}
              {sectionName ? ` ${sectionName}` : ''}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {!student && (
              <p className="text-sm text-muted-foreground">Select a student to collect fees.</p>
            )}

            {student && isLoading && <LoadingState message="Loading fee details..." />}

            {student && isError && (
              <ErrorState
                message={error instanceof Error ? error.message : 'Could not load fee details'}
                onRetry={() => void refetch()}
              />
            )}

            {student && fees && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryCard label="Total due" value={formatAmount(fees.total_due)} />
                  <SummaryCard label="Paid" value={formatAmount(fees.total_paid)} />
                  <SummaryCard label="Balance" value={formatAmount(fees.total_balance)} />
                </div>

                {fees.lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No fee assignments for this student in the current session.
                  </p>
                ) : (
                  <DataTable
                    data={fees.lines}
                    columns={lineColumns}
                    getRowKey={(line) => line.id}
                  />
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <CollectFeeDialog
        open={collectDialogOpen}
        onOpenChange={setCollectDialogOpen}
        feeLine={selectedFeeLine}
        onSubmit={(payload) => {
          payFeeMutation.mutate(payload, {
            onSuccess: () => setCollectDialogOpen(false),
          });
        }}
        isLoading={payFeeMutation.isPending}
      />
    </>
  );
}
