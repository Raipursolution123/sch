import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { PageHeader } from '@components/layout/PageHeader';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession, useSessions } from '@hooks/useSessions';
import { useBulkEmailStudents, useCommunicationMessages } from '@hooks/useMessages';
import type { CommunicationMessage } from '@app-types/communications/messages';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message is required'),
  session_id: z.number().min(1, 'Session is required'),
  class_id: z.number().min(1, 'Class is required'),
  section_id: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CommunicationMessage>[] = [
  { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title || '—' },
  {
    id: 'recipients',
    header: 'Recipients',
    cell: (r) =>
      r.recipient_count != null
        ? String(r.recipient_count)
        : r.user_list
          ? String(r.user_list.split(',').filter(Boolean).length)
          : '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.delivery_status === 'sent' ? 'Sent' : 'Queued'),
  },
  {
    id: 'created',
    header: 'Created',
    cell: (r) => (r.created_at ? r.created_at.slice(0, 16).replace('T', ' ') : '—'),
  },
];

export function BulkEmailPage() {
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCommunicationMessages('email');
  const logErrorMessage =
    typeof error === 'object' && error && 'message' in error
      ? String((error as Error).message)
      : 'Could not load message log';
  const bulkMutation = useBulkEmailStudents();
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const { data: activeSession } = useActiveSession();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      message: '',
      session_id: 0,
      class_id: 0,
      section_id: 0,
    },
  });

  const classId = useWatch({ control, name: 'class_id' }) || 0;
  const sessionId = useWatch({ control, name: 'session_id' }) || 0;
  const sectionId = useWatch({ control, name: 'section_id' }) || 0;

  useEffect(() => {
    if (activeSession?.id && sessionId === 0) {
      setValue('session_id', activeSession.id);
    }
  }, [activeSession, sessionId, setValue]);

  useEffect(() => {
    if (classId <= 0) return;
    const first = firstSectionIdForClass(classSections, classId);
    if (first) setValue('section_id', first);
  }, [classId, classSections, setValue]);

  const sessionOptions = useMemo(
    () => [
      { value: '', label: 'Select session' },
      ...sessions.map((s) => ({ value: String(s.id), label: s.session })),
    ],
    [sessions],
  );

  const classOptions = useMemo(
    () => [
      { value: '', label: 'Select class' },
      ...classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    ],
    [classes],
  );

  const sectionOptions = useMemo(
    () => [{ value: '', label: 'All sections' }, ...sectionOptionsForClass(classSections, classId)],
    [classSections, classId],
  );

  const recentBulk = useMemo(
    () => messages.filter((m) => m.is_class && m.send_mail).slice(0, 20),
    [messages],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Email to Students"
        description="Email all students in a class or section. Addresses are taken from student records and queued for delivery when SMTP is configured."
      />

      <form
        className="space-y-4 rounded-lg border bg-card p-6"
        onSubmit={handleSubmit((values) => {
          bulkMutation.mutate(
            {
              title: values.title,
              message: values.message,
              session_id: values.session_id,
              class_id: values.class_id,
              section_id: values.section_id || null,
            },
            {
              onSuccess: () =>
                reset({
                  title: '',
                  message: '',
                  session_id: values.session_id,
                  class_id: values.class_id,
                  section_id: values.section_id,
                }),
            },
          );
        })}
        noValidate
      >
        <FormErrorSummary errors={errors} />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Session"
            htmlFor="bulk_session"
            required
            error={errors.session_id?.message}
          >
            <Select
              id="bulk_session"
              options={sessionOptions}
              value={sessionId ? String(sessionId) : ''}
              onChange={(e) => setValue('session_id', Number(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="Class" htmlFor="bulk_class" required error={errors.class_id?.message}>
            <Select
              id="bulk_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onChange={(e) => {
                setValue('class_id', Number(e.target.value) || 0);
                setValue('section_id', 0);
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="bulk_section">
            <Select
              id="bulk_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => setValue('section_id', Number(e.target.value) || 0)}
              disabled={classId <= 0}
            />
          </FormField>
        </div>
        <FormTextField control={control} name="title" label="Subject" required />
        <FormTextareaField control={control} name="message" label="Message" required rows={6} />
        <div className="flex justify-end">
          <PermissionButton
            permission="communicate.bulk_email.send"
            type="submit"
            isLoading={bulkMutation.isPending}
          >
            Queue bulk email
          </PermissionButton>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent class emails
        </h2>
        {isLoading && <LoadingState message="Loading message log..." />}
        {isError && <ErrorState message={logErrorMessage} onRetry={() => void refetch()} />}
        {!isLoading && !isError && (
          <DataTable data={recentBulk} columns={columns} getRowKey={(r) => r.id} />
        )}
      </section>
    </div>
  );
}
