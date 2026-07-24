import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCertificateTemplates, useGenerateCertificate } from '@hooks/useCertificates';
import { useStudents } from '@hooks/useStudents';
import type { CertificatePreview } from '@app-types/certificates';
import { printReport } from '@utils/print-report';
import { ModuleListPack } from '@workflow-packs';

export function GenerateCertificatePage() {
  const { data: templates = [], isLoading: templatesLoading } = useCertificateTemplates();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const generateMutation = useGenerateCertificate();
  const [templateId, setTemplateId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [preview, setPreview] = useState<CertificatePreview | null>(null);

  const templateOptions = useMemo(
    () => templates.map((t) => ({ value: String(t.id), label: t.certificate_name })),
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

  const isLoading = templatesLoading || studentsLoading;

  const handleGenerate = () => {
    if (!templateId || !studentId) return;
    generateMutation.mutate(
      { certificateId: Number(templateId), studentId: Number(studentId) },
      { onSuccess: (data) => setPreview(data) },
    );
  };

  return (
    <ModuleListPack
      title="Generate Certificate"
      description="Select a template and student, then print the merged certificate."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Template" htmlFor="cert-template">
            <Select
              id="cert-template"
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
          <FormField label="Student" htmlFor="cert-student">
            <Select
              id="cert-student"
              className="w-72"
              value={studentId}
              onValueChange={(v) => {
                setStudentId(v);
                setPreview(null);
              }}
              options={studentOptions}
              placeholder="Select student"
            />
          </FormField>
          <PermissionButton
            permission="certificates.generate.view"
            onClick={handleGenerate}
            disabled={!templateId || !studentId}
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
      isLoading={isLoading}
      loadingMessage="Loading students and templates..."
      isEmpty={false}
    >
      {preview ? (
        <div
          className="mx-auto rounded-lg border bg-card p-6 print:border-0 print:p-0"
          style={{ maxWidth: preview.content_width || 800 }}
        >
          <div
            className="grid grid-cols-3 gap-2 text-sm"
            style={{ minHeight: preview.header_height || undefined }}
          >
            <div>{preview.left_header}</div>
            <div className="text-center font-semibold">{preview.center_header}</div>
            <div className="text-right">{preview.right_header}</div>
          </div>
          <div
            className="prose prose-sm max-w-none py-6"
            style={{ minHeight: preview.content_height || undefined }}
            dangerouslySetInnerHTML={{ __html: preview.certificate_text }}
          />
          <div
            className="grid grid-cols-3 gap-2 text-sm text-muted-foreground"
            style={{ minHeight: preview.footer_height || undefined }}
          >
            <div>{preview.left_footer}</div>
            <div className="text-center">{preview.center_footer}</div>
            <div className="text-right">{preview.right_footer}</div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a template and student, then click Generate to preview.
        </p>
      )}
    </ModuleListPack>
  );
}
