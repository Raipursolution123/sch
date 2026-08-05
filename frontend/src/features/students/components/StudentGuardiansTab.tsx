import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@components/ui/button';
import { SettingsCard } from '@components/forms/SettingsCard';
import { GuardianFormDialog } from '@features/students/components/GuardianFormDialog';
import type { GuardianFormValues } from '@features/students/schemas/guardian.schema';
import {
  mergeGuardianIntoStudentPayload,
  studentToGuardianFormValues,
} from '@features/students/utils/guardian-payload';
import { useUpdateStudent } from '@hooks/useStudents';
import type { StudentDetail } from '@app-types/students/student';

interface StudentGuardiansTabProps {
  student: StudentDetail;
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-label text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export function StudentGuardiansTab({ student }: StudentGuardiansTabProps) {
  const [editOpen, setEditOpen] = useState(false);
  const updateMutation = useUpdateStudent(student.id);

  const handleSubmit = (values: GuardianFormValues) => {
    updateMutation.mutate(mergeGuardianIntoStudentPayload(student, values), {
      onSuccess: () => setEditOpen(false),
    });
  };

  return (
    <>
      <SettingsCard
        title="Parents & guardian"
        description="Contacts used for fee notices, transport updates, and emergencies."
        footer={
          <Button variant="outline" className="gap-1" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit contacts
          </Button>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Father" value={student.father_name} />
          <DetailItem label="Mother" value={student.mother_name} />
          <DetailItem label="Guardian" value={student.guardian_name} />
          <DetailItem label="Guardian phone" value={student.guardian_phone} />
          <DetailItem label="Guardian relation" value={student.guardian_relation} />
          <DetailItem label="Guardian email" value={student.guardian_email} />
          <DetailItem label="Guardian occupation" value={student.guardian_occupation} />
          <DetailItem label="Guardian address" value={student.guardian_address} />
        </dl>
      </SettingsCard>

      <GuardianFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={studentToGuardianFormValues(student)}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </>
  );
}
