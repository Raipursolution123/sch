import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
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
import { useCommunicationMessages, useComposeEmail, useComposeSms } from '@hooks/useMessages';
import type { CommunicationMessage, MessageAudience } from '@app-types/communications/messages';
import { cn } from '@utils/cn';

const schema = z
  .object({
    channel: z.enum(['email', 'sms']),
    title: z.string().trim().min(1, 'Title is required'),
    message: z.string().trim().min(1, 'Message is required'),
    audience: z.enum(['group', 'individual', 'class']),
    group_list: z.string().optional(),
    user_list: z.string().optional(),
    class_id: z.number().optional(),
    section_id: z.number().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.audience === 'individual' && !(values.user_list || '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['user_list'],
        message: 'Enter at least one recipient (email or mobile).',
      });
    }
    if (values.audience === 'class' && !values.class_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['class_id'],
        message: 'Class is required.',
      });
    }
  });

type FormValues = z.infer<typeof schema>;
type Step = 0 | 1 | 2;

const STEPS = ['Audience', 'Message', 'Preview'] as const;

const columns: DataTableColumn<CommunicationMessage>[] = [
  { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title || '—' },
  {
    id: 'channel',
    header: 'Channel',
    cell: (r) => (r.send_mail ? 'Email' : r.send_sms ? 'SMS' : r.send_through || '—'),
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

export function EmailSmsPage() {
  const { data: messages = [], isLoading, isError, error, refetch } = useCommunicationMessages();
  const emailMutation = useComposeEmail();
  const smsMutation = useComposeSms();
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
      channel: 'email',
      title: '',
      message: '',
      audience: 'group',
      group_list: 'students,staff,parent',
      user_list: '',
      class_id: 0,
      section_id: 0,
    },
  });

  const audience = useWatch({ control, name: 'audience' }) as MessageAudience;
  const channel = useWatch({ control, name: 'channel' });
  const classId = useWatch({ control, name: 'class_id' }) || 0;
  const sectionId = useWatch({ control, name: 'section_id' }) || 0;
  const title = useWatch({ control, name: 'title' }) || '';
  const message = useWatch({ control, name: 'message' }) || '';
  const groupList = useWatch({ control, name: 'group_list' }) || '';
  const userList = useWatch({ control, name: 'user_list' }) || '';

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

  useEffect(() => {
    if (audience !== 'class' || classId <= 0) return;
    const first = firstSectionIdForClass(classSections, classId);
    if (first) setValue('section_id', first);
  }, [audience, classId, classSections, setValue]);

  const isPending = emailMutation.isPending || smsMutation.isPending;
  const composePermission = channel === 'sms' ? 'communicate.sms.send' : 'communicate.email.send';

  const classLabel = classOptions.find((c) => c.value === String(classId))?.label;
  const sectionLabel = sectionOptions.find((s) => s.value === String(sectionId))?.label;

  const audienceSummary =
    audience === 'group'
      ? `Groups: ${groupList || '—'}`
      : audience === 'individual'
        ? `Recipients: ${userList || '—'}`
        : `Class ${classLabel || '—'}${sectionLabel ? ` · ${sectionLabel}` : ''}`;

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(['channel', 'audience', 'group_list', 'user_list', 'class_id']);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(['title', 'message']);
      if (ok) setStep(2);
    }
  };

  const queueMessage = () => {
    const values = getValues();
    const payload = {
      title: values.title,
      message: values.message,
      audience: values.audience,
      group_list: values.group_list?.trim() || undefined,
      user_list: values.user_list?.trim() || undefined,
      class_id: values.class_id || undefined,
      section_id: values.section_id || undefined,
    };
    const onSuccess = () => {
      setConfirmOpen(false);
      setStep(0);
      reset({
        channel: values.channel,
        title: '',
        message: '',
        audience: 'group',
        group_list: 'students,staff,parent',
        user_list: '',
        class_id: 0,
        section_id: 0,
      });
    };
    if (values.channel === 'sms') {
      smsMutation.mutate(payload, { onSuccess });
      return;
    }
    emailMutation.mutate(payload, { onSuccess });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Email / SMS"
        description="Compose in steps, preview the message, then confirm before it is queued for delivery."
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
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="channel"
              label="Channel"
              required
              options={[
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
              ]}
            />
            <FormSelectField
              control={control}
              name="audience"
              label="Audience"
              required
              options={[
                { value: 'group', label: 'Group (students / staff / parents)' },
                { value: 'individual', label: 'Individual recipients' },
                { value: 'class', label: 'Class / section' },
              ]}
            />
            {audience === 'group' && (
              <div className="sm:col-span-2">
                <FormTextField
                  control={control}
                  name="group_list"
                  label="Groups"
                  hint="Comma-separated: students, staff, parent"
                />
              </div>
            )}
            {audience === 'individual' && (
              <div className="sm:col-span-2">
                <FormTextareaField
                  control={control}
                  name="user_list"
                  label="Recipients"
                  hint="Comma-separated emails or mobile numbers"
                  rows={3}
                  required
                />
              </div>
            )}
            {audience === 'class' && (
              <>
                <FormField
                  label="Class"
                  htmlFor="class_id"
                  required
                  error={errors.class_id?.message}
                >
                  <Controller
                    name="class_id"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        id="class_id"
                        options={classOptions}
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => {
                          field.onChange(Number(v) || 0);
                          setValue('section_id', 0);
                        }}
                        placeholder="Select class"
                        searchPlaceholder="Search class…"
                      />
                    )}
                  />
                </FormField>
                <FormField label="Section" htmlFor="section_id">
                  <Combobox
                    id="section_id"
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
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <FormTextField control={control} name="title" label="Title" required />
            <FormTextareaField control={control} name="message" label="Message" required rows={6} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-panel border border-dashed border-border bg-muted/20 p-4">
            <p className="text-label text-muted-foreground">Preview</p>
            <p className="text-sm">
              <span className="font-medium">Channel:</span> {channel === 'sms' ? 'SMS' : 'Email'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Audience:</span> {audienceSummary}
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
              permission={composePermission}
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
        title={`Queue ${channel === 'sms' ? 'SMS' : 'email'}?`}
        description={`“${title}” will be queued for ${audienceSummary}. Live delivery runs when SMTP/SMS gateways are configured.`}
        confirmLabel={channel === 'sms' ? 'Queue SMS' : 'Queue email'}
        isLoading={isPending}
        onConfirm={queueMessage}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent messages
        </h2>
        {isLoading && <LoadingState message="Loading message log..." />}
        {isError && (
          <ErrorState
            message={
              typeof error === 'object' && error && 'message' in error
                ? String((error as Error).message)
                : 'Could not load message log'
            }
            onRetry={() => void refetch()}
          />
        )}
        {!isLoading && !isError && messages.length === 0 && (
          <EmptyState
            title="No messages yet"
            description="Queue your first email or SMS using the compose steps above."
          />
        )}
        {!isLoading && !isError && messages.length > 0 && (
          <DataTable data={messages} columns={columns} getRowKey={(r) => r.id} />
        )}
      </section>
    </div>
  );
}
