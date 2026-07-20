import { PromoteWizard } from '@features/academics/promote/components/PromoteWizard';
import { useSessions } from '@features/academics/sessions/hooks/useSessions';
import { ModuleListPack } from '@workflow-packs';

export function PromoteStudentsPage() {
  const { isLoading, isError, error, refetch } = useSessions();

  return (
    <ModuleListPack
      title="Promote Students"
      description="Transfer student enrollments from one session and class-section to another."
      isLoading={isLoading}
      loadingMessage="Loading academic sessions..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      <PromoteWizard />
    </ModuleListPack>
  );
}
