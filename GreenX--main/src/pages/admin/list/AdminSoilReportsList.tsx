import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { FileText } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminSoilReportsList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-soil-reports'],
    queryFn: () => admin.getSoilReports().catch(() => []),
    retry: 2,
  });

  const ratingBadge = (rating: string) => {
    const map: Record<string, string> = {
      EXCELLENT: 'gx-s-active', GOOD: 'gx-s-done',
      FAIR: 'gx-s-pending', POOR: 'gx-s-alert',
    };
    return <span className={`gx-status ${map[(rating || '').toUpperCase()] || 'gx-s-waiting'}`}>{rating || '—'}</span>;
  };

  return (
    <AdminListPage
      title="Soil Reports"
      subtitle={`${data.length} lab analysis reports`}
      icon={<FileText size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by farm ID, expert ID…"
      searchKeys={['farmId', 'expertId', 'overallRating']}
      filters={[
        {
          key: 'overallRating',
          label: 'All Ratings',
          options: [
            { value: 'EXCELLENT', label: 'Excellent' },
            { value: 'GOOD', label: 'Good' },
            { value: 'FAIR', label: 'Fair' },
            { value: 'POOR', label: 'Poor' },
          ],
        },
      ]}
      columns={[
        { key: 'farmId', label: 'Farm ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).farmId?.slice(-8) || '—'}</span> },
        { key: 'expertId', label: 'Expert ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).expertId?.slice(-8) || '—'}</span> },
        { key: 'reportDate', label: 'Date', render: r => (r as any).reportDate ? new Date((r as any).reportDate).toLocaleDateString() : (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString() : '—' },
        {
          key: 'npk', label: 'N / P / K',
          render: r => {
            const n = (r as any).nitrogenKgHa;
            const p = (r as any).phosphorusKgHa;
            const k = (r as any).potassiumKgHa;
            if (!n && !p && !k) return '—';
            return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{n ?? '?'} / {p ?? '?'} / {k ?? '?'}</span>;
          },
        },
        { key: 'phLevel', label: 'pH', render: r => (r as any).phLevel ?? '—' },
        { key: 'overallRating', label: 'Rating', render: r => ratingBadge((r as any).overallRating) },
      ]}
      onRowClick={row => navigate(`/admin/soil-reports/${(row as any).id}`)}
      emptyMessage="No soil reports found. Try adjusting your search or filters."
    />
  );
}
