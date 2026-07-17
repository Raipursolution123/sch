import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@components/ui/button';
import {
  ActivityFeed,
  ActivityFeedEmpty,
  AttentionList,
  ChartPanel,
  DashboardCard,
  DashboardHero,
  DashboardSkeleton,
  FeeProgressList,
  getTodayLabel,
  MiniBarChart,
  QuickActionTile,
  StatAccentCard,
  UpcomingExamsList,
} from '@components/dashboard';
import { ErrorState } from '@components/feedback/ErrorState';
import { DASHBOARD_QUICK_ACTIONS } from '@constants/dashboard';
import { ROUTES } from '@constants/index';
import { useDashboardOverview } from '@hooks/useDashboard';
import { useActiveSession } from '@hooks/useSessions';
import { useAuthStore } from '@store/index';
import { cn } from '@utils/cn';
import { getApiErrorMessage } from '@utils/error-message';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting}, ${name}`;
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: activeSession } = useActiveSession();
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();

  const displayName =
    user?.role && user.role.toLowerCase() !== user?.username?.toLowerCase()
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : user?.username?.includes('@')
        ? 'Admin'
        : user?.username || 'Admin';

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

  const { kpis, weeklyAttendance, feeOverview, attentionItems, recentActivity, upcomingExams } =
    data;
  const feeTotal = feeOverview.collected + feeOverview.pending + feeOverview.overdue;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-2 lg:space-y-8">
      <DashboardHero
        greeting={getGreeting(displayName)}
        dateLabel={getTodayLabel()}
        sessionLabel={activeSession?.session}
      />

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key performance indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatAccentCard
            label={kpis.students.label}
            value={kpis.students.value}
            changePercent={kpis.students.changePercent}
            changeLabel={kpis.students.changeLabel}
            accentTone="primary"
          />
          <StatAccentCard
            label={kpis.staff.label}
            value={kpis.staff.value}
            changePercent={kpis.staff.changePercent}
            changeLabel={kpis.staff.changeLabel}
            accentTone="violet"
          />
          <StatAccentCard
            label={kpis.fees.label}
            value={kpis.fees.value}
            changePercent={kpis.fees.changePercent}
            changeLabel={kpis.fees.changeLabel}
            accentTone="brown"
          />
          <StatAccentCard
            label={kpis.attendance.label}
            value={kpis.attendance.value}
            changePercent={kpis.attendance.changePercent}
            changeLabel={kpis.attendance.changeLabel}
            accentTone="teal"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <DashboardCard
          title="Weekly attendance"
          className="lg:col-span-3"
          action={
            <Link
              to={ROUTES.attendance.report}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1 text-primary')}
            >
              View report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <ChartPanel
            isEmpty={weeklyAttendance.every((point) => point.rate === 0)}
            emptyTitle="No attendance data this week"
            emptyDescription="Mark attendance to see weekly trends on the dashboard."
          >
            <MiniBarChart
              data={weeklyAttendance.map((point) => ({
                label: point.label,
                value: point.rate,
              }))}
              maxValue={100}
              ariaLabel="Weekly attendance rates by day"
            />
          </ChartPanel>
        </DashboardCard>

        <DashboardCard title="Needs attention" className="lg:col-span-2">
          <AttentionList items={attentionItems} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <DashboardCard
          title="Fee collection"
          description="Current session breakdown"
          className="lg:col-span-2"
          action={
            <Link
              to={ROUTES.fees.assign}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1 text-primary')}
            >
              Manage fees
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <ChartPanel
            isEmpty={feeTotal <= 0}
            emptyTitle="No fee assignments yet"
            emptyDescription="Assign fees to classes to track collection on the dashboard."
          >
            <FeeProgressList
              total={feeTotal}
              collectionRate={feeOverview.collectionRate}
              items={[
                { label: 'Collected', amount: feeOverview.collected, tone: 'success' },
                { label: 'Pending', amount: feeOverview.pending, tone: 'warning' },
                { label: 'Overdue', amount: feeOverview.overdue, tone: 'destructive' },
              ]}
            />
          </ChartPanel>
        </DashboardCard>

        <DashboardCard
          title="Upcoming exams"
          description="Next scheduled papers"
          className="lg:col-span-3"
          action={
            <Link
              to={ROUTES.examinations.schedule}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1 text-primary')}
            >
              Full schedule
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <UpcomingExamsList items={upcomingExams} />
        </DashboardCard>
      </div>

      <DashboardCard title="Recent activity" description="Latest updates across modules">
        {recentActivity.length > 0 ? (
          <ActivityFeed items={recentActivity} />
        ) : (
          <ActivityFeedEmpty />
        )}
      </DashboardCard>

      <DashboardCard
        title="Quick actions"
        description="Shortcuts to frequently used modules"
        padding="none"
        contentClassName="p-5 sm:p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_QUICK_ACTIONS.map((action) => (
            <QuickActionTile key={action.path} item={action} />
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
