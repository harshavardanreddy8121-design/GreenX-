import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { X, Sprout, MapPin, FileText, Leaf, User, Phone, Mail, Hash, Wallet } from 'lucide-react';

interface Props {
  ownerId: string;
  onClose: () => void;
}

export default function LandOwnerDetailModal({ ownerId, onClose }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-landowner-detail', ownerId],
    queryFn: () => admin.getLandOwnerDetail(ownerId),
  });

  const user = data?.user as any;
  const farms = (data?.farms as any[]) ?? [];
  const reports = (data?.soilReports as any[]) ?? [];
  const suggestions = (data?.cropSuggestions as any[]) ?? [];
  const stats = (data?.stats as any) ?? {};

  const totalRevenue = farms.reduce((s: number, f: any) => s + (f.expectedRevenue || 0), 0);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sprout style={{ width: 20, height: 20, color: 'var(--gx-gold)' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Land Owner Detail</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div style={bodyStyle}>
          {isLoading && <div style={centerStyle}>Loading land owner details…</div>}
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
                <StatBox label="Farms" value={stats.totalFarms ?? 0} color="var(--gx-gold)" />
                <StatBox label="Total Acres" value={Math.round(stats.totalAcres ?? 0)} color="var(--gx-green)" />
                <StatBox label="Reports" value={stats.totalReports ?? 0} color="var(--gx-blue)" />
                <StatBox label="Suggestions" value={stats.totalSuggestions ?? 0} color="var(--gx-orange)" />
              </div>

              {totalRevenue > 0 && (
                <div style={{ ...sectionStyle, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Wallet style={{ width: 14, height: 14, color: 'var(--gx-gold)' }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Revenue Summary</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gx-gold)' }}>
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>Total expected revenue across all farms</div>
                </div>
              )}

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><MapPin style={iconSm} /> Farms Owned ({farms.length})</div>
                {farms.length === 0 ? <EmptyMsg text="No farms registered" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Farm</th><th style={thStyle}>Village</th><th style={thStyle}>Acres</th><th style={thStyle}>Crop</th><th style={thStyle}>Status</th></tr></thead>
                    <tbody>
                      {farms.map((f: any) => (
                        <tr key={f.id} style={trStyle}>
                          <td style={tdStyle}>{f.name || f.farmCode || f.id}</td>
                          <td style={tdStyle}>{f.village || '—'}</td>
                          <td style={tdStyle}>{f.totalLand || '—'}</td>
                          <td style={tdStyle}>{f.crop || f.currentCrop || '—'}</td>
                          <td style={tdStyle}><StatusBadge status={f.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><FileText style={iconSm} /> Soil Reports ({reports.length})</div>
                {reports.length === 0 ? <EmptyMsg text="No soil reports available" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Date</th><th style={thStyle}>Farm</th><th style={thStyle}>pH</th><th style={thStyle}>Rating</th></tr></thead>
                    <tbody>
                      {reports.slice(0, 6).map((r: any) => (
                        <tr key={r.id} style={trStyle}>
                          <td style={tdStyle}>{r.reportDate || r.createdAt?.split('T')[0] || '—'}</td>
                          <td style={tdStyle}>{r.farmId}</td>
                          <td style={tdStyle}>{r.phLevel ?? '—'}</td>
                          <td style={tdStyle}><StatusBadge status={r.overallRating || 'N/A'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={sectionTitleStyle}><Leaf style={iconSm} /> Crop Suggestions ({suggestions.length})</div>
                {suggestions.length === 0 ? <EmptyMsg text="No crop suggestions" /> : (
                  <table style={tableStyle}>
                    <thead><tr style={thRowStyle}><th style={thStyle}>Crop</th><th style={thStyle}>Season</th><th style={thStyle}>Score</th><th style={thStyle}>Profit/Acre</th><th style={thStyle}>Selected</th></tr></thead>
                    <tbody>
                      {suggestions.slice(0, 8).map((s: any) => (
                        <tr key={s.id} style={trStyle}>
                          <td style={tdStyle}>{s.cropName || '—'}</td>
                          <td style={tdStyle}>{s.season || '—'}</td>
                          <td style={tdStyle}>{s.suitabilityScore ?? '—'}</td>
                          <td style={tdStyle}>{s.profitPerAcre ? `₹${Number(s.profitPerAcre).toLocaleString('en-IN')}` : '—'}</td>
                          <td style={tdStyle}><StatusBadge status={s.isselected ? 'Selected' : 'Pending'} /></td>
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
  const color = s === 'ACTIVE' || s === 'COMPLETED' || s === 'SELECTED' ? 'var(--gx-green)'
    : s === 'HIGH' || s === 'OPEN' ? 'var(--gx-red)'
    : s === 'PENDING' || s === 'REGISTERED' ? 'var(--gx-gold)'
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
  background: 'var(--gx-card-bg, #1a1f2e)', borderRadius: 12, width: '100%', maxWidth: 740,
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
  marginBottom: 10, color: 'var(--gx-gold)', textTransform: 'uppercase', letterSpacing: .5,
};
const statsRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginBottom: 20 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thRowStyle: React.CSSProperties = { background: 'rgba(255,255,255,.04)' };
const thStyle: React.CSSProperties = { padding: '7px 10px', textAlign: 'left', opacity: .6, fontWeight: 600, fontSize: 11 };
const trStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,.04)' };
const tdStyle: React.CSSProperties = { padding: '7px 10px' };
const centerStyle: React.CSSProperties = { textAlign: 'center', padding: 40, opacity: .5 };
const iconSm: React.CSSProperties = { width: 13, height: 13 };
