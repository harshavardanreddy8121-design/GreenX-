import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WorkerManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState('');
  const [workerId, setWorkerId] = useState('');

  const { data: farms = [] } = useQuery({
    queryKey: ['wm-farms', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const assign = await javaApi.select('farm_assignments', { eq: { user_id: user?.id, role: 'fieldmanager' } });
      const rows = assign.success && assign.data ? (assign.data as any[]) : [];
      const farmRows = await Promise.all(rows.map((r: any) => javaApi.select('farms', { eq: { id: r.farm_id } })));
      return farmRows.filter((r: any) => r.success && r.data && (r.data as any[]).length > 0).map((r: any) => (r.data as any[])[0]);
    },
  });

  const { data: workers = [] } = useQuery({
    queryKey: ['wm-workers'],
    queryFn: async () => {
      const roles = await javaApi.select('user_roles', { eq: { role: 'worker' } });
      const rows = roles.success && roles.data ? (roles.data as any[]) : [];
      const profiles = await Promise.all(rows.map((r: any) => javaApi.select('profiles', { eq: { id: r.user_id } })));
      return profiles
        .filter((r: any) => r.success && r.data && (r.data as any[]).length > 0)
        .map((r: any) => (r.data as any[])[0]);
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['wm-assignments'],
    queryFn: async () => {
      const res = await javaApi.select('farm_assignments', { eq: { role: 'worker' } });
      return res.success && res.data ? (res.data as any[]) : [];
    },
  });

  const assignWorker = useMutation({
    mutationFn: async () => {
      const selectedFarm = farmId || farms[0]?.id;
      if (!selectedFarm || !workerId) throw new Error('Select farm and worker');

      const res = await javaApi.insert('farm_assignments', {
        id: crypto.randomUUID(),
        farm_id: selectedFarm,
        user_id: workerId,
        role: 'worker',
        created_at: new Date().toISOString(),
      });
      if (!res.success) throw new Error(res.error || 'Failed to assign worker');
    },
    onSuccess: () => {
      toast.success('Worker assigned');
      setWorkerId('');
      queryClient.invalidateQueries({ queryKey: ['wm-assignments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to assign worker'),
  });

  return (
    <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Worker Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign workers to farms and track allocation</p>
        </div>

        <Card className="p-4">
          <div className="grid md:grid-cols-3 gap-3">
            <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
            </select>
            <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="">Select worker</option>
              {workers.map((w: any) => <option key={w.id} value={w.id}>{w.full_name || w.email || w.id}</option>)}
            </select>
            <Button onClick={() => assignWorker.mutate()} disabled={assignWorker.isPending}>Assign Worker</Button>
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-semibold mb-3">Current Worker Assignments</p>
          <div className="space-y-2">
            {assignments.map((a: any) => (
              <div key={a.id} className="p-3 border rounded-lg flex items-center justify-between text-sm">
                <span>Farm: {a.farm_id}</span>
                <span className="text-muted-foreground">Worker: {a.user_id}</span>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No worker assignments yet.</p>}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
