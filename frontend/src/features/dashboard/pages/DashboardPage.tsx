import { useAuthStore } from '@store/index';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome, {user?.username || user?.role}. Business modules will be added here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Schools', 'Students', 'Staff', 'Fees', 'Attendance', 'Exams'].map((module) => (
          <div
            key={module}
            className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center"
          >
            <h3 className="font-medium text-gray-700">{module}</h3>
            <p className="mt-1 text-xs text-gray-400">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
