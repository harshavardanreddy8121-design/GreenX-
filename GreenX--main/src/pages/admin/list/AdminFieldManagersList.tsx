import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { Tractor } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminFieldManagersList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  return (
    <AdminListPage
      title="Field Managers"
      subtitle={`${data.length} field managers`}
      icon={<Tractor size={26} />}
      backHref="/admin"
      data={data}
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
      onRowClick={row => navigate(`/admin/field-managers/${(row as any).id}`)}
      emptyMessage="No field managers found. Try adjusting your search or filters."
    />
  );
}
