import { useState } from 'react';
import type { StaffDetail } from '@app-types/staff/staff';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FileText, Download, Trash2, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@components/ui/button';
import { cn } from '@utils/cn';
import { StaffDocumentUploadDialog } from './StaffDocumentUploadDialog';
import { useUploadStaffDocument, useDeleteStaffDocument } from '@hooks/useStaff';
import { env } from '@constants/env';

interface StaffDocumentsTabProps {
  staff: StaffDetail;
}

interface DocumentItemProps {
  label: string;
  type: string;
  filename: string;
  name?: string;
  id?: number;
  onDeleteClick: (type: string, id?: number) => void;
  isDeleting: boolean;
}

function DocumentItem({
  label,
  type,
  filename,
  name,
  id,
  onDeleteClick,
  isDeleting,
}: DocumentItemProps) {
  const downloadUrl = filename.startsWith('http')
    ? filename
    : `${env.apiBaseUrl.replace('/api/v1', '')}/media/${filename}`;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{name || label}</span>
          <span className="text-xs text-muted-foreground">{filename.split('/').pop()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          onClick={() => onDeleteClick(type, id)}
          disabled={isDeleting}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface DocumentSectionProps {
  title: string;
  description?: string;
  documents: Array<{ id: number; name: string; file_path: string }>;
  type: string;
  label: string;
  onUploadClick: (type: string, label: string) => void;
  onDeleteClick: (type: string, id?: number) => void;
  isDeleting: boolean;
}

function DocumentSection({
  title,
  description,
  documents,
  type,
  label,
  onUploadClick,
  onDeleteClick,
  isDeleting,
}: DocumentSectionProps) {
  return (
    <SettingsCard
      title={title}
      description={description}
      action={
        <Button variant="outline" size="sm" onClick={() => onUploadClick(type, label)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {label}
        </Button>
      }
    >
      {documents && documents.length > 0 ? (
        <div className="divide-y">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              label={label}
              type={type}
              id={doc.id}
              name={doc.name}
              filename={doc.file_path}
              onDeleteClick={onDeleteClick}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-muted-foreground">No documents uploaded.</div>
      )}
    </SettingsCard>
  );
}

export function StaffDocumentsTab({ staff }: StaffDocumentsTabProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeUploadType, setActiveUploadType] = useState<{ type: string; label: string } | null>(
    null,
  );

  const uploadMutation = useUploadStaffDocument(staff.id);
  const deleteMutation = useDeleteStaffDocument(staff.id);

  const handleUploadClick = (type: string, label: string) => {
    setActiveUploadType({ type, label });
    setUploadOpen(true);
  };

  const handleUploadSubmit = (file: File, name?: string) => {
    if (!activeUploadType) return;

    const formData = new FormData();
    formData.append('document_type', activeUploadType.type);
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setUploadOpen(false);
        setActiveUploadType(null);
      },
    });
  };

  const handleDeleteClick = (type: string, id?: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate({ document_type: type, document_id: id });
    }
  };

  return (
    <div className="space-y-6">
      <DocumentSection
        title="Resumes"
        documents={staff.resume || []}
        type="resume"
        label="Resume"
        onUploadClick={handleUploadClick}
        onDeleteClick={handleDeleteClick}
        isDeleting={deleteMutation.isPending}
      />
      <DocumentSection
        title="Joining Letters"
        documents={staff.joining_letter || []}
        type="joining_letter"
        label="Joining Letter"
        onUploadClick={handleUploadClick}
        onDeleteClick={handleDeleteClick}
        isDeleting={deleteMutation.isPending}
      />
      <DocumentSection
        title="Resignation Letters"
        documents={staff.resignation_letter || []}
        type="resignation_letter"
        label="Resignation Letter"
        onUploadClick={handleUploadClick}
        onDeleteClick={handleDeleteClick}
        isDeleting={deleteMutation.isPending}
      />
      <DocumentSection
        title="Additional Documents"
        description="Upload any additional custom documents here."
        documents={staff.other_documents || []}
        type="other_document_file"
        label="Additional Document"
        onUploadClick={handleUploadClick}
        onDeleteClick={handleDeleteClick}
        isDeleting={deleteMutation.isPending}
      />

      <StaffDocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        documentType={activeUploadType?.type || ''}
        documentLabel={activeUploadType?.label || ''}
        onSubmit={handleUploadSubmit}
        isLoading={uploadMutation.isPending}
      />
    </div>
  );
}
