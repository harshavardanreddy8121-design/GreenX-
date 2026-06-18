import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { TestTubes } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminSubmissionsList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-pending-samples'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
    refetchInterval: 30000,
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      COLLECTED: 'gx-s-pending', AT_LAB: 'gx-s-done',
      TESTING: 'gx-s-active', COMPLETED: 'gx-s-waiting',
    };
    return <span className={`gx-status ${map[(status || '').toUpperCase()] || 'gx-s-waiting'}`}>{status || '—'}</span>;
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, string> = { HIGH: 'gx-s-alert', NORMAL: 'gx-s-done', LOW: 'gx-s-waiting' };
    return <span className={`gx-status ${map[(priority || '').toUpperCase()] || 'gx-s-waiting'}`}>{priority || 'Normal'}</span>;
  };

  return (
    <AdminListPage
      title="Submissions"
      subtitle={`${data.length} soil sample submissions`}
      icon={<TestTubes size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by farm ID, collected by, status…"
      searchKeys={['farmId', 'collectedBy', 'sampleCode', 'status']}
      filters={[
        {
          key: 'status',
          label: 'All Statuses',
          options: [
            { value: 'COLLECTED', label: 'Collected' },
            { value: 'AT_LAB', label: 'At Lab' },
            { value: 'TESTING', label: 'Testing' },
            { value: 'COMPLETED', label: 'Completed' },
          ],
        },
        {
          key: 'priority',
          label: 'All Priorities',
          options: [
            { value: 'HIGH', label: 'High' },
            { value: 'NORMAL', label: 'Normal' },
            { value: 'LOW', label: 'Low' },
          ],
        },
      ]}
      columns={[
        { key: 'sampleCode', label: 'Sample Code', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{(r as any).sampleCode || '—'}</span> },
        { key: 'farmId', label: 'Farm ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).farmId?.slice(-8) || '—'}</span> },
        { key: 'collectedBy', label: 'Collected By', render: r => (r as any).collectorName || (r as any).collectedBy || '—' },
        { key: 'status', label: 'Status', render: r => statusBadge((r as any).status) },
        { key: 'priority', label: 'Priority', render: r => priorityBadge((r as any).priority) },
        { key: 'createdAt', label: 'Date', render: r => (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString() : '—' },
      ]}
      onRowClick={row => navigate(`/admin/submissions/${(row as any).id}`)}
      emptyMessage="No submissions found. Try adjusting your search or filters."
    />
  );
}
