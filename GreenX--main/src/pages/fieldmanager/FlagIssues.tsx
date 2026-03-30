import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function FlagIssues() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [issue, setIssue] = useState('');

  const { data: farms = [] } = useQuery({
    queryKey: ['fi-farms', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const assign = await javaApi.select('farm_assignments', { eq: { user_id: user?.id, role: 'fieldmanager' } });
      const rows = assign.success && assign.data ? (assign.data as any[]) : [];
      const farmRows = await Promise.all(rows.map((r: any) => javaApi.select('farms', { eq: { id: r.farm_id } })));
      return farmRows.filter((r: any) => r.success && r.data && (r.data as any[]).length > 0).map((r: any) => (r.data as any[])[0]);
    },
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['flagged-issues', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await javaApi.select('farm_timeline', { eq: { event_type: 'issue_flagged' }, order: { field: 'created_at', ascending: false } });
      return res.success && res.data ? (res.data as any[]) : [];
    },
  });

  const flagIssue = useMutation({
    mutationFn: async () => {
      const selectedFarm = farmId || farms[0]?.id;
      if (!selectedFarm || !issue.trim()) throw new Error('Select farm and enter issue');

      const res = await javaApi.insert('farm_timeline', {
        id: crypto.randomUUID(),
        farm_id: selectedFarm,
        event_type: 'issue_flagged',
        event_title: `Issue (${severity})`,
        event_description: issue.trim(),
        user_id: user?.id,
        user_role: 'fieldmanager',
        created_at: new Date().toISOString(),
      });
      if (!res.success) throw new Error(res.error || 'Failed to flag issue');

      await emitWorkflowTrigger({
        farmId: selectedFarm,
        eventKey: 'pest_flagged',
        triggeredBy: 'fieldmanager',
        note: `Field manager flagged ${severity} issue: ${issue.trim()}`,
      });
    },
    onSuccess: () => {
      toast.success('Issue flagged and shared to dashboard');
      setIssue('');
      queryClient.invalidateQueries({ queryKey: ['flagged-issues'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to flag issue'),
  });

  return (
    <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flag Issues</h1>
          <p className="text-sm text-muted-foreground mt-1">Raise pest, disease, and urgent field alerts for expert review</p>
        </div>

        <Card className="p-4">
          <div className="grid md:grid-cols-4 gap-3">
            <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
            </select>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Describe issue" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <Button onClick={() => flagIssue.mutate()} disabled={flagIssue.isPending}>Flag Issue</Button>
          </div>
        </Card>

        <div className="space-y-3">
          {issues.map((item: any) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-1 text-amber-500" />
                <div>
                  <p className="font-medium">{item.event_title || 'Issue'}</p>
                  <p className="text-sm text-muted-foreground">{item.event_description || 'No description'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Farm: {item.farm_id} · {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </Card>
          ))}
          {issues.length === 0 && <Card className="p-6 text-center text-muted-foreground">No flagged issues yet</Card>}
        </div>
      </div>
    </DashboardShell>
  );
}
