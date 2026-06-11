import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { X, HardHat, Activity, ClipboardList, User, Phone, Mail, Hash } from 'lucide-react';

interface Props {
  workerId: string;
  onClose: () => void;
}

export default function WorkerDetailModal({ workerId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-worker-detail', workerId],
    queryFn: () => admin.getWorkerDetail(workerId),
  });

  const user = data?.user as any;
  const tasks = (data?.assignedTasks as any[]) ?? [];
  const operations = (data?.operations as any[]) ?? [];
  const stats = (data?.stats as any) ?? {};

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HardHat style={{ width: 20, height: 20, color: 'var(--gx-green)' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Worker Detail</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div style={bodyStyle}>
          {isLoading && <div style={centerStyle}>Loading worker details…</div>}
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
                <StatBox label="Total Tasks" value={stats.totalTasks ?? 0} color="var(--gx-green)" />
                <StatBox label="Completed" value={stats.completedTasks ?? 0} color="var(--gx-blue)" />
                <StatBox label="Operations" value={stats.totalOperations ?? 0} color="var(--gx-gold)" />
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><ClipboardList style={iconSm} /> Assigned Tasks ({tasks.length})</div>
                {tasks.length === 0 ? <EmptyMsg text="No tasks assigned" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Task</th><th style={thStyle}>Farm</th><th style={thStyle}>Due Date</th><th style={thStyle}>Status</th><th style={thStyle}>Priority</th></tr></thead>
                    <tbody>
                      {tasks.slice(0, 10).map((t: any) => (
                        <tr key={t.id} style={trStyle}>
                          <td style={tdStyle}>{t.taskTitle || '—'}</td>
                          <td style={tdStyle}>{t.farmId || '—'}</td>
                          <td style={tdStyle}>{t.scheduledDate || '—'}</td>
                          <td style={tdStyle}><StatusBadge status={t.status} /></td>
                          <td style={tdStyle}><StatusBadge status={t.priority} /></td>
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
                    <thead><tr style={thRowStyle}><th style={thStyle}>Date</th><th style={thStyle}>Farm</th><th style={thStyle}>Type</th><th style={thStyle}>Workers</th></tr></thead>
                    <tbody>
                      {operations.slice(0, 8).map((op: any) => (
                        <tr key={op.id} style={trStyle}>
                          <td style={tdStyle}>{op.operationDate?.split('T')[0] || '—'}</td>
                          <td style={tdStyle}>{op.farmId}</td>
                          <td style={tdStyle}>{op.operationType || '—'}</td>
                          <td style={tdStyle}>{op.workersDeployed ?? '—'}</td>
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
  const color = s === 'ACTIVE' || s === 'COMPLETED' ? 'var(--gx-green)'
    : s === 'HIGH' || s === 'OPEN' ? 'var(--gx-red)'
    : s === 'PENDING' || s === 'AT_LAB' ? 'var(--gx-gold)'
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
  background: 'var(--gx-card-bg, #1a1f2e)', borderRadius: 12, width: '100%', maxWidth: 680,
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
  marginBottom: 10, color: 'var(--gx-green)', textTransform: 'uppercase', letterSpacing: .5,
};
const statsRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginBottom: 20 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thRowStyle: React.CSSProperties = { background: 'rgba(255,255,255,.04)' };
const thStyle: React.CSSProperties = { padding: '7px 10px', textAlign: 'left', opacity: .6, fontWeight: 600, fontSize: 11 };
const trStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,.04)' };
const tdStyle: React.CSSProperties = { padding: '7px 10px' };
const centerStyle: React.CSSProperties = { textAlign: 'center', padding: 40, opacity: .5 };
const iconSm: React.CSSProperties = { width: 13, height: 13 };
