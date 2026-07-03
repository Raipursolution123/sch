import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, CalendarCheck, IndianRupee, Users } from 'lucide-react';
import { buttonVariants } from '@components/ui/button';
import {
  ActivityFeed,
  ActivityFeedEmpty,
  DashboardCard,
  DashboardHero,
  FeeProgressList,
  KpiStatCard,
  MiniBarChart,
  QuickActionTile,
  UpcomingExamsList,
} from '@components/dashboard';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { DASHBOARD_QUICK_ACTIONS } from '@constants/dashboard';
import { ROUTES } from '@constants/index';
import { useDashboardOverview } from '@hooks/useDashboard';
import { useActiveSession } from '@hooks/useSessions';
import { useAuthStore } from '@store/index';
import { cn } from '@utils/cn';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting}, ${name}`;
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: activeSession } = useActiveSession();
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();

  const displayName = user?.username || user?.role || 'Admin';

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load dashboard'}
        onRetry={() => void refetch()}
      />
    );
  }

  const { kpis, weeklyAttendance, feeOverview, recentActivity, upcomingExams } = data;
  const feeTotal = feeOverview.collected + feeOverview.pending + feeOverview.overdue;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-2 lg:space-y-8">
      <DashboardHero
        greeting={getGreeting(displayName)}
        subtitle="Track school performance, stay on top of operations, and jump into key modules from one place."
        sessionLabel={activeSession?.session}
      />

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key performance indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard
            label={kpis.students.label}
            value={kpis.students.value}
            icon={Users}
            changePercent={kpis.students.changePercent}
            changeLabel={kpis.students.changeLabel}
            sparkline={kpis.students.sparkline}
            iconTone="primary"
          />
          <KpiStatCard
            label={kpis.staff.label}
            value={kpis.staff.value}
            icon={Briefcase}
            changePercent={kpis.staff.changePercent}
            changeLabel={kpis.staff.changeLabel}
            iconTone="neutral"
          />
          <KpiStatCard
            label={kpis.fees.label}
            value={kpis.fees.value}
            icon={IndianRupee}
            changePercent={kpis.fees.changePercent}
            changeLabel={kpis.fees.changeLabel}
            iconTone="success"
          />
          <KpiStatCard
            label={kpis.attendance.label}
            value={kpis.attendance.value}
            icon={CalendarCheck}
            changePercent={kpis.attendance.changePercent}
            changeLabel={kpis.attendance.changeLabel}
            sparkline={kpis.attendance.sparkline}
            iconTone="warning"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <DashboardCard
          title="Weekly Attendance"
          description="Average attendance rate by weekday"
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
          <MiniBarChart
            data={weeklyAttendance.map((point) => ({
              label: point.label,
              value: point.rate,
            }))}
            maxValue={100}
            ariaLabel="Weekly attendance rates by day"
          />
        </DashboardCard>

        <DashboardCard
          title="Fee Collection"
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
          <FeeProgressList
            total={feeTotal}
            collectionRate={feeOverview.collectionRate}
            items={[
              { label: 'Collected', amount: feeOverview.collected, tone: 'success' },
              { label: 'Pending', amount: feeOverview.pending, tone: 'warning' },
              { label: 'Overdue', amount: feeOverview.overdue, tone: 'destructive' },
            ]}
          />
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Upcoming Exams"
          description="Next scheduled papers"
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

        <DashboardCard title="Recent Activity" description="Latest updates across modules">
          {recentActivity.length > 0 ? (
            <ActivityFeed items={recentActivity} />
          ) : (
            <ActivityFeedEmpty />
          )}
        </DashboardCard>
      </div>

      <DashboardCard
        title="Quick Actions"
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
