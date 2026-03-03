import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { GreenXLogo } from '@/components/GreenXLogo';
import WeatherWidget from '@/components/WeatherWidget';
import { LogOut, Sprout, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LandownerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [farmIndex, setFarmIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'soil' | 'timeline'>('overview');

  const handleLogout = () => { logout(); navigate('/'); };

  // Get farms assigned to this landowner
  const { data: myFarms = [], isLoading } = useQuery({
    queryKey: ['landowner-farms', user?.id],
    queryFn: async () => {
      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'landowner' }
      });
      if (!assignResponse.success || !assignResponse.data) return [];
      const assignments = assignResponse.data as any[];
      if (!assignments?.length) return [];
      const farmIds = assignments.map((a: any) => a.farm_id);
      const farmsResponse = await javaApi.select('farms', {
        in: { id: farmIds }
      });
      return farmsResponse.success && farmsResponse.data ? farmsResponse.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  // Get assigned workers for current farm
  const farm = myFarms[farmIndex];
  const { data: assignedWorkers = [] } = useQuery({
    queryKey: ['landowner-workers', farm?.id],
    queryFn: async () => {
      if (!farm) return [];
      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { farm_id: farm.id, role: 'worker' }
      });
      if (!assignResponse.success || !assignResponse.data) return [];
      const assignments = assignResponse.data as any[];
      if (!assignments?.length) return [];
      const ids = assignments.map((a: any) => a.user_id);
      const profileResponse = await javaApi.select('profiles', {
        in: { id: ids }
      });
      return profileResponse.success && profileResponse.data ? profileResponse.data as any[] : [];
    },
    enabled: !!farm?.id,
  });

  const handlePrev = () => { setFarmIndex(i => Math.max(0, i - 1)); setActiveTab('overview'); };
  const handleNext = () => { setFarmIndex(i => Math.min(myFarms.length - 1, i + 1)); setActiveTab('overview'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <GreenXLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{profile?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors"><LogOut className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : myFarms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No farms assigned to your account yet.</p>
            <p className="text-xs mt-1">Contact your administrator to get access.</p>
          </div>
        ) : (
          <>
            {/* Farm Navigation */}
            <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
              <button onClick={handlePrev} disabled={farmIndex === 0}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="text-center flex-1">
                <h2 className="text-lg font-bold text-foreground">{farm?.name}</h2>
                <p className="text-xs text-muted-foreground">{farm?.village} · {farm?.crop || '—'} · {farm?.growth_stage || '—'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Farm {farmIndex + 1} of {myFarms.length}</p>
              </div>
              <button onClick={handleNext} disabled={farmIndex === myFarms.length - 1}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Weather */}
            {farm && <WeatherWidget village={farm.village} pincode={farm.pincode} compact />}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard icon={<MapPin className="w-5 h-5" />} label="Land" value={`${farm?.total_land || 0} Acres`} />
              <SummaryCard icon={<Sprout className="w-5 h-5" />} label="Health" value={`${farm?.crop_health_score || 0}/100`} />
              <SummaryCard icon={<User className="w-5 h-5" />} label="Revenue" value={farm?.expected_revenue > 0 ? `₹${(farm.expected_revenue / 1000).toFixed(0)}K` : '—'} />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(['overview', 'soil'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Total Land" value={`${farm?.total_land || 0} Acres`} />
                  <InfoRow label="Expected Revenue" value={farm?.expected_revenue > 0 ? `₹${(farm.expected_revenue / 1000).toFixed(0)}K` : '—'} />
                  <InfoRow label="Profit Share" value={farm?.profit_share > 0 ? `${farm.profit_share}%` : '—'} />
                  <InfoRow label="Growth Stage" value={farm?.growth_stage || '—'} />
                </div>
                {farm?.contract_summary && (
                  <p className="text-xs text-muted-foreground">{farm.contract_summary}</p>
                )}

                {assignedWorkers.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Assigned Workers</p>
                    {assignedWorkers.map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="text-sm text-foreground">{w.full_name}</p>
                        {w.phone && <span className="text-xs text-primary">{w.phone}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'soil' && (
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="pH" value={String(farm?.soil_ph || '—')} />
                  <InfoRow label="Nitrogen (kg/ha)" value={String(farm?.soil_nitrogen || '—')} />
                  <InfoRow label="Phosphorus (kg/ha)" value={String(farm?.soil_phosphorus || '—')} />
                  <InfoRow label="Potassium (kg/ha)" value={String(farm?.soil_potassium || '—')} />
                  <InfoRow label="Organic Carbon (%)" value={String(farm?.soil_organic_carbon || '—')} />
                  <InfoRow label="Moisture (%)" value={String(farm?.soil_moisture || '—')} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center space-y-1">
      <div className="flex justify-center text-primary">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
