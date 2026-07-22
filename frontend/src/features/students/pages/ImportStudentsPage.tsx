import { useMemo, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useImportStudents, useStudentImportTemplate } from '@hooks/useStudentMasters';
import type { StudentImportResult, StudentImportRow } from '@app-types/students/masters';
import { ModuleListPack } from '@workflow-packs';

const PREVIEW_COLUMNS: DataTableColumn<StudentImportRow & { __row: number }>[] = [
  { id: 'row', header: '#', cell: (r) => r.__row },
  { id: 'admission_no', header: 'Admission no', cell: (r) => String(r.admission_no ?? '') },
  {
    id: 'name',
    header: 'Name',
    cell: (r) => `${r.firstname ?? ''} ${r.lastname ?? ''}`.trim() || '—',
  },
  { id: 'class_id', header: 'Class ID', cell: (r) => String(r.class_id ?? '') },
  { id: 'section_id', header: 'Section ID', cell: (r) => String(r.section_id ?? '') },
  { id: 'gender', header: 'Gender', cell: (r) => String(r.gender ?? '—') },
];

function parseCsv(text: string): StudentImportRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: StudentImportRow = {};
    headers.forEach((header, index) => {
      const raw = (cells[index] ?? '').trim();
      if (!raw) return;
      if (
        header === 'class_id' ||
        header === 'section_id' ||
        header === 'school_house_id' ||
        header === 'roll_no'
      ) {
        const num = Number(raw);
        row[header] = Number.isFinite(num) ? num : raw;
        return;
      }
      row[header] = raw;
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function downloadTemplateCsv(columns: string[]) {
  const sample = [
    columns.join(','),
    [
      'ADM001',
      'Ada',
      'Lovelace',
      'Female',
      '2010-01-15',
      '2026-04-01',
      '1',
      '1',
      '9876543210',
      '',
      'Father',
      'Mother',
      '',
      '',
      '',
      '',
      '',
      'General',
      '',
      'No',
    ]
      .slice(0, columns.length)
      .join(','),
  ].join('\n');
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'student-import-template.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ImportStudentsPage() {
  const { data: template, isLoading: templateLoading } = useStudentImportTemplate();
  const importMutation = useImportStudents();
  const [rows, setRows] = useState<StudentImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<StudentImportResult | null>(null);

  const previewRows = useMemo(
    () => rows.slice(0, 50).map((row, index) => ({ ...row, __row: index + 1 })),
    [rows],
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-1"
        disabled={!template?.columns?.length}
        onClick={() => template && downloadTemplateCsv(template.columns)}
      >
        <Download className="h-4 w-4" />
        Download template
      </Button>
      <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold hover:bg-muted">
        <Upload className="h-4 w-4" />
        Choose CSV
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setResult(null);
            const reader = new FileReader();
            reader.onload = () => {
              const text = String(reader.result ?? '');
              setRows(parseCsv(text));
            };
            reader.readAsText(file);
            event.target.value = '';
          }}
        />
      </label>
      <PermissionButton
        permission="students.import.view"
        disabled={rows.length === 0}
        isLoading={importMutation.isPending}
        onClick={() => {
          importMutation.mutate(rows, { onSuccess: (data) => setResult(data) });
        }}
      >
        Import {rows.length || ''} row{rows.length === 1 ? '' : 's'}
      </PermissionButton>
    </div>
  );

  return (
    <ModuleListPack
      title="Import Students"
      description="Upload a CSV using the template columns. Students enroll in the active session."
      actions={actions}
      isLoading={templateLoading}
      loadingMessage="Loading import template..."
      isEmpty={false}
    >
      <div className="space-y-4">
        {template?.notes ? <p className="text-sm text-muted-foreground">{template.notes}</p> : null}
        {fileName ? (
          <p className="text-sm">
            File: <span className="font-medium">{fileName}</span> ({rows.length} row
            {rows.length === 1 ? '' : 's'})
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Download the template, fill class_id / section_id from Academics, then upload.
          </p>
        )}

        {previewRows.length > 0 ? (
          <DataTable data={previewRows} columns={PREVIEW_COLUMNS} getRowKey={(r) => r.__row} />
        ) : null}

        {result ? (
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <p>
              Created <span className="font-semibold">{result.created_count}</span>, errors{' '}
              <span className="font-semibold">{result.error_count}</span>
            </p>
            {result.errors.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-destructive">
                {result.errors.slice(0, 20).map((err) => (
                  <li key={`${err.row}-${err.message}`}>
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </ModuleListPack>
  );
}
