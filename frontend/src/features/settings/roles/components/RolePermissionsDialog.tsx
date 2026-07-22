import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { useRolePermissions, useUpdateRolePermissions } from '@/hooks/useRoles';
import type { Role, RolePermission } from '@/types/settings/roles';

interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RolePermissionsDialog({
  open,
  onOpenChange,
  role,
}: RolePermissionsDialogProps) {
  const { data: serverPermissions, isLoading } = useRolePermissions(role?.id || null);
  const { mutate: updatePermissions, isPending } = useUpdateRolePermissions();
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>([]);

  useEffect(() => {
    if (open && serverPermissions) {
      setLocalPermissions(serverPermissions);
    }
  }, [open, serverPermissions]);

  const handlePermissionChange = (catId: number, field: 'can_view' | 'can_add' | 'can_edit' | 'can_delete') => {
    setLocalPermissions((prev) =>
      prev.map((perm) => {
        if (perm.permission_category === catId) {
          return {
            ...perm,
            [field]: perm[field] === 1 ? 0 : 1,
          };
        }
        return perm;
      }),
    );
  };

  const handleSave = () => {
    if (!role) return;
    updatePermissions(
      {
        roleId: role.id,
        permissions: localPermissions,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Permissions configuration for "{role?.name}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm flex-1">
            Loading permissions grid...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 sticky top-0 bg-background z-10">
                  <th className="p-3 font-semibold text-muted-foreground">Module Category</th>
                  <th className="p-3 font-semibold text-muted-foreground text-center">View</th>
                  <th className="p-3 font-semibold text-muted-foreground text-center">Add</th>
                  <th className="p-3 font-semibold text-muted-foreground text-center">Edit</th>
                  <th className="p-3 font-semibold text-muted-foreground text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {localPermissions.map((perm) => (
                  <tr key={perm.permission_category} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium">{perm.permission_category_name}</td>
                    
                    {/* View */}
                    <td className="p-3 text-center">
                      {perm.enable_view === 1 ? (
                        <input
                          type="checkbox"
                          checked={perm.can_view === 1}
                          onChange={() => handlePermissionChange(perm.permission_category, 'can_view')}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>

                    {/* Add */}
                    <td className="p-3 text-center">
                      {perm.enable_add === 1 ? (
                        <input
                          type="checkbox"
                          checked={perm.can_add === 1}
                          onChange={() => handlePermissionChange(perm.permission_category, 'can_add')}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>

                    {/* Edit */}
                    <td className="p-3 text-center">
                      {perm.enable_edit === 1 ? (
                        <input
                          type="checkbox"
                          checked={perm.can_edit === 1}
                          onChange={() => handlePermissionChange(perm.permission_category, 'can_edit')}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="p-3 text-center">
                      {perm.enable_delete === 1 ? (
                        <input
                          type="checkbox"
                          checked={perm.can_delete === 1}
                          onChange={() => handlePermissionChange(perm.permission_category, 'can_delete')}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || isLoading}>
            Save Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default RolePermissionsDialog;
