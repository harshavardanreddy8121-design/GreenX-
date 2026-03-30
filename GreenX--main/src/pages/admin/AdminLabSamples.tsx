import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { BookOpen, FlaskConical, TestTubes } from 'lucide-react';
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
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const { data: experts = [] } = useQuery({
    queryKey: ['admin-lab-experts'],
    queryFn: () => admin.getExperts(),
    retry: 2,
  });

  const { data: fieldManagers = [] } = useQuery({
    queryKey: ['admin-lab-field-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  const { data: samples = [] } = useQuery({
    queryKey: ['admin-lab-samples'],
    queryFn: () => admin.getPendingSamples(),
    refetchInterval: 15000,
    retry: 2,
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
      queryClient.invalidateQueries({ queryKey: ['expert-pending-samples'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-samples'] });
      queryClient.invalidateQueries({ queryKey: ['landowner-samples'] });
      queryClient.invalidateQueries({ queryKey: ['fm-samples'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to receive sample'),
  });

  return (
    <>
      <div className="gx-page-header">
        <div className="gx-page-title">Lab & Samples <TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /></div>
        <div className="gx-page-sub">Collect, assign, and track soil samples</div>
      </div>

      <div className="gx-section-divider"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Receive & Assign Sample</div>
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-header">
          <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Sample Intake Form</div>
        </div>
        <div className="gx-card-body">
          <div className="gx-form-grid" style={{ marginBottom: 12 }}>
            <div className="gx-form-group">
              <label className="gx-label">Farm</label>
              <select value={form.farmId || farms[0]?.id || ''} onChange={(e) => setForm((prev) => ({ ...prev, farmId: e.target.value }))} className="gx-select">
                {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farmCode}</option>)}
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Collected By</label>
              <select value={form.collectedBy} onChange={(e) => setForm((prev) => ({ ...prev, collectedBy: e.target.value }))} className="gx-select">
                <option value="">Select Field Manager</option>
                {fieldManagers.map((manager: any) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Assign Expert</label>
              <select value={form.assignExpertId} onChange={(e) => setForm((prev) => ({ ...prev, assignExpertId: e.target.value }))} className="gx-select">
                <option value="">Select Expert</option>
                {experts.map((expert: any) => <option key={expert.id} value={expert.id}>{expert.name || expert.email}</option>)}
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Sample Points</label>
              <input value={form.samplePoints} onChange={(e) => setForm((prev) => ({ ...prev, samplePoints: e.target.value }))} placeholder="e.g. 5" className="gx-input" />
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))} className="gx-select">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Sample Type</label>
              <select value={form.sampleType} onChange={(e) => setForm((prev) => ({ ...prev, sampleType: e.target.value }))} className="gx-select">
                <option value="soil">Soil</option>
                <option value="water">Water</option>
                <option value="plant_tissue">Plant Tissue</option>
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Sampling Method</label>
              <select value={form.samplingMethod} onChange={(e) => setForm((prev) => ({ ...prev, samplingMethod: e.target.value }))} className="gx-select">
                <option value="zigzag">Zigzag</option>
                <option value="grid">Grid</option>
              </select>
            </div>
          </div>
          <div className="gx-form-group" style={{ marginBottom: 12 }}>
            <label className="gx-label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Additional notes" className="gx-input" />
          </div>
          <button onClick={() => receiveSample.mutate()} disabled={receiveSample.isPending} className="gx-btn gx-btn-green">
            {receiveSample.isPending ? 'Submitting...' : 'Receive & Assign Sample'}
          </button>
        </div>
      </div>

      <div className="gx-section-divider"><BookOpen className="inline-block w-4 h-4 mr-1 align-middle" /> Lab Reports Archive</div>
      <div className="gx-card">
        <div className="gx-card-header">
          <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Recent Lab Samples</div>
          <span className="gx-status gx-s-pending">{samples.length}</span>
        </div>
        <div className="gx-card-body">
          {samples.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--gx-text2)' }}>
              <FlaskConical className="w-10 h-10" style={{ margin: '0 auto 8px', opacity: 0.35 }} />
              <div>No lab samples logged yet.</div>
            </div>
          ) : (
            <table className="gx-data-table">
              <thead>
                <tr><th>Sample</th><th>Farm</th><th>Collected By</th><th>Priority</th><th>Status</th></tr>
              </thead>
              <tbody>
                {samples.slice(0, 50).map((sample: any) => (
                  <tr key={sample.id}>
                    <td>{sample.sampleCode || sample.id}</td>
                    <td>{farmById.get(sample.farmId)?.name || sample.farmId}</td>
                    <td>{userById.get(sample.collectedBy)?.name || userById.get(sample.collectedBy)?.email || sample.collectedBy}</td>
                    <td>{sample.priority || 'normal'}</td>
                    <td><span className={`gx-status ${sample.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{sample.status || 'submitted'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
