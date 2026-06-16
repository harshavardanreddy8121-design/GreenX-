import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { admin, expert } from '@/lib/api';
import { AlertTriangle, ArrowLeft, Bug, ClipboardList } from 'lucide-react';

export default function AdminPestAlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: alerts = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-pest-alerts-list'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['admin-prescriptions-list'],
    queryFn: () => expert.getMyPrescriptions(),
    retry: 2,
  });

  const alert = alerts.find((a: any) => a.id === id);
  const alertPrescriptions = prescriptions.filter((p: any) => p.alertId === id);

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
          <strong>Failed to load pest alert:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/pest-alerts')}>Back to list</button>
      </div>
    );
  }

  if (!alert) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <Bug size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pest alert not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/pest-alerts')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Pest Alerts
        </button>
      </div>
    );
  }

  const a = alert as any;
  const isResolved = (a.status || '').toUpperCase() === 'RESOLVED';

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/pest-alerts')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Pest Alerts
          </button>
          <div>
            <div className="gx-page-title"><Bug className="inline-block w-4 h-4 mr-1 align-middle" /> {a.pestName || 'Pest Alert'}</div>
            <div className="gx-page-sub">Alert ID: {a.id}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><Bug className="inline-block w-4 h-4 mr-1 align-middle" /> Alert Details</div>
            <span className={isResolved ? 'gx-status gx-s-done' : 'gx-status gx-s-alert'}>{a.status || 'ACTIVE'}</span>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Pest Name</span><span className="gx-metric-value" style={{ fontWeight: 600 }}>{a.pestName || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Pest Type</span><span className="gx-metric-value">{a.pestType || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Severity</span><span className="gx-metric-value">
              <span className={a.severity === 'HIGH' || a.severity === 'CRITICAL' ? 'gx-status gx-s-alert' : 'gx-status gx-s-pending'}>{a.severity || '—'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Farm ID</span><span className="gx-metric-value">
              <span style={{ cursor: 'pointer', color: 'var(--gx-green)' }} onClick={() => navigate(`/admin/farms/${a.farmId}`)}>{a.farmId || '—'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Reported By</span><span className="gx-metric-value">{a.reportedBy || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Affected Area</span><span className="gx-metric-value">{a.affectedAreaPct ? `${a.affectedAreaPct}%` : '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Field Location</span><span className="gx-metric-value">{a.fieldLocation || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Reported On</span><span className="gx-metric-value">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</span></div>
            {isResolved && (
              <div className="gx-metric-row"><span className="gx-metric-label">Resolved On</span><span className="gx-metric-value">{a.resolvedAt ? new Date(a.resolvedAt).toLocaleDateString() : '—'}</span></div>
            )}
          </div>
        </div>

        {a.description && (
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title">Description</div>
            </div>
            <div className="gx-card-body">
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{a.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prescriptions for this alert */}
      <div className="gx-section-divider"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Prescriptions ({alertPrescriptions.length})</div>
      <div className="gx-card">
        <div className="gx-card-body">
          {alertPrescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>No prescriptions issued for this alert yet.</div>
          ) : (
            <table className="gx-data-table">
              <thead>
                <tr><th>#</th><th>Prescription ID</th><th>Chemical</th><th>Method</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {alertPrescriptions.map((p: any, i: number) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/prescriptions/${p.id}`)} className="hover:bg-muted/30">
                    <td>{i + 1}</td>
                    <td><code style={{ fontSize: 11 }}>{p.id?.slice(0, 8)}</code></td>
                    <td>{p.chemicalName || '—'}</td>
                    <td>{p.applicationMethod || '—'}</td>
                    <td><span className={p.isacknowledged ? 'gx-status gx-s-done' : 'gx-status gx-s-pending'}>{p.isacknowledged ? 'APPLIED' : 'PENDING'}</span></td>
                    <td style={{ fontSize: 12, opacity: 0.7 }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
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
