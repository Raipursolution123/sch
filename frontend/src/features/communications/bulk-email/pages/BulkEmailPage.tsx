import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { PageHeader } from '@components/layout/PageHeader';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Button } from '@components/ui/button';
import { Combobox } from '@components/ui/combobox';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EmptyState } from '@components/feedback/EmptyState';
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
import { cn } from '@utils/cn';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message is required'),
  session_id: z.number().min(1, 'Session is required'),
  class_id: z.number().min(1, 'Class is required'),
  section_id: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;
type Step = 0 | 1 | 2;

const STEPS = ['Recipients', 'Message', 'Preview'] as const;

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

  const [step, setStep] = useState<Step>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    control,
    reset,
    setValue,
    trigger,
    getValues,
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
  const title = useWatch({ control, name: 'title' }) || '';
  const message = useWatch({ control, name: 'message' }) || '';

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
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const classOptions = useMemo(
    () =>
      classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const recentBulk = useMemo(
    () => messages.filter((m) => m.is_class && m.send_mail).slice(0, 20),
    [messages],
  );

  const sessionLabel = sessionOptions.find((s) => s.value === String(sessionId))?.label;
  const classLabel = classOptions.find((c) => c.value === String(classId))?.label;
  const sectionLabel = sectionOptions.find((s) => s.value === String(sectionId))?.label;

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(['session_id', 'class_id', 'section_id']);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(['title', 'message']);
      if (ok) setStep(2);
    }
  };

  const queueBulk = () => {
    const values = getValues();
    bulkMutation.mutate(
      {
        title: values.title,
        message: values.message,
        session_id: values.session_id,
        class_id: values.class_id,
        section_id: values.section_id || null,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setStep(0);
          reset({
            title: '',
            message: '',
            session_id: values.session_id,
            class_id: values.class_id,
            section_id: values.section_id,
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Email to Students"
        description="Choose class recipients, write the message, preview, then confirm before queueing."
      />

      <nav aria-label="Compose steps" className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={cn(
              'rounded-sm border px-3 py-1.5 text-sm',
              step === index
                ? 'border-primary bg-primary-pale font-medium text-ink'
                : index < step
                  ? 'border-border bg-card text-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground',
            )}
            onClick={() => {
              if (index < step) setStep(index as Step);
            }}
          >
            {index + 1}. {label}
          </button>
        ))}
      </nav>

      <form
        className="space-y-4 rounded-panel border border-border bg-card p-6"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <FormErrorSummary errors={errors} />

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Session"
              htmlFor="bulk_session"
              required
              error={errors.session_id?.message}
            >
              <Combobox
                id="bulk_session"
                options={sessionOptions}
                value={sessionId ? String(sessionId) : ''}
                onValueChange={(v) => setValue('session_id', Number(v) || 0)}
                placeholder="Select session"
                searchPlaceholder="Search session…"
              />
            </FormField>
            <FormField label="Class" htmlFor="bulk_class" required error={errors.class_id?.message}>
              <Combobox
                id="bulk_class"
                options={classOptions}
                value={classId ? String(classId) : ''}
                onValueChange={(v) => {
                  setValue('class_id', Number(v) || 0);
                  setValue('section_id', 0);
                }}
                placeholder="Select class"
                searchPlaceholder="Search class…"
              />
            </FormField>
            <FormField label="Section" htmlFor="bulk_section">
              <Combobox
                id="bulk_section"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onValueChange={(v) => setValue('section_id', Number(v) || 0)}
                allowEmpty
                emptyLabel="All sections"
                placeholder="All sections"
                searchPlaceholder="Search section…"
                disabled={classId <= 0}
              />
            </FormField>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <FormTextField control={control} name="title" label="Subject" required />
            <FormTextareaField control={control} name="message" label="Message" required rows={6} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-panel border border-dashed border-border bg-muted/20 p-4">
            <p className="text-label text-muted-foreground">Preview</p>
            <p className="text-sm">
              <span className="font-medium">Session:</span> {sessionLabel || '—'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Class:</span> {classLabel || '—'}
              {sectionLabel ? ` · ${sectionLabel}` : ' · All sections'}
            </p>
            <p className="font-display text-lg font-medium tracking-display">{title || '—'}</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{message || '—'}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={step === 0}
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
          >
            Back
          </Button>
          {step < 2 ? (
            <Button type="button" className="min-h-11" onClick={() => void goNext()}>
              Continue
            </Button>
          ) : (
            <PermissionButton
              permission="communicate.bulk_email.send"
              type="button"
              className="min-h-11"
              onClick={() => setConfirmOpen(true)}
            >
              Review & queue
            </PermissionButton>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Queue bulk email?"
        description={`“${title}” will be emailed to students in ${classLabel || 'the selected class'}${
          sectionLabel ? ` · ${sectionLabel}` : ''
        }. Delivery runs when SMTP is configured.`}
        confirmLabel="Queue bulk email"
        isLoading={bulkMutation.isPending}
        onConfirm={queueBulk}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent class emails
        </h2>
        {isLoading && <LoadingState message="Loading message log..." />}
        {isError && <ErrorState message={logErrorMessage} onRetry={() => void refetch()} />}
        {!isLoading && !isError && recentBulk.length === 0 && (
          <EmptyState
            title="No class emails yet"
            description="Queue a bulk email to see it appear in this log."
          />
        )}
        {!isLoading && !isError && recentBulk.length > 0 && (
          <DataTable data={recentBulk} columns={columns} getRowKey={(r) => r.id} />
        )}
      </section>
    </div>
  );
}
