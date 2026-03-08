import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { Map } from 'lucide-react';

export default function AdminLand() {
  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? response.data as any[] : [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Land Management</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No land registered yet. Add farms via the Farmers page.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{farms.reduce((s: number, f: any) => s + (f.total_land || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Total Acres</p>
            </div>
            <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{farms.length}</p>
              <p className="text-xs text-muted-foreground">Total Farms</p>
            </div>
            <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{new Set(farms.map((f: any) => f.village).filter(Boolean)).size}</p>
              <p className="text-xs text-muted-foreground">Villages</p>
            </div>
            <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-health p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{new Set(farms.map((f: any) => f.crop).filter(Boolean)).size}</p>
              <p className="text-xs text-muted-foreground">Crop Types</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {farms.map((farm: any) => (
              <div key={farm.id} className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 text-center space-y-1">
                <p className="text-sm font-bold text-foreground">{farm.name}</p>
                <p className="text-xs text-muted-foreground">{farm.village}</p>
                <p className="text-sm font-semibold text-primary">{farm.total_land} Acres</p>
                <p className="text-xs text-muted-foreground">{farm.crop || 'No crop'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
