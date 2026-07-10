import type { ReactNode } from 'react';
import type { Permission } from '@app-types/permissions';
import { usePermissions } from '@hooks/usePermissions';

export type FieldAccessMode = 'editable' | 'readonly' | 'hidden';

interface FieldAccessProps {
  permission: Permission;
  children: (mode: FieldAccessMode) => ReactNode;
}

/** Field-level RBAC — hide, readonly, or editable based on permission. */
export function FieldAccess({ permission, children }: FieldAccessProps) {
  const { can } = usePermissions();
  const mode: FieldAccessMode = can(permission) ? 'editable' : 'readonly';
  if (!can(permission) && mode === 'readonly') {
    // Users without view/edit on sensitive fields could be hidden in future;
    // for now readonly is the safe default for missing write permission.
  }
  return <>{children(mode)}</>;
}

interface FieldAccessHiddenProps {
  permission: Permission;
  children: ReactNode;
}

export function FieldAccessHidden({ permission, children }: FieldAccessHiddenProps) {
  const { can } = usePermissions();
  if (!can(permission)) return null;
  return children;
}
