import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface AdminDetailPageProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  backHref: string;
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  fields: DetailField[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function AdminDetailPage({
  title,
  subtitle,
  icon,
  backHref,
  isLoading,
  isError,
  error,
  onRetry,
  fields,
  actions,
  children,
}: AdminDetailPageProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => navigate(backHref)}
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={15} /> Back to list
          </button>
        </div>
        <div className="gx-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ opacity: 0.8 }}>{icon}</span>}
          {title}
        </div>
        {subtitle && <div className="gx-page-sub">{subtitle}</div>}
      </div>

      {isError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--gx-radius)', marginBottom: 20,
        }}>
          <AlertTriangle size={18} style={{ color: 'var(--gx-red)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--gx-red)' }}>Failed to load</strong>
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

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: 12 }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--gx-green)' }} />
          <span style={{ color: 'var(--gx-text3)' }}>Loading…</span>
        </div>
      ) : (
        <>
          {/* Action buttons */}
          {actions && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}

          {/* Fields card */}
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header">
              <div className="gx-card-title">Details</div>
            </div>
            <div className="gx-card-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0 24px',
              }}>
                {fields.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: f.fullWidth ? '1 / -1' : undefined,
                      padding: '12px 0',
                      borderBottom: '1px solid var(--gx-border)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gx-text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--gx-text)', fontWeight: 500 }}>
                      {f.value ?? <span style={{ opacity: 0.4 }}>—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {children}
        </>
      )}
    </>
  );
}
