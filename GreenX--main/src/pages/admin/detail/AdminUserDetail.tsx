import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { Users, Trash2 } from 'lucide-react';
import { AdminDetailPage } from '../components/AdminDetailPage';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  CLUSTER_ADMIN: 'Admin', ADMIN: 'Admin',
  LAND_OWNER: 'Land Owner', LANDOWNER: 'Land Owner',
  EXPERT: 'Expert',
  FIELD_MANAGER: 'Field Manager', FIELDMANAGER: 'Field Manager',
  WORKER: 'Worker', USER: 'Worker',
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: users = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const user = (users as any[]).find((u: any) => u.id === id);
  const roleKey = (role: string) => (role || '').toUpperCase().replace(/-/g, '_');

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return;
    try {
      await admin.deleteUser(user.id);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete user');
    }
  };

  const fields = user ? [
    { label: 'User ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user.id}</span> },
    { label: 'UID', value: <span style={{ fontFamily: 'monospace' }}>{user.uid || '—'}</span> },
    { label: 'Full Name', value: user.name || '—' },
    { label: 'Email', value: user.email || '—' },
    { label: 'Phone', value: user.phone || '—' },
    {
      label: 'Role',
      value: <span className="gx-status gx-s-done">{ROLE_LABELS[roleKey(user.role)] || user.role || '—'}</span>,
    },
    {
      label: 'Status',
      value: <span className={`gx-status ${user.isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
        {user.isActive !== false ? 'Active' : 'Inactive'}
      </span>,
    },
    { label: 'Cluster ID', value: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user.clusterId || '—'}</span> },
  ] : [];

  return (
    <AdminDetailPage
      title={user ? (user.name || user.email || 'User Detail') : 'User Detail'}
      subtitle={user ? `Role: ${ROLE_LABELS[roleKey(user.role)] || user.role || '—'}` : undefined}
      icon={<Users size={26} />}
      backHref="/admin/users"
      isLoading={isLoading && !user}
      isError={isError && !user}
      error={error as Error}
      onRetry={() => refetch()}
      fields={fields}
      actions={
        user ? (
          <button
            onClick={handleDelete}
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ color: 'var(--gx-red)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Trash2 size={15} /> Delete User
          </button>
        ) : undefined
      }
    />
  );
}
