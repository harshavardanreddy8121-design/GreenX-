import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { HardHat } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminWorkerDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: allUsers = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const worker = (allUsers as any[]).find((u: any) => u.id === id);

  const fields = worker ? [
    { label: 'User ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{worker.id}</span> },
    { label: 'UID', value: <span style={{ fontFamily: 'monospace' }}>{worker.uid || '—'}</span> },
    { label: 'Full Name', value: worker.name || '—' },
    { label: 'Email', value: worker.email || '—' },
    { label: 'Phone', value: worker.phone || '—' },
    { label: 'Role', value: <span className="gx-status gx-s-waiting">Worker</span> },
    {
      label: 'Status',
      value: <span className={`gx-status ${worker.isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
        {worker.isActive !== false ? 'Active' : 'Inactive'}
      </span>,
    },
    { label: 'Cluster ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{worker.clusterId || '—'}</span> },
  ] : [];

  return (
    <AdminDetailPage
      title={worker ? (worker.name || 'Worker Detail') : 'Worker Detail'}
      subtitle={worker ? worker.email : undefined}
      icon={<HardHat size={26} />}
      backHref="/admin/workers"
      isLoading={isLoading && !worker}
      isError={isError && !worker}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
