import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { admin, expert } from '@/lib/api';
import { AlertTriangle, ArrowLeft, Bug, Edit, MapPin, TestTubes, Tractor, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFarmDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: farms = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-farms-list'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-pest-alerts-list'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-soil-reports-list'],
    queryFn: () => expert.getMyReports(),
    retry: 2,
  });

  const { data: managers = [] } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  const { data: expertList = [] } = useQuery({
    queryKey: ['admin-expert-list'],
    queryFn: () => admin.getExperts(),
    retry: 2,
  });

  const deleteFarm = useMutation({
    mutationFn: (farmId: string) => admin.deleteFarm(farmId),
    onSuccess: () => {
      toast.success('Farm deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-farms-list'] });
      navigate('/admin/farms');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete farm'),
  });

  const farm = farms.find((f: any) => f.id === id);
  const farmAlerts = alerts.filter((a: any) => a.farmId === id);
  const farmReports = reports.filter((r: any) => r.farmId === id);
  const assignedManager = managers.find((m: any) => m.id === farm?.fieldManagerId);
  const assignedExpert = expertList.find((e: any) => e.id === farm?.expertId);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="gx-alert-box gx-alert-red" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={18} />
        <div style={{ flex: 1 }}>
          <strong>Failed to load farm:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/farms')}>Back to list</button>
      </div>
    );
  }

  if (!farm) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <Tractor size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Farm not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/farms')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Farms
        </button>
      </div>
    );
  }

  const statusClass = (s: string) => {
    if (s === 'ACTIVE') return 'gx-status gx-s-done';
    if (s === 'REGISTERED') return 'gx-status gx-s-pending';
    return 'gx-status gx-s-alert';
  };

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/farms')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Farms
          </button>
          <div>
            <div className="gx-page-title"><Tractor className="inline-block w-4 h-4 mr-1 align-middle" /> {farm.name || farm.farmCode || 'Farm Detail'}</div>
            <div className="gx-page-sub">Farm ID: {farm.id}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => toast.info('Edit functionality coming soon')}
          >
            <Edit size={14} /> Edit
          </button>
          <button
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gx-red)' }}
            disabled={deleteFarm.isPending}
            onClick={() => {
              if (confirm(`Delete farm "${farm.name || farm.farmCode}"? This cannot be undone.`)) {
                deleteFarm.mutate(farm.id);
              }
            }}
          >
            <Trash2 size={14} /> {deleteFarm.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Farm Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><Tractor className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Information</div>
            <span className={statusClass((farm.status || '').toUpperCase())}>{farm.status || 'UNKNOWN'}</span>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Farm Name</span><span className="gx-metric-value">{farm.name || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Farm Code</span><span className="gx-metric-value"><code>{farm.farmCode || '—'}</code></span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Total Land</span><span className="gx-metric-value">{farm.totalLand ? `${farm.totalLand} acres` : '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Soil Type</span><span className="gx-metric-value">{farm.soilType || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Water Source</span><span className="gx-metric-value">{farm.waterSource || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Current Crop</span><span className="gx-metric-value">{farm.currentCrop || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Crop Stage</span><span className="gx-metric-value">{farm.currentStage || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Health Score</span><span className="gx-metric-value">{farm.cropHealthScore ?? '—'}</span></div>
          </div>
        </div>

        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><MapPin className="inline-block w-4 h-4 mr-1 align-middle" /> Location</div>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Village</span><span className="gx-metric-value">{farm.village || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">District</span><span className="gx-metric-value">{farm.district || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">State</span><span className="gx-metric-value">{farm.state || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Pincode</span><span className="gx-metric-value">{farm.pincode || '—'}</span></div>
          </div>
        </div>

        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><User className="inline-block w-4 h-4 mr-1 align-middle" /> Assigned Team</div>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row">
              <span className="gx-metric-label">Expert</span>
              <span className="gx-metric-value">{assignedExpert ? (assignedExpert as any).name || (assignedExpert as any).email : farm.expertId ? `ID: ${farm.expertId.slice(0, 8)}` : '—'}</span>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label">Field Manager</span>
              <span className="gx-metric-value">{assignedManager ? (assignedManager as any).name || (assignedManager as any).email : farm.fieldManagerId ? `ID: ${farm.fieldManagerId.slice(0, 8)}` : '—'}</span>
            </div>
            <div className="gx-metric-row"><span className="gx-metric-label">Owner ID</span><span className="gx-metric-value"><code style={{ fontSize: 11 }}>{farm.ownerId?.slice(0, 12) || '—'}</code></span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Cluster ID</span><span className="gx-metric-value"><code style={{ fontSize: 11 }}>{farm.clusterId?.slice(0, 12) || '—'}</code></span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Registered</span><span className="gx-metric-value">{farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>
      </div>

      {/* Soil Reports */}
      <div className="gx-section-divider"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Reports ({farmReports.length})</div>
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-body">
          {farmReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>No soil reports for this farm.</div>
          ) : (
            <table className="gx-data-table">
              <thead>
                <tr><th>#</th><th>Report ID</th><th>pH</th><th>Rating</th><th>Date</th></tr>
              </thead>
              <tbody>
                {farmReports.map((r: any, i: number) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/soil-reports/${r.id}`)} className="hover:bg-muted/30">
                    <td>{i + 1}</td>
                    <td><code style={{ fontSize: 11 }}>{r.id?.slice(0, 8)}</code></td>
                    <td>{r.phLevel ?? '—'}</td>
                    <td>{r.overallRating || '—'}</td>
                    <td style={{ fontSize: 12, opacity: 0.7 }}>{r.reportDate ? new Date(r.reportDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pest Alerts */}
      <div className="gx-section-divider"><Bug className="inline-block w-4 h-4 mr-1 align-middle" /> Pest Alerts ({farmAlerts.length})</div>
      <div className="gx-card">
        <div className="gx-card-body">
          {farmAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>No pest alerts for this farm.</div>
          ) : (
            <table className="gx-data-table">
              <thead>
                <tr><th>#</th><th>Alert ID</th><th>Pest</th><th>Severity</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {farmAlerts.map((a: any, i: number) => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/pest-alerts/${a.id}`)} className="hover:bg-muted/30">
                    <td>{i + 1}</td>
                    <td><code style={{ fontSize: 11 }}>{a.id?.slice(0, 8)}</code></td>
                    <td>{a.pestName || '—'}</td>
                    <td><span className={a.severity === 'HIGH' ? 'gx-status gx-s-alert' : 'gx-status gx-s-pending'}>{a.severity || '—'}</span></td>
                    <td><span className={(a.status || '').toUpperCase() === 'RESOLVED' ? 'gx-status gx-s-done' : 'gx-status gx-s-alert'}>{a.status || 'ACTIVE'}</span></td>
                    <td style={{ fontSize: 12, opacity: 0.7 }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
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
