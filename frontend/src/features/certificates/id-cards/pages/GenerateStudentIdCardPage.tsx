import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useGenerateStudentIdCard, useStudentIdCardTemplates } from '@hooks/useIdCards';
import { useStudents } from '@hooks/useStudents';
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

export function GenerateStudentIdCardPage() {
  const { data: templates = [], isLoading: templatesLoading } = useStudentIdCardTemplates();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const generateMutation = useGenerateStudentIdCard();
  const [templateId, setTemplateId] = useState('');
  const [personId, setPersonId] = useState('');
  const [preview, setPreview] = useState<IdCardPreview | null>(null);

  const templateOptions = useMemo(
    () => templates.map((t) => ({ value: String(t.id), label: t.title })),
    [templates],
  );
  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: String(s.id),
        label: `${s.full_name} (${s.admission_no})`,
      })),
    [students],
  );

  return (
    <ModuleListPack
      title="Generate Student ID Card"
      description="Select a template and student, then print the ID card preview."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Template" htmlFor="student-id-template">
            <Select
              id="student-id-template"
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
          <FormField label="Student" htmlFor="student-id-person">
            <Select
              id="student-id-person"
              className="w-72"
              value={personId}
              onValueChange={(v) => {
                setPersonId(v);
                setPreview(null);
              }}
              options={studentOptions}
              placeholder="Select student"
            />
          </FormField>
          <PermissionButton
            permission="idcards.student.generate"
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
      isLoading={templatesLoading || studentsLoading}
      loadingMessage="Loading students and templates..."
      isEmpty={false}
    >
      {preview ? (
        <IdCardPreviewCard preview={preview} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a template and student, then click Generate to preview.
        </p>
      )}
    </ModuleListPack>
  );
}
