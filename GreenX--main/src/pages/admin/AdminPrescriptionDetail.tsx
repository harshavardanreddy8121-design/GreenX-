import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { expert } from '@/lib/api';
import { AlertTriangle, ArrowLeft, ClipboardList } from 'lucide-react';

export default function AdminPrescriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: prescriptions = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-prescriptions-list'],
    queryFn: () => expert.getMyPrescriptions(),
    retry: 2,
  });

  const prescription = prescriptions.find((p: any) => p.id === id);

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
          <strong>Failed to load prescription:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/prescriptions')}>Back to list</button>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <ClipboardList size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Prescription not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/prescriptions')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Prescriptions
        </button>
      </div>
    );
  }

  const p = prescription as any;
  const status = p.isacknowledged ? 'APPLIED' : 'PENDING';

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/prescriptions')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Prescriptions
          </button>
          <div>
            <div className="gx-page-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> {p.chemicalName || 'Prescription Detail'}</div>
            <div className="gx-page-sub">Prescription ID: {p.id}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Prescription Details</div>
            <span className={status === 'APPLIED' ? 'gx-status gx-s-done' : 'gx-status gx-s-pending'}>{status}</span>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Chemical Name</span><span className="gx-metric-value" style={{ fontWeight: 600 }}>{p.chemicalName || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Chemical Type</span><span className="gx-metric-value">{p.chemicalType || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Dose</span><span className="gx-metric-value">{p.dose || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Dilution Ratio</span><span className="gx-metric-value">{p.dilutionRatio || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Application Method</span><span className="gx-metric-value">{p.applicationMethod || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Application Timing</span><span className="gx-metric-value">{p.applicationTiming || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Pre-Harvest Interval</span><span className="gx-metric-value">{p.preHarvestInterval || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Alert ID</span><span className="gx-metric-value">
              <span style={{ cursor: 'pointer', color: 'var(--gx-green)' }} onClick={() => navigate(`/admin/pest-alerts/${p.alertId}`)}>{p.alertId?.slice(0, 12) || '—'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Expert ID</span><span className="gx-metric-value">{p.expertId?.slice(0, 12) || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Acknowledged</span><span className="gx-metric-value">{p.isacknowledged ? 'Yes' : 'No'}</span></div>
            {p.acknowledgedAt && (
              <div className="gx-metric-row"><span className="gx-metric-label">Acknowledged At</span><span className="gx-metric-value">{new Date(p.acknowledgedAt).toLocaleDateString()}</span></div>
            )}
            <div className="gx-metric-row"><span className="gx-metric-label">Issued On</span><span className="gx-metric-value">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        {(p.safetyPrecautions || p.fmInstructions) && (
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title">Instructions & Safety</div>
            </div>
            <div className="gx-card-body">
              {p.fmInstructions && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Field Manager Instructions</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{p.fmInstructions}</p>
                </div>
              )}
              {p.safetyPrecautions && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Safety Precautions</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{p.safetyPrecautions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
