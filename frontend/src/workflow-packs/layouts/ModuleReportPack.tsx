import type { ReactNode } from 'react';
import { ReportFilterBar, ReportHeader, ReportPrintShell } from '@components/reports';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';

interface ModuleReportPackProps {
  title: string;
  description?: string;
  printTitle?: string;
  printSubtitle?: string;
  onPrint?: () => void;
  onExportCsv?: () => void;
  exportDisabled?: boolean;
  sessionLabel?: string;
  onApply?: () => void;
  applyDisabled?: boolean;
  filters: ReactNode;
  summary?: ReactNode;
  submitted?: boolean;
  hasData?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode;
}

/** Report module shell: header + filters + summary + printable content. */
export function ModuleReportPack({
  title,
  description,
  printTitle,
  printSubtitle,
  onPrint,
  onExportCsv,
  exportDisabled,
  sessionLabel,
  onApply,
  applyDisabled,
  filters,
  summary,
  submitted = true,
  hasData = true,
  isLoading,
  loadingMessage = 'Loading report…',
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No records found',
  emptyDescription,
  children,
}: ModuleReportPackProps) {
  return (
    <div className="space-y-6">
      <ReportHeader
        title={title}
        description={description}
        onPrint={onPrint}
        onExportCsv={onExportCsv}
        exportDisabled={exportDisabled}
      />

      <ReportFilterBar sessionLabel={sessionLabel} onApply={onApply} applyDisabled={applyDisabled}>
        {filters}
      </ReportFilterBar>

      {submitted && isLoading && <LoadingState message={loadingMessage} />}

      {submitted && isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load report'}
          onRetry={onRetry}
        />
      )}

      {submitted && !isLoading && !isError && hasData && (
        <ReportPrintShell printTitle={printTitle ?? title} printSubtitle={printSubtitle}>
          {summary}
          {isEmpty ? <EmptyState title={emptyTitle} description={emptyDescription} /> : children}
        </ReportPrintShell>
      )}
    </div>
  );
}
