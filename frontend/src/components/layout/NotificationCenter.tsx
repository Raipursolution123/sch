import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer';
import type { AppNotification } from '@app-types/notifications';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@hooks/useNotifications';
import { formatDate } from '@utils/format';
import { cn } from '@utils/cn';

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NotificationItem({
  item,
  onRead,
}: {
  item: AppNotification;
  onRead: (id: string) => void;
}) {
  const content = (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        item.read ? 'border-border/60 bg-card' : 'border-primary/20 bg-primary-pale/40',
      )}
    >
      <p className="text-sm font-medium text-foreground">{item.title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
    </div>
  );

  if (item.href) {
    return (
      <Link
        to={item.href}
        onClick={() => onRead(item.id)}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="w-full text-left" onClick={() => onRead(item.id)}>
      {content}
    </button>
  );
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" aria-hidden="true" />
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription>Alerts and updates across modules</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {unreadCount > 0 && (
            <div className="mb-4 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  markAllRead.mutate(notifications.map((item) => item.id), {
                    onSuccess: () => onOpenChange(false),
                  })
                }
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Mark all read
              </Button>
            </div>
          )}

          {isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading notifications…</p>
          )}

          {!isLoading && notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}

          <div className="space-y-2">
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
