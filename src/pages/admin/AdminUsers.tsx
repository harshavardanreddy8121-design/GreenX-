import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin, auth as apiAuth } from '@/lib/api';
import { javaApi } from '@/integrations/java-api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Plus, X, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/types/database';

interface UserWithRole {
  id: string;
  full_name: string;
  phone: string;
  role: AppRole | null;
  email: string;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', role: 'worker' as AppRole });
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'worker' as AppRole });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers().catch(() => []),
  });

  const createUser = useMutation({
    mutationFn: (formData: typeof form) =>
      apiAuth.register(formData.email.trim().toLowerCase(), formData.password, formData.full_name, formData.role),
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreate(false);
      setForm({ email: '', password: '', full_name: '', phone: '', role: 'worker' });
    },
    onError: (err: any) => {
      const message = err?.message || 'Failed to create user';
      if (message.includes('ORA-00001') || message.toLowerCase().includes('unique constraint')) {
        toast.error('Email already exists. Please use a different email.');
        return;
      }
      toast.error(message);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, full_name, phone }: { id: string; full_name: string; phone: string }) => {
      const r = await javaApi.update('USERS', id, { full_name, phone });
      if (!r.success) throw new Error(r.error || 'Failed to update profile');
    },
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const r = await javaApi.update('USERS', userId, { role });
      if (!r.success) throw new Error(r.error || 'Failed to update role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => admin.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      const message = err?.message || 'Failed to delete user';
      if (message.toLowerCase().includes('constraint')) {
        toast.error('Cannot delete this user because related records depend on it. Reassign related data first.');
        return;
      }
      toast.error(message);
    },
  });

  const openEdit = (u: UserWithRole) => {
    setEditingUser(u);
    setEditForm({ full_name: u.full_name || '', phone: u.phone || '', role: u.role || 'worker' });
  };

  const saveEdit = () => {
    if (!editingUser) return;
    updateProfile.mutate({ id: editingUser.id, full_name: editForm.full_name, phone: editForm.phone });
    if (editForm.role !== editingUser.role) {
      updateRole.mutate({ userId: editingUser.id, role: editForm.role });
    }
  };

  const handleDeleteUser = (u: UserWithRole) => {
    if (u.id === user?.id) {
      toast.error('You cannot delete your own account while logged in.');
      return;
    }
    if (!confirm(`Delete user ${u.full_name || u.email || u.id}?`)) return;
    deleteUser.mutate(u.id);
  };

  // Normalize DB roles (CLUSTER_ADMIN, FIELD_MANAGER, LAND_OWNER, EXPERT, WORKER, ADMIN) to display keys
  const normalizeRoleKey = (r: string | null | undefined): string => {
    const s = (r || '').toUpperCase().replace(/-/g, '_');
    if (s === 'CLUSTER_ADMIN' || s === 'ADMIN') return 'admin';
    if (s === 'FIELD_MANAGER' || s === 'FIELDMANAGER') return 'fieldmanager';
    if (s === 'LAND_OWNER' || s === 'LANDOWNER') return 'landowner';
    if (s === 'EXPERT') return 'expert';
    if (s === 'WORKER' || s === 'USER') return 'worker';
    return s.toLowerCase();
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin', landowner: 'Land Owner', fieldmanager: 'Field Manager', expert: 'Expert', worker: 'Worker',
  };

  const roleBadgeColor: Record<string, string> = {
    admin: 'bg-destructive/10 text-destructive',
    landowner: 'bg-blue-100 text-blue-700',
    fieldmanager: 'bg-purple-100 text-purple-700',
    expert: 'bg-yellow-100 text-yellow-700',
    worker: 'bg-primary/10 text-primary',
  };

  return (
    <div>
      <div className="gx-page-header">
        <div className="gx-page-title">Users & Roles 👥</div>
        <div className="gx-page-sub">Manage platform users and their access roles</div>
      </div>

      <div className="gx-section-divider">👥 User Management</div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowCreate(true)} className="gx-btn gx-btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : users.length === 0 ? (
        <div className="gx-card">
          <div className="gx-card-body" style={{ textAlign: 'center', padding: '50px 0', color: 'var(--gx-text2)' }}>
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No users created yet.</p>
          </div>
        </div>
      ) : (
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title">👥 All Users</div>
            <span className="gx-status gx-s-done">{users.length}</span>
          </div>
          <div className="gx-card-body" style={{ display: 'grid', gap: 10 }}>
            {users.map((u: UserWithRole) => (
              <div key={u.id} className="gx-card" style={{ marginBottom: 0 }}>
                <div className="gx-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: 'var(--gx-text)' }}>{u.full_name || 'Unnamed User'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      {u.email && <span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>{u.email}</span>}
                      {u.role && (
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[normalizeRoleKey(u.role)] || 'bg-muted text-muted-foreground'}`} style={{ letterSpacing: 0.4 }}>
                          {roleLabels[normalizeRoleKey(u.role)] || u.role}
                        </span>
                      )}
                      {u.phone && (
                        <span style={{ fontSize: 12, color: 'var(--gx-text2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Phone className="w-3 h-3" /> {u.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => openEdit(u)} className="gx-btn gx-btn-ghost gx-btn-sm" title="Edit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDeleteUser(u)} disabled={deleteUser.isPending}
                      className="gx-btn gx-btn-ghost gx-btn-sm disabled:opacity-50" title="Delete" style={{ color: 'var(--gx-red)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="gx-card" style={{ width: '100%', maxWidth: 560 }}>
            <div className="flex items-center justify-between">
              <h3 className="gx-card-title" style={{ fontSize: 18 }}>Create New User</h3>
              <button onClick={() => setShowCreate(false)} className="gx-btn gx-btn-ghost gx-btn-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="gx-card-body" style={{ padding: 0 }}>
              <div className="gx-form-grid" style={{ marginBottom: 14 }}>
                <div className="gx-form-group">
                  <label className="gx-label">Full Name</label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Venkat Reddy" className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email" placeholder="user@example.com" className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Password (min 6 chars)</label>
                  <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    type="password" placeholder="Min 6 characters" className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210" className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AppRole }))}
                    className="gx-select">
                    <option value="landowner">Land Owner</option>
                    <option value="fieldmanager">Field Manager</option>
                    <option value="expert">Expert</option>
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => createUser.mutate(form)} disabled={createUser.isPending || !form.email || !form.password || form.password.length < 6}
              className="gx-btn gx-btn-green w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus className="w-4 h-4" /> {createUser.isPending ? 'Creating...' : 'Create User'}
            </button>
            {form.password && form.password.length < 6 && (
              <p className="text-xs text-destructive text-center">Password must be at least 6 characters</p>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="gx-card" style={{ width: '100%', maxWidth: 560 }}>
            <div className="flex items-center justify-between">
              <h3 className="gx-card-title" style={{ fontSize: 18 }}>Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="gx-btn gx-btn-ghost gx-btn-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="gx-card-body" style={{ padding: 0 }}>
              <div className="gx-form-grid" style={{ marginBottom: 14 }}>
                <div className="gx-form-group">
                  <label className="gx-label">Full Name</label>
                  <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="gx-input" />
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as AppRole }))}
                    className="gx-select">
                    <option value="landowner">Land Owner</option>
                    <option value="fieldmanager">Field Manager</option>
                    <option value="expert">Expert</option>
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={saveEdit} disabled={updateProfile.isPending}
              className="gx-btn gx-btn-green w-full py-2.5 text-sm font-medium disabled:opacity-50">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
