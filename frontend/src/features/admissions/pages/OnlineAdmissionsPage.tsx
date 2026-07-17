import { useState } from 'react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { OnlineAdmissionsTable } from '@features/admissions/components/OnlineAdmissionsTable';
import { useConvertOnlineAdmission, useOnlineAdmissions } from '@hooks/useOnlineAdmissions';
import type { OnlineAdmission } from '@app-types/admissions/online-admission';
import { ModuleListPack } from '@workflow-packs';

export function OnlineAdmissionsPage() {
  const { data: admissions, isLoading, isError, error, refetch } = useOnlineAdmissions();
  const convertMutation = useConvertOnlineAdmission();
  const [convertTarget, setConvertTarget] = useState<OnlineAdmission | null>(null);

  const applicantName = convertTarget
    ? [convertTarget.firstname, convertTarget.lastname].filter(Boolean).join(' ').trim()
    : '';

  return (
    <ModuleListPack
      title="Online Admissions"
      description="Review submitted online admission forms and convert approved applicants into students."
      isLoading={isLoading}
      loadingMessage="Loading online admissions..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (admissions?.length ?? 0) === 0}
      emptyTitle="No online admissions"
      emptyDescription="Submitted online admission forms will appear here for review."
      footer={
        <ConfirmDialog
          open={convertTarget !== null}
          onOpenChange={(open) => {
            if (!open) setConvertTarget(null);
          }}
          title="Convert to student"
          description={
            convertTarget
              ? `Convert "${applicantName || convertTarget.reference_no}" into a student record?`
              : ''
          }
          confirmLabel="Convert"
          isLoading={convertMutation.isPending}
          onConfirm={() => {
            if (!convertTarget) return;
            convertMutation.mutate(
              {
                id: convertTarget.id,
                payload: {
                  admission_no: convertTarget.admission_no ?? undefined,
                  roll_no: convertTarget.roll_no,
                  admission_date: convertTarget.admission_date,
                },
              },
              { onSuccess: () => setConvertTarget(null) },
            );
          }}
        />
      }
    >
      <OnlineAdmissionsTable
        admissions={admissions ?? []}
        convertingId={convertMutation.isPending ? (convertTarget?.id ?? null) : null}
        onConvert={setConvertTarget}
      />
    </ModuleListPack>
  );
}
