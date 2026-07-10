import type { ReactNode } from 'react';
import type { Permission } from '@app-types/permissions';
import { usePermissions } from '@hooks/usePermissions';

interface PermissionGateProps {
  permission: Permission | Permission[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the current user has the required permission(s). */
export function PermissionGate({
  permission,
  mode = 'any',
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();
  const items = Array.isArray(permission) ? permission : [permission];
  const allowed =
    mode === 'all' ? canAll(items) : items.length === 1 ? can(items[0]) : canAny(items);

  return allowed ? children : fallback;
}
