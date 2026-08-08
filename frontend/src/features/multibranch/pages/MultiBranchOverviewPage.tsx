import { useEffect, useState } from 'react';
import { multibranchService, type OverviewData } from '@services/api/multibranch.service';
import { Loader2 } from 'lucide-react';
import { Badge } from '@components/ui/badge';

export function MultiBranchOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    multibranchService.getOverview()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load overview data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Multi-Branch Overview</h1>
        <p className="text-sm text-muted-foreground">Detailed statistics across all verified branches.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fees Details */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Fees Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Session</th>
                  <th className="py-2">Students</th>
                  <th className="py-2 text-right">Total Fees</th>
                  <th className="py-2 text-right">Paid</th>
                  <th className="py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.school_students.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.session}</td>
                    <td className="py-2">{b.total_student}</td>
                    <td className="py-2 text-right">${b.total_fees.toLocaleString()}</td>
                    <td className="py-2 text-right text-success-foreground">${b.total_paid.toLocaleString()}</td>
                    <td className="py-2 text-right text-destructive">${b.total_balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transport Fees */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Transport Fees Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Session</th>
                  <th className="py-2 text-right">Total Fees</th>
                  <th className="py-2 text-right">Paid</th>
                  <th className="py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.school_transport_fees.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.session}</td>
                    <td className="py-2 text-right">${b.total_fees.toLocaleString()}</td>
                    <td className="py-2 text-right text-success-foreground">${b.total_paid.toLocaleString()}</td>
                    <td className="py-2 text-right text-destructive">${b.total_balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Admissions */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Student Admissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Session</th>
                  <th className="py-2">Offline Admissions</th>
                  <th className="py-2">Online Admissions</th>
                </tr>
              </thead>
              <tbody>
                {data.student_admission_list.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.session}</td>
                    <td className="py-2">{b.offline_admission}</td>
                    <td className="py-2">
                      <Badge variant="secondary">{b.online_admission}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Library Details */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Library Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Total Books</th>
                  <th className="py-2">Members</th>
                  <th className="py-2">Books Issued</th>
                </tr>
              </thead>
              <tbody>
                {data.student_books_list.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.total_books}</td>
                    <td className="py-2">{b.libarary_members}</td>
                    <td className="py-2">{b.book_issued}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alumni */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Alumni Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Alumni Student Count</th>
                </tr>
              </thead>
              <tbody>
                {data.alumni_student_list.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.total_alumni_student}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payroll */}
        <div className="rounded-lg border bg-card p-4 shadow-sm col-span-1 md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Staff Payroll Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Total Staff</th>
                  <th className="py-2">Payroll Generated</th>
                  <th className="py-2">Payroll Pending</th>
                  <th className="py-2">Payroll Paid</th>
                  <th className="py-2 text-right">Net Amount</th>
                  <th className="py-2 text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.staff_payroll.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2">{b.total_staff}</td>
                    <td className="py-2">{b.payroll_generated}</td>
                    <td className="py-2 text-amber-600">{b.payroll_not_generated}</td>
                    <td className="py-2 text-success-foreground">{b.payroll_paid}</td>
                    <td className="py-2 text-right">${b.net_amount.toLocaleString()}</td>
                    <td className="py-2 text-right text-success-foreground">${b.paid_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
