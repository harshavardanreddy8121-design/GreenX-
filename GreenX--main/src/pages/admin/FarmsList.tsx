import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Search, MapPin, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'REGISTERED', 'INACTIVE', 'PENDING'];

export default function FarmsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: farms = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-farms-list'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const filtered = useMemo(() => {
    let list = farms as any[];
    if (statusFilter !== 'ALL') {
      list = list.filter((f) => (f.status || '').toUpperCase() === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          String(f.farmCode || '').toLowerCase().includes(q) ||
          String(f.name || '').toLowerCase().includes(q) ||
          String(f.village || '').toLowerCase().includes(q) ||
          String(f.district || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [farms, search, statusFilter]);

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
              <Building2 className="inline-block w-5 h-5 mr-2 align-middle" />
              All Farms
            </div>
            <div className="gx-page-sub">{farms.length} total farms registered</div>
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
                placeholder="Farm code, name, village, district..."
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
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Statuses' : s}
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
            <Building2 className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Registry
          </div>
          <span className="gx-status gx-s-done">{filtered.length} farms</span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading farms...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load farms'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>{search || statusFilter !== 'ALL' ? 'No farms match your filters.' : 'No farms registered yet.'}</div>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Farm Code</th>
                    <th>Name</th>
                    <th>Village</th>
                    <th>District</th>
                    <th>Land (acres)</th>
                    <th>Crop</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((farm: any, i: number) => (
                    <tr
                      key={farm.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/farms/${farm.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                          {farm.farmCode || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{farm.name || '—'}</td>
                      <td>{farm.village || '—'}</td>
                      <td>{farm.district || '—'}</td>
                      <td>{farm.totalLand ?? '—'}</td>
                      <td>{farm.currentCrop || '—'}</td>
                      <td>
                        <span
                          className={`gx-status ${
                            farm.status === 'ACTIVE'
                              ? 'gx-s-done'
                              : farm.status === 'REGISTERED'
                              ? 'gx-s-pending'
                              : 'gx-s-alert'
                          }`}
                        >
                          {farm.status || 'PENDING'}
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
