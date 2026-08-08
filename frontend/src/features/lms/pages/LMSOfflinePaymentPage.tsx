import { useEffect, useState } from 'react';
import { lmsService, type OfflinePayment } from '@services/api/lms.service';
import { Button } from '@components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';

export function LMSOfflinePaymentPage() {
  const [payments, setPayments] = useState<OfflinePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    lmsService.listOfflinePayments()
      .then(setPayments)
      .catch((err) => setError(err.message || 'Failed to load payments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    lmsService.createOfflinePayment({
      student_id: Number(studentId),
      online_courses_id: Number(courseId),
      paid_amount: Number(amount),
      transaction_id: transactionId,
    })
      .then(() => {
        setOpen(false);
        setStudentId('');
        setCourseId('');
        setAmount('');
        setTransactionId('');
        fetchPayments();
      })
      .catch((err) => alert(err.message || 'Failed to record payment.'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Offline Payment</h1>
          <p className="text-sm text-muted-foreground">Manage and record manual offline payments for online courses.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Payment
        </Button>
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
                  <th className="py-2">Student ID</th>
                  <th className="py-2">Course Name</th>
                  <th className="py-2">Transaction ID</th>
                  <th className="py-2 text-right">Paid Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 font-medium">#{p.student_id}</td>
                    <td className="py-2">{p.course_name}</td>
                    <td className="py-2">{p.transaction_id || '—'}</td>
                    <td className="py-2 text-right text-success-foreground">${p.paid_amount.toLocaleString()}</td>
                    <td className="py-2">{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No offline payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Offline Course Payment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Student ID</label>
              <input
                type="number"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 15"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Online Course ID</label>
              <input
                type="number"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g. 1"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Paid Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 199.99"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Transaction ID</label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN987654"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
