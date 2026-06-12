import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { ClipboardList } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminPrescriptionsList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-prescriptions'],
    queryFn: () => admin.getPrescriptions().catch(() => []),
    retry: 2,
  });

  return (
    <AdminListPage
      title="Prescriptions"
      subtitle={`${data.length} expert prescriptions`}
      icon={<ClipboardList size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by expert ID, chemical name…"
      searchKeys={['expertId', 'alertId', 'chemicalName', 'applicationMethod']}
      filters={[
        {
          key: 'isacknowledged',
          label: 'All Statuses',
          options: [
            { value: 'true', label: 'Acknowledged' },
            { value: 'false', label: 'Pending' },
          ],
        },
      ]}
      columns={[
        { key: 'alertId', label: 'Alert ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).alertId?.slice(-8) || '—'}</span> },
        { key: 'expertId', label: 'Expert ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).expertId?.slice(-8) || '—'}</span> },
        { key: 'chemicalName', label: 'Chemical', render: r => <strong>{(r as any).chemicalName || '—'}</strong> },
        { key: 'dose', label: 'Dose', render: r => (r as any).dose || '—' },
        { key: 'applicationMethod', label: 'Method', render: r => (r as any).applicationMethod || '—' },
        { key: 'createdAt', label: 'Date', render: r => (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString() : '—' },
        {
          key: 'isacknowledged', label: 'Status',
          render: r => <span className={`gx-status ${(r as any).isacknowledged ? 'gx-s-active' : 'gx-s-pending'}`}>
            {(r as any).isacknowledged ? 'Acknowledged' : 'Pending'}
          </span>,
        },
      ]}
      onRowClick={row => navigate(`/admin/prescriptions/${(row as any).id}`)}
      emptyMessage="No prescriptions found. Try adjusting your search or filters."
    />
  );
}
