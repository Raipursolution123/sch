import { useEffect, useId, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { getInitials } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { ThemeToggle } from '@components/layout/ThemeToggle';
import { useAuthStore } from '@store/index';

function shortDisplayName(username: string | undefined, role: string | undefined): string {
  const raw = username?.includes('@') ? username.split('@')[0] : username;
  if (raw?.trim()) {
    const cleaned = raw.replace(/[._-]+/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.charAt(0).toUpperCase()}${parts[0]!.slice(1)} ${parts[1]!.charAt(0).toUpperCase()}.`;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Admin';
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const fullName = user?.username || user?.role || 'Admin';
  const shortName = shortDisplayName(user?.username, user?.role);
  const initials = getInitials(fullName);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-sm border border-border py-1 pl-1 pr-2.5 text-[0.8125rem] hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${fullName}`}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-sm bg-paper-3 text-xs font-medium text-foreground"
          aria-hidden="true"
        >
          {initials.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden max-w-[7rem] truncate font-medium text-foreground sm:inline">
          {shortName}
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-52 rounded-panel border border-border bg-card py-1 shadow-sm"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
            {user?.role && <p className="text-label mt-0.5 text-muted-foreground">{user.role}</p>}
          </div>
          <div className="border-b border-border px-4 py-3">
            <p className="text-label mb-2 text-muted-foreground">Theme</p>
            <ThemeToggle />
          </div>
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false);
                clearAuth();
              }}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
