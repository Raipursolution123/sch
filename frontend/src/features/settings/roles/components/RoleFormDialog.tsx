import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import type { Role } from '@/types/settings/roles';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSubmit: (values: { name: string; is_system: number }) => void;
  isLoading: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}: RoleFormDialogProps) {
  const [name, setName] = useState('');
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    if (open) {
      setName(role ? role.name || '' : '');
      setIsSystem(role ? role.is_system === 1 : false);
    }
  }, [open, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, is_system: isSystem ? 1 : 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Custom Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="role_name_modal">Role Name *</Label>
            <Input
              id="role_name_modal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vice Principal, IT Staff"
              required
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="is_system_checkbox"
              checked={isSystem}
              onChange={(e) => setIsSystem(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_system_checkbox" className="cursor-pointer">
              System Protected Role (Cannot be deleted)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {role ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default RoleFormDialog;
