import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { MapPin, Users, Sprout, IndianRupee } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';

export default function AdminDashboard() {
  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? response.data as any[] : [];
    },
  });

  const { data: userCount = 0 } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const response = await javaApi.select('profiles', {});
      return response.success && response.data ? (response.data as any[]).length : 0;
    },
  });

  const { data: taskStats = { pending: 0, completed: 0 } } = useQuery({
    queryKey: ['admin-task-stats'],
    queryFn: async () => {
      const response = await javaApi.select('tasks', {});
      const data = response.success && response.data ? response.data as any[] : [];
      if (!data.length) return { pending: 0, completed: 0 };
      return {
        pending: data.filter((t: any) => t.status === 'pending').length,
        completed: data.filter((t: any) => t.status === 'completed').length,
      };
    },
  });

  const totalLand = farms.reduce((s: number, f: any) => s + (f.total_land || 0), 0);
  const totalRevenue = farms.reduce((s: number, f: any) => s + (f.expected_revenue || 0), 0);
  const activeCrops = new Set(farms.map((f: any) => f.crop).filter(Boolean)).size;

  // Pick first farm for weather preview
  const primaryFarm = farms[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Company Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MapPin />} label="Total Land" value={`${totalLand} Acres`} />
        <StatCard icon={<Users />} label="Total Users" value={String(userCount)} />
        <StatCard icon={<Sprout />} label="Active Crops" value={String(activeCrops)} />
        <StatCard icon={<IndianRupee />} label="Revenue Projection" value={totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0'} />
      </div>

      {/* Weather preview */}
      {primaryFarm && (
        <WeatherWidget village={primaryFarm.village} pincode={primaryFarm.pincode} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{taskStats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending Tasks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{taskStats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed Tasks</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No farms added yet. Go to <strong>Farmers</strong> to add your first farm.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">All Farms</h2>
          {farms.map((farm: any) => (
            <div key={farm.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{farm.name}</h3>
                  <p className="text-xs text-muted-foreground">{farm.village}{farm.pincode ? ` - ${farm.pincode}` : ''} · {farm.total_land} acres · {farm.crop || 'No crop set'}</p>
                </div>
                {farm.crop_health_score > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${farm.crop_health_score >= 80 ? 'bg-primary/10 text-primary' : farm.crop_health_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-destructive/10 text-destructive'}`}>
                    Health: {farm.crop_health_score}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg btn-gradient flex items-center justify-center text-primary-foreground shrink-0">{icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
