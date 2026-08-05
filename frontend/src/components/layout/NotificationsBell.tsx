import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@components/ui/button';
import { NotificationCenter } from '@components/layout/NotificationCenter';
import { useNotifications } from '@hooks/useNotifications';

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
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </Button>

      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
}
