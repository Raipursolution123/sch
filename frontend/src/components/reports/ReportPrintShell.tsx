import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface ReportPrintShellProps {
  children: ReactNode;
  printTitle: string;
  printSubtitle?: string;
  className?: string;
}

/** Printable report body — use with print.css and ReportHeader print action. */
export function ReportPrintShell({
  children,
  printTitle,
  printSubtitle,
  className,
}: ReportPrintShellProps) {
  return (
    <div id="report-print-root" className={cn('space-y-6', className)}>
      <div className="print-only border-b border-border pb-4">
        <h1 className="text-xl font-semibold text-foreground">{printTitle}</h1>
        {printSubtitle && <p className="mt-1 text-sm text-muted-foreground">{printSubtitle}</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          Generated {new Date().toLocaleString()}
        </p>
      </div>
      {children}
    </div>
  );
}
