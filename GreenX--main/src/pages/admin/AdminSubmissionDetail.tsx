import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { admin } from '@/lib/api';
import { AlertTriangle, ArrowLeft, FlaskConical } from 'lucide-react';

export default function AdminSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: submissions = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-submissions-list'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
  });

  const submission = submissions.find((s: any) => s.id === id);

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
          <strong>Failed to load submission:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/submissions')}>Back to list</button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <FlaskConical size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Submission not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/submissions')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Submissions
        </button>
      </div>
    );
  }

  const s = submission as any;
  const statusClass = (st: string) => {
    if (st === 'COMPLETED') return 'gx-status gx-s-done';
    if (st === 'TESTING' || st === 'AT_LAB') return 'gx-status gx-s-pending';
    return 'gx-status';
  };

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/submissions')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Submissions
          </button>
          <div>
            <div className="gx-page-title"><FlaskConical className="inline-block w-4 h-4 mr-1 align-middle" /> Submission Detail</div>
            <div className="gx-page-sub">Sample Code: {s.sampleCode || s.id}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><FlaskConical className="inline-block w-4 h-4 mr-1 align-middle" /> Sample Information</div>
            <span className={statusClass((s.status || '').toUpperCase())}>{s.status || '—'}</span>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Sample Code</span><span className="gx-metric-value"><code>{s.sampleCode || '—'}</code></span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Farm ID</span><span className="gx-metric-value">
              <span style={{ cursor: 'pointer', color: 'var(--gx-green)' }} onClick={() => navigate(`/admin/farms/${s.farmId}`)}>{s.farmId || '—'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Collected By</span><span className="gx-metric-value">{s.collectorName || s.collectedBy || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Assigned Expert</span><span className="gx-metric-value">{s.assignedExpertId || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Priority</span><span className="gx-metric-value">
              <span className={s.priority === 'HIGH' ? 'gx-status gx-s-alert' : 'gx-status gx-s-done'}>{s.priority || 'Normal'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Sample Points</span><span className="gx-metric-value">{s.numPoints ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Sampling Method</span><span className="gx-metric-value">{s.samplingMethod || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Depth (cm)</span><span className="gx-metric-value">{s.depthCm ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Soil Texture</span><span className="gx-metric-value">{s.soilTexture || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">GPS</span><span className="gx-metric-value">{s.gpsCoordinates || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Collection Date</span><span className="gx-metric-value">{s.collectionDate ? new Date(s.collectionDate).toLocaleDateString() : '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Created</span><span className="gx-metric-value">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        {s.collectionNotes && (
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title">Collection Notes</div>
            </div>
            <div className="gx-card-body">
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{s.collectionNotes}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
