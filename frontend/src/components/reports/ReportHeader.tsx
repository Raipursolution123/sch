import type { ReactNode } from 'react';
import { ReportExportActions } from '@components/reports/ReportExportActions';
import { cn } from '@utils/cn';

interface ReportHeaderProps {
  title: string;
  description?: string;
  onPrint?: () => void;
  onExportCsv?: () => void;
  exportDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Report page title row with optional export actions. */
export function ReportHeader({
  title,
  description,
  onPrint,
  onExportCsv,
  exportDisabled,
  className,
  children,
}: ReportHeaderProps) {
  const showExport = onPrint != null || onExportCsv != null;

  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
      {showExport && (
        <ReportExportActions
          className="no-print shrink-0"
          onPrint={onPrint}
          onExportCsv={onExportCsv}
          disabled={exportDisabled}
        />
      )}
    </div>
  );
}
