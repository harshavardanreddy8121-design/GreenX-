import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { Card } from '@/components/ui/card';
import { MapPin, Sprout, Users, Calendar, TrendingUp } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';

export default function MyFarms() {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['my-farms', user?.id],
    queryFn: async () => {
      const ownedResponse = await javaApi.select('farms', { eq: { owner_id: user?.id } });
      const owned = ownedResponse.success && ownedResponse.data ? ownedResponse.data as any[] : [];

      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'landowner' }
      });
      const assignments = assignResponse.success && assignResponse.data ? assignResponse.data as any[] : [];

      const assignedFarmResults = await Promise.all(
        assignments.map((a: any) => javaApi.select('farms', { eq: { id: a.farm_id } }))
      );
      const assigned = assignedFarmResults
        .filter((r) => r.success && r.data && (r.data as any[]).length > 0)
        .map((r) => (r.data as any[])[0]);

      const allFarms = [...owned, ...assigned];
      const uniqueFarms = Array.from(new Map(allFarms.map(f => [f.id, f])).values());

      return uniqueFarms;
    },
    enabled: !!user?.id,
  });

  const selectedFarm = farms.find((f: any) => f.id === selectedFarmId) || farms[0];

  return (
    <DashboardShell menuItems={landownerMenuItems} role="Landowner">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Farms</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage your registered farmlands</p>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></Card>
      ) : farms.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No farms registered yet</Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {farms.map((farm: any) => (
              <Card
                key={farm.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedFarm?.id === farm.id ? 'border-2 border-primary' : ''}`}
                onClick={() => setSelectedFarmId(farm.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{farm.name || `Farm ${farm.farm_code}`}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {farm.village}, {farm.district}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-900">{farm.acres} acres</span>
                      <span className="text-xs text-muted-foreground">Code: {farm.farm_code}</span>
                    </div>
                  </div>
                  <Sprout className="w-10 h-10 text-emerald-600 opacity-20" />
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedFarm && (
              <>
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-950 dark:to-lime-950 border-emerald-200">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{selectedFarm.name || `Farm ${selectedFarm.farm_code}`}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Location</p>
                      <p className="text-foreground">{selectedFarm.village}, {selectedFarm.district}, {selectedFarm.state}</p>
                      <p className="text-sm text-muted-foreground">PIN: {selectedFarm.pincode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Size</p>
                      <p className="text-2xl font-bold text-emerald-600">{selectedFarm.acres} acres</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Farm Code</p>
                      <p className="text-foreground font-mono">{selectedFarm.farm_code}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Status</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-900">
                        ✅ Active
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Season Status</p>
                    <p className="text-lg font-bold text-foreground">Active</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <Users className="w-8 h-8 text-amber-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Assigned Team</p>
                    <p className="text-lg font-bold text-foreground">3 Members</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm text-muted-foreground">This Season</p>
                    <p className="text-lg font-bold text-foreground">Growing</p>
                  </Card>
                </div>

                {selectedFarm.pincode && <WeatherWidget pincode={selectedFarm.pincode} village={selectedFarm.village || ''} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </DashboardShell>
  );
}
