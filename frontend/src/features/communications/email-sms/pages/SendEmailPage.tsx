import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { PageHeader } from '@components/layout/PageHeader';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { communicationsService } from '@services/api/communications.service';
import { toast } from 'sonner';

const schema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    message: z.string().trim().min(1, 'Message body is required'),
    audience: z.enum(['group', 'individual', 'class']),
    group_list: z.string().optional(),
    user_list: z.string().optional(),
    class_id: z.string().optional(),
    section_id: z.string().optional(),
    is_schedule: z.boolean(),
    schedule_date_time: z.string().optional(),
    template_id: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.audience === 'individual' && !(values.user_list || '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['user_list'],
        message: 'Enter at least one email address.',
      });
    }
    if (values.audience === 'class' && !values.class_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['class_id'],
        message: 'Class is required.',
      });
    }
    if (values.is_schedule && !values.schedule_date_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['schedule_date_time'],
        message: 'Schedule date and time are required.',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export function SendEmailPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: communicationsService.getEmailTemplates,
  });

  const sendMutation = useMutation({
    mutationFn: communicationsService.sendMessage,
    onSuccess: () => {
      toast.success('Email composed and queued successfully');
      reset({
        title: '',
        message: '',
        audience: 'group',
        group_list: 'students,staff,parent',
        user_list: '',
        class_id: '',
        section_id: '',
        is_schedule: false,
        schedule_date_time: '',
        template_id: '',
      });
    },
    onError: () => {
      toast.error('Failed to send/schedule email');
    },
  });

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
      audience: 'group',
      group_list: 'students,staff,parent',
      user_list: '',
      class_id: '',
      section_id: '',
      is_schedule: false,
      schedule_date_time: '',
      template_id: '',
    },
  });

  const audience = useWatch({ control, name: 'audience' });
  const isSchedule = useWatch({ control, name: 'is_schedule' });
  const classId = useWatch({ control, name: 'class_id' }) || '';
  const templateId = useWatch({ control, name: 'template_id' });

  // Autofill message when template is selected
  useEffect(() => {
    if (!templateId) return;
    const selectedTemplate = templates.find((t) => String(t.id) === templateId);
    if (selectedTemplate) {
      setValue('title', selectedTemplate.title);
      setValue('message', selectedTemplate.message);
    }
  }, [templateId, templates, setValue]);

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
    () => [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, Number(classId)),
    ],
    [classSections, classId],
  );

  const templateOptions = useMemo(
    () => [
      { value: '', label: 'Select email template (optional)' },
      ...templates.map((t) => ({ value: String(t.id), label: t.title })),
    ],
    [templates],
  );

  const onSubmit = (values: FormValues) => {
    sendMutation.mutate({
      title: values.title,
      message: values.message,
      send_through: 'email',
      is_schedule: values.is_schedule ? 1 : 0,
      schedule_date_time: values.is_schedule ? values.schedule_date_time : undefined,
      recipient_type: values.audience,
      group_list: values.audience === 'group' ? values.group_list : undefined,
      user_list: values.audience === 'individual' ? values.user_list : undefined,
      schedule_class: values.audience === 'class' ? Number(values.class_id) : undefined,
      schedule_section: values.audience === 'class' ? values.section_id : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Email"
        description="Compose and send emails to classes, groups, or individual recipients."
      />

      <form
        className="space-y-4 rounded-lg border bg-card p-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormErrorSummary errors={errors} />

        <div className="grid gap-4 sm:grid-cols-3">
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

          <FormSelectField
            control={control}
            name="template_id"
            label="Email Template"
            options={templateOptions}
          />
        </div>

        <FormTextField control={control} name="title" label="Title" required />
        <FormTextareaField control={control} name="message" label="Message" required rows={6} />

        {audience === 'group' && (
          <FormTextField
            control={control}
            name="group_list"
            label="Group list (comma-separated)"
            placeholder="students,staff,parent"
          />
        )}

        {audience === 'individual' && (
          <FormTextareaField
            control={control}
            name="user_list"
            label="Individual Emails"
            placeholder="example1@mail.com, example2@mail.com"
            required
          />
        )}

        {audience === 'class' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="class_id"
              label="Class"
              required
              options={classOptions}
            />
            <FormSelectField
              control={control}
              name="section_id"
              label="Section"
              options={sectionOptions}
              disabled={!classId}
            />
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_schedule"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              {...control.register('is_schedule')}
            />
            <label htmlFor="is_schedule" className="text-sm font-medium text-foreground">
              Schedule this email
            </label>
          </div>

          {isSchedule && (
            <div className="mt-3 max-w-xs">
              <FormTextField
                control={control}
                name="schedule_date_time"
                label="Date & Time"
                type="datetime-local"
                required
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <PermissionButton
            permission="communicate.email.send"
            type="submit"
            isLoading={sendMutation.isPending}
          >
            Send Email
          </PermissionButton>
        </div>
      </form>
    </div>
  );
}
