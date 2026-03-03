import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { DollarSign } from 'lucide-react';

export default function AdminFinance() {
  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? response.data as any[] : [];
    },
  });

  const totalRevenue = farms.reduce((s: number, f: any) => s + (f.expected_revenue || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Finance</h1>

      {farms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No financial data yet. Add farms to see revenue projections.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">₹{(totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">Total Expected Revenue</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{farms.length}</p>
              <p className="text-xs text-muted-foreground">Active Farms</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{farms.reduce((s: number, f: any) => s + (f.total_land || 0), 0)} Ac</p>
              <p className="text-xs text-muted-foreground">Total Land</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Revenue by Farm</h3>
            <div className="space-y-2">
              {farms.map((f: any) => (
                <div key={f.name} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.crop || '—'} · {f.total_land} acres</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₹{((f.expected_revenue || 0) / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
