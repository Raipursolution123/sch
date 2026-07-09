import { Download, Printer } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@utils/cn';

interface ReportExportActionsProps {
  onPrint?: () => void;
  onExportCsv?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ReportExportActions({
  onPrint,
  onExportCsv,
  disabled,
  className,
}: ReportExportActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {onPrint && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onPrint}>
          <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Print
        </Button>
      )}
      {onExportCsv && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onExportCsv}>
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      )}
    </div>
  );
}
