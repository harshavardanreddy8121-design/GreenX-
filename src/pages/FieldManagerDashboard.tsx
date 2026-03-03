import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { GreenXLogo } from '@/components/GreenXLogo';
import WeatherWidget from '@/components/WeatherWidget';
import { LogOut, Sprout, Plus, X, Send, ClipboardList, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function FieldManagerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWorkerId, setNewTaskWorkerId] = useState('');
  const [newTaskFarmId, setNewTaskFarmId] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // Get farms assigned to this field manager
  const { data: myFarms = [] } = useQuery({
    queryKey: ['fm-farms', user?.id],
    queryFn: async () => {
      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'fieldmanager' }
      });
      if (!assignResponse.success || !assignResponse.data) return [];
      const assignments = assignResponse.data as any[];
      if (!assignments?.length) return [];
      const farmIds = assignments.map((a: any) => a.farm_id);
      const farmsResponse = await javaApi.select('farms', {
        in: { id: farmIds }
      });
      return farmsResponse.success && farmsResponse.data ? farmsResponse.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  // Get workers (users with worker role)
  const { data: workers = [] } = useQuery({
    queryKey: ['fm-workers'],
    queryFn: async () => {
      const rolesResponse = await javaApi.select('user_roles', {
        eq: { role: 'worker' }
      });
      if (!rolesResponse.success || !rolesResponse.data) return [];
      const roles = rolesResponse.data as any[];
      if (!roles?.length) return [];
      const ids = roles.map((r: any) => r.user_id);
      const profileResponse = await javaApi.select('profiles', {
        in: { id: ids }
      });
      return profileResponse.success && profileResponse.data ? profileResponse.data as any[] : [];
    },
  });

  // Get pending tasks for assigned farms
  const { data: tasks = [] } = useQuery({
    queryKey: ['fm-tasks', user?.id],
    queryFn: async () => {
      if (!myFarms.length) return [];
      const farmIds = myFarms.map((f: any) => f.id);
      const taskResponse = await javaApi.select('tasks', {
        in: { farm_id: farmIds },
        order: { field: 'created_at', ascending: false }
      });
      return taskResponse.success && taskResponse.data ? taskResponse.data as any[] : [];
    },
    enabled: myFarms.length > 0,
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const response = await javaApi.insert('tasks', {
        title: newTaskTitle,
        assigned_to: newTaskWorkerId,
        farm_id: newTaskFarmId,
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
        photo_required: true,
        created_by: user?.id,
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      toast.success('Task created');
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskWorkerId('');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const assignWorker = useMutation({
    mutationFn: async ({ farmId, workerId }: { farmId: string; workerId: string }) => {
      const response = await javaApi.insert('farm_assignments', {
        farm_id: farmId,
        user_id: workerId,
        role: 'worker',
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      toast.success('Worker assigned');
      setShowAssignModal(null);
      queryClient.invalidateQueries({ queryKey: ['fm-farms'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <GreenXLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{profile?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted"><LogOut className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
        {/* Weather for first assigned farm */}
        {myFarms.length > 0 && (
          <WeatherWidget village={myFarms[0].village} pincode={myFarms[0].pincode} compact />
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Assigned Farms</h2>
          <button onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg btn-gradient text-primary-foreground text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>

        {myFarms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No farms assigned to you yet.</p>
            <p className="text-xs mt-1">Ask your admin to assign farms to your account.</p>
          </div>
        ) : (
          myFarms.map((farm: any) => {
            const isExpanded = expandedBlock === farm.id;
            return (
              <div key={farm.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedBlock(isExpanded ? null : farm.id)} className="w-full p-4 flex items-center justify-between text-left">
                  <div>
                    <h3 className="font-semibold text-foreground">{farm.name} — {farm.crop || 'No crop'}</h3>
                    <p className="text-xs text-muted-foreground">{farm.village} · {farm.total_land} acres · {farm.growth_stage || '—'}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-foreground mb-2">Soil Data</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">pH:</span> <span className="font-medium">{farm.soil_ph || '—'}</span></div>
                        <div><span className="text-muted-foreground">N:</span> <span className="font-medium">{farm.soil_nitrogen || '—'}</span></div>
                        <div><span className="text-muted-foreground">P:</span> <span className="font-medium">{farm.soil_phosphorus || '—'}</span></div>
                        <div><span className="text-muted-foreground">K:</span> <span className="font-medium">{farm.soil_potassium || '—'}</span></div>
                        <div><span className="text-muted-foreground">OC:</span> <span className="font-medium">{farm.soil_organic_carbon || '—'}</span></div>
                        <div><span className="text-muted-foreground">Moisture:</span> <span className="font-medium">{farm.soil_moisture || '—'}%</span></div>
                      </div>
                    </div>

                    <button onClick={() => setShowAssignModal(farm.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm hover:bg-muted/50 transition-colors">
                      <Users className="w-4 h-4" /> Assign Worker
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Tasks */}
        <h2 className="text-lg font-semibold text-foreground pt-2">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks created yet.</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <ClipboardList className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.profiles?.full_name || 'Unassigned'} · {task.farms?.name} · {task.status}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'}`}>
                {task.status}
              </span>
            </div>
          ))
        )}
      </main>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Create Task</h3>
              <button onClick={() => setShowTaskModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Task description" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <select value={newTaskWorkerId} onChange={e => setNewTaskWorkerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              <option value="">Select Worker</option>
              {workers.map((w: any) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
            </select>
            <select value={newTaskFarmId} onChange={e => setNewTaskFarmId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              <option value="">Select Farm</option>
              {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={() => createTask.mutate()} disabled={createTask.isPending || !newTaskTitle || !newTaskWorkerId || !newTaskFarmId}
              className="w-full py-2.5 rounded-lg btn-gradient text-primary-foreground text-sm font-medium disabled:opacity-50">
              <Send className="w-4 h-4 inline mr-2" /> {createTask.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {/* Assign Worker Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Assign Worker</h3>
              <button onClick={() => setShowAssignModal(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            {workers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workers available. Ask admin to create worker accounts.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {workers.map((w: any) => (
                  <button key={w.id} onClick={() => assignWorker.mutate({ farmId: showAssignModal, workerId: w.id })}
                    disabled={assignWorker.isPending}
                    className="w-full p-3 rounded-lg border border-border text-left hover:bg-muted/50 transition-colors disabled:opacity-50">
                    <p className="text-sm font-medium text-foreground">{w.full_name}</p>
                    <p className="text-xs text-muted-foreground">{w.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
