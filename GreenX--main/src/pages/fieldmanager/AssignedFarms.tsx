import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function AssignedFarms() {
  const { user } = useAuth();

  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['fieldmanager-assigned-farms', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const assignments = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'fieldmanager' },
      });
      const rows = assignments.success && assignments.data ? (assignments.data as any[]) : [];

      if (!rows.length) {
        const fallback = await javaApi.select('farms', {});
        return fallback.success && fallback.data ? (fallback.data as any[]) : [];
      }

      const farms = await Promise.all(rows.map((r: any) => javaApi.select('farms', { eq: { id: r.farm_id } })));
      return farms
        .filter((r: any) => r.success && r.data && (r.data as any[]).length > 0)
        .map((r: any) => (r.data as any[])[0]);
    },
  });

  return (
    <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Assigned Farms</h1>
          <p className="text-sm text-muted-foreground mt-1">Farms currently assigned to your operational queue</p>
        </div>

        {isLoading ? (
          <Card className="p-6 text-center">Loading farms...</Card>
        ) : farms.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No farms assigned yet</Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {farms.map((farm: any) => (
              <Card key={farm.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{farm.name || farm.farm_code}</p>
                    <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{farm.village}, {farm.district}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-900">Active</span>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Farm Code: {farm.farm_code || 'N/A'}</p>
                  <p>Area: {farm.acres || farm.total_land || 'N/A'} acres</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
