import type { LegacyPermissionActions } from '@app-types/auth';
import type { Permission } from '@app-types/permissions';
import { PERMISSION_TO_LEGACY } from '@services/navigation/permission-resolver';

const ACTION_SUFFIX: Record<string, keyof LegacyPermissionActions> = {
  view: 'can_view',
  create: 'can_add',
  edit: 'can_edit',
  delete: 'can_delete',
  manage: 'can_view',
  mark: 'can_add',
  submit: 'can_add',
  approve: 'can_edit',
};

/**
 * Resolve a UI permission against backend legacy_permissions from /auth/me.
 */
export function legacyPermissionAllows(
  legacyPermissions: Record<string, LegacyPermissionActions> | undefined,
  permission: Permission,
): boolean {
  if (!legacyPermissions || Object.keys(legacyPermissions).length === 0) {
    return false;
  }

  const parts = permission.split('.');
  const actionKey = ACTION_SUFFIX[parts[parts.length - 1] ?? ''] ?? 'can_view';
  const legacyCategories = PERMISSION_TO_LEGACY[permission] ?? [parts.join('_')];

  return legacyCategories.some((category) => {
    const actions = legacyPermissions[category];
    return Boolean(actions?.[actionKey]);
  });
}

/** Legacy category short_codes where the user has can_view. */
export function legacyViewableCategories(
  legacyPermissions: Record<string, LegacyPermissionActions> | undefined,
): string[] {
  if (!legacyPermissions) return [];
  return Object.entries(legacyPermissions)
    .filter(([, actions]) => actions.can_view)
    .map(([category]) => category);
}
