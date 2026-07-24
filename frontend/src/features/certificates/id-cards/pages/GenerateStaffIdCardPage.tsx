import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useGenerateStaffIdCard, useStaffIdCardTemplates } from '@hooks/useIdCards';
import { useStaff } from '@hooks/useStaff';
import { DEFAULT_ID_CARD_HEADER_COLOR } from '@constants/id-cards';
import type { IdCardPreview } from '@app-types/id-cards';
import { printReport } from '@utils/print-report';
import { ModuleListPack } from '@workflow-packs';

function IdCardPreviewCard({ preview }: { preview: IdCardPreview }) {
  return (
    <div
      className="mx-auto overflow-hidden rounded-lg border bg-card shadow-sm print:border-0 print:shadow-none"
      style={{
        maxWidth: preview.enable_vertical_card === 1 ? 280 : 420,
        borderTop: `6px solid ${preview.header_color || DEFAULT_ID_CARD_HEADER_COLOR}`,
      }}
    >
      <div className="space-y-1 p-4 text-center">
        <p className="text-sm font-semibold">{preview.school_name || preview.title}</p>
        {preview.school_address ? (
          <p className="text-xs text-muted-foreground">{preview.school_address}</p>
        ) : null}
      </div>
      <div className="border-t px-4 py-3">
        <p className="mb-2 text-center font-medium">{preview.person_name}</p>
        <dl className="space-y-1 text-sm">
          {preview.fields.map((field) => (
            <div key={field.label} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{field.label}</dt>
              <dd className="text-right font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
        {preview.barcode ? (
          <p className="mt-3 text-center font-mono text-xs tracking-widest">{preview.barcode}</p>
        ) : null}
      </div>
    </div>
  );
}

export function GenerateStaffIdCardPage() {
  const { data: templates = [], isLoading: templatesLoading } = useStaffIdCardTemplates();
  const { data: staffData, isLoading: staffLoading } = useStaff(1);
  const staff = staffData?.results ?? [];
  const generateMutation = useGenerateStaffIdCard();
  const [templateId, setTemplateId] = useState('');
  const [personId, setPersonId] = useState('');
  const [preview, setPreview] = useState<IdCardPreview | null>(null);

  const templateOptions = useMemo(
    () => templates.map((t) => ({ value: String(t.id), label: t.title })),
    [templates],
  );
  const staffOptions = useMemo(
    () =>
      staff.map((s) => ({
        value: String(s.id),
        label: `${[s.name, s.surname].filter(Boolean).join(' ')} (${s.employee_id || s.id})`,
      })),
    [staff],
  );

  return (
    <ModuleListPack
      title="Generate Staff ID Card"
      description="Select a template and staff member, then print the ID card preview."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Template" htmlFor="staff-id-template">
            <Select
              id="staff-id-template"
              className="w-64"
              value={templateId}
              onValueChange={(v) => {
                setTemplateId(v);
                setPreview(null);
              }}
              options={templateOptions}
              placeholder="Select template"
            />
          </FormField>
          <FormField label="Staff" htmlFor="staff-id-person">
            <Select
              id="staff-id-person"
              className="w-72"
              value={personId}
              onValueChange={(v) => {
                setPersonId(v);
                setPreview(null);
              }}
              options={staffOptions}
              placeholder="Select staff"
            />
          </FormField>
          <PermissionButton
            permission="idcards.staff.generate"
            onClick={() => {
              if (!templateId || !personId) return;
              generateMutation.mutate(
                { templateId: Number(templateId), personId: Number(personId) },
                { onSuccess: (data) => setPreview(data) },
              );
            }}
            disabled={!templateId || !personId}
            isLoading={generateMutation.isPending}
          >
            Generate
          </PermissionButton>
          {preview ? (
            <Button variant="outline" className="gap-1" onClick={() => printReport()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          ) : null}
        </div>
      }
      isLoading={templatesLoading || staffLoading}
      loadingMessage="Loading staff and templates..."
      isEmpty={false}
    >
      {preview ? (
        <IdCardPreviewCard preview={preview} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a template and staff member, then click Generate to preview.
        </p>
      )}
    </ModuleListPack>
  );
}
