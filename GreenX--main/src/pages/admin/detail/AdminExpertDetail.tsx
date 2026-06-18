import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { Microscope } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminExpertDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: experts = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-expert-list'],
    queryFn: () => admin.getExperts(),
    retry: 2,
  });

  const expert = (experts as any[]).find((e: any) => e.id === id);

  const fields = expert ? [
    { label: 'User ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{expert.id}</span> },
    { label: 'UID', value: <span style={{ fontFamily: 'monospace' }}>{expert.uid || '—'}</span> },
    { label: 'Full Name', value: expert.name || '—' },
    { label: 'Email', value: expert.email || '—' },
    { label: 'Phone', value: expert.phone || '—' },
    { label: 'Role', value: <span className="gx-status gx-s-done">Expert</span> },
    {
      label: 'Status',
      value: <span className={`gx-status ${expert.isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
        {expert.isActive !== false ? 'Active' : 'Inactive'}
      </span>,
    },
    { label: 'Cluster ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{expert.clusterId || '—'}</span> },
  ] : [];

  return (
    <AdminDetailPage
      title={expert ? (expert.name || 'Expert Detail') : 'Expert Detail'}
      subtitle={expert ? expert.email : undefined}
      icon={<Microscope size={26} />}
      backHref="/admin/experts"
      isLoading={isLoading && !expert}
      isError={isError && !expert}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
