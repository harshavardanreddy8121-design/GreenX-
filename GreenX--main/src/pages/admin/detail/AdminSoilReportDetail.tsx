import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { FileText } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';

export default function AdminSoilReportDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: reports = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-soil-reports'],
    queryFn: () => admin.getSoilReports().catch(() => []),
    retry: 2,
  });

  const report = (reports as any[]).find((r: any) => r.id === id);

  const ratingBadge = (rating: string) => {
    const map: Record<string, string> = {
      EXCELLENT: 'gx-s-active', GOOD: 'gx-s-done',
      FAIR: 'gx-s-pending', POOR: 'gx-s-alert',
    };
    return <span className={`gx-status ${map[(rating || '').toUpperCase()] || 'gx-s-waiting'}`}>{rating || '—'}</span>;
  };

  const fields = report ? [
    { label: 'Report ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{report.id}</span> },
    { label: 'Farm ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{report.farmId || '—'}</span> },
    { label: 'Expert ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{report.expertId || '—'}</span> },
    { label: 'Sample ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{report.sampleId || '—'}</span> },
    { label: 'Report Date', value: report.reportDate ? new Date(report.reportDate).toLocaleDateString() : '—' },
    { label: 'Overall Rating', value: ratingBadge(report.overallRating) },
    { label: 'pH Level', value: report.phLevel ?? '—' },
    { label: 'Nitrogen (kg/ha)', value: report.nitrogenKgHa ?? '—' },
    { label: 'Phosphorus (kg/ha)', value: report.phosphorusKgHa ?? '—' },
    { label: 'Potassium (kg/ha)', value: report.potassiumKgHa ?? '—' },
    { label: 'Organic Matter (%)', value: report.organicMatterPct ?? '—' },
    { label: 'Moisture (%)', value: report.moisturePct ?? '—' },
    { label: 'EC (dS/m)', value: report.ecDsM ?? '—' },
    { label: 'Zinc (ppm)', value: report.zincPpm ?? '—' },
    { label: 'Boron (ppm)', value: report.boronPpm ?? '—' },
    { label: 'Sulphur (ppm)', value: report.sulphurPpm ?? '—' },
    { label: 'Iron (ppm)', value: report.ironPpm ?? '—' },
    { label: 'Expert Remarks', value: report.expertRemarks || '—', fullWidth: true },
    { label: 'Created At', value: report.createdAt ? new Date(report.createdAt).toLocaleString() : '—' },
  ] : [];

  return (
    <AdminDetailPage
      title="Soil Report Detail"
      subtitle={report ? `Farm: ${report.farmId || '—'}` : undefined}
      icon={<FileText size={26} />}
      backHref="/admin/soil-reports"
      isLoading={isLoading && !report}
      isError={isError && !report}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
    />
  );
}
