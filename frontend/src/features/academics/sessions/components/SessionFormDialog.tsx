import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormTextField } from '@components/forms/fields';
import type { AcademicSession } from '@features/academics/sessions/types/session.types';
import { currentIndianAcademicSession } from '@utils/session';
import {
  sessionFormSchema,
  type SessionFormValues,
} from '@features/academics/sessions/schemas/session.schema';

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: AcademicSession | null;
  onSubmit: (sessionName: string) => void;
  isLoading?: boolean;
}

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  onSubmit,
  isLoading,
}: SessionFormDialogProps) {
  const isEdit = Boolean(session);

  const { control, handleSubmit, reset } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: { session: currentIndianAcademicSession() },
  });

  useEffect(() => {
    if (open) {
      reset({ session: session?.session ?? currentIndianAcademicSession() });
    }
  }, [open, session, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Academic Session' : 'Add Academic Session'}
      description={
        isEdit
          ? 'Update the session label. Active status is managed separately.'
          : 'Create a new academic year. New sessions start as inactive.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create session'}
      onSubmit={handleSubmit((values) => onSubmit(values.session))}
      size="sm"
    >
      <FormTextField
        control={control}
        name="session"
        label="Session name"
        placeholder="2026-27"
        required
        autoFocus
      />
    </EntityFormDialog>
  );
}
