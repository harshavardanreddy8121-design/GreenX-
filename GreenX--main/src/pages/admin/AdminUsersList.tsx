import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';

const PAGE_SIZE = 10;

const ROLE_OPTIONS = ['ALL', 'LAND_OWNER', 'EXPERT', 'FIELD_MANAGER', 'WORKER', 'CLUSTER_ADMIN'];

const ROLE_LABELS: Record<string, string> = {
  LAND_OWNER: 'Land Owner',
  EXPERT: 'Expert',
  FIELD_MANAGER: 'Field Manager',
  WORKER: 'Worker',
  CLUSTER_ADMIN: 'Cluster Admin',
};

const ROLE_BADGE: Record<string, string> = {
  LAND_OWNER: 'gx-status gx-s-done',
  EXPERT: 'gx-status gx-s-pending',
  FIELD_MANAGER: 'gx-status gx-s-alert',
  WORKER: 'gx-status',
  CLUSTER_ADMIN: 'gx-status gx-s-done',
};

export default function AdminUsersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u: any) => {
      const matchSearch = !q ||
        String(u.name || u.full_name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.uid || '').toLowerCase().includes(q) ||
        String(u.phone || '').toLowerCase().includes(q);
      const userRole = (u.role || '').toUpperCase().replace(/-/g, '_');
      const matchRole = roleFilter === 'ALL' || userRole === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: string) => { setRoleFilter(v); setPage(1); };

  const normalizeRole = (r: string) => (r || '').toUpperCase().replace(/-/g, '_');

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div className="gx-page-title"><Users className="inline-block w-4 h-4 mr-1 align-middle" /> Users</div>
            <div className="gx-page-sub">{users.length} total users on the platform</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="gx-card" style={{ marginBottom: 16 }}>
        <div className="gx-card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              className="gx-input"
              style={{ paddingLeft: 30 }}
              placeholder="Search name, email, UID, phone..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="gx-select" style={{ flex: '0 0 180px' }} value={roleFilter} onChange={e => handleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            {ROLE_OPTIONS.filter(r => r !== 'ALL').map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
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
            <strong>Failed to load users:</strong> {(error as Error)?.message || 'Unknown error'}
          </div>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><Users className="inline-block w-4 h-4 mr-1 align-middle" /> All Users</div>
            <span className="gx-status gx-s-done">{filtered.length} users</span>
          </div>
          <div className="gx-card-body">
            {paginated.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <Users size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <div>{search || roleFilter !== 'ALL' ? 'No users match your search.' : 'No users found.'}</div>
              </div>
            ) : (
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>UID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u: any, i: number) => {
                    const role = normalizeRole(u.role);
                    return (
                      <tr
                        key={u.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="hover:bg-muted/30"
                      >
                        <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{u.name || u.full_name || '—'}</td>
                        <td><code style={{ fontSize: 11 }}>{u.uid || '—'}</code></td>
                        <td>{u.email || '—'}</td>
                        <td>{u.phone || '—'}</td>
                        <td><span className={ROLE_BADGE[role] || 'gx-status'}>{ROLE_LABELS[role] || u.role || '—'}</span></td>
                        <td><span className={u.isActive === false ? 'gx-status gx-s-alert' : 'gx-status gx-s-done'}>{u.isActive === false ? 'Inactive' : 'Active'}</span></td>
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
