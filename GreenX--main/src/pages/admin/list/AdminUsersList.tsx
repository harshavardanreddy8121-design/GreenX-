import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { admin } from '@/lib/api';
import { Users } from 'lucide-react';
import { AdminListPage } from '../components/AdminListPage';

const ROLE_LABELS: Record<string, string> = {
  CLUSTER_ADMIN: 'Admin', ADMIN: 'Admin',
  LAND_OWNER: 'Land Owner', LANDOWNER: 'Land Owner',
  EXPERT: 'Expert',
  FIELD_MANAGER: 'Field Manager', FIELDMANAGER: 'Field Manager',
  WORKER: 'Worker', USER: 'Worker',
};

const ROLE_COLORS: Record<string, string> = {
  CLUSTER_ADMIN: 'gx-s-alert', ADMIN: 'gx-s-alert',
  LAND_OWNER: 'gx-s-done', LANDOWNER: 'gx-s-done',
  EXPERT: 'gx-s-pending',
  FIELD_MANAGER: 'gx-s-active', FIELDMANAGER: 'gx-s-active',
  WORKER: 'gx-s-waiting', USER: 'gx-s-waiting',
};

export default function AdminUsersList() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const roleKey = (role: string) => (role || '').toUpperCase().replace(/-/g, '_');

  return (
    <AdminListPage
      title="Users"
      subtitle={`${data.length} registered users`}
      icon={<Users size={26} />}
      backHref="/admin"
      data={data}
      rowKey={r => (r as any).id}
      isLoading={isLoading}
      isError={isError}
      error={error as Error}
      onRetry={() => refetch()}
      searchPlaceholder="Search by name, email, UID, phone…"
      searchKeys={['name', 'email', 'uid', 'phone']}
      filters={[
        {
          key: 'role',
          label: 'All Roles',
          options: [
            { value: 'LAND_OWNER', label: 'Land Owner' },
            { value: 'EXPERT', label: 'Expert' },
            { value: 'FIELD_MANAGER', label: 'Field Manager' },
            { value: 'WORKER', label: 'Worker' },
            { value: 'CLUSTER_ADMIN', label: 'Admin' },
          ],
        },
      ]}
      columns={[
        { key: 'uid', label: 'UID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{(r as any).uid || '—'}</span> },
        { key: 'name', label: 'Name', render: r => <strong>{(r as any).name || '—'}</strong> },
        { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 13 }}>{(r as any).email || '—'}</span> },
        { key: 'phone', label: 'Phone', render: r => (r as any).phone || '—' },
        {
          key: 'role', label: 'Role',
          render: r => {
            const k = roleKey((r as any).role);
            return <span className={`gx-status ${ROLE_COLORS[k] || 'gx-s-waiting'}`}>{ROLE_LABELS[k] || (r as any).role || '—'}</span>;
          },
        },
        {
          key: 'isActive', label: 'Status',
          render: r => <span className={`gx-status ${(r as any).isActive !== false ? 'gx-s-active' : 'gx-s-waiting'}`}>
            {(r as any).isActive !== false ? 'Active' : 'Inactive'}
          </span>,
        },
      ]}
      onRowClick={row => navigate(`/admin/users/${(row as any).id}`)}
      emptyMessage="No users found. Try adjusting your search or filters."
    />
  );
}
