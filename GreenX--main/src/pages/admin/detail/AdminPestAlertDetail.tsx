import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { Bug } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminPestAlertDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: alerts = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const alert = (alerts as any[]).find((a: any) => a.id === id);

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

  const fields = alert ? [
    { label: 'Alert ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{alert.id}</span> },
    { label: 'Farm ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{alert.farmId || '—'}</span> },
    { label: 'Reported By', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{alert.reportedBy || '—'}</span> },
    { label: 'Pest Name', value: alert.pestName || '—' },
    { label: 'Pest Type', value: alert.pestType || '—' },
    { label: 'Severity', value: severityBadge(alert.severity) },
    { label: 'Status', value: statusBadge(alert.status) },
    { label: 'Affected Area (%)', value: alert.affectedAreaPct != null ? `${alert.affectedAreaPct}%` : '—' },
    { label: 'Field Location', value: alert.fieldLocation || '—' },
    { label: 'Description', value: alert.description || '—', fullWidth: true },
    { label: 'Reported On', value: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—' },
    { label: 'Resolved At', value: alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '—' },
  ] : [];

  return (
    <AdminDetailPage
      title={alert ? (alert.pestName || 'Pest Alert Detail') : 'Pest Alert Detail'}
      subtitle={alert ? `Farm: ${alert.farmId || '—'}` : undefined}
      icon={<Bug size={26} />}
      backHref="/admin/pest-alerts"
      isLoading={isLoading && !alert}
      isError={isError && !alert}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
