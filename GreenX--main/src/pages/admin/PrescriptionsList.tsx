import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin, fieldManager } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Search, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'PENDING', label: 'Pending' },
];

export default function PrescriptionsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: prescriptions = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-prescriptions-list'],
    queryFn: () => fieldManager.getPrescriptions(),
    retry: 2,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-rx'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts-rx'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const getExpertName = (expertId: string) => {
    const user = (users as any[]).find((u) => u.id === expertId);
    return user ? user.name || user.email : expertId || '—';
  };

  const getAlertInfo = (alertId: string) => {
    const alert = (alerts as any[]).find((a) => a.id === alertId);
    return alert ? `${alert.pestName || 'Alert'} (${alert.farmId || ''})` : alertId || '—';
  };

  const filtered = useMemo(() => {
    let list = prescriptions as any[];

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACKNOWLEDGED') {
        list = list.filter((p) => p.isacknowledged === true);
      } else {
        list = list.filter((p) => !p.isacknowledged);
      }
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          String(p.chemicalName || '').toLowerCase().includes(q) ||
          String(p.chemicalType || '').toLowerCase().includes(q) ||
          String(p.applicationMethod || '').toLowerCase().includes(q) ||
          getExpertName(p.expertId).toLowerCase().includes(q)
      );
    }

    return list;
  }, [prescriptions, search, statusFilter, users, alerts]);

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
              <Pill className="inline-block w-5 h-5 mr-2 align-middle" />
              Prescriptions
            </div>
            <div className="gx-page-sub">{prescriptions.length} total prescriptions issued</div>
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
                placeholder="Chemical name, type, expert..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
            <Pill className="inline-block w-4 h-4 mr-1 align-middle" /> Prescription Registry
          </div>
          <span className="gx-status gx-s-done">{filtered.length} prescriptions</span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading prescriptions...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load prescriptions'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>
                {search || statusFilter !== 'ALL'
                  ? 'No prescriptions match your filters.'
                  : 'No prescriptions issued yet.'}
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Chemical</th>
                    <th>Type</th>
                    <th>Dose</th>
                    <th>Application</th>
                    <th>Alert / Farm</th>
                    <th>Expert</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rx: any, i: number) => (
                    <tr
                      key={rx.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/prescriptions/${rx.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{rx.chemicalName || '—'}</td>
                      <td>{rx.chemicalType || '—'}</td>
                      <td style={{ fontSize: 12 }}>{rx.dose || '—'}</td>
                      <td style={{ fontSize: 12 }}>{rx.applicationMethod || '—'}</td>
                      <td style={{ fontSize: 12 }}>{getAlertInfo(rx.alertId)}</td>
                      <td style={{ fontSize: 12 }}>{getExpertName(rx.expertId)}</td>
                      <td style={{ fontSize: 12 }}>
                        {rx.createdAt
                          ? new Date(rx.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            rx.isacknowledged ? 'gx-s-done' : 'gx-s-pending'
                          }`}
                        >
                          {rx.isacknowledged ? 'Acknowledged' : 'Pending'}
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
