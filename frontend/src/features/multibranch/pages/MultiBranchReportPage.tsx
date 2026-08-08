import { useEffect, useState } from 'react';
import { multibranchService } from '@services/api/multibranch.service';
import { Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'daily_collection', label: 'Daily Collection Report' },
  { value: 'payroll', label: 'Payroll Report' },
  { value: 'income', label: 'Income Report' },
  { value: 'expense', label: 'Expense Report' },
  { value: 'user_log', label: 'User Log Report' },
];

export function MultiBranchReportPage() {
  const [type, setType] = useState('daily_collection');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = (reportType: string) => {
    setLoading(true);
    multibranchService.getReports(reportType)
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load report data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport(type);
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Multi-Branch Reports</h1>
          <p className="text-sm text-muted-foreground">Consolidated reports across all verified branches.</p>
        </div>

        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch Name</th>
                  {type === 'daily_collection' && (
                    <>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Collected Amount</th>
                    </>
                  )}
                  {type === 'payroll' && (
                    <>
                      <th className="py-2">Month</th>
                      <th className="py-2">Staff Count</th>
                      <th className="py-2 text-right">Net Amount</th>
                    </>
                  )}
                  {type === 'income' && (
                    <>
                      <th className="py-2">Source</th>
                      <th className="py-2 text-right">Amount</th>
                    </>
                  )}
                  {type === 'expense' && (
                    <>
                      <th className="py-2">Category</th>
                      <th className="py-2 text-right">Amount</th>
                    </>
                  )}
                  {type === 'user_log' && (
                    <>
                      <th className="py-2">User</th>
                      <th className="py-2">Action</th>
                      <th className="py-2">Time</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{row.branch_name}</td>
                    {type === 'daily_collection' && (
                      <>
                        <td className="py-2">{row.date}</td>
                        <td className="py-2 text-right text-success-foreground">${row.collected_amount?.toLocaleString()}</td>
                      </>
                    )}
                    {type === 'payroll' && (
                      <>
                        <td className="py-2">{row.month}</td>
                        <td className="py-2">{row.staff_count}</td>
                        <td className="py-2 text-right">${row.amount?.toLocaleString()}</td>
                      </>
                    )}
                    {type === 'income' && (
                      <>
                        <td className="py-2">{row.source}</td>
                        <td className="py-2 text-right text-success-foreground">${row.amount?.toLocaleString()}</td>
                      </>
                    )}
                    {type === 'expense' && (
                      <>
                        <td className="py-2">{row.category}</td>
                        <td className="py-2 text-right text-destructive">${row.amount?.toLocaleString()}</td>
                      </>
                    )}
                    {type === 'user_log' && (
                      <>
                        <td className="py-2">{row.user}</td>
                        <td className="py-2">{row.action}</td>
                        <td className="py-2">{row.time}</td>
                      </>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No report records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
