import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminListPageProps<T> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  backHref?: string;
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function AdminListPage<T>({
  title,
  subtitle,
  icon,
  backHref = '/admin',
  data,
  columns,
  isLoading,
  isError,
  error,
  onRetry,
  searchPlaceholder = 'Search…',
  searchKeys = [],
  filters = [],
  onRowClick,
  rowKey,
  pageSize = 10,
  emptyMessage = 'No items found.',
  actions,
}: AdminListPageProps<T>) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(row =>
        searchKeys.some(key => {
          const val = getNestedValue(row, String(key));
          return String(val ?? '').toLowerCase().includes(q);
        })
      );
    }

    // Apply filters
    filters.forEach(f => {
      const val = filterValues[f.key];
      if (val && val !== '') {
        result = result.filter(row => {
          const rowVal = getNestedValue(row, f.key);
          return String(rowVal ?? '').toLowerCase() === val.toLowerCase();
        });
      }
    });

    return result;
  }, [data, search, searchKeys, filters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleFilter = (key: string, val: string) => {
    setFilterValues(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  return (
    <>
      {/* Header */}
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => navigate(backHref)}
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
        <div className="gx-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ opacity: 0.8 }}>{icon}</span>}
          {title}
        </div>
        {subtitle && <div className="gx-page-sub">{subtitle}</div>}
      </div>

      {/* Error state */}
      {isError && (
        <div className="gx-alert-box gx-alert-red" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--gx-radius)', marginBottom: 20,
        }}>
          <AlertTriangle size={18} style={{ color: 'var(--gx-red)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--gx-red)' }}>Failed to load data</strong>
            <div style={{ fontSize: 13, color: 'var(--gx-text2)', marginTop: 2 }}>
              {error?.message || 'Could not connect to the server.'}
            </div>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="gx-btn gx-btn-ghost gx-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gx-text3)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            className="gx-input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8, fontSize: 14 }}
          />
        </div>

        {/* Filter dropdowns */}
        {filters.map(f => (
          <select
            key={f.key}
            className="gx-select"
            value={filterValues[f.key] || ''}
            onChange={e => handleFilter(f.key, e.target.value)}
            style={{ flex: '0 0 auto', minWidth: 140, paddingTop: 8, paddingBottom: 8, fontSize: 14 }}
          >
            <option value="">{f.label}</option>
            {f.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}

        {/* Total count */}
        <span className="gx-status gx-s-done" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>

        {actions}
      </div>

      {/* Table card */}
      <div className="gx-card">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', gap: 12 }}>
            <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderColor: 'var(--gx-green)' }} />
            <span style={{ color: 'var(--gx-text3)', fontSize: 14 }}>Loading…</span>
          </div>
        ) : pageData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gx-text3)' }}>
            <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 15 }}>{emptyMessage}</div>
            {(search || Object.values(filterValues).some(Boolean)) && (
              <button
                onClick={() => { setSearch(''); setFilterValues({}); }}
                className="gx-btn gx-btn-ghost gx-btn-sm"
                style={{ marginTop: 12 }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gx-data-table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {onRowClick && <th style={{ width: 60 }}></th>}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, idx) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                  >
                    <td style={{ color: 'var(--gx-text3)', fontSize: 13 }}>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(row)
                          : String(getNestedValue(row, col.key) ?? '—')}
                      </td>
                    ))}
                    {onRowClick && (
                      <td>
                        <ChevronRight size={16} style={{ color: 'var(--gx-text3)' }} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', borderTop: '1px solid var(--gx-border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--gx-text3)' }}>
              Page {currentPage} of {totalPages} · {filtered.length} total
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gx-btn gx-btn-ghost gx-btn-sm"
                style={{ padding: '5px 10px' }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) {
                  p = i + 1;
                } else if (currentPage <= 3) {
                  p = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  p = totalPages - 4 + i;
                } else {
                  p = currentPage - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="gx-btn gx-btn-ghost gx-btn-sm"
                    style={{
                      padding: '5px 10px',
                      background: p === currentPage ? 'var(--gx-green-dim)' : undefined,
                      color: p === currentPage ? 'var(--gx-green)' : undefined,
                      borderColor: p === currentPage ? 'var(--gx-green)' : undefined,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gx-btn gx-btn-ghost gx-btn-sm"
                style={{ padding: '5px 10px' }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
