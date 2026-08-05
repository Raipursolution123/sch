import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { systemReportsService, type ReportListParams } from '@services/api/system-reports.service';

export function useUserLogs(filters: ReportListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.systemReports.userLogs(filters as Record<string, string>),
    queryFn: () => systemReportsService.listUserLogs(filters),
    enabled,
  });
}

export function useAuditTrail(filters: ReportListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.systemReports.auditTrail(filters as Record<string, string>),
    queryFn: () => systemReportsService.listAuditTrail(filters),
    enabled,
  });
}
