import { Skeleton } from '@/components/ui/skeleton';

/**
 * Reusable loading skeleton for dashboard stat cards and content cards.
 * Use while React Query is fetching data from the backend.
 */

export function StatCardSkeleton() {
  return (
    <div className="gx-stat-card" style={{ minHeight: 90 }}>
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="gx-stats-row">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="gx-card" style={{ marginBottom: 20 }}>
      <div className="gx-card-header">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="gx-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="gx-card" style={{ marginBottom: 20 }}>
      <div className="gx-card-header">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="gx-card-body">
        {/* Header row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--gx-border)' }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3" style={{ flex: 1 }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-3" style={{ flex: 1, opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <DashboardStatsSkeleton />
      <div className="gx-content-grid">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={5} />
      </div>
      <TableSkeleton cols={5} rows={4} />
    </>
  );
}
