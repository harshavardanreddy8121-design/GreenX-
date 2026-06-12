import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import {
  Wheat, Users, TestTubes, Microscope, Tractor, HardHat,
  FileText, Bug, ClipboardList, AlertTriangle, ArrowRight,
  Building2,
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'gold' | 'orange' | 'purple' | 'red' | 'teal' | 'indigo' | 'pink';
  href: string;
  subtitle?: string;
}

const COLOR_MAP: Record<StatCardProps['color'], { accent: string; bg: string; iconBg: string }> = {
  green:  { accent: 'var(--gx-green)',  bg: 'var(--gx-green-dim)',  iconBg: 'rgba(34,197,94,0.18)' },
  blue:   { accent: 'var(--gx-blue)',   bg: 'var(--gx-blue-dim)',   iconBg: 'rgba(59,130,246,0.18)' },
  gold:   { accent: 'var(--gx-gold)',   bg: 'var(--gx-gold-dim)',   iconBg: 'rgba(240,180,41,0.18)' },
  orange: { accent: 'var(--gx-orange)', bg: 'var(--gx-orange-dim)', iconBg: 'rgba(249,115,22,0.18)' },
  purple: { accent: '#a855f7',          bg: 'rgba(168,85,247,0.12)', iconBg: 'rgba(168,85,247,0.18)' },
  red:    { accent: 'var(--gx-red)',    bg: 'rgba(239,68,68,0.12)', iconBg: 'rgba(239,68,68,0.18)' },
  teal:   { accent: '#14b8a6',          bg: 'rgba(20,184,166,0.12)', iconBg: 'rgba(20,184,166,0.18)' },
  indigo: { accent: '#6366f1',          bg: 'rgba(99,102,241,0.12)', iconBg: 'rgba(99,102,241,0.18)' },
  pink:   { accent: '#ec4899',          bg: 'rgba(236,72,153,0.12)', iconBg: 'rgba(236,72,153,0.18)' },
};

