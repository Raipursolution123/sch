import { useMemo, useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { StaffReportTable } from '@features/reports/hr/components/StaffReportTable';
import { useStaff, useStaffDepartments, useStaffDesignations } from '@hooks/useStaff';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function StaffReportPage() {
  const { data: staffData, isLoading, isError, error, refetch } = useStaff(1);
  const staff = staffData?.results ?? [];
  const totalCount = staffData?.count ?? staff.length;
  const { data: departments = [] } = useStaffDepartments();
  const { data: designations = [] } = useStaffDesignations();

  const [departmentId, setDepartmentId] = useState(0);
  const [designationId, setDesignationId] = useState(0);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      if (departmentId > 0 && member.department_id !== departmentId) return false;
      if (designationId > 0 && member.designation_id !== designationId) return false;
      return member.is_active === 'yes';
    });
  }, [staff, departmentId, designationId]);

  const departmentOptions = [
    { value: '', label: 'All departments' },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const designationOptions = [
    { value: '', label: 'All designations' },
    ...designations.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const handleExportCsv = () => {
    exportToCsv(
      'staff-report',
      ['Employee ID', 'Name', 'Department', 'Designation', 'Contact', 'Joined'],
      filteredStaff.map((row) => [
        row.employee_id,
        row.full_name,
        row.department_name,
        row.designation_name,
        row.contact_no || row.email,
        row.date_of_joining ?? '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="HR Report"
      description="Active staff directory with department and designation filters."
      printTitle="Staff Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredStaff.length === 0}
      submitted
      hasData={Boolean(staffData)}
      isLoading={isLoading}
      loadingMessage="Loading staff..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={filteredStaff.length === 0}
      emptyTitle="No staff found"
      emptyDescription="Adjust filters or add staff members first."
      summary={
        staffData ? (
          <ReportSummaryGrid
            items={[
              { label: 'Total staff', value: totalCount },
              { label: 'Filtered (page 1)', value: filteredStaff.length },
              {
                label: 'Departments',
                value: new Set(filteredStaff.map((s) => s.department_id)).size,
              },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
          <FormField label="Department" htmlFor="staff_report_department">
            <Select
              id="staff_report_department"
              options={departmentOptions}
              value={departmentId ? String(departmentId) : ''}
              onChange={(e) => setDepartmentId(Number(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="Designation" htmlFor="staff_report_designation">
            <Select
              id="staff_report_designation"
              options={designationOptions}
              value={designationId ? String(designationId) : ''}
              onChange={(e) => setDesignationId(Number(e.target.value) || 0)}
            />
          </FormField>
        </>
      }
    >
      {filteredStaff.length > 0 && <StaffReportTable staff={filteredStaff} />}
    </ModuleReportPack>
  );
}
