import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { expert } from '@/lib/api';
import { AlertTriangle, ArrowLeft, TestTubes } from 'lucide-react';

export default function AdminSoilReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: reports = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-soil-reports-list'],
    queryFn: () => expert.getMyReports(),
    retry: 2,
  });

  const report = reports.find((r: any) => r.id === id);

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
          <strong>Failed to load soil report:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/soil-reports')}>Back to list</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <TestTubes size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Soil report not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/soil-reports')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Soil Reports
        </button>
      </div>
    );
  }

  const r = report as any;
  const status = r.overallRating ? 'COMPLETED' : 'PENDING';

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/soil-reports')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Soil Reports
          </button>
          <div>
            <div className="gx-page-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Report Detail</div>
            <div className="gx-page-sub">Report ID: {r.id}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Report Overview</div>
            <span className={status === 'COMPLETED' ? 'gx-status gx-s-done' : 'gx-status gx-s-pending'}>{status}</span>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">Farm ID</span><span className="gx-metric-value">
              <span style={{ cursor: 'pointer', color: 'var(--gx-green)' }} onClick={() => navigate(`/admin/farms/${r.farmId}`)}>{r.farmId || '—'}</span>
            </span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Expert ID</span><span className="gx-metric-value">{r.expertId || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Sample ID</span><span className="gx-metric-value"><code style={{ fontSize: 11 }}>{r.sampleId || '—'}</code></span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Overall Rating</span><span className="gx-metric-value">{r.overallRating || '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Report Date</span><span className="gx-metric-value">{r.reportDate ? new Date(r.reportDate).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title">Soil Nutrients</div>
          </div>
          <div className="gx-card-body">
            <div className="gx-metric-row"><span className="gx-metric-label">pH Level</span><span className="gx-metric-value">{r.phLevel ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Nitrogen (kg/ha)</span><span className="gx-metric-value">{r.nitrogenKgHa ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Phosphorus (kg/ha)</span><span className="gx-metric-value">{r.phosphorusKgHa ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Potassium (kg/ha)</span><span className="gx-metric-value">{r.potassiumKgHa ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Organic Matter (%)</span><span className="gx-metric-value">{r.organicMatterPct ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Moisture (%)</span><span className="gx-metric-value">{r.moisturePct ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">EC (dS/m)</span><span className="gx-metric-value">{r.ecDsM ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Zinc (ppm)</span><span className="gx-metric-value">{r.zincPpm ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Boron (ppm)</span><span className="gx-metric-value">{r.boronPpm ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Sulphur (ppm)</span><span className="gx-metric-value">{r.sulphurPpm ?? '—'}</span></div>
            <div className="gx-metric-row"><span className="gx-metric-label">Iron (ppm)</span><span className="gx-metric-value">{r.ironPpm ?? '—'}</span></div>
          </div>
        </div>

        {r.expertRemarks && (
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title">Expert Remarks</div>
            </div>
            <div className="gx-card-body">
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{r.expertRemarks}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
