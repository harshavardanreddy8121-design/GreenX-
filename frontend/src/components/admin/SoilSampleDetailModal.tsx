import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { X, TestTubes, MapPin, User, CheckCircle, Circle, FileText } from 'lucide-react';

interface Props {
  sampleId: string;
  onClose: () => void;
}

const PIPELINE_STEPS = ['COLLECTED', 'AT_LAB', 'TESTING', 'COMPLETED'];

export default function SoilSampleDetailModal({ sampleId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-sample-detail', sampleId],
    queryFn: () => admin.getSampleDetail(sampleId),
  });

  const sample = data?.sample as any;
  const farm = data?.farm as any;
  const expert = data?.assignedExpert as any;
  const collector = data?.collector as any;
  const report = data?.soilReport as any;

  const currentStepIdx = PIPELINE_STEPS.indexOf(sample?.status || 'COLLECTED');

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TestTubes style={{ width: 20, height: 20, color: 'var(--gx-blue)' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Soil Sample Detail</span>
            {sample && <span style={{ fontSize: 12, opacity: .6, fontFamily: 'monospace' }}>{sample.sampleCode}</span>}
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div style={bodyStyle}>
          {isLoading && <div style={centerStyle}>Loading sample details…</div>}
          {error && <div style={{ color: 'var(--gx-red)', padding: 20 }}>Failed to load: {(error as Error).message}</div>}

          {data && sample && (
            <>
              {/* Pipeline */}
              <div style={{ ...sectionStyle, background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={sectionTitleStyle}><TestTubes style={iconSm} /> Sample Pipeline</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {PIPELINE_STEPS.map((step, idx) => {
                    const done = idx <= currentStepIdx;
                    const active = idx === currentStepIdx;
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? 'var(--gx-green)' : 'rgba(255,255,255,.1)',
                            border: active ? '2px solid var(--gx-green)' : '2px solid transparent',
                            transition: 'all .2s',
                          }}>
                            {done
                              ? <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
                              : <Circle style={{ width: 14, height: 14, opacity: .4 }} />}
                          </div>
                          <div style={{ fontSize: 10, marginTop: 4, opacity: done ? 1 : .4, fontWeight: active ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {step.replace('_', ' ')}
                          </div>
                        </div>
                        {idx < PIPELINE_STEPS.length - 1 && (
                          <div style={{ height: 2, flex: 1, background: idx < currentStepIdx ? 'var(--gx-green)' : 'rgba(255,255,255,.1)', marginBottom: 18 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sample Info */}
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><TestTubes style={iconSm} /> Sample Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
                  <InfoRow label="Sample Code" value={sample.sampleCode || '—'} />
                  <InfoRow label="Collection Date" value={sample.collectionDate || '—'} />
                  <InfoRow label="Priority" value={sample.priority || '—'} />
                  <InfoRow label="Status" value={sample.status || '—'} />
                  <InfoRow label="Num Points" value={String(sample.numPoints ?? '—')} />
                  <InfoRow label="Depth (cm)" value={String(sample.depthCm ?? '—')} />
                  <InfoRow label="Soil Texture" value={sample.soilTexture || '—'} />
                  <InfoRow label="GPS" value={sample.gpsCoordinates || '—'} />
                </div>
                {sample.collectionNotes && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 6, fontSize: 12, opacity: .8 }}>
                    <strong>Notes:</strong> {sample.collectionNotes}
                  </div>
                )}
              </div>

              {/* Farm & People */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 8 }}><MapPin style={iconSm} /> Farm</div>
                  {farm ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{farm.name || farm.farmCode}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{farm.village}{farm.district ? `, ${farm.district}` : ''}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{farm.totalLand ? `${farm.totalLand} acres` : ''}</div>
                      <StatusBadge status={farm.status} />
                    </>
                  ) : <div style={{ opacity: .4, fontSize: 12 }}>Farm not found</div>}
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 8 }}><User style={iconSm} /> Assigned Expert</div>
                  {expert ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{expert.name}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{expert.email}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{expert.phone || ''}</div>
                    </>
                  ) : <div style={{ opacity: .4, fontSize: 12 }}>No expert assigned</div>}
                </div>
              </div>

              {/* Collector */}
              {collector && (
                <div style={{ ...sectionStyle, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 6 }}><User style={iconSm} /> Collected By</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{collector.name || sample.collectorName || '—'}</div>
                  <div style={{ fontSize: 12, opacity: .6 }}>{collector.email} · {collector.role}</div>
                </div>
              )}

              {/* Soil Report */}
              {report ? (
                <div style={sectionStyle}>
                  <div style={sectionTitleStyle}><FileText style={iconSm} /> Soil Report (Available)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                    <InfoRow label="pH Level" value={report.phLevel ?? '—'} />
                    <InfoRow label="Nitrogen (kg/ha)" value={report.nitrogenKgHa ?? '—'} />
                    <InfoRow label="Phosphorus (kg/ha)" value={report.phosphorusKgHa ?? '—'} />
                    <InfoRow label="Potassium (kg/ha)" value={report.potassiumKgHa ?? '—'} />
                    <InfoRow label="Organic Matter (%)" value={report.organicMatterPct ?? '—'} />
                    <InfoRow label="Moisture (%)" value={report.moisturePct ?? '—'} />
                    <InfoRow label="EC (dS/m)" value={report.ecDsM ?? '—'} />
                    <InfoRow label="Zinc (ppm)" value={report.zincPpm ?? '—'} />
                    <InfoRow label="Boron (ppm)" value={report.boronPpm ?? '—'} />
                    <InfoRow label="Sulphur (ppm)" value={report.sulphurPpm ?? '—'} />
                    <InfoRow label="Iron (ppm)" value={report.ironPpm ?? '—'} />
                    <InfoRow label="Rating" value={report.overallRating ?? '—'} />
                  </div>
                  {report.expertRemarks && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 6, fontSize: 12 }}>
                      <strong>Expert Remarks:</strong> {report.expertRemarks}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ ...sectionStyle, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '14px', textAlign: 'center', opacity: .5, fontSize: 13 }}>
                  <FileText style={{ width: 20, height: 20, margin: '0 auto 6px' }} />
                  <div>No soil report yet — sample is still in pipeline</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <div style={{ fontSize: 10, opacity: .5, marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const color = s === 'ACTIVE' || s === 'COMPLETED' ? 'var(--gx-green)'
    : s === 'HIGH' || s === 'OPEN' ? 'var(--gx-red)'
    : s === 'PENDING' || s === 'AT_LAB' || s === 'TESTING' ? 'var(--gx-gold)'
    : 'var(--gx-blue)';
  return <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}22`, padding: '2px 7px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>{status || '—'}</span>;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const modalStyle: React.CSSProperties = {
  background: 'var(--gx-card-bg, #1a1f2e)', borderRadius: 12, width: '100%', maxWidth: 760,
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 20px 60px rgba(0,0,0,.5)',
};
const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)',
};
const bodyStyle: React.CSSProperties = { overflowY: 'auto', padding: '16px 20px', flex: 1 };
const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: .6, padding: 4, borderRadius: 4,
};
const sectionStyle: React.CSSProperties = { marginBottom: 20 };
const sectionTitleStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13,
  marginBottom: 10, color: 'var(--gx-blue)', textTransform: 'uppercase', letterSpacing: .5,
};
const centerStyle: React.CSSProperties = { textAlign: 'center', padding: 40, opacity: .5 };
const iconSm: React.CSSProperties = { width: 13, height: 13 };
