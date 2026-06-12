import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { HardHat } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminWorkersList() {
  const navigate = useNavigate();

  // Workers are filtered from the full users list since there may not be a dedicated endpoint
  const { data: allUsers = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const workers = (allUsers as any[]).filter((u: any) =>
    ['WORKER', 'USER'].includes((u.role || '').toUpperCase())
  );

  return (
    <AdminListPage
      title="Workers"
      subtitle={`${workers.length} registered workers`}
      icon={<HardHat size={26} />}
      backHref="/admin"
      data={workers}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by name, email, UID…"
      searchKeys={['name', 'email', 'uid', 'phone']}
      filters={[
        {
          key: 'isActive',
          label: 'All Statuses',
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ],
        },
      ]}
      columns={[
        { key: 'uid', label: 'UID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{(r as any).uid || '—'}</span> },
        { key: 'name', label: 'Name', render: r => <strong>{(r as any).name || '—'}</strong> },
        { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 13 }}>{(r as any).email || '—'}</span> },
        { key: 'phone', label: 'Phone', render: r => (r as any).phone || '—' },
        {
          key: 'isActive', label: 'Status',
          render: r => <span className={`gx-status ${(r as any).isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
            {(r as any).isActive !== false ? 'Active' : 'Inactive'}
          </span>,
        },
      ]}
      onRowClick={row => navigate(`/admin/workers/${(row as any).id}`)}
      emptyMessage="No workers found. Try adjusting your search or filters."
    />
  );
}
