import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { GreenXLogo } from '@/components/GreenXLogo';
import WeatherWidget from '@/components/WeatherWidget';
import { LogOut, CheckCircle2, Circle, Clock, Package, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function WorkerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqItem, setReqItem] = useState('');
  const [reqCategory, setReqCategory] = useState('chemical');
  const [reqQty, setReqQty] = useState('1');
  const [reqUrgency, setReqUrgency] = useState('medium');
  const [reqNote, setReqNote] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // Check today's attendance
  const today = new Date().toISOString().split('T')[0];
  const { data: attended = false } = useQuery({
    queryKey: ['worker-attendance', user?.id, today],
    queryFn: async () => {
      const response = await javaApi.select('attendance', {
        eq: { user_id: user?.id },
        gte: { check_in: today }
      });
      return response.success && response.data && (response.data as any[]).length > 0;
    },
    enabled: !!user?.id,
  });

  // Get assigned tasks
  const { data: myTasks = [] } = useQuery({
    queryKey: ['worker-tasks', user?.id],
    queryFn: async () => {
      const response = await javaApi.select('tasks', {
        eq: { assigned_to: user?.id },
        order: { field: 'due_date', ascending: false }
      });
      return response.success && response.data ? response.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  // Get assigned farms
  const { data: myFarms = [] } = useQuery({
    queryKey: ['worker-farms', user?.id],
    queryFn: async () => {
      const assignResponse = await javaApi.select('farm_assignments', {
        eq: { user_id: user?.id, role: 'worker' }
      });

      if (!assignResponse.success || !assignResponse.data) return [];

      const assignments = assignResponse.data as any[];
      if (!assignments.length) return [];

      const farmIds = assignments.map((a: any) => a.farm_id);
      const farmsResponse = await javaApi.select('farms', {
        in: { id: farmIds }
      });

      return farmsResponse.success && farmsResponse.data ? farmsResponse.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  const markAttendance = useMutation({
    mutationFn: async () => {
      const farmId = myFarms.length > 0 ? myFarms[0].id : null;
      const response = await javaApi.insert('attendance', {
        user_id: user?.id,
        farm_id: farmId,
        note: 'Daily check-in',
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      toast.success('Attendance marked');
      queryClient.invalidateQueries({ queryKey: ['worker-attendance'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleTask = useMutation({
    mutationFn: async (task: any) => {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const response = await javaApi.update('tasks', task.id, { status: newStatus });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-tasks'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      const response = await javaApi.insert('equipment_requests', {
        user_id: user?.id,
        farm_id: myFarms.length > 0 ? myFarms[0].id : null,
        equipment_type: reqCategory,
        item: reqItem,
        quantity: reqQty,
        priority: reqUrgency,
        note: reqNote,
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      toast.success('Request submitted');
      setShowRequestModal(false);
      setReqItem('');
      setReqNote('');
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

      <main className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Weather */}
        {myFarms.length > 0 && <WeatherWidget village={myFarms[0].village} pincode={myFarms[0].pincode} compact />}

        {/* Attendance */}
        <button onClick={() => markAttendance.mutate()} disabled={attended || markAttendance.isPending}
          className={`w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-70 ${attended ? 'bg-primary text-primary-foreground' : 'btn-gradient text-primary-foreground'
            }`}>
          <Clock className="w-6 h-6" />
          {attended ? '✓ Attendance Marked' : markAttendance.isPending ? 'Marking...' : 'Mark Attendance'}
        </button>

        {/* My Farms */}
        {myFarms.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">My Farms</h2>
            {myFarms.map((farm: any) => (
              <div key={farm.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">{farm.name}</h3>
                <p className="text-xs text-muted-foreground">{farm.village} · {farm.total_land} acres · {farm.crop || '—'}</p>
              </div>
            ))}
          </>
        )}

        {/* Equipment Request Button */}
        <button onClick={() => setShowRequestModal(true)}
          className="w-full py-3 rounded-xl border border-border bg-card flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
          <Package className="w-5 h-5 text-primary" /> Request Equipment / Supplies
        </button>

        {/* Today's Tasks */}
        <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks assigned yet</p>
          </div>
        ) : (
          myTasks.map((task: any) => (
            <div key={task.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTask.mutate(task)} disabled={toggleTask.isPending} className="mt-0.5 shrink-0">
                  {task.status === 'completed'
                    ? <CheckCircle2 className="w-6 h-6 text-primary" />
                    : <Circle className="w-6 h-6 text-muted-foreground" />}
                </button>
                <div className="flex-1">
                  <p className={`text-base font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.farms?.name} · {task.due_date}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Equipment Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Request Equipment</h3>
              <button onClick={() => setShowRequestModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <select value={reqCategory} onChange={e => setReqCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              <option value="chemical">Pesticide / Chemical</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="drone">Drone Service</option>
              <option value="tool">Tools / Equipment</option>
              <option value="motor">Motor / Pump</option>
              <option value="irrigation">Irrigation Parts</option>
              <option value="other">Other</option>
            </select>
            <input value={reqItem} onChange={e => setReqItem(e.target.value)}
              placeholder="Item name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input value={reqQty} onChange={e => setReqQty(e.target.value)}
                placeholder="Quantity" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <select value={reqUrgency} onChange={e => setReqUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <textarea value={reqNote} onChange={e => setReqNote(e.target.value)} rows={2}
              placeholder="Note (optional)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
            <button onClick={() => submitRequest.mutate()} disabled={submitRequest.isPending || !reqItem}
              className="w-full py-2.5 rounded-lg btn-gradient text-primary-foreground text-sm font-medium disabled:opacity-50">
              <Send className="w-4 h-4 inline mr-2" /> {submitRequest.isPending ? 'Sending...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
