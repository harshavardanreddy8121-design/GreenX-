import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { TestTubes } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminSubmissionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: submissions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-pending-samples'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
  });

  const submission = (submissions as any[]).find((s: any) => s.id === id);

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

  const fields = submission ? [
    { label: 'Submission ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{submission.id}</span> },
    { label: 'Sample Code', value: <span style={{ fontFamily: 'monospace' }}>{submission.sampleCode || '—'}</span> },
    { label: 'Farm ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{submission.farmId || '—'}</span> },
    { label: 'Collected By', value: submission.collectorName || submission.collectedBy || '—' },
    { label: 'Assigned Expert', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{submission.assignedExpertId || '—'}</span> },
    { label: 'Status', value: statusBadge(submission.status) },
    { label: 'Priority', value: priorityBadge(submission.priority) },
    { label: 'Collection Date', value: submission.collectionDate ? new Date(submission.collectionDate).toLocaleDateString() : '—' },
    { label: 'Num Points', value: submission.numPoints ?? '—' },
    { label: 'Sampling Method', value: submission.samplingMethod || '—' },
    { label: 'Depth (cm)', value: submission.depthCm ?? '—' },
    { label: 'Soil Texture', value: submission.soilTexture || '—' },
    { label: 'GPS Coordinates', value: submission.gpsCoordinates || '—' },
    { label: 'Notes', value: submission.collectionNotes || '—', fullWidth: true },
    { label: 'Created At', value: submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '—' },
  ] : [];

  return (
    <AdminDetailPage
      title={submission ? (submission.sampleCode || 'Submission Detail') : 'Submission Detail'}
      subtitle={submission ? `Farm: ${submission.farmId || '—'}` : undefined}
      icon={<TestTubes size={26} />}
      backHref="/admin/submissions"
      isLoading={isLoading && !submission}
      isError={isError && !submission}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
