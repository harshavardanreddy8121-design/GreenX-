import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope, Search, AlertTriangle } from 'lucide-react';

export default function ExpertsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-users-experts'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms-experts'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const experts = useMemo(() => {
    return (users as any[]).filter(
      (u) => (u.role || '').toUpperCase() === 'EXPERT'
    );
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter(
      (u: any) =>
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.uid || '').toLowerCase().includes(q)
    );
  }, [experts, search]);

  const assignedFarmsCount = (expertId: string) =>
    (farms as any[]).filter((f) => f.expertId === expertId).length;

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
              <Microscope className="inline-block w-5 h-5 mr-2 align-middle" />
              Experts
            </div>
            <div className="gx-page-sub">{experts.length} experts registered</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-body">
          <div className="gx-form-group">
            <label className="gx-label">
              <Search className="inline-block w-3 h-3 mr-1 align-middle" /> Search
            </label>
            <input
              type="text"
              className="gx-input"
              placeholder="Name, email, UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gx-card">
        <div className="gx-card-header">
          <div className="gx-card-title">
            <Microscope className="inline-block w-4 h-4 mr-1 align-middle" /> Expert Directory
          </div>
          <span className="gx-status gx-s-done">{filtered.length} experts</span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading experts...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load experts'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <Microscope className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>{search ? 'No experts match your search.' : 'No experts registered yet.'}</div>
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
                    <th>Assigned Farms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((expert: any, i: number) => (
                    <tr
                      key={expert.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/users/${expert.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {expert.uid || expert.id?.slice(-6) || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{expert.name || '—'}</td>
                      <td style={{ fontSize: 12 }}>{expert.email || '—'}</td>
                      <td style={{ fontSize: 12 }}>{expert.phone || '—'}</td>
                      <td>
                        <span className="gx-status gx-s-done">
                          {assignedFarmsCount(expert.id)} farms
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            expert.isActive !== false ? 'gx-s-done' : 'gx-s-alert'
                          }`}
                        >
                          {expert.isActive !== false ? 'Active' : 'Inactive'}
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
