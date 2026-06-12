import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, AlertTriangle } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'LAND_OWNER', label: 'Land Owner' },
  { value: 'EXPERT', label: 'Expert' },
  { value: 'FIELD_MANAGER', label: 'Field Manager' },
  { value: 'WORKER', label: 'Worker' },
  { value: 'CLUSTER_ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function roleBadge(role: string) {
  const r = (role || '').toUpperCase();
  if (r.includes('ADMIN')) return 'gx-s-alert';
  if (r === 'EXPERT') return 'gx-s-done';
  if (r.includes('FIELD') || r.includes('MANAGER')) return 'gx-s-pending';
  return 'gx-s-pending';
}

function roleLabel(role: string) {
  const r = (role || '').toUpperCase();
  if (r === 'LAND_OWNER' || r === 'LANDOWNER') return 'Land Owner';
  if (r === 'FIELD_MANAGER' || r === 'FIELDMANAGER') return 'Field Manager';
  if (r === 'CLUSTER_ADMIN' || r === 'ADMIN') return 'Admin';
  if (r === 'EXPERT') return 'Expert';
  if (r === 'WORKER') return 'Worker';
  return role || '—';
}

export default function UsersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const filtered = useMemo(() => {
    let list = users as any[];

    if (roleFilter !== 'ALL') {
      list = list.filter((u) => {
        const r = (u.role || '').toUpperCase().replace(/-/g, '_');
        return r === roleFilter || r.includes(roleFilter.replace('_', ''));
      });
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((u) =>
        statusFilter === 'ACTIVE' ? u.isActive !== false : u.isActive === false
      );
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          String(u.name || '').toLowerCase().includes(q) ||
          String(u.email || '').toLowerCase().includes(q) ||
          String(u.uid || '').toLowerCase().includes(q) ||
          String(u.phone || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, search, roleFilter, statusFilter]);

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
              <Users className="inline-block w-5 h-5 mr-2 align-middle" />
              All Users
            </div>
            <div className="gx-page-sub">{users.length} total users on the platform</div>
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
                placeholder="Name, email, UID, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Role</label>
              <select
                className="gx-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
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
            <Users className="inline-block w-4 h-4 mr-1 align-middle" /> User Directory
          </div>
          <span className="gx-status gx-s-done">{filtered.length} users</span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading users...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load users'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>
                {search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No users match your filters.'
                  : 'No users found.'}
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>UID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user: any, i: number) => (
                    <tr
                      key={user.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {user.uid || user.id?.slice(-6) || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{user.name || '—'}</td>
                      <td style={{ fontSize: 12 }}>{user.email || '—'}</td>
                      <td style={{ fontSize: 12 }}>{user.phone || '—'}</td>
                      <td>
                        <span className={`gx-status ${roleBadge(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            user.isActive !== false ? 'gx-s-done' : 'gx-s-alert'
                          }`}
                        >
                          {user.isActive !== false ? 'Active' : 'Inactive'}
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
