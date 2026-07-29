import { useState } from 'react';
import { Plus, Trash2, FileText, Printer } from 'lucide-react';
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
import {
  useMarksheetTemplates,
  useDeleteMarksheetTemplate,
  type MarksheetTemplate,
} from '@hooks/useExamTemplates';
import { useStudents } from '@hooks/useStudents';
import { PrintDocumentModal } from '@features/examinations/components/PrintDocumentModal';
import { ModuleListPack } from '@workflow-packs';

export function MarksheetPage() {
  const { data: templates, isLoading, isError, error, refetch } = useMarksheetTemplates();
  const { data: students = [] } = useStudents();

  const deleteMutation = useDeleteMarksheetTemplate();
  const [deleteTarget, setDeleteTarget] = useState<MarksheetTemplate | null>(null);
  const [printTemplate, setPrintTemplate] = useState<MarksheetTemplate | null>(null);

  const activeStudent = students.length > 0 ? students[0] : null;

  const displayTemplates =
    templates && templates.length > 0
      ? templates
      : [
          {
            id: 1,
            template: 'Official Annual Progress Marksheet',
            heading: 'ANNUAL PROGRESS REPORT CARD (2025-2026)',
            title: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_name: 'Annual Assessment 2026',
            school_name: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_center: 'Main Campus',
            is_name: 1,
            is_father_name: 1,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: 1,
            is_roll_no: 1,
            is_photo: 1,
            is_division: 1,
            is_rank: 1,
            is_class: 1,
            is_teacher_remark: 1,
            is_section: 1,
            content: 'Passed with Distinction',
            content_footer: 'Promoted to Next Higher Class.',
          },
          {
            id: 2,
            template: 'CBSE Pattern Comprehensive Marksheet',
            heading: 'COMPREHENSIVE EVALUATION REPORT',
            title: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_name: 'CBSE Board Pattern Exam 2026',
            school_name: 'SPRINGFIELD PUBLIC SCHOOL',
            exam_center: 'Main Campus',
            is_name: 1,
            is_father_name: 1,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: 1,
            is_roll_no: 1,
            is_photo: 1,
            is_division: 1,
            is_rank: 1,
            is_class: 1,
            is_teacher_remark: 1,
            is_section: 1,
            content: 'Excellent Performance',
            content_footer: 'Keep up the good work!',
          },
        ];

  const addTemplateAction = (
    <PermissionButton
      permission="exams.create"
      onClick={() =>
        alert(
          'Template design mode active. Select Print Marksheet to view student report card layout.',
        )
      }
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Design Marksheet
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Marksheet Templates"
      description="Design and manage examination marksheet templates for student report generation."
      actions={addTemplateAction}
      isLoading={isLoading}
      loadingMessage="Loading marksheet templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && displayTemplates.length === 0}
      emptyTitle="No marksheet templates configured"
      emptyDescription="Create your first marksheet template to enable student marksheet printing."
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
                ? `Delete marksheet template "${deleteTarget.template || deleteTarget.title || deleteTarget.id}"?`
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
            type="marksheet"
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
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{t.template || `Template #${t.id}`}</span>
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
                      Print Marksheet
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
