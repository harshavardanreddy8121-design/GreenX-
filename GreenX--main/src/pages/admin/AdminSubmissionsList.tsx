import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, FlaskConical, Search } from 'lucide-react';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['ALL', 'COLLECTED', 'AT_LAB', 'TESTING', 'COMPLETED'];

export default function AdminSubmissionsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: submissions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-submissions-list'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s: any) => {
      const matchSearch = !q ||
        String(s.farmId || '').toLowerCase().includes(q) ||
        String(s.collectedBy || '').toLowerCase().includes(q) ||
        String(s.sampleCode || '').toLowerCase().includes(q) ||
        String(s.status || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || (s.status || '').toUpperCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: string) => { setStatusFilter(v); setPage(1); };

  const statusClass = (s: string) => {
    if (s === 'COMPLETED') return 'gx-status gx-s-done';
    if (s === 'TESTING' || s === 'AT_LAB') return 'gx-status gx-s-pending';
    return 'gx-status';
  };

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div className="gx-page-title"><FlaskConical className="inline-block w-4 h-4 mr-1 align-middle" /> Submissions</div>
            <div className="gx-page-sub">{submissions.length} total soil sample submissions</div>
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
              placeholder="Search farm ID, collected by, code..."
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
            <strong>Failed to load submissions:</strong> {(error as Error)?.message || 'Unknown error'}
          </div>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><FlaskConical className="inline-block w-4 h-4 mr-1 align-middle" /> All Submissions</div>
            <span className="gx-status gx-s-done">{filtered.length} submissions</span>
          </div>
          <div className="gx-card-body">
            {paginated.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <FlaskConical size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <div>{search || statusFilter !== 'ALL' ? 'No submissions match your search.' : 'No submissions found.'}</div>
              </div>
            ) : (
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sample Code</th>
                    <th>Farm ID</th>
                    <th>Collected By</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s: any, i: number) => (
                    <tr
                      key={s.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/submissions/${s.id}`)}
                      className="hover:bg-muted/30"
                    >
                      <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td style={{ fontWeight: 500 }}><code style={{ fontSize: 11 }}>{s.sampleCode || s.id?.slice(0, 8) || '—'}</code></td>
                      <td>{s.farmId || '—'}</td>
                      <td>{s.collectorName || s.collectedBy || '—'}</td>
                      <td>
                        <span className={s.priority === 'HIGH' ? 'gx-status gx-s-alert' : 'gx-status gx-s-done'}>
                          {s.priority || 'Normal'}
                        </span>
                      </td>
                      <td><span className={statusClass((s.status || '').toUpperCase())}>{s.status || '—'}</span></td>
                      <td style={{ fontSize: 12, opacity: 0.7 }}>{s.collectionDate ? new Date(s.collectionDate).toLocaleDateString() : s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
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
