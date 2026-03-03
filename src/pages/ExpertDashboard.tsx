import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { GreenXLogo } from '@/components/GreenXLogo';
import WeatherWidget from '@/components/WeatherWidget';
import { LogOut, FlaskConical, ChevronDown, ChevronUp, Send, Sprout } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpertDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedFarm, setExpandedFarm] = useState<string | null>(null);
  const [prescription, setPrescription] = useState('');
  const [pestRisk, setPestRisk] = useState('low');
  const [diseaseRisk, setDiseaseRisk] = useState('low');
  const [notes, setNotes] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // Get farms assigned to this expert
  const { data: myFarms = [] } = useQuery({
    queryKey: ['expert-farms', user?.id],
    queryFn: async () => {
      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'expert' }
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

  // Get my diagnostics
  const { data: myDiagnostics = [] } = useQuery({
    queryKey: ['expert-diagnostics', user?.id],
    queryFn: async () => {
      const response = await javaApi.select('diagnostics', {
        eq: { expert_id: user?.id },
        order: { field: 'created_at', ascending: false }
      });
      return response.success && response.data ? response.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  const submitDiagnostic = useMutation({
    mutationFn: async (farmId: string) => {
      const response = await javaApi.insert('diagnostics', {
        farm_id: farmId,
        expert_id: user?.id,
        pest_risk: pestRisk,
        disease_risk: diseaseRisk,
        prescription,
        notes,
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      toast.success('Diagnostic report submitted');
      queryClient.invalidateQueries({ queryKey: ['expert-diagnostics'] });
      setPrescription('');
      setPestRisk('low');
      setDiseaseRisk('low');
      setNotes('');
      setExpandedFarm(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <GreenXLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{profile?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted"><LogOut className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
        {/* Weather */}
        {myFarms.length > 0 && <WeatherWidget village={myFarms[0].village} pincode={myFarms[0].pincode} compact />}

        <h2 className="text-lg font-semibold text-foreground">Crop Diagnostics</h2>

        {myFarms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No farms assigned to you yet.</p>
            <p className="text-xs mt-1">Ask your admin to assign farms for diagnostics.</p>
          </div>
        ) : (
          myFarms.map((farm: any) => {
            const isExpanded = expandedFarm === farm.id;
            return (
              <div key={farm.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedFarm(isExpanded ? null : farm.id)} className="w-full p-4 flex items-center justify-between text-left">
                  <div>
                    <h3 className="font-semibold text-foreground">{farm.name} — {farm.crop || 'No crop'}</h3>
                    <p className="text-xs text-muted-foreground">{farm.village} · {farm.total_land} acres</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" /> Soil Data</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">pH:</span> <span className="font-medium">{farm.soil_ph || '—'}</span></div>
                        <div><span className="text-muted-foreground">N:</span> <span className="font-medium">{farm.soil_nitrogen || '—'}</span></div>
                        <div><span className="text-muted-foreground">P:</span> <span className="font-medium">{farm.soil_phosphorus || '—'}</span></div>
                        <div><span className="text-muted-foreground">K:</span> <span className="font-medium">{farm.soil_potassium || '—'}</span></div>
                        <div><span className="text-muted-foreground">OC:</span> <span className="font-medium">{farm.soil_organic_carbon || '—'}</span></div>
                        <div><span className="text-muted-foreground">Moisture:</span> <span className="font-medium">{farm.soil_moisture || '—'}%</span></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-medium text-foreground">Submit Diagnostic Report</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Pest Risk</label>
                          <select value={pestRisk} onChange={e => setPestRisk(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Disease Risk</label>
                          <select value={diseaseRisk} onChange={e => setDiseaseRisk(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <textarea value={prescription} onChange={e => setPrescription(e.target.value)} rows={3}
                        placeholder="Prescription / Recommendations..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                        placeholder="Additional notes..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
                      <button onClick={() => submitDiagnostic.mutate(farm.id)} disabled={submitDiagnostic.isPending}
                        className="w-full py-2.5 rounded-lg btn-gradient text-primary-foreground text-sm font-medium disabled:opacity-50">
                        <Send className="w-4 h-4 inline mr-2" /> {submitDiagnostic.isPending ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Previous Reports */}
        {myDiagnostics.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-foreground pt-2">Previous Reports</h2>
            {myDiagnostics.map((d: any) => (
              <div key={d.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground text-sm">{d.farms?.name}</h3>
                  <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 text-xs mb-2">
                  <span className={`px-2 py-0.5 rounded ${d.pest_risk === 'high' ? 'bg-destructive/10 text-destructive' : d.pest_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>Pest: {d.pest_risk}</span>
                  <span className={`px-2 py-0.5 rounded ${d.disease_risk === 'high' ? 'bg-destructive/10 text-destructive' : d.disease_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>Disease: {d.disease_risk}</span>
                </div>
                {d.prescription && <p className="text-xs text-foreground">{d.prescription}</p>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
