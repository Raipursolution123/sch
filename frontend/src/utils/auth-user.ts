import type { User, LegacyPermissionActions } from '@app-types/auth';

/** Build auth user payload fields from backend legacy_permissions map. */
export function mapLegacyPermissionsToUser(
  user: User,
  legacyPermissions: Record<string, LegacyPermissionActions>,
): User {
  const permissions = Object.entries(legacyPermissions)
    .filter(([, actions]) => actions.can_view)
    .map(([category]) => category);

  return {
    ...user,
    legacy_permissions: legacyPermissions,
    permissions,
  };
}
