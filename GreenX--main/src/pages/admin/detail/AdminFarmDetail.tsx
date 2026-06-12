import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { Wheat, Pencil, Trash2 } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';
import { toast } from 'sonner';

export default function AdminFarmDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: farms = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const farm = (farms as any[]).find((f: any) => f.id === id);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'gx-s-active', REGISTERED: 'gx-s-pending', INACTIVE: 'gx-s-waiting',
    };
    return <span className={`gx-status ${map[status] || 'gx-s-waiting'}`}>{status || '—'}</span>;
  };

  const handleDelete = async () => {
    if (!farm) return;
    if (!confirm(`Delete farm "${farm.name || farm.farmCode}"? This cannot be undone.`)) return;
    try {
      await admin.deleteFarm(farm.id);
      toast.success('Farm deleted');
      navigate('/admin/farms');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete farm');
    }
  };

  const fields = farm ? [
    { label: 'Farm ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{farm.id}</span> },
    { label: 'Farm Code', value: <span style={{ fontFamily: 'monospace' }}>{farm.farmCode || '—'}</span> },
    { label: 'Farm Name', value: farm.name || '—' },
    { label: 'Status', value: statusBadge(farm.status) },
    { label: 'Village', value: farm.village || '—' },
    { label: 'District', value: farm.district || '—' },
    { label: 'State', value: farm.state || '—' },
    { label: 'Pincode', value: farm.pincode || '—' },
    { label: 'Total Land', value: farm.totalLand ? `${farm.totalLand} acres` : '—' },
    { label: 'Soil Type', value: farm.soilType || '—' },
    { label: 'Water Source', value: farm.waterSource || '—' },
    { label: 'Current Crop', value: farm.currentCrop || '—' },
    { label: 'Current Stage', value: farm.currentStage || '—' },
    { label: 'Crop Health Score', value: farm.cropHealthScore != null ? `${farm.cropHealthScore}/100` : '—' },
    { label: 'Expected Revenue', value: farm.expectedRevenue ? `₹${farm.expectedRevenue.toLocaleString('en-IN')}` : '—' },
    { label: 'Profit Share', value: farm.profitShare ? `${farm.profitShare}%` : '—' },
    { label: 'Owner ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{farm.ownerId || '—'}</span> },
    { label: 'Field Manager ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{farm.fieldManagerId || '—'}</span> },
    { label: 'Cluster ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{farm.clusterId || '—'}</span> },
    { label: 'Registered On', value: farm.createdAt ? new Date(farm.createdAt).toLocaleString() : '—' },
  ] : [];

  return (
    <AdminDetailPage
      title={farm ? (farm.name || farm.farmCode || 'Farm Detail') : 'Farm Detail'}
      subtitle={farm ? `Farm Code: ${farm.farmCode || '—'}` : undefined}
      icon={<Wheat size={26} />}
      backHref="/admin/farms"
      isLoading={isLoading && !farm}
      isError={isError && !farm}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
      actions={
        farm ? (
          <>
            <button
              onClick={handleDelete}
              className="gx-btn gx-btn-ghost gx-btn-sm"
              style={{ color: 'var(--gx-red)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={15} /> Delete Farm
            </button>
          </>
        ) : undefined
      }
    />
  );
}
