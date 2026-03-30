import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PestAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState('');
  const [risk, setRisk] = useState('medium');
  const [notes, setNotes] = useState('');

  const { data: farms = [] } = useQuery({
    queryKey: ['pa-farms'],
    queryFn: async () => {
      const res = await javaApi.select('farms', {});
      return res.success && res.data ? (res.data as any[]) : [];
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['pest-alerts-list'],
    queryFn: async () => {
      const res = await javaApi.select('diagnostics', { order: { field: 'created_at', ascending: false } });
      return res.success && res.data ? (res.data as any[]) : [];
    },
  });

  const raiseAlert = useMutation({
    mutationFn: async () => {
      const selectedFarm = farmId || farms[0]?.id;
      if (!selectedFarm || !notes.trim()) throw new Error('Select farm and enter alert details');

      const res = await javaApi.insert('diagnostics', {
        id: crypto.randomUUID(),
        farm_id: selectedFarm,
        expert_id: user?.id,
        pest_risk: risk,
        disease_risk: risk,
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      });
      if (!res.success) throw new Error(res.error || 'Failed to raise alert');
    },
    onSuccess: () => {
      toast.success('Pest alert created');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['pest-alerts-list'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to raise alert'),
  });

  return (
    <DashboardShell menuItems={expertMenuItems} role="Expert">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pest/Disease Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and raise disease or infestation alerts</p>
        </div>

        <Card className="p-4">
          <div className="grid md:grid-cols-4 gap-3">
            <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
            </select>
            <select value={risk} onChange={(e) => setRisk(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alert notes" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <Button onClick={() => raiseAlert.mutate()} disabled={raiseAlert.isPending}>Raise Alert</Button>
          </div>
        </Card>

        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <Card key={alert.id} className="p-4">
              <p className="font-medium">Farm {alert.farm_id} - Pest: {alert.pest_risk || 'N/A'} / Disease: {alert.disease_risk || 'N/A'}</p>
              <p className="text-sm text-muted-foreground mt-1">{alert.notes || alert.prescription || 'No notes'}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
