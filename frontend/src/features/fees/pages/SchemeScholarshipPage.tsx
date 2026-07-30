import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ModuleMarkGridPack } from '@workflow-packs';
import { toast } from 'sonner';

interface Scheme {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  description: string;
}

export function SchemeScholarshipPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([
    { id: 1, name: 'Merit Scholarship', code: 'MERIT50', type: 'Percentage', value: 50, description: '50% tuition fee waiver for academic excellence' },
    { id: 2, name: 'Sports Quota Discount', code: 'SPORTS_DISC', type: 'Fixed Amount', value: 5000, description: '₹5000 waiver for state/national level athletes' },
    { id: 3, name: 'EWS Scheme', code: 'EWS_FULL', type: 'Percentage', value: 100, description: '100% waiver for Economically Weaker Section' },
  ]);

  const handleDelete = (id: number) => {
    setSchemes(prev => prev.filter(s => s.id !== id));
    toast.success('Scholarship scheme deleted successfully');
  };

  const columns: DataTableColumn<Scheme>[] = [
    { id: 'name', header: 'Scheme Name', cellClassName: 'font-medium', cell: (r) => r.name },
    { id: 'code', header: 'Code', cell: (r) => r.code },
    { id: 'type', header: 'Type', cell: (r) => r.type },
    { id: 'value', header: 'Value', cellClassName: 'tabular-nums font-semibold', cell: (r) => r.type === 'Percentage' ? `${r.value}%` : `₹${r.value}` },
    { id: 'description', header: 'Description', cell: (r) => r.description },
    {
      id: 'actions',
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(r.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Scheme & Scholarship Master"
      description="Define scholarship schemes, fee concessions, and student benefits."
      actions={
        <button
          onClick={() => toast.info('Add Scheme drawer would open here')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Scheme
        </button>
      }
      filtersReady={true}
      isLoading={false}
      isEmpty={schemes.length === 0}
      emptyTitle="No schemes defined"
      emptyDescription="Create a new scholarship or fee concession scheme to get started."
    >
      <DataTable data={schemes} columns={columns} getRowKey={(r) => r.id} />
    </ModuleMarkGridPack>
  );
}
