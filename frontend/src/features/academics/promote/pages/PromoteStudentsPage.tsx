import { PromoteWizard } from '@features/academics/promote/components/PromoteWizard';
import { ModuleListPack } from '@workflow-packs';

export function PromoteStudentsPage() {
  return (
    <ModuleListPack
      title="Promote Students"
      description="Transfer student enrollments from one session and class-section to another."
    >
      <PromoteWizard />
    </ModuleListPack>
  );
}
