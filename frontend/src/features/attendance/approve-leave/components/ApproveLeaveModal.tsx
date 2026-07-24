import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Select } from '@components/ui/select';
import { useCreateApproveLeave, useUpdateApproveLeave } from '@hooks/useApproveLeave';
import { type ApproveLeave } from '@services/api/approve-leave.service';

interface ApproveLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave?: ApproveLeave | null;
}

export function ApproveLeaveModal({ isOpen, onClose, leave }: ApproveLeaveModalProps) {
  const createMutation = useCreateApproveLeave();
  const updateMutation = useUpdateApproveLeave();
  const isEditing = !!leave;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      roll_no: '',
      from_date: '',
      to_date: '',
      reason: '',
      status: '0',
    },
  });

  useEffect(() => {
    if (leave) {
      reset({
        roll_no: '',
        from_date: leave.from_date || '',
        to_date: leave.to_date || '',
        reason: leave.reason || '',
        status: leave.status.toString(),
      });
    } else {
      reset({
        roll_no: '',
        from_date: '',
        to_date: '',
        reason: '',
        status: '0',
      });
    }
  }, [leave, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    if (isEditing && leave) {
      updateMutation.mutate(
        {
          id: leave.id,
          payload: {
            status: parseInt(data.status, 10),
            reason: data.reason,
            from_date: data.from_date,
            to_date: data.to_date,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          roll_no: data.roll_no,
          from_date: data.from_date,
          to_date: data.to_date,
          reason: data.reason,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Leave Request' : 'Add Leave Request'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label>Student Roll Number</Label>
              <Controller
                control={control}
                name="roll_no"
                render={({ field }) => <Input placeholder="Enter student roll number" {...field} />}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Controller
                control={control}
                name="from_date"
                render={({ field }) => (
                  <Input type="date" disabled={leave?.is_attendance} {...field} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Controller
                control={control}
                name="to_date"
                render={({ field }) => (
                  <Input type="date" disabled={leave?.is_attendance} {...field} />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <Textarea
                  placeholder="Enter leave reason"
                  disabled={leave?.is_attendance}
                  {...field}
                />
              )}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>{leave?.is_attendance ? 'Attendance Action' : 'Status'}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    options={
                      leave?.is_attendance
                        ? [
                            { value: '0', label: 'Pending' },
                            { value: '1', label: 'Approve Exception (Mark as Present)' },
                            { value: '2', label: 'Reject Exception' },
                          ]
                        : [
                            { value: '0', label: 'Pending' },
                            { value: '1', label: 'Approve' },
                            { value: '2', label: 'Reject' },
                          ]
                    }
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
