import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { Wheat } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminFarmsList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'gx-s-active', REGISTERED: 'gx-s-pending', INACTIVE: 'gx-s-waiting',
    };
    return <span className={`gx-status ${map[status] || 'gx-s-waiting'}`}>{status || '—'}</span>;
  };

  return (
    <AdminListPage
      title="Farms"
      subtitle={`${data.length} farms registered`}
      icon={<Wheat size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by name, code, village…"
      searchKeys={['name', 'farmCode', 'village', 'district']}
      filters={[
        {
          key: 'status',
          label: 'All Statuses',
          options: [
            { value: 'REGISTERED', label: 'Registered' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ],
        },
      ]}
      columns={[
        { key: 'farmCode', label: 'Farm Code', render: r => <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{(r as any).farmCode || '—'}</span> },
        { key: 'name', label: 'Farm Name', render: r => <strong>{(r as any).name || '—'}</strong> },
        { key: 'village', label: 'Village', render: r => (r as any).village || '—' },
        { key: 'district', label: 'District', render: r => (r as any).district || '—' },
        { key: 'ownerId', label: 'Owner ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).ownerId?.slice(-8) || '—'}</span> },
        { key: 'status', label: 'Status', render: r => statusBadge((r as any).status) },
      ]}
      onRowClick={row => navigate(`/admin/farms/${(row as any).id}`)}
      emptyMessage="No farms found. Try adjusting your search or filters."
    />
  );
}
