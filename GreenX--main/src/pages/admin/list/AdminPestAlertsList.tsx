import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { Bug } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

export default function AdminPestAlertsList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const severityBadge = (severity: string) => {
    const map: Record<string, string> = {
      HIGH: 'gx-s-alert', MEDIUM: 'gx-s-pending', LOW: 'gx-s-done',
    };
    return <span className={`gx-status ${map[(severity || '').toUpperCase()] || 'gx-s-waiting'}`}>{severity || '—'}</span>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'gx-s-alert', IN_PROGRESS: 'gx-s-pending', RESOLVED: 'gx-s-active',
    };
    return <span className={`gx-status ${map[(status || '').toUpperCase()] || 'gx-s-waiting'}`}>{status || '—'}</span>;
  };

  return (
    <AdminListPage
      title="Pest Alerts"
      subtitle={`${data.length} pest alerts`}
      icon={<Bug size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by farm ID, pest type…"
      searchKeys={['farmId', 'pestName', 'pestType', 'status']}
      filters={[
        {
          key: 'status',
          label: 'All Statuses',
          options: [
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'RESOLVED', label: 'Resolved' },
          ],
        },
        {
          key: 'severity',
          label: 'All Severities',
          options: [
            { value: 'HIGH', label: 'High' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'LOW', label: 'Low' },
          ],
        },
      ]}
      columns={[
        { key: 'farmId', label: 'Farm ID', render: r => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{(r as any).farmId?.slice(-8) || '—'}</span> },
        { key: 'pestName', label: 'Pest Type', render: r => <strong>{(r as any).pestName || '—'}</strong> },
        { key: 'createdAt', label: 'Date', render: r => (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString() : '—' },
        { key: 'status', label: 'Status', render: r => statusBadge((r as any).status) },
        { key: 'severity', label: 'Severity', render: r => severityBadge((r as any).severity) },
        { key: 'affectedAreaPct', label: 'Area Affected', render: r => (r as any).affectedAreaPct != null ? `${(r as any).affectedAreaPct}%` : '—' },
      ]}
      onRowClick={row => navigate(`/admin/pest-alerts/${(row as any).id}`)}
      emptyMessage="No pest alerts found. Try adjusting your search or filters."
    />
  );
}
