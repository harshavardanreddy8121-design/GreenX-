import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { CloudSun } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';

export default function AdminWeather() {
  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? response.data as any[] : [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Weather Analytics</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <CloudSun className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No farms added yet. Add farms first to see weather data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {farms.map((farm: any) => (
            <div key={farm.id} className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4">
              <p className="text-sm font-medium text-foreground mb-2">{farm.name} — {farm.village} {farm.crop ? `(${farm.crop})` : ''}</p>
              <WeatherWidget village={farm.village} pincode={farm.pincode} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
