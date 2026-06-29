import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import type { AcademicSession } from '@app-types/settings/session';
import { currentIndianAcademicSession, isValidSessionName } from '@utils/session';

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: AcademicSession | null;
  onSubmit: (sessionName: string) => void;
  isLoading?: boolean;
}

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  onSubmit,
  isLoading,
}: SessionFormDialogProps) {
  const isEdit = Boolean(session);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(session?.session ?? currentIndianAcademicSession());
      setError('');
    }
  }, [open, session]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!isValidSessionName(trimmed)) {
      setError('Use format YYYY-YY (e.g. 2026-27)');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Academic Session' : 'Add Academic Session'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the session label. Active status is managed separately.'
                : 'Create a new academic year. New sessions start as inactive.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              label="Session name"
              name="session"
              placeholder="2026-27"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              error={error}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save changes' : 'Create session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
