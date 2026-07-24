import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { z } from 'zod';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormCheckboxField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCmsSettings, useUpdateCmsSettings } from '@hooks/useCms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  theme: z.string().optional(),
  contact_us_email: z.string().optional(),
  complain_form_email: z.string().optional(),
  logo: z.string().optional(),
  fav_icon: z.string().optional(),
  footer_text: z.string().optional(),
  fb_url: z.string().optional(),
  twitter_url: z.string().optional(),
  youtube_url: z.string().optional(),
  instagram_url: z.string().optional(),
  whatsapp_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  google_analytics: z.string().optional(),
  is_active_front_cms: z.boolean().optional(),
  is_active_sidebar: z.boolean().optional(),
  is_active_rtl: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useCmsSettings();
  const updateMutation = useUpdateCmsSettings();
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      theme: 'default',
      contact_us_email: '',
      complain_form_email: '',
      logo: '',
      fav_icon: '',
      footer_text: '',
      fb_url: '',
      twitter_url: '',
      youtube_url: '',
      instagram_url: '',
      whatsapp_url: '',
      linkedin_url: '',
      google_analytics: '',
      is_active_front_cms: false,
      is_active_sidebar: false,
      is_active_rtl: false,
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      theme: data.theme || 'default',
      contact_us_email: data.contact_us_email || '',
      complain_form_email: data.complain_form_email || '',
      logo: data.logo || '',
      fav_icon: data.fav_icon || '',
      footer_text: data.footer_text || '',
      fb_url: data.fb_url || '',
      twitter_url: data.twitter_url || '',
      youtube_url: data.youtube_url || '',
      instagram_url: data.instagram_url || '',
      whatsapp_url: data.whatsapp_url || '',
      linkedin_url: data.linkedin_url || '',
      google_analytics: data.google_analytics || '',
      is_active_front_cms: Boolean(data.is_active_front_cms),
      is_active_sidebar: Boolean(data.is_active_sidebar),
      is_active_rtl: Boolean(data.is_active_rtl),
    });
  }, [data, reset]);

  const saveAction = (
    <PermissionButton
      permission="cms.settings.edit"
      className="gap-1"
      disabled={updateMutation.isPending}
      onClick={handleSubmit((values) => {
        updateMutation.mutate({
          theme: values.theme?.trim() || 'default',
          contact_us_email: values.contact_us_email?.trim() || '',
          complain_form_email: values.complain_form_email?.trim() || '',
          logo: values.logo?.trim() || '',
          fav_icon: values.fav_icon?.trim() || '',
          footer_text: values.footer_text?.trim() || '',
          fb_url: values.fb_url?.trim() || '',
          twitter_url: values.twitter_url?.trim() || '',
          youtube_url: values.youtube_url?.trim() || '',
          instagram_url: values.instagram_url?.trim() || '',
          whatsapp_url: values.whatsapp_url?.trim() || '',
          linkedin_url: values.linkedin_url?.trim() || '',
          google_analytics: values.google_analytics?.trim() || '',
          is_active_front_cms: values.is_active_front_cms ? 1 : 0,
          is_active_sidebar: values.is_active_sidebar ? 1 : 0,
          is_active_rtl: values.is_active_rtl ? 1 : 0,
        });
      })}
    >
      <Save className="h-4 w-4" />
      Save settings
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="CMS Settings"
      description="Theme, contact emails, social links, and front CMS toggles."
      actions={saveAction}
      isLoading={isLoading}
      loadingMessage="Loading CMS settings..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={false}
    >
      <form className="mx-auto grid max-w-3xl gap-4" onSubmit={(e) => e.preventDefault()}>
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="theme" label="Theme" />
        <FormTextField control={control} name="contact_us_email" label="Contact email" />
        <FormTextField control={control} name="complain_form_email" label="Complaint form email" />
        <FormTextField control={control} name="logo" label="Logo path / URL" />
        <FormTextField control={control} name="fav_icon" label="Favicon path / URL" />
        <FormTextareaField control={control} name="footer_text" label="Footer text" />
        <FormTextField control={control} name="fb_url" label="Facebook URL" />
        <FormTextField control={control} name="twitter_url" label="Twitter URL" />
        <FormTextField control={control} name="youtube_url" label="YouTube URL" />
        <FormTextField control={control} name="instagram_url" label="Instagram URL" />
        <FormTextField control={control} name="whatsapp_url" label="WhatsApp URL" />
        <FormTextField control={control} name="linkedin_url" label="LinkedIn URL" />
        <FormTextareaField control={control} name="google_analytics" label="Google Analytics" />
        <FormCheckboxField control={control} name="is_active_front_cms" label="Enable front CMS" />
        <FormCheckboxField control={control} name="is_active_sidebar" label="Enable sidebar" />
        <FormCheckboxField control={control} name="is_active_rtl" label="Enable RTL" />
      </form>
    </ModuleListPack>
  );
}
