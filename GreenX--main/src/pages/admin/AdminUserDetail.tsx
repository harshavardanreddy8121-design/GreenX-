import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { admin } from '@/lib/api';
import { AlertTriangle, ArrowLeft, Edit, Mail, Phone, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  LAND_OWNER: 'Land Owner',
  EXPERT: 'Expert',
  FIELD_MANAGER: 'Field Manager',
  WORKER: 'Worker',
  CLUSTER_ADMIN: 'Cluster Admin',
};

const ROLE_BADGE: Record<string, string> = {
  LAND_OWNER: 'gx-status gx-s-done',
  EXPERT: 'gx-status gx-s-pending',
  FIELD_MANAGER: 'gx-status gx-s-alert',
  WORKER: 'gx-status',
  CLUSTER_ADMIN: 'gx-status gx-s-done',
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-farms-list'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => admin.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      navigate('/admin/users');
    },
    onError: (err: Error) => {
      const msg = err.message || 'Failed to delete user';
      if (msg.toLowerCase().includes('constraint')) {
        toast.error('Cannot delete this user — related records exist. Reassign data first.');
      } else {
        toast.error(msg);
      }
    },
  });

  const user = users.find((u: any) => u.id === id);
  const normalizeRole = (r: string) => (r || '').toUpperCase().replace(/-/g, '_');

  // Find farms associated with this user
  const userFarms = farms.filter((f: any) =>
    f.ownerId === id || f.fieldManagerId === id || f.expertId === id
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="gx-alert-box gx-alert-red" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={18} />
        <div style={{ flex: 1 }}>
          <strong>Failed to load user:</strong> {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/users')}>Back to list</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
        <User size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>User not found</div>
        <button className="gx-btn gx-btn-ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Users
        </button>
      </div>
    );
  }

  const role = normalizeRole((user as any).role);

  return (
    <>
      <div className="gx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => navigate('/admin/users')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Users
          </button>
          <div>
            <div className="gx-page-title"><User className="inline-block w-4 h-4 mr-1 align-middle" /> {(user as any).name || (user as any).full_name || 'User Detail'}</div>
            <div className="gx-page-sub">User ID: {(user as any).id}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => toast.info('Edit functionality — use the Users management page')}
          >
            <Edit size={14} /> Edit
          </button>
          <button
            className="gx-btn gx-btn-ghost gx-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gx-red)' }}
            disabled={deleteUser.isPending || (user as any).id === currentUser?.id}
            onClick={() => {
              if ((user as any).id === currentUser?.id) {
                toast.error('You cannot delete your own account.');
                return;
              }
              if (confirm(`Delete user "${(user as any).name || (user as any).email}"? This cannot be undone.`)) {
                deleteUser.mutate((user as any).id);
              }
            }}
          >
            <Trash2 size={14} /> {deleteUser.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Profile */}
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><User className="inline-block w-4 h-4 mr-1 align-middle" /> Profile</div>
            <span className={ROLE_BADGE[role] || 'gx-status'}>{ROLE_LABELS[role] || (user as any).role || '—'}</span>
          </div>
          <div className="gx-card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--gx-green-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: 'var(--gx-green)'
              }}>
                {((user as any).name || (user as any).full_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{(user as any).name || (user as any).full_name || 'Unnamed'}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>UID: {(user as any).uid || '—'}</div>
              </div>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email</span>
              <span className="gx-metric-value">{(user as any).email || '—'}</span>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</span>
              <span className="gx-metric-value">{(user as any).phone || '—'}</span>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label">Role</span>
              <span className="gx-metric-value">{ROLE_LABELS[role] || (user as any).role || '—'}</span>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label">Status</span>
              <span className="gx-metric-value">
                <span className={(user as any).isActive === false ? 'gx-status gx-s-alert' : 'gx-status gx-s-done'}>
                  {(user as any).isActive === false ? 'Inactive' : 'Active'}
                </span>
              </span>
            </div>
            <div className="gx-metric-row">
              <span className="gx-metric-label">Cluster ID</span>
              <span className="gx-metric-value"><code style={{ fontSize: 11 }}>{(user as any).clusterId?.slice(0, 12) || '—'}</code></span>
            </div>
          </div>
        </div>

        {/* Associated Farms */}
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title">Associated Farms</div>
            <span className="gx-status gx-s-done">{userFarms.length}</span>
          </div>
          <div className="gx-card-body">
            {userFarms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>No farms associated with this user.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userFarms.map((f: any) => (
                  <div
                    key={f.id}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,.03)',
                      borderRadius: 8,
                      borderLeft: '3px solid var(--gx-green)',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/admin/farms/${f.id}`)}
                    className="hover:bg-muted/30"
                  >
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{f.name || f.farmCode || f.id}</div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                      {f.village || '—'} · {f.district || '—'} ·{' '}
                      <span className={f.status === 'ACTIVE' ? 'gx-status gx-s-done' : 'gx-status gx-s-pending'} style={{ fontSize: 10 }}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
