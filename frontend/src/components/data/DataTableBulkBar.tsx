import { X } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@utils/cn';

interface DataTableBulkBarProps {
  selectedCount: number;
  onClear: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function DataTableBulkBar({
  selectedCount,
  onClear,
  children,
  className,
}: DataTableBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-b border-primary/20 bg-primary-pale/50 px-4 py-2.5',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium text-ink">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-8 gap-1"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear
      </Button>
    </div>
  );
}
