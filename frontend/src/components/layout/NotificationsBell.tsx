import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@components/ui/button';
import { NotificationCenter } from '@components/layout/NotificationCenter';
import { useNotifications } from '@hooks/useNotifications';
import { cn } from '@utils/cn';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setOpen(true)}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
}
