import { Spinner } from '@components/feedback/Spinner';
import { cn } from '@utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size="md" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
