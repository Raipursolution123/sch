import { useEffect, useState } from 'react';
import { lmsService } from '@services/api/lms.service';
import { Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'trending', label: 'Trending Courses' },
  { value: 'rating', label: 'Course Ratings' },
  { value: 'quiz', label: 'Quiz Performance' },
];

export function LMSReportPage() {
  const [type, setType] = useState('trending');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = (reportType: string) => {
    setLoading(true);
    lmsService.getReports(reportType)
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport(type);
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Online Course Reports</h1>
          <p className="text-sm text-muted-foreground">Consolidated performance metrics and course ratings.</p>
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
                  <th className="py-2">Course Name</th>
                  {type === 'trending' && <th className="py-2 text-right">Purchase Count</th>}
                  {type === 'rating' && <th className="py-2 text-right">Average Rating</th>}
                  {type === 'quiz' && (
                    <>
                      <th className="py-2">Quiz Title</th>
                      <th className="py-2 text-right">Average Score</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{row.course_name}</td>
                    {type === 'trending' && <td className="py-2 text-right">{row.purchase_count}</td>}
                    {type === 'rating' && <td className="py-2 text-right text-amber-500">★ {row.rating}</td>}
                    {type === 'quiz' && (
                      <>
                        <td className="py-2">{row.quiz_title}</td>
                        <td className="py-2 text-right text-success-foreground">{row.avg_score}%</td>
                      </>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No report data found.
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
