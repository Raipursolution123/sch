export type NotificationCategory =
  | 'student'
  | 'staff'
  | 'fee'
  | 'attendance'
  | 'exam'
  | 'settings'
  | 'approval';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href?: string;
  category: NotificationCategory;
  createdAt: string;
  read: boolean;
}
