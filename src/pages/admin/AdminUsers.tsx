import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
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
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', role: 'worker' as AppRole });
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'worker' as AppRole });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const profilesResponse = await javaApi.select('profiles', {});
      const rolesResponse = await javaApi.select('user_roles', {});

      const profiles = profilesResponse.success && profilesResponse.data ? profilesResponse.data as any[] : [];
      const roles = rolesResponse.success && rolesResponse.data ? rolesResponse.data as any[] : [];

      if (!profiles) return [];

      return profiles.map((p: any) => {
        const userRole = roles?.find((r: any) => r.user_id === p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          phone: p.phone,
          role: userRole?.role || null,
          email: '',
        } as UserWithRole;
      });
    },
  });

  const createUser = useMutation({
    mutationFn: async (formData: typeof form) => {
      const response = await javaApi.insert('users', formData);
      if (!response.success) throw new Error(response.error || 'Failed to create user');
      return response.data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreate(false);
      setForm({ email: '', password: '', full_name: '', phone: '', role: 'worker' });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create user');
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, full_name, phone }: { id: string; full_name: string; phone: string }) => {
      const response = await javaApi.update('profiles', id, { full_name, phone });
      if (!response.success) throw new Error(response.error);
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
      const delResponse = await javaApi.delete('user_roles', userId);
      if (!delResponse.success) throw new Error(delResponse.error);

      const insResponse = await javaApi.insert('user_roles', { user_id: userId, role });
      if (!insResponse.success) throw new Error(insResponse.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err.message),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Users & Roles</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-gradient text-primary-foreground text-sm font-medium">
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No users created yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u: UserWithRole) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{u.full_name || 'Unnamed User'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {u.role && (
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[u.role] || 'bg-muted text-muted-foreground'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  )}
                  {u.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {u.phone}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Create New User</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Venkat Reddy" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  type="email" placeholder="user@example.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password (min 6 chars)</label>
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  type="password" placeholder="Min 6 characters" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AppRole }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="landowner">Land Owner</option>
                  <option value="fieldmanager">Field Manager</option>
                  <option value="expert">Expert</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button onClick={() => createUser.mutate(form)} disabled={createUser.isPending || !form.email || !form.password || form.password.length < 6}
              className="w-full py-2.5 rounded-lg btn-gradient text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
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
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Edit User</h3>
              <button onClick={() => setEditingUser(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as AppRole }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="landowner">Land Owner</option>
                  <option value="fieldmanager">Field Manager</option>
                  <option value="expert">Expert</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button onClick={saveEdit} disabled={updateProfile.isPending}
              className="w-full py-2.5 rounded-lg btn-gradient text-primary-foreground text-sm font-medium disabled:opacity-50">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
