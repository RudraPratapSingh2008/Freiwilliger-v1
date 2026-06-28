import { Users, Calendar, Activity, Flag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useGetStatsQuery } from '@/api/adminApi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-5 border-0 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useGetStatsQuery();
  const stats = data?.data || data || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
        <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} color="bg-violet-500" />
        <StatCard icon={Activity} label="Active Events" value={stats.activeEvents} color="bg-green-500" />
        <StatCard icon={Flag} label="Open Reports" value={stats.openReports} color="bg-orange-500" />
      </div>
    </div>
  );
}
