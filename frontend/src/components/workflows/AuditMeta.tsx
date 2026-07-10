import { formatDate } from '@utils/format';
import { cn } from '@utils/cn';

interface AuditMetaProps {
  updatedAt?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  className?: string;
}

/** Audit-friendly metadata for entity detail screens. */
export function AuditMeta({
  updatedAt,
  updatedBy,
  createdAt,
  createdBy,
  className,
}: AuditMetaProps) {
  if (!updatedAt && !createdAt) return null;

  return (
    <div className={cn('text-xs text-muted-foreground', className)}>
      {createdAt && (
        <p>
          Created {formatDate(createdAt)}
          {createdBy ? ` by ${createdBy}` : ''}
        </p>
      )}
      {updatedAt && (
        <p>
          Last updated {formatDate(updatedAt)}
          {updatedBy ? ` by ${updatedBy}` : ''}
        </p>
      )}
    </div>
  );
}
