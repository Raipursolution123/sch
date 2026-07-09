import type { AppNotification } from '@app-types/notifications';
import { ROUTES } from '@constants/index';
import { dashboardService } from '@services/api/dashboard.service';

const READ_STORAGE_KEY = 'school_erp_notifications_read';

function readReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

export const notificationsService = {
  async list(sessionId?: number): Promise<AppNotification[]> {
    const overview = await dashboardService.getOverview(sessionId);
    const readIds = readReadIds();
    const items: AppNotification[] = [];

    for (const item of overview.attentionItems) {
      items.push({
        id: `attention-${item.id}`,
        title: item.title,
        body: item.description ?? 'Requires your attention',
        href: item.href,
        category: item.id.includes('exam') ? 'exam' : item.id.includes('fee') ? 'fee' : 'staff',
        createdAt: new Date().toISOString(),
        read: readIds.has(`attention-${item.id}`),
      });
    }

    for (const activity of overview.recentActivity.slice(0, 4)) {
      items.push({
        id: `activity-${activity.id}`,
        title: activity.title,
        body: activity.description,
        href:
          activity.category === 'student'
            ? ROUTES.students.root
            : activity.category === 'exam'
              ? ROUTES.examinations.exams
              : activity.category === 'fee'
                ? ROUTES.fees.assign
                : undefined,
        category: activity.category,
        createdAt: activity.timestamp,
        read: readIds.has(`activity-${activity.id}`),
      });
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markRead(id: string) {
    const ids = readReadIds();
    ids.add(id);
    writeReadIds(ids);
  },

  markAllRead(notificationIds: string[]) {
    const ids = readReadIds();
    for (const id of notificationIds) ids.add(id);
    writeReadIds(ids);
  },
};
