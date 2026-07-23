import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
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
import { useCommunicationMessages, useComposeEmail, useComposeSms } from '@hooks/useMessages';
import type { CommunicationMessage, MessageAudience } from '@app-types/communications/messages';

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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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

  useEffect(() => {
    if (audience !== 'class' || classId <= 0) return;
    const first = firstSectionIdForClass(classSections, classId);
    if (first) setValue('section_id', first);
  }, [audience, classId, classSections, setValue]);

  const isPending = emailMutation.isPending || smsMutation.isPending;
  const composePermission = channel === 'sms' ? 'communicate.sms.send' : 'communicate.email.send';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Email / SMS"
        description="Compose a message for groups, individuals, or a class. Messages are saved to the send log; live delivery runs when SMTP/SMS gateways are configured."
      />

      <form
        className="space-y-4 rounded-lg border bg-card p-6"
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title,
            message: values.message,
            audience: values.audience,
            group_list: values.group_list?.trim() || undefined,
            user_list: values.user_list?.trim() || undefined,
            class_id: values.class_id || undefined,
            section_id: values.section_id || undefined,
          };
          const onSuccess = () =>
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
          if (values.channel === 'sms') {
            smsMutation.mutate(payload, { onSuccess });
            return;
          }
          emailMutation.mutate(payload, { onSuccess });
        })}
        noValidate
      >
        <FormErrorSummary errors={errors} />
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
        </div>

        <FormTextField control={control} name="title" label="Title" required />
        <FormTextareaField control={control} name="message" label="Message" required rows={5} />

        {audience === 'group' && (
          <FormTextField
            control={control}
            name="group_list"
            label="Groups"
            hint="Comma-separated: students, staff, parent"
          />
        )}
        {audience === 'individual' && (
          <FormTextareaField
            control={control}
            name="user_list"
            label="Recipients"
            hint="Comma-separated emails or mobile numbers"
            rows={3}
            required
          />
        )}
        {audience === 'class' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Class" htmlFor="class_id" required error={errors.class_id?.message}>
              <Controller
                name="class_id"
                control={control}
                render={({ field }) => (
                  <Select
                    id="class_id"
                    options={classOptions}
                    value={field.value ? String(field.value) : ''}
                    onChange={(e) => {
                      const next = Number(e.target.value) || 0;
                      field.onChange(next);
                      setValue('section_id', 0);
                    }}
                  />
                )}
              />
            </FormField>
            <FormField label="Section" htmlFor="section_id">
              <Select
                id="section_id"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setValue('section_id', Number(e.target.value) || 0)}
                disabled={classId <= 0}
              />
            </FormField>
          </div>
        )}

        <div className="flex justify-end">
          <PermissionButton permission={composePermission} type="submit" isLoading={isPending}>
            Queue {channel === 'sms' ? 'SMS' : 'Email'}
          </PermissionButton>
        </div>
      </form>

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
        {!isLoading && !isError && (
          <DataTable data={messages} columns={columns} getRowKey={(r) => r.id} />
        )}
      </section>
    </div>
  );
}
