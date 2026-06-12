import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { expert } from '@/lib/api';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPLIED', 'COMPLETED'];

export default function AdminPrescriptionsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: prescriptions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-prescriptions-list'],
    queryFn: () => expert.getMyPrescriptions(),
    retry: 2,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prescriptions.filter((p: any) => {
      const matchSearch = !q ||
        String(p.alertId || '').toLowerCase().includes(q) ||
        String(p.expertId || '').toLowerCase().includes(q) ||
        String(p.chemicalName || '').toLowerCase().includes(q) ||
        String(p.id || '').toLowerCase().includes(q);
      const isAcknowledged = p.isacknowledged;
      let status = 'PENDING';
      if (isAcknowledged) status = 'APPLIED';
      const matchStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: string) => { setStatusFilter(v); setPage(1); };

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div className="gx-page-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Prescriptions</div>
            <div className="gx-page-sub">{prescriptions.length} total prescriptions</div>
          </div>
        </div>
      </div>

      <div className="gx-card" style={{ marginBottom: 16 }}>
        <div className="gx-card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              className="gx-input"
              style={{ paddingLeft: 30 }}
              placeholder="Search alert ID, expert, chemical..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="gx-select" style={{ flex: '0 0 160px' }} value={statusFilter} onChange={e => handleFilter(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
          <span className="gx-status gx-s-done">{filtered.length} results</span>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="gx-alert-box gx-alert-red" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} />
          <div style={{ flex: 1 }}>
            <strong>Failed to load prescriptions:</strong> {(error as Error)?.message || 'Unknown error'}
          </div>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> All Prescriptions</div>
            <span className="gx-status gx-s-done">{filtered.length} prescriptions</span>
          </div>
          <div className="gx-card-body">
            {paginated.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <ClipboardList size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <div>{search || statusFilter !== 'ALL' ? 'No prescriptions match your search.' : 'No prescriptions found.'}</div>
              </div>
            ) : (
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Prescription ID</th>
                    <th>Alert ID</th>
                    <th>Expert ID</th>
                    <th>Chemical</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p: any, i: number) => {
                    const status = p.isacknowledged ? 'APPLIED' : 'PENDING';
                    return (
                      <tr
                        key={p.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/prescriptions/${p.id}`)}
                        className="hover:bg-muted/30"
                      >
                        <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td><code style={{ fontSize: 11 }}>{p.id?.slice(0, 8) || '—'}</code></td>
                        <td>{p.alertId?.slice(0, 8) || '—'}</td>
                        <td>{p.expertId?.slice(0, 8) || '—'}</td>
                        <td style={{ fontWeight: 500 }}>{p.chemicalName || '—'}</td>
                        <td>{p.applicationMethod || '—'}</td>
                        <td style={{ fontSize: 12, opacity: 0.7 }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={status === 'APPLIED' ? 'gx-status gx-s-done' : 'gx-status gx-s-pending'}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--gx-border)' }}>
              <button className="gx-btn gx-btn-ghost gx-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, opacity: 0.7 }}>Page {page} of {totalPages}</span>
              <button className="gx-btn gx-btn-ghost gx-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
