import { useState } from 'react';
import { Save, UserCheck } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Input } from '@components/ui/input';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { useStaffAttendance, useMarkStaffAttendance } from '@hooks/useStaff';
import { ModuleListPack } from '@workflow-packs';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

const ATTENDANCE_TYPES = [
  { value: '1', label: 'Present' },
  { value: '2', label: 'Late' },
  { value: '3', label: 'Absent' },
  { value: '4', label: 'Half Day' },
];

export function StaffAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(todayIsoDate());
  const { data: attendanceRes, isLoading, isError, error, refetch } = useStaffAttendance(selectedDate);
  const markMutation = useMarkStaffAttendance();

  const [rosterState, setRosterState] = useState<Record<number, { type: string; remark: string }>>({});

  const listData = attendanceRes?.results || [];

  const handleTypeChange = (staffId: number, typeVal: string) => {
    setRosterState((prev) => ({
      ...prev,
      [staffId]: {
        type: typeVal,
        remark: prev[staffId]?.remark || '',
      },
    }));
  };

  const handleRemarkChange = (staffId: number, remarkVal: string) => {
    setRosterState((prev) => ({
      ...prev,
      [staffId]: {
        type: prev[staffId]?.type || '1',
        remark: remarkVal,
      },
    }));
  };

  const handleSaveAttendance = () => {
    const payload = listData.map((item) => {
      const state = rosterState[item.staff_id] || { type: String(item.attendance_type_id || 1), remark: item.remark || '' };
      return {
        staff_id: item.staff_id,
        attendance_type_id: parseInt(state.type, 10),
        remark: state.remark,
      };
    });

    markMutation.mutate({ date: selectedDate, attendanceData: payload });
  };

  const actions = (
    <PermissionButton
      permission="staff.edit"
      onClick={handleSaveAttendance}
      isLoading={markMutation.isPending}
      className="gap-1"
    >
      <Save className="h-4 w-4" />
      Save Attendance
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Staff Attendance"
      description="Mark and record daily attendance for all school employees and teachers."
      actions={actions}
      isLoading={isLoading}
      loadingMessage="Loading staff attendance roster..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && listData.length === 0}
      emptyTitle="No active staff members found"
      emptyDescription="Add staff members first to start marking attendance."
    >
      {/* Date Filter Bar */}
      <div className="p-4 bg-card rounded-md border mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-56">
            <FormField label="Attendance Date" htmlFor="attendance_date">
              <Input
                id="attendance_date"
                type="date"
                value={selectedDate}
                max={todayIsoDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </FormField>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Showing attendance roster for <strong className="text-foreground">{selectedDate}</strong>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff ID</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Attendance Status</TableHead>
              <TableHead>Remark / Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listData.map((item) => {
              const currentType = rosterState[item.staff_id]?.type ?? String(item.attendance_type_id || 1);
              const currentRemark = rosterState[item.staff_id]?.remark ?? (item.remark || '');

              return (
                <TableRow key={item.staff_id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.staff_id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{item.staff_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.employee_id || '—'}</TableCell>
                  <TableCell className="w-48">
                    <Select
                      options={ATTENDANCE_TYPES}
                      value={currentType}
                      onChange={(e) => handleTypeChange(item.staff_id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={currentRemark}
                      onChange={(e) => handleRemarkChange(item.staff_id, e.target.value)}
                      placeholder="e.g. On Leave, Late arrival"
                      className="h-8 text-xs"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ModuleListPack>
  );
}