function StatCard({ label, value, icon, color, href, subtitle }: StatCardProps) {
  const navigate = useNavigate();
  const c = COLOR_MAP[color];

  return (
    <button
      onClick={() => navigate(href)}
      style={{
        background: 'var(--gx-surface)',
        border: `1px solid var(--gx-border)`,
        borderRadius: 'var(--gx-radius)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = c.accent;
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px -8px ${c.accent}40`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gx-border)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: c.accent, borderRadius: 'var(--gx-radius) var(--gx-radius) 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.accent, flexShrink: 0,
        }}>
          {icon}
        </div>
        <ArrowRight size={16} style={{ color: 'var(--gx-text3)', marginTop: 4 }} />
      </div>

      <div>
        <div style={{ fontSize: 13, color: 'var(--gx-text2)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{
          fontSize: 34, fontWeight: 700, color: 'var(--gx-text)',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px', lineHeight: 1,
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--gx-text3)', marginTop: 6 }}>{subtitle}</div>
        )}
      </div>

      <div style={{
        fontSize: 12, color: c.accent, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        View all <ArrowRight size={12} />
      </div>
    </button>
  );
}

export default function AdminOverview() {
  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['admin-pending-samples'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
  });

  const { data: experts = [], isLoading: expertsLoading } = useQuery({
    queryKey: ['admin-expert-list'],
    queryFn: () => admin.getExperts(),
    retry: 2,
  });

  const { data: managers = [], isLoading: managersLoading } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const { data: soilReports = [], isLoading: soilLoading } = useQuery({
    queryKey: ['admin-soil-reports'],
    queryFn: () => admin.getSoilReports().catch(() => []),
    retry: 2,
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['admin-prescriptions'],
    queryFn: () => admin.getPrescriptions().catch(() => []),
    retry: 2,
  });

  const workers = (users as any[]).filter((u: any) =>
    ['WORKER', 'USER'].includes((u.role || '').toUpperCase())
  );

  const isLoading = farmsLoading || usersLoading || submissionsLoading ||
    expertsLoading || managersLoading || alertsLoading || soilLoading || prescriptionsLoading;

  const stats: StatCardProps[] = [
    {
      label: 'Total Farms',
      value: isLoading ? '—' : farms.length,
      icon: <Wheat size={22} />,
      color: 'green',
      href: '/admin/farms',
      subtitle: `${(farms as any[]).filter((f: any) => f.status === 'ACTIVE').length} active`,
    },
    {
      label: 'Total Users',
      value: isLoading ? '—' : users.length,
      icon: <Users size={22} />,
      color: 'blue',
      href: '/admin/users',
      subtitle: `${experts.length} experts · ${managers.length} managers`,
    },
    {
      label: 'Submissions',
      value: isLoading ? '—' : submissions.length,
      icon: <TestTubes size={22} />,
      color: 'gold',
      href: '/admin/submissions',
      subtitle: 'Soil sample submissions',
    },
    {
      label: 'Experts',
      value: isLoading ? '—' : experts.length,
      icon: <Microscope size={22} />,
      color: 'indigo',
      href: '/admin/experts',
      subtitle: 'Assigned soil experts',
    },
    {
      label: 'Field Managers',
      value: isLoading ? '—' : managers.length,
      icon: <Tractor size={22} />,
      color: 'orange',
      href: '/admin/field-managers',
      subtitle: 'Available field managers',
    },
    {
      label: 'Workers',
      value: isLoading ? '—' : workers.length,
      icon: <HardHat size={22} />,
      color: 'teal',
      href: '/admin/workers',
      subtitle: 'Registered workers',
    },
    {
      label: 'Soil Reports',
      value: isLoading ? '—' : soilReports.length,
      icon: <FileText size={22} />,
      color: 'purple',
      href: '/admin/soil-reports',
      subtitle: 'Lab analysis reports',
    },
    {
      label: 'Pest Alerts',
      value: isLoading ? '—' : alerts.length,
      icon: <Bug size={22} />,
      color: 'red',
      href: '/admin/pest-alerts',
      subtitle: `${(alerts as any[]).filter((a: any) => a.severity === 'HIGH').length} high severity`,
    },
    {
      label: 'Prescriptions',
      value: isLoading ? '—' : prescriptions.length,
      icon: <ClipboardList size={22} />,
      color: 'pink',
      href: '/admin/prescriptions',
      subtitle: 'Expert prescriptions',
    },
  ];

  return (
    <>
      <div className="gx-page-header">
        <div className="gx-page-title">
          <Building2 className="inline-block w-6 h-6 mr-2 align-middle" />
          Admin Dashboard
        </div>
        <div className="gx-page-sub">
          Click any card to view detailed list · {farms.length} farms · {users.length} users
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: 'var(--gx-text3)' }}>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--gx-green)' }} />
          Loading dashboard statistics…
        </div>
      )}

      {/* 9-card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}
        className="admin-overview-grid"
      >
        {stats.map(s => (
          <StatCard key={s.href} {...s} />
        ))}
      </div>

      {/* Quick summary */}
      <div className="gx-section-divider">
        <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /> System Overview
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><Bug className="inline-block w-4 h-4 mr-1 align-middle" /> Active Pest Alerts</div>
            <span className={`gx-status ${alerts.length > 0 ? 'gx-s-alert' : 'gx-s-done'}`}>{alerts.length}</span>
          </div>
          <div className="gx-card-body">
            {(alerts as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>No active pest alerts</div>
            ) : (
              <table className="gx-data-table">
                <thead><tr><th>Farm</th><th>Pest</th><th>Severity</th><th>Status</th></tr></thead>
                <tbody>
                  {(alerts as any[]).slice(0, 5).map((a: any, i: number) => (
                    <tr key={a.id || i}>
                      <td>{a.farmId || '—'}</td>
                      <td>{a.pestName || '—'}</td>
                      <td><span className={`gx-status ${a.severity === 'HIGH' ? 'gx-s-alert' : 'gx-s-pending'}`}>{a.severity || '—'}</span></td>
                      <td><span className="gx-status gx-s-pending">{a.status || 'Open'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Pending Submissions</div>
            <span className="gx-status gx-s-pending">{submissions.length}</span>
          </div>
          <div className="gx-card-body">
            {(submissions as any[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>All samples processed</div>
            ) : (
              <table className="gx-data-table">
                <thead><tr><th>Farm</th><th>Collected By</th><th>Priority</th></tr></thead>
                <tbody>
                  {(submissions as any[]).slice(0, 5).map((s: any, i: number) => (
                    <tr key={s.id || i}>
                      <td>{s.farmId || s.sampleCode || '—'}</td>
                      <td>{s.collectedBy || '—'}</td>
                      <td><span className={`gx-status ${s.priority === 'HIGH' ? 'gx-s-alert' : 'gx-s-done'}`}>{s.priority || 'Normal'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-overview-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .admin-overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
