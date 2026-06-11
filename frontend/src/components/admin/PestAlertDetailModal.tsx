import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { X, Bug, MapPin, User, ShieldAlert, Pill } from 'lucide-react';

interface Props {
  alertId: string;
  onClose: () => void;
}

export default function PestAlertDetailModal({ alertId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-alert-detail', alertId],
    queryFn: () => admin.getAlertDetail(alertId),
  });

  const alert = data?.alert as any;
  const farm = data?.farm as any;
  const reporter = data?.reporter as any;
  const prescriptions = (data?.prescriptions as any[]) ?? [];
  const stats = (data?.stats as any) ?? {};

  const severityColor = (sev: string) => {
    const s = (sev || '').toUpperCase();
    return s === 'HIGH' || s === 'CRITICAL' ? 'var(--gx-red)'
      : s === 'MEDIUM' ? 'var(--gx-gold)'
      : 'var(--gx-blue)';
  };

  const statusColor = (st: string) => {
    const s = (st || '').toUpperCase();
    return s === 'RESOLVED' ? 'var(--gx-green)'
      : s === 'IN_PROGRESS' ? 'var(--gx-gold)'
      : 'var(--gx-red)';
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bug style={{ width: 20, height: 20, color: 'var(--gx-red)' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Pest Alert Detail</span>
            {alert && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: `${severityColor(alert.severity)}22`, color: severityColor(alert.severity),
              }}>{alert.severity}</span>
            )}
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div style={bodyStyle}>
          {isLoading && <div style={centerStyle}>Loading alert details…</div>}
          {error && <div style={{ color: 'var(--gx-red)', padding: 20 }}>Failed to load: {(error as Error).message}</div>}

          {data && alert && (
            <>
              {/* Alert Header Card */}
              <div style={{ background: `${severityColor(alert.severity)}11`, border: `1px solid ${severityColor(alert.severity)}44`, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{alert.pestName}</div>
                    <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>{alert.pestType || 'Unknown type'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${statusColor(alert.status)}22`, color: statusColor(alert.status) }}>
                      {alert.status || 'OPEN'}
                    </div>
                    <div style={{ fontSize: 11, opacity: .6, marginTop: 4 }}>{alert.createdAt?.split('T')[0] || '—'}</div>
                  </div>
                </div>
                {alert.affectedAreaPct != null && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, opacity: .6, marginBottom: 4 }}>Affected Area</div>
                    <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(alert.affectedAreaPct, 100)}%`, height: '100%', background: severityColor(alert.severity), borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, marginTop: 3, fontWeight: 600, color: severityColor(alert.severity) }}>{alert.affectedAreaPct}% of field affected</div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={statsRowStyle}>
                <StatBox label="Prescriptions" value={stats.totalPrescriptions ?? 0} color="var(--gx-blue)" />
                <StatBox label="Acknowledged" value={stats.acknowledgedPrescriptions ?? 0} color="var(--gx-green)" />
              </div>

              {/* Description */}
              {alert.description && (
                <div style={{ ...sectionStyle, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={sectionTitleStyle}><ShieldAlert style={iconSm} /> Description</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, opacity: .85 }}>{alert.description}</div>
                </div>
              )}

              {/* Farm & Reporter */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 8 }}><MapPin style={iconSm} /> Farm</div>
                  {farm ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{farm.name || farm.farmCode}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{farm.village}{farm.district ? `, ${farm.district}` : ''}</div>
                      {alert.fieldLocation && <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>Location: {alert.fieldLocation}</div>}
                    </>
                  ) : <div style={{ opacity: .4, fontSize: 12 }}>Farm not found</div>}
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ ...sectionTitleStyle, marginBottom: 8 }}><User style={iconSm} /> Reported By</div>
                  {reporter ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{reporter.name}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{reporter.email}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{reporter.role}</div>
                    </>
                  ) : <div style={{ opacity: .4, fontSize: 12 }}>Reporter not found</div>}
                </div>
              </div>

              {/* Prescriptions */}
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><Pill style={iconSm} /> Prescriptions ({prescriptions.length})</div>
                {prescriptions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '14px 0', opacity: .4, fontSize: 13 }}>No prescriptions issued yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {prescriptions.map((p: any) => (
                      <div key={p.id} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid var(--gx-blue)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.chemicalName}</div>
                            <div style={{ fontSize: 11, opacity: .6 }}>{p.chemicalType || 'Chemical'}</div>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                            background: p.isacknowledged ? 'var(--gx-green)22' : 'var(--gx-gold)22',
                            color: p.isacknowledged ? 'var(--gx-green)' : 'var(--gx-gold)',
                          }}>{p.isacknowledged ? 'Acknowledged' : 'Pending'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginTop: 8 }}>
                          <InfoRow label="Dose" value={p.dose || '—'} />
                          <InfoRow label="Method" value={p.applicationMethod || '—'} />
                          <InfoRow label="Dilution" value={p.dilutionRatio || '—'} />
                          <InfoRow label="Timing" value={p.applicationTiming || '—'} />
                          {p.preHarvestInterval && <InfoRow label="Pre-Harvest Interval" value={p.preHarvestInterval} />}
                        </div>
                        {p.fmInstructions && (
                          <div style={{ marginTop: 8, fontSize: 12, opacity: .8, padding: '6px 10px', background: 'rgba(255,255,255,.04)', borderRadius: 4 }}>
                            <strong>FM Instructions:</strong> {p.fmInstructions}
                          </div>
                        )}
                        {p.safetyPrecautions && (
                          <div style={{ marginTop: 6, fontSize: 12, opacity: .7, padding: '6px 10px', background: 'rgba(255,100,0,.06)', borderRadius: 4 }}>
                            <strong>⚠ Safety:</strong> {p.safetyPrecautions}
                          </div>
                        )}
                        <div style={{ fontSize: 11, opacity: .4, marginTop: 6 }}>Issued: {p.createdAt?.split('T')[0] || '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '3px 0' }}>
      <div style={{ fontSize: 10, opacity: .5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 14px', borderTop: `3px solid ${color}`, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{label}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const modalStyle: React.CSSProperties = {
  background: 'var(--gx-card-bg, #1a1f2e)', borderRadius: 12, width: '100%', maxWidth: 720,
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
  marginBottom: 10, color: 'var(--gx-red)', textTransform: 'uppercase', letterSpacing: .5,
};
const statsRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginBottom: 20 };
const centerStyle: React.CSSProperties = { textAlign: 'center', padding: 40, opacity: .5 };
const iconSm: React.CSSProperties = { width: 13, height: 13 };
