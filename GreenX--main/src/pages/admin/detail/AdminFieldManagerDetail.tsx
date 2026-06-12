import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { Tractor } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminFieldManagerDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: managers = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  const manager = (managers as any[]).find((m: any) => m.id === id);

  const fields = manager ? [
    { label: 'User ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{manager.id}</span> },
    { label: 'UID', value: <span style={{ fontFamily: 'monospace' }}>{manager.uid || '—'}</span> },
    { label: 'Full Name', value: manager.name || '—' },
    { label: 'Email', value: manager.email || '—' },
    { label: 'Phone', value: manager.phone || '—' },
    { label: 'Role', value: <span className="gx-status gx-s-active">Field Manager</span> },
    {
      label: 'Status',
      value: <span className={`gx-status ${manager.isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
        {manager.isActive !== false ? 'Active' : 'Inactive'}
      </span>,
    },
    { label: 'Cluster ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{manager.clusterId || '—'}</span> },
  ] : [];

  return (
    <AdminDetailPage
      title={manager ? (manager.name || 'Field Manager Detail') : 'Field Manager Detail'}
      subtitle={manager ? manager.email : undefined}
      icon={<Tractor size={26} />}
      backHref="/admin/field-managers"
      isLoading={isLoading && !manager}
      isError={isError && !manager}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
