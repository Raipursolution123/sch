import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { useApproveLeaves, useDeleteApproveLeave } from '@/hooks/useApproveLeave';
import { type ApproveLeave } from '@services/api/approve-leave.service';
import { Skeleton } from '@components/ui/skeleton';

interface ApproveLeaveTableProps {
  onEdit: (leave: ApproveLeave) => void;
}

export function ApproveLeaveTable({ onEdit }: ApproveLeaveTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useApproveLeaves(page);
  const deleteMutation = useDeleteApproveLeave();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      deleteMutation.mutate(id);
    }
  };

  const leaves: ApproveLeave[] = data?.results || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class & Section</TableHead>
              <TableHead>Leave Dates</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave: ApproveLeave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.student_name}</TableCell>
                  <TableCell>
                    {leave.class_name} ({leave.section_name})
                  </TableCell>
                  <TableCell>
                    {leave.from_date} to {leave.to_date}
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    {leave.status === 0 && <Badge variant="secondary">Pending</Badge>}
                    {leave.status === 1 && <Badge variant="default" className="bg-green-600">Approved</Badge>}
                    {leave.status === 2 && <Badge variant="destructive">Rejected</Badge>}
                    {leave.is_attendance && (
                      <Badge 
                        variant="outline" 
                        className={`ml-2 border-orange-200 ${
                          leave.attendance_type_label === 'Absent' ? 'bg-red-50 text-red-700' : 
                          leave.attendance_type_label === 'Late' ? 'bg-orange-50 text-orange-700' : 
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        Teacher Marked: {leave.attendance_type_label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(leave)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(leave.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!data?.previous}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.next}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
