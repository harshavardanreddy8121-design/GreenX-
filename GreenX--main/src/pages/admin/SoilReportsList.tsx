import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTubes, Search, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REVIEWED', label: 'Reviewed' },
];

export default function SoilReportsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: samples = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-soil-reports-list'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms-soil'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-soil'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const getFarmName = (farmId: string) => {
    const farm = (farms as any[]).find((f) => f.id === farmId);
    return farm ? farm.name || farm.farmCode || farmId : farmId;
  };

  const getExpertName = (expertId: string) => {
    const user = (users as any[]).find((u) => u.id === expertId);
    return user ? user.name || user.email : expertId || '—';
  };

  const filtered = useMemo(() => {
    let list = samples as any[];

    if (statusFilter !== 'ALL') {
      list = list.filter((s) => (s.status || '').toUpperCase() === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          String(s.sampleCode || '').toLowerCase().includes(q) ||
          String(s.farmId || '').toLowerCase().includes(q) ||
          getFarmName(s.farmId).toLowerCase().includes(q) ||
          String(s.collectedBy || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [samples, search, statusFilter, farms]);

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
              <TestTubes className="inline-block w-5 h-5 mr-2 align-middle" />
              Soil Reports
            </div>
            <div className="gx-page-sub">{samples.length} soil samples in the system</div>
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
                placeholder="Sample code, farm, collected by..."
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
            <TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Sample Pipeline
          </div>
          <span className="gx-status gx-s-done">{filtered.length} samples</span>
        </div>
        <div className="gx-card-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div style={{ marginTop: 12, opacity: 0.5, fontSize: 13 }}>Loading soil reports...</div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="gx-alert-box gx-alert-red">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" />
              <span>{(error as Error)?.message || 'Failed to load soil reports'}</span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <TestTubes className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <div>
                {search || statusFilter !== 'ALL'
                  ? 'No soil reports match your filters.'
                  : 'No soil reports found.'}
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="gx-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sample Code</th>
                    <th>Farm</th>
                    <th>Collected By</th>
                    <th>Assigned Expert</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any, i: number) => (
                    <tr
                      key={s.id}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      onClick={() => navigate(`/admin/soil-reports/${s.id}`)}
                    >
                      <td>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {s.sampleCode || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{getFarmName(s.farmId)}</td>
                      <td>{s.collectorName || s.collectedBy || '—'}</td>
                      <td>{getExpertName(s.assignedExpertId)}</td>
                      <td style={{ fontSize: 12 }}>
                        {s.collectionDate
                          ? new Date(s.collectionDate).toLocaleDateString('en-IN')
                          : s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            s.priority === 'HIGH' ? 'gx-s-alert' : 'gx-s-pending'
                          }`}
                        >
                          {s.priority || 'Normal'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gx-status ${
                            s.status === 'COMPLETED' || s.status === 'REVIEWED'
                              ? 'gx-s-done'
                              : 'gx-s-pending'
                          }`}
                        >
                          {s.status || 'PENDING'}
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
