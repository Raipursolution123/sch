import { useState } from 'react';
import { FeeReminderFormDialog } from '@features/fees/reminders/components/FeeReminderFormDialog';
import { FeeRemindersTable } from '@features/fees/reminders/components/FeeRemindersTable';
import type { FeeReminderFormValues } from '@features/fees/reminders/schemas/fee-reminder.schema';
import { useFeeReminders, useUpdateFeeReminder } from '@hooks/useFeeReminders';
import type { FeeReminder } from '@app-types/fees/fee-reminder';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

export function FeeRemindersPage() {
  const { data: reminders, isLoading, isError, error, refetch } = useFeeReminders();
  const updateMutation = useUpdateFeeReminder();
  const [selectedReminder, setSelectedReminder] = useState<FeeReminder | null>(null);

  const handleFormSubmit = (values: FeeReminderFormValues) => {
    if (!selectedReminder) return;
    updateMutation.mutate(
      {
        id: selectedReminder.id,
        payload: {
          day: values.day,
          is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
        },
      },
      { onSuccess: () => setSelectedReminder(null) },
    );
  };

  return (
    <ModuleListPack
      title="Fee Reminders"
      description="Configure auto fee reminder rules by type and day offset. SMS/email send uses these settings."
      isLoading={isLoading}
      loadingMessage="Loading fee reminders..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (reminders?.length ?? 0) === 0}
      emptyTitle="No fee reminder rules"
      emptyDescription="Reminder rules are seeded by the system. Contact an admin if none appear."
      footer={
        <FeeReminderFormDialog
          open={selectedReminder !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedReminder(null);
          }}
          reminder={selectedReminder}
          onSubmit={handleFormSubmit}
          isLoading={updateMutation.isPending}
        />
      }
    >
      <FeeRemindersTable reminders={reminders ?? []} onEdit={setSelectedReminder} />
    </ModuleListPack>
  );
}
