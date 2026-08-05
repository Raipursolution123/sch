import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityFeed,
  ActivityFeedEmpty,
  AttentionBand,
  AttentionList,
  DashboardHero,
  DashboardSkeleton,
  getTodayLabel,
  MissionTiles,
  type MissionTileItem,
} from '@components/dashboard';
import { ErrorState } from '@components/feedback/ErrorState';
import { DASHBOARD_QUICK_ACTIONS } from '@constants/dashboard';
import { ROUTES } from '@constants/index';
import { useDashboardOverview } from '@hooks/useDashboard';
import { useActiveSession } from '@hooks/useSessions';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { useAuthStore } from '@store/index';
import type { User } from '@app-types/auth';
import type { AttentionItem, DashboardOverview } from '@app-types/dashboard/dashboard';
import { getApiErrorMessage } from '@utils/error-message';
import { formatCompactAmount } from '@utils/format';

function getGreetingName(user: User | null): string {
  if (!user?.username) return 'there';
  const raw = user.username.includes('@') ? user.username.split('@')[0]! : user.username;
  const cleaned = raw.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'there';
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting}, ${name}`;
}

function formatRoleLabel(role: string | undefined): string {
  if (!role?.trim()) return 'Admin';
  return role
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildMissionTiles(data: DashboardOverview): MissionTileItem[] {
  const { kpis, feeOverview, attentionItems } = data;
  const attendanceGaps = attentionItems.filter(
    (item) =>
      item.title.toLowerCase().includes('attendance') ||
      item.description?.toLowerCase().includes('attendance'),
  ).length;
  return [
    {
      id: 'fees',
      eyebrow: 'Fees',
      title: 'Collect fees',
      value: kpis.fees.value,
      hint: 'Current session collection',
      hintWarn:
        feeOverview.overdue > 0 ? `${formatCompactAmount(feeOverview.overdue)} overdue` : undefined,
      href: ROUTES.fees.collect,
      badge: 'Live',
      badgeTone: 'live',
    },
    {
      id: 'attendance',
      eyebrow: 'Attendance',
      title: 'Close gaps',
      value: attendanceGaps > 0 ? String(attendanceGaps) : kpis.attendance.value,
      hint:
        attendanceGaps > 0
          ? `${attendanceGaps} item${attendanceGaps === 1 ? '' : 's'} need follow-up`
          : 'Present rate across marked classes',
      href: ROUTES.attendance.mark,
      badge: attendanceGaps > 0 ? 'Gaps' : undefined,
      badgeTone: 'muted',
    },
    {
      id: 'students',
      eyebrow: 'People',
      title: 'Students on roll',
      value: kpis.students.value,
      hint: kpis.staff.value !== '—' ? `${kpis.staff.value} staff active` : 'Active session roster',
      href: ROUTES.students.root,
      badge: 'Roster',
      badgeTone: 'muted',
    },
  ];
}

function pickGraphiteItem(items: AttentionItem[]): AttentionItem | null {
  return (
    items.find((item) => item.severity === 'danger') ??
    items.find((item) => item.severity === 'warning') ??
    items[0] ??
    null
  );
}

function useRevealRoot(ready: boolean) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ready) return;

    const root = rootRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>('.hm-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      nodes.forEach((node) => node.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ready]);

  return rootRef;
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { name: schoolName } = useSchoolBrand();
  const { data: activeSession } = useActiveSession();
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();
  const ready = !isLoading && !isError && Boolean(data);
  const rootRef = useRevealRoot(ready);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Could not load dashboard')}
        onRetry={() => void refetch()}
      />
    );
  }

  const { kpis, attentionItems, recentActivity } = data;
  const hasAttendanceRate = kpis.attendance.value !== '—';
  const lead = hasAttendanceRate
    ? {
        value: kpis.attendance.value,
        label: 'Attendance today',
        qualifier: 'Present across marked classes · mark remaining gaps from Your work.',
      }
    : {
        value: kpis.students.value,
        label: kpis.students.label,
        qualifier: "On roll this session. Mark attendance to unlock today's rate.",
      };

  const missions = buildMissionTiles(data);
  const graphiteItem = pickGraphiteItem(attentionItems);
  const savedViews = DASHBOARD_QUICK_ACTIONS.slice(0, 4);

  return (
    <div ref={rootRef} className="dashboard flex flex-col gap-8">
      <DashboardHero
        greeting={getGreeting(getGreetingName(user))}
        schoolLabel={schoolName}
        dateLabel={getTodayLabel()}
        sessionLabel={activeSession?.session}
        roleLabel={formatRoleLabel(user?.role)}
        leadValue={lead.value}
        leadLabel={lead.label}
        leadQualifier={lead.qualifier}
        primaryAction={{ label: 'Mark attendance', to: ROUTES.attendance.mark }}
        secondaryAction={{ label: 'View report', to: ROUTES.attendance.report }}
      />

      <MissionTiles items={missions} />

      <div className="hm-workboard hm-reveal grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section
          className="hm-workboard__queue min-w-0 lg:col-span-3"
          aria-labelledby="queue-heading"
        >
          <div className="hm-workboard__head mb-4 flex items-baseline justify-between gap-4">
            <h2 id="queue-heading" className="hm-section__title">
              Needs attention
            </h2>
            <Link to={ROUTES.reports.hub} className="hm-link">
              View all
            </Link>
          </div>
          <div className="hm-workboard__panel">
            <AttentionList items={attentionItems} />
          </div>
        </section>

        <div className="hm-workboard__side flex min-w-0 flex-col gap-4 lg:col-span-2">
          <section className="hm-workboard__panel" aria-labelledby="feed-heading">
            <div className="hm-workboard__panel-head">
              <h2 id="feed-heading" className="text-sm font-medium text-foreground">
                Live feed
              </h2>
            </div>
            <div className="hm-workboard__panel-body">
              {recentActivity.length > 0 ? (
                <ActivityFeed items={recentActivity.slice(0, 5)} />
              ) : (
                <ActivityFeedEmpty />
              )}
            </div>
          </section>

          <section className="hm-workboard__panel" aria-labelledby="views-heading">
            <div className="hm-workboard__panel-head">
              <h2 id="views-heading" className="text-sm font-medium text-foreground">
                Saved views
              </h2>
            </div>
            <ul className="hm-saved-views">
              {savedViews.map((view) => (
                <li key={view.path}>
                  <Link to={view.path} className="hm-saved-views__link">
                    <span>{view.label}</span>
                    <span className="hm-saved-views__meta">{view.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {graphiteItem ? <AttentionBand item={graphiteItem} /> : null}
    </div>
  );
}
