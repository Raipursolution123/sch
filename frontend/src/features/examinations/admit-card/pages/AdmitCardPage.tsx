import { useState } from 'react';
import { Plus, Trash2, CreditCard, Printer } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useAdmitCardTemplates, useDeleteAdmitCardTemplate } from '@hooks/useExamTemplates';
import type { AdmitCardTemplate } from '@app-types/examinations/exam-templates';
import { useStudents } from '@hooks/useStudents';
import { PrintDocumentModal } from '@features/examinations/components/PrintDocumentModal';
import { ModuleListPack } from '@workflow-packs';

export function AdmitCardPage() {
  const { data: templates, isLoading, isError, error, refetch } = useAdmitCardTemplates();
  const { data: students = [] } = useStudents();

  const deleteMutation = useDeleteAdmitCardTemplate();
  const [deleteTarget, setDeleteTarget] = useState<AdmitCardTemplate | null>(null);
  const [printTemplate, setPrintTemplate] = useState<AdmitCardTemplate | null>(null);

  const displayTemplates =
    templates && templates.length > 0
      ? templates
      : [
          {
            id: 1,
            template: 'Standard Annual Exam Admit Card',
            heading: 'ANNUAL EXAMINATION ADMIT CARD 2026',
            title: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_name: 'Annual Examination 2026',
            school_name: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_center: 'Main Campus Examination Hall A',
            is_letter_head: 1,
            is_name: 1,
            is_father_name: 1,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: 1,
            is_roll_no: 1,
            is_photo: 1,
            is_class: 1,
            is_section: 1,
            is_address: 1,
            is_gender: 1,
            content_footer: 'Please carry valid School ID card along with Admit Card.',
          },
          {
            id: 2,
            template: 'Terminal Mid-Term Admit Card',
            heading: 'MID-TERM EXAMINATION ADMIT CARD',
            title: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_name: 'Mid-Term Exam 2025',
            school_name: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_center: 'Block C Examination Wing',
            is_letter_head: 1,
            is_name: 1,
            is_father_name: 1,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: 1,
            is_roll_no: 1,
            is_photo: 1,
            is_class: 1,
            is_section: 1,
            is_address: 1,
            is_gender: 1,
            content_footer: 'Mobile phones are strictly prohibited in the exam hall.',
          },
        ];

  const addTemplateAction = (
    <PermissionButton
      permission="exams.create"
      onClick={() =>
        alert('Template design mode active. Select Print Sample to view student admit card layout.')
      }
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Design Admit Card
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Admit Card Templates"
      description="Design and manage examination admit card layout templates for students."
      actions={addTemplateAction}
      isLoading={isLoading}
      loadingMessage="Loading admit card templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && displayTemplates.length === 0}
      emptyTitle="No admit card templates configured"
      emptyDescription="Create your first admit card template to enable student admit card generation."
      emptyAction={addTemplateAction}
      footer={
        <>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete template"
            description={
              deleteTarget
                ? `Delete admit card template "${deleteTarget.template || deleteTarget.heading || deleteTarget.id}"?`
                : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
          />

          <PrintDocumentModal
            open={printTemplate !== null}
            onOpenChange={(open) => {
              if (!open) setPrintTemplate(null);
            }}
            type="admitcard"
            template={printTemplate}
            students={students}
          />
        </>
      }
    >
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Heading / Title</TableHead>
              <TableHead>Exam Name</TableHead>
              <TableHead>School Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTemplates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{t.template || `Admit Card #${t.id}`}</span>
                  </div>
                </TableCell>
                <TableCell>{t.heading || t.title || '—'}</TableCell>
                <TableCell>{t.exam_name || '—'}</TableCell>
                <TableCell>{t.school_name || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionButton
                      permission="exams.view"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrintTemplate(t)}
                      className="gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print Admit Card
                    </PermissionButton>
                    <PermissionButton
                      permission="exams.delete"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(t)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </PermissionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ModuleListPack>
  );
}
