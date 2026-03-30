import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';

export default function LabResults() {
  const { user } = useAuth();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['expert-lab-results', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await javaApi.select('farm_details', { eq: { tested_by: user?.id }, order: { field: 'tested_at', ascending: false } });
      return res.success && res.data ? (res.data as any[]) : [];
    },
  });

  return (
    <DashboardShell menuItems={expertMenuItems} role="Expert">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lab Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Recently uploaded soil analysis reports</p>
        </div>

        {isLoading ? (
          <Card className="p-6 text-center">Loading lab results...</Card>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No lab results uploaded yet</Card>
        ) : (
          <div className="space-y-3">
            {rows.map((row: any) => (
              <Card key={row.id} className="p-4">
                <p className="font-semibold text-foreground">Farm ID: {row.farm_id}</p>
                <p className="text-sm text-muted-foreground mt-1">pH {row.soil_ph || 'N/A'} | N {row.soil_nitrogen || 'N/A'} | P {row.soil_phosphorus || 'N/A'} | K {row.soil_potassium || 'N/A'}</p>
                <p className="text-sm text-muted-foreground mt-1">{row.recommendations || 'No recommendation text'}</p>
                <p className="text-xs text-muted-foreground mt-2">{row.tested_at ? new Date(row.tested_at).toLocaleString() : 'N/A'}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
