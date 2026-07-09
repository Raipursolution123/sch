import type { LucideIcon } from 'lucide-react';

/** Sidebar section grouping for the admin shell. */
export type NavSection =
  | 'main'
  | 'people'
  | 'academics'
  | 'operations'
  | 'finance'
  | 'insights'
  | 'system';

/**
 * Legacy permission_category key(s) from permission_group / roles_permissions.
 * Backend `/me` will supply these; navigation only declares requirements.
 */
export type NavPermissionKey = string;

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  section?: NavSection;
  /** When set, item is visible if the user has ANY listed permission. */
  permissionKeys?: NavPermissionKey[];
  /** When true, user must have ALL permissionKeys (default: any). */
  requireAllPermissions?: boolean;
  children?: NavItem[];
}

export interface RoutePageMeta {
  title: string;
  description: string;
  module?: string;
  permissionKeys?: NavPermissionKey[];
}

export interface AppRouteHandle {
  page: RoutePageMeta;
}
