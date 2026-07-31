import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';
import { Button } from '@components/ui/button';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/api-endpoints';

export function ImportStudentsPage() {
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: async (students: any[]) => {
      const response = await apiClient.post<{ message: string; data: { imported_count: number } }>(
        API_ENDPOINTS.students.import,
        { students },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || `Successfully imported ${parsedStudents.length} students!`);
      setParsedStudents([]);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const items = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    setParsedStudents(items);
  };

  const handleImport = () => {
    if (parsedStudents.length > 0) {
      importMutation.mutate(parsedStudents);
    }
  };

  return (
    <ModuleListPack
      title="Import Students"
      description="Upload CSV spreadsheet to bulk import new student admission records into the system database."
    >
      <div className="max-w-2xl space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        {successMessage && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Upload CSV File" htmlFor="csv_file" required>
            <div className="flex items-center gap-3">
              <Input
                id="csv_file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </FormField>

          <p className="text-xs text-muted-foreground">
            Expected CSV headers:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">
              firstname, lastname, admission_no, gender
            </code>
          </p>
        </div>

        {parsedStudents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Preview ({parsedStudents.length} Students Ready to Import)
            </h4>

            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border bg-muted/40 p-2">
              {parsedStudents.slice(0, 5).map((st, idx) => (
                <div key={idx} className="flex justify-between border-b pb-1 text-xs">
                  <span className="font-medium">
                    {st.firstname || st.first_name} {st.lastname || st.last_name}
                  </span>
                  <span className="font-mono text-muted-foreground">Adm #{st.admission_no}</span>
                </div>
              ))}
              {parsedStudents.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  + {parsedStudents.length - 5} more records
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? 'Importing...' : 'Bulk Import Students'}
            </Button>
          </div>
        )}
      </div>
    </ModuleListPack>
  );
}
