import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

const initialForm = {
  farmId: '',
  collectedBy: '',
  samplePoints: '5',
  priority: 'normal',
  assignExpertId: '',
  sampleType: 'soil',
  samplingMethod: 'zigzag',
  notes: '',
};

export default function AdminLabSamples() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-lab-farms'],
    queryFn: () => admin.getFarms().catch(() => []),
  });

  const { data: experts = [] } = useQuery({
    queryKey: ['admin-lab-experts'],
    queryFn: () => admin.getExperts().catch(() => []),
  });

  const { data: fieldManagers = [] } = useQuery({
    queryKey: ['admin-lab-field-managers'],
    queryFn: () => admin.getAvailableManagers().catch(() => []),
  });

  const { data: samples = [] } = useQuery({
    queryKey: ['admin-lab-samples'],
    queryFn: () => admin.getPendingSamples().catch(() => []),
  });

  const farmById = useMemo(() => {
    const map = new Map<string, any>();
    farms.forEach((f: any) => map.set(f.id, f));
    return map;
  }, [farms]);

  const userById = useMemo(() => {
    const map = new Map<string, any>();
    [...experts, ...fieldManagers].forEach((u: any) => map.set(u.id, u));
    return map;
  }, [experts, fieldManagers]);

  const receiveSample = useMutation({
    mutationFn: () => {
      const farmId = form.farmId || farms[0]?.id;
      if (!farmId) throw new Error('Select farm');
      if (!form.collectedBy) throw new Error('Select field manager who collected samples');
      if (!form.assignExpertId) throw new Error('Assign an expert');
      return admin.receiveSoilSample({
        farmId,
        collectedBy: form.collectedBy,
        assignedExpertId: form.assignExpertId,
        numPoints: parseInt(form.samplePoints) || 5,
        priority: form.priority,
      });
    },
    onSuccess: () => {
      toast.success('Soil sample received and assigned to expert');
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ['admin-lab-samples'] });
      queryClient.invalidateQueries({ queryKey: ['expert-soil-queue'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to receive sample'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Lab & Samples</h1>

      <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Receive Soil Sample</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <select value={form.farmId || farms[0]?.id || ''} onChange={(e) => setForm((prev) => ({ ...prev, farmId: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farmCode}</option>)}
          </select>
          <select value={form.collectedBy} onChange={(e) => setForm((prev) => ({ ...prev, collectedBy: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="">Collected By (Field Manager)</option>
            {fieldManagers.map((manager: any) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
          </select>
          <select value={form.assignExpertId} onChange={(e) => setForm((prev) => ({ ...prev, assignExpertId: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="">Assign Expert</option>
            {experts.map((expert: any) => <option key={expert.id} value={expert.id}>{expert.name || expert.email}</option>)}
          </select>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <input value={form.samplePoints} onChange={(e) => setForm((prev) => ({ ...prev, samplePoints: e.target.value }))} placeholder="Sample points" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
          <select value={form.sampleType} onChange={(e) => setForm((prev) => ({ ...prev, sampleType: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="soil">Soil</option>
            <option value="water">Water</option>
            <option value="plant_tissue">Plant Tissue</option>
          </select>
          <select value={form.samplingMethod} onChange={(e) => setForm((prev) => ({ ...prev, samplingMethod: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="zigzag">Zigzag</option>
            <option value="grid">Grid</option>
          </select>
        </div>

        <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Additional notes" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <button onClick={() => receiveSample.mutate()} disabled={receiveSample.isPending} className="dashboard-btn-primary px-4 py-2 rounded-lg text-sm">
          {receiveSample.isPending ? 'Submitting...' : 'Receive & Assign Sample'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Lab Reports Archive</h2>
        {samples.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No lab samples logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {samples.slice(0, 50).map((sample: any) => (
              <div key={sample.id} className="rounded-lg border border-border px-3 py-2 text-xs flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{sample.sampleCode || sample.id}</p>
                  <p className="text-muted-foreground">Farm: {farmById.get(sample.farmId)?.name || sample.farmId}</p>
                  <p className="text-muted-foreground">Collected by: {userById.get(sample.collectedBy)?.name || userById.get(sample.collectedBy)?.email || sample.collectedBy}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Priority: {sample.priority || 'normal'}</p>
                  <p className="text-muted-foreground">Status: {sample.status || 'submitted'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
