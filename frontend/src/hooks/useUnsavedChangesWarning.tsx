import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave this page anyway?';

interface UseUnsavedChangesWarningOptions {
  enabled?: boolean;
  message?: string;
}

/** Warn on browser refresh/close and in-app navigation when a form is dirty. */
export function useUnsavedChangesWarning(
  isDirty: boolean,
  { enabled = true, message = DEFAULT_MESSAGE }: UseUnsavedChangesWarningOptions = {},
) {
  const shouldBlock = enabled && isDirty;
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!shouldBlock) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [shouldBlock, message]);

  const navigationGuard =
    blocker.state === 'blocked' ? (
      <ConfirmDialog
        open
        onOpenChange={(open) => {
          if (!open) blocker.reset();
        }}
        title="Discard unsaved changes?"
        description={message}
        confirmLabel="Leave page"
        destructive
        onConfirm={() => blocker.proceed()}
      />
    ) : null;

  return { navigationGuard };
}
