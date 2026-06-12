import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Search, AlertTriangle } from 'lucide-react';

const SEVERITY_OPTIONS = [
  { value: 'ALL', label: 'All Severities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export default function PestAlertsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: alerts = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-pest-alerts-list'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms-alerts'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const getFarmName = (farmId: string) => {
    const farm = (farms as any[]).find((f) => f.id === farmId);
    return farm ? farm.name || farm.farmCode || farmId : farmId;
  };

  const filtered = useMemo(() => {
    let list = alerts as any[];

    if (severityFilter !== 'ALL') {
      list = list.filter((a) => (a.severity || '').toUpperCase() === severityFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((a) => (a.status || '').toUpperCase() === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          String(a.pestName || '').toLowerCase().includes(q) ||
          String(a.pestType || '').toLowerCase().includes(q) ||
          getFarmName(a.farmId).toLowerCase().includes(q) ||
          String(a.farmId || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [alerts, search, severityFilter, statusFilter, farms]);

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="gx-btn gx-btn-ghost gx-btn-sm"
            onClick={() => navigate('/admin')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <div className="gx-page-title">
              <Bug className="inline-block w-5 h-5 mr-2 align-middle" />
              Pest Alerts
            </div>
            <div className="gx-page-sub">{alerts.length} total pest alerts</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-body">
          <div className="gx-form-grid">
            <div className="gx-form-group">
              <label className="gx-label">
                <Search className="inline-block w-3 h-3 mr-1 align-middle" /> Search
              </label>
              <input
                type="text"
                className="gx-input"
                placeholder="Pest name, type, farm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Severity</label>
              <select
                className="gx-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Status</label>
              <select
                className="gx-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gx-card">
        <div className="gx-card-header">
          <div className="gx-card-title">
            <Bug className="inline-block w-4 h-4 mr-1 align-middle" /> Pest Alert Registry
          </div>
          <span
            className={`gx-status ${
              filtered.some((a: any) => (a.severity || '').toUpperCase() === 'HIGH')
                ? 'gx-s-alert'
                : 'gx-s-done'
            }`}
          >
            {filtered.length} alerts
          </span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading pest alerts...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load pest alerts'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <Bug className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>
                {search || severityFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No pest alerts match your filters.'
                  : 'No pest alerts found. All clear!'}
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pest Name</th>
                    <th>Type</th>
                    <th>Farm</th>
                    <th>Reported By</th>
                    <th>Date</th>
                    <th>Affected Area</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((alert: any, i: number) => (
                    <tr
                      key={alert.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/pest-alerts/${alert.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{alert.pestName || '—'}</td>
                      <td>{alert.pestType || '—'}</td>
                      <td>{getFarmName(alert.farmId)}</td>
                      <td style={{ fontSize: 12 }}>{alert.reportedBy || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {alert.createdAt
                          ? new Date(alert.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        {alert.affectedAreaPct != null ? `${alert.affectedAreaPct}%` : '—'}
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            (alert.severity || '').toUpperCase() === 'HIGH'
                              ? 'gx-s-alert'
                              : 'gx-s-pending'
                          }`}
                        >
                          {alert.severity || '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            (alert.status || '').toUpperCase() === 'RESOLVED'
                              ? 'gx-s-done'
                              : 'gx-s-pending'
                          }`}
                        >
                          {alert.status || 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
