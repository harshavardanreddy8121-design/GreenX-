import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { X, Tractor, MapPin, Activity, TestTubes, User, Phone, Mail, Hash, ClipboardList } from 'lucide-react';

interface Props {
  managerId: string;
  onClose: () => void;
}

export default function FieldManagerDetailModal({ managerId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-fm-detail', managerId],
    queryFn: () => admin.getFieldManagerDetail(managerId),
  });

  const user = data?.user as any;
  const farms = (data?.assignedFarms as any[]) ?? [];
  const operations = (data?.operations as any[]) ?? [];
  const samples = (data?.samples as any[]) ?? [];
  const pendingTasks = (data?.pendingTasks as any[]) ?? [];
  const stats = (data?.stats as any) ?? {};

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tractor style={{ width: 20, height: 20, color: 'var(--gx-orange)' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Field Manager Detail</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div style={bodyStyle}>
          {isLoading && <div style={centerStyle}>Loading field manager details…</div>}
          {error && <div style={{ color: 'var(--gx-red)', padding: 20 }}>Failed to load: {(error as Error).message}</div>}

          {data && (
            <>
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><User style={iconSm} /> Profile</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <InfoRow icon={<User style={iconSm} />} label="Name" value={user?.name || '—'} />
                  <InfoRow icon={<Mail style={iconSm} />} label="Email" value={user?.email || '—'} />
                  <InfoRow icon={<Phone style={iconSm} />} label="Phone" value={user?.phone || '—'} />
                  <InfoRow icon={<Hash style={iconSm} />} label="UID" value={user?.uid || '—'} />
                  <InfoRow icon={<Hash style={iconSm} />} label="Status" value={user?.isActive === false ? 'Inactive' : 'Active'} />
                </div>
              </div>

              <div style={statsRowStyle}>
                <StatBox label="Farms" value={stats.totalFarms ?? 0} color="var(--gx-orange)" />
                <StatBox label="Operations" value={stats.totalOperations ?? 0} color="var(--gx-green)" />
                <StatBox label="Samples" value={stats.totalSamples ?? 0} color="var(--gx-blue)" />
                <StatBox label="Pending Tasks" value={stats.pendingTasks ?? 0} color="var(--gx-gold)" />
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><MapPin style={iconSm} /> Assigned Farms ({farms.length})</div>
                {farms.length === 0 ? <EmptyMsg text="No farms assigned" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Farm</th><th style={thStyle}>Village</th><th style={thStyle}>Acres</th><th style={thStyle}>Status</th></tr></thead>
                    <tbody>
                      {farms.map((f: any) => (
                        <tr key={f.id} style={trStyle}>
                          <td style={tdStyle}>{f.name || f.farmCode || f.id}</td>
                          <td style={tdStyle}>{f.village || '—'}</td>
                          <td style={tdStyle}>{f.totalLand || '—'}</td>
                          <td style={tdStyle}><StatusBadge status={f.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><Activity style={iconSm} /> Field Operations ({operations.length})</div>
                {operations.length === 0 ? <EmptyMsg text="No operations logged" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Date</th><th style={thStyle}>Farm</th><th style={thStyle}>Type</th><th style={thStyle}>Area (ac)</th></tr></thead>
                    <tbody>
                      {operations.slice(0, 8).map((op: any) => (
                        <tr key={op.id} style={trStyle}>
                          <td style={tdStyle}>{op.operationDate?.split('T')[0] || '—'}</td>
                          <td style={tdStyle}>{op.farmId}</td>
                          <td style={tdStyle}>{op.operationType || '—'}</td>
                          <td style={tdStyle}>{op.areaCoveredAcres ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><TestTubes style={iconSm} /> Soil Samples Collected ({samples.length})</div>
                {samples.length === 0 ? <EmptyMsg text="No samples collected" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Code</th><th style={thStyle}>Farm</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th></tr></thead>
                    <tbody>
                      {samples.slice(0, 8).map((s: any) => (
                        <tr key={s.id} style={trStyle}>
                          <td style={tdStyle}>{s.sampleCode || s.id}</td>
                          <td style={tdStyle}>{s.farmId}</td>
                          <td style={tdStyle}>{s.collectionDate || '—'}</td>
                          <td style={tdStyle}><StatusBadge status={s.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><ClipboardList style={iconSm} /> Pending Tasks ({pendingTasks.length})</div>
                {pendingTasks.length === 0 ? <EmptyMsg text="No pending tasks" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Task</th><th style={thStyle}>Farm</th><th style={thStyle}>Due Date</th><th style={thStyle}>Priority</th></tr></thead>
                    <tbody>
                      {pendingTasks.slice(0, 8).map((t: any) => (
                        <tr key={t.id} style={trStyle}>
                          <td style={tdStyle}>{t.taskTitle || '—'}</td>
                          <td style={tdStyle}>{t.farmId || '—'}</td>
                          <td style={tdStyle}>{t.scheduledDate || '—'}</td>
                          <td style={tdStyle}><StatusBadge status={t.priority} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
      <span style={{ opacity: .5 }}>{icon}</span>
      <span style={{ opacity: .6, fontSize: 12, minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
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

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const color = s === 'ACTIVE' || s === 'COMPLETED' || s === 'GOOD' ? 'var(--gx-green)'
    : s === 'HIGH' || s === 'OPEN' || s === 'ALERT' ? 'var(--gx-red)'
    : s === 'PENDING' || s === 'AT_LAB' || s === 'TESTING' ? 'var(--gx-gold)'
    : 'var(--gx-blue)';
  return <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}22`, padding: '2px 7px', borderRadius: 4 }}>{status || '—'}</span>;
}

function EmptyMsg({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '14px 0', opacity: .4, fontSize: 13 }}>{text}</div>;
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
  marginBottom: 10, color: 'var(--gx-orange)', textTransform: 'uppercase', letterSpacing: .5,
};
const statsRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginBottom: 20 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thRowStyle: React.CSSProperties = { background: 'rgba(255,255,255,.04)' };
const thStyle: React.CSSProperties = { padding: '7px 10px', textAlign: 'left', opacity: .6, fontWeight: 600, fontSize: 11 };
const trStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,.04)' };
const tdStyle: React.CSSProperties = { padding: '7px 10px' };
const centerStyle: React.CSSProperties = { textAlign: 'center', padding: 40, opacity: .5 };
const iconSm: React.CSSProperties = { width: 13, height: 13 };
