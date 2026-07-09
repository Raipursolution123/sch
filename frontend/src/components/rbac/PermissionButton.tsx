import type { ComponentProps } from 'react';
import { Button } from '@components/ui/button';
import type { Permission } from '@app-types/permissions';
import { usePermissions } from '@hooks/usePermissions';
import { cn } from '@utils/cn';

type ButtonProps = ComponentProps<typeof Button>;

interface PermissionButtonProps extends ButtonProps {
  permission: Permission;
  hideWhenDenied?: boolean;
}

/**
 * Button that is hidden or disabled (with tooltip) when permission is missing.
 * Prefer disabled+title so layout does not shift unexpectedly.
 */
export function PermissionButton({
  permission,
  hideWhenDenied = false,
  disabled,
  title,
  className,
  ...props
}: PermissionButtonProps) {
  const { can, reasonIfDenied } = usePermissions();
  const allowed = can(permission);
  const deniedReason = reasonIfDenied(permission);

  if (!allowed && hideWhenDenied) return null;

  return (
    <Button
      {...props}
      disabled={disabled || !allowed}
      title={!allowed ? deniedReason : title}
      aria-disabled={!allowed || disabled}
      className={cn(!allowed && 'cursor-not-allowed', className)}
    />
  );
}
