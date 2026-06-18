import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { ClipboardList } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminPrescriptionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: prescriptions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-prescriptions'],
    queryFn: () => admin.getPrescriptions().catch(() => []),
    retry: 2,
  });

  const prescription = (prescriptions as any[]).find((p: any) => p.id === id);

  const fields = prescription ? [
    { label: 'Prescription ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{prescription.id}</span> },
    { label: 'Alert ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{prescription.alertId || '—'}</span> },
    { label: 'Expert ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{prescription.expertId || '—'}</span> },
    { label: 'Chemical Name', value: prescription.chemicalName || '—' },
    { label: 'Chemical Type', value: prescription.chemicalType || '—' },
    { label: 'Dose', value: prescription.dose || '—' },
    { label: 'Dilution Ratio', value: prescription.dilutionRatio || '—' },
    { label: 'Application Method', value: prescription.applicationMethod || '—' },
    { label: 'Application Timing', value: prescription.applicationTiming || '—' },
    { label: 'Pre-Harvest Interval', value: prescription.preHarvestInterval || '—' },
    {
      label: 'Status',
      value: <span className={`gx-status ${prescription.isacknowledged ? 'gx-s-active' : 'gx-s-pending'}`}>
        {prescription.isacknowledged ? 'Acknowledged' : 'Pending Acknowledgement'}
      </span>,
    },
    { label: 'Acknowledged At', value: prescription.acknowledgedAt ? new Date(prescription.acknowledgedAt).toLocaleString() : '—' },
    { label: 'Safety Precautions', value: prescription.safetyPrecautions || '—', fullWidth: true },
    { label: 'FM Instructions', value: prescription.fmInstructions || '—', fullWidth: true },
    { label: 'Created At', value: prescription.createdAt ? new Date(prescription.createdAt).toLocaleString() : '—' },
  ] : [];

  return (
    <AdminDetailPage
      title={prescription ? (prescription.chemicalName || 'Prescription Detail') : 'Prescription Detail'}
      subtitle={prescription ? `Expert: ${prescription.expertId || '—'}` : undefined}
      icon={<ClipboardList size={26} />}
      backHref="/admin/prescriptions"
      isLoading={isLoading && !prescription}
      isError={isError && !prescription}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
