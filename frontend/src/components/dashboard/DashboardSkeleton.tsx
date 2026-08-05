export function DashboardSkeleton() {
  return (
    <div className="dashboard flex flex-col gap-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="hm-skeleton" style={{ height: '4.5rem' }} />
      <div className="hm-skeleton" style={{ height: '9rem' }} />
      <div className="hm-skeleton" style={{ height: '8.5rem' }} />
      <div className="hm-workboard grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="hm-skeleton lg:col-span-3" style={{ height: '18rem' }} />
        <div className="hm-workboard__side flex flex-col gap-4 lg:col-span-2">
          <div className="hm-skeleton" style={{ height: '12rem' }} />
          <div className="hm-skeleton" style={{ height: '10rem' }} />
        </div>
      </div>
      <div className="hm-skeleton" style={{ height: '5.5rem' }} />
    </div>
  );
}
