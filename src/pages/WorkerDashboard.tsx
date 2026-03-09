import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { upsertWorkflowEvent } from '@/utils/workflowEvents';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'attendance' | 'tasks' | 'farms' | 'photos' | 'requests';

export default function WorkerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoType, setPhotoType] = useState('crop_progress');

  const handleLogout = () => { logout(); navigate('/'); };
  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance = null } = useQuery({
    queryKey: ['worker-attendance', user?.id, today],
    queryFn: async () => {
      const r = await javaApi.select('attendance', { eq: { user_id: user?.id }, gte: { check_in: today } });
      return r.success && r.data && (r.data as any[]).length > 0 ? (r.data as any[])[0] : null;
    },
    enabled: !!user?.id,
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['worker-tasks', user?.id],
    queryFn: async () => {
      const r = await javaApi.select('tasks', { eq: { assigned_to: user?.id }, order: { field: 'due_date', ascending: false } });
      return r.success && r.data ? r.data as any[] : [];
    },
    enabled: !!user?.id,
  });

  const { data: myFarms = [] } = useQuery({
    queryKey: ['worker-farms', user?.id],
    queryFn: async () => {
      const aR = await javaApi.select('farm_assignments', { eq: { user_id: user?.id, role: 'worker' } });
      if (aR.success && aR.data) {
        const ids = (aR.data as any[]).map((a: any) => a.farm_id);
        if (ids.length) {
          const fR = await javaApi.select('farms', { in: { id: ids } });
          if (fR.success && fR.data) return fR.data as any[];
        }
      }
      return [];
    },
    enabled: !!user?.id,
  });

  const markAttendance = useMutation({
    mutationFn: async (type: 'checkin' | 'checkout') => {
      const farmId = myFarms.length > 0 ? myFarms[0].id : null;
      if (type === 'checkin') {
        const r = await javaApi.insert('attendance', { id: crypto.randomUUID(), user_id: user?.id, farm_id: farmId, check_in: new Date().toISOString(), note: 'Daily check-in' });
        if (!r.success) throw new Error(r.error);
      } else {
        if (!todayAttendance) throw new Error('No check-in found');
        const r = await javaApi.update('attendance', todayAttendance.id, { check_out: new Date().toISOString() });
        if (!r.success) throw new Error(r.error);
      }
    },
    onSuccess: (_, type) => {
      toast.success(type === 'checkin' ? 'Checked in!' : 'Checked out!');
      queryClient.invalidateQueries({ queryKey: ['worker-attendance'] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: async (task: any) => {
      const newStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending';
      await javaApi.update('tasks', task.id, { status: newStatus, updated_at: new Date().toISOString() });
      await upsertWorkflowEvent({ farmId: task.farm_id, eventKey: 'field_operation_logged', status: newStatus === 'completed' ? 'completed' : 'in-progress', doneBy: 'worker', note: `Worker set task to ${newStatus}.` });
    },
    onSuccess: () => {
      toast.success('Task updated!');
      queryClient.invalidateQueries({ queryKey: ['worker-tasks'] });
    },
  });

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Worker';
  const pendingTasks = myTasks.filter((t: any) => t.status !== 'completed');
  const completedTasks = myTasks.filter((t: any) => t.status === 'completed');

  return (
    <div className="gx-dashboard" style={{ '--role-accent': '#22c55e', '--role-accent-dim': 'rgba(34,197,94,.12)' } as React.CSSProperties}>
      <MobileHeader title="Worker" roleIcon="👷" />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'rgba(34,197,94,.15)' }}>👷</div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">WORKER · FIELD</div>
        </div>

        <div className="gx-nav-group-label">Daily</div>
        <SideNavItem icon="⏰" label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
        <SideNavItem icon="📋" label="My Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} badge={pendingTasks.length > 0 ? String(pendingTasks.length) : undefined} badgeColor="red" />

        <div className="gx-nav-group-label">Farm</div>
        <SideNavItem icon="🌾" label="Assigned Farms" active={activeTab === 'farms'} onClick={() => setActiveTab('farms')} badge={String(myFarms.length)} badgeColor="green" />
        <SideNavItem icon="📷" label="Upload Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />

        <div className="gx-nav-group-label">Support</div>
        <SideNavItem icon="📦" label="Material Request" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Worker Dashboard — {userName} 👷</div>
          <div className="gx-page-sub">{pendingTasks.length} tasks pending · {myFarms.length} farms</div>
        </div>

        {/* Stats Row — always visible */}
        <div className="gx-stats-row">
          <div className="gx-stat-card green">
            <div className="gx-stat-label">Attendance</div>
            <div className="gx-stat-value">{todayAttendance ? (todayAttendance.check_out ? '✅ Done' : '🟢 In') : '⬜ Not Yet'}</div>
            <div className="gx-stat-change gx-neutral">Today</div>
          </div>
          <div className="gx-stat-card orange">
            <div className="gx-stat-label">Pending Tasks</div>
            <div className="gx-stat-value">{pendingTasks.length}</div>
            <div className="gx-stat-change gx-down">{pendingTasks.length > 0 ? 'Needs attention' : 'All done!'}</div>
          </div>
          <div className="gx-stat-card blue">
            <div className="gx-stat-label">Completed</div>
            <div className="gx-stat-value">{completedTasks.length}</div>
            <div className="gx-stat-change gx-up">This season</div>
          </div>
          <div className="gx-stat-card gold">
            <div className="gx-stat-label">Assigned Farms</div>
            <div className="gx-stat-value">{myFarms.length}</div>
            <div className="gx-stat-change gx-neutral">Active</div>
          </div>
        </div>

        {/* ═══ ATTENDANCE TAB ═══ */}
        {activeTab === 'attendance' && (<>
          <div className="gx-section-divider">⏰ Daily Attendance</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header">
              <div className="gx-card-title">⏰ Today's Attendance — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <span className={`gx-status ${todayAttendance ? 'gx-s-done' : 'gx-s-pending'}`}>{todayAttendance ? 'Checked In' : 'Not Checked In'}</span>
            </div>
            <div className="gx-card-body">
              {!todayAttendance ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
                  <div style={{ marginBottom: 16, opacity: .7 }}>You haven't checked in today. Tap the button to mark attendance.</div>
                  <button className="gx-btn gx-btn-green" onClick={() => markAttendance.mutate('checkin')}>✅ Check In Now</button>
                </div>
              ) : !todayAttendance.check_out ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🟢</div>
                  <div style={{ marginBottom: 8, color: 'var(--gx-green)' }}>Checked in at {new Date(todayAttendance.check_in).toLocaleTimeString('en-IN')}</div>
                  <div style={{ marginBottom: 16, opacity: .5 }}>Working... Tap below when shift is done.</div>
                  <button className="gx-btn gx-btn-orange" onClick={() => markAttendance.mutate('checkout')}>🔴 Check Out</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ color: 'var(--gx-green)', marginBottom: 4 }}>In: {new Date(todayAttendance.check_in).toLocaleTimeString('en-IN')}</div>
                  <div style={{ color: 'var(--gx-orange)', marginBottom: 8 }}>Out: {new Date(todayAttendance.check_out).toLocaleTimeString('en-IN')}</div>
                  <div style={{ opacity: .5 }}>Attendance complete for today.</div>
                </div>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ TASKS TAB ═══ */}
        {activeTab === 'tasks' && (<>
          <div className="gx-section-divider">📋 My Tasks</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header">
              <div className="gx-card-title">📋 Assigned Tasks</div>
              <span className="gx-status gx-s-pending">{myTasks.length} Total</span>
            </div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Task</th><th>Farm</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {myTasks.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, opacity: .5 }}>No tasks assigned yet</td></tr>
                  ) : myTasks.map((t: any, i: number) => (
                    <tr key={t.id || i}>
                      <td>{i + 1}</td>
                      <td>{t.title || 'Task'}</td>
                      <td>{t.farmId || '—'}</td>
                      <td>{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`gx-status ${t.status === 'completed' ? 'gx-s-done' : t.status === 'in_progress' ? 'gx-s-pending' : 'gx-s-alert'}`}>{t.status || 'pending'}</span></td>
                      <td>
                        {t.status !== 'completed' && (
                          <button className="gx-btn gx-btn-green" style={{ padding: '4px 12px', fontSize: 11 }}
                            onClick={() => toggleTask.mutate(t)}>
                            {t.status === 'pending' ? '▶ Start' : '✅ Done'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ═══ FARMS TAB ═══ */}
        {activeTab === 'farms' && (<>
          <div className="gx-section-divider">🌾 Assigned Farms</div>
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title">🌾 My Farms</div>
              <span className="gx-status gx-s-done">{myFarms.length} Active</span>
            </div>
            <div className="gx-card-body">
              {myFarms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No farms assigned yet. Contact your Field Manager.</div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Farm Code</th><th>Location</th><th>Area (acres)</th><th>Crop</th></tr></thead>
                  <tbody>
                    {myFarms.map((f: any, i: number) => (
                      <tr key={f.id || i}>
                        <td>{i + 1}</td>
                        <td>{f.farmCode || f.id}</td>
                        <td>{f.village || f.district || '—'}</td>
                        <td>{f.totalLand || '—'}</td>
                        <td>{f.currentCrop || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ UPLOAD PHOTOS TAB ═══ */}
        {activeTab === 'photos' && (<>
          <div className="gx-section-divider">📷 Upload Field Photos</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📷 Photo Upload</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select">
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Photo Type</label>
                  <select className="gx-select" value={photoType} onChange={e => setPhotoType(e.target.value)}>
                    <option value="crop_progress">Crop Progress</option>
                    <option value="pest_damage">Pest / Disease</option>
                    <option value="soil_condition">Soil Condition</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="post_operation">Post-Operation</option>
                  </select>
                </div>
              </div>
              <div className="gx-upload-box" style={{ marginTop: 14 }}>
                <div className="gx-upload-label">📷 Select or Capture Photos</div>
                <div style={{ fontSize: 11, opacity: .5 }}>JPEG/PNG · Max 10MB each · Up to 5 photos</div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Caption / Notes</label>
                <textarea className="gx-textarea" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Describe what the photo shows..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-green">📤 Upload Photos</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MATERIAL REQUEST TAB ═══ */}
        {activeTab === 'requests' && (<>
          <div className="gx-section-divider">📦 Material Request</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📦 Request Materials / Supplies</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select">
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Material Type</label>
                  <select className="gx-select">
                    <option>Seeds</option><option>Fertilizer</option><option>Pesticide</option><option>Tools</option><option>Fuel</option><option>Other</option>
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Quantity</label><input type="text" className="gx-input" placeholder="e.g. 50 kg, 2 litres" /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Reason / Notes</label>
                <textarea className="gx-textarea" placeholder="Explain why the material is needed, urgency level..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-green">📤 Submit Request</button>
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function SideNavItem({ icon, label, active, onClick, badge, badgeColor }: {
  icon: string; label: string; active?: boolean; onClick?: () => void;
  badge?: string; badgeColor?: 'red' | 'green' | 'gold' | 'blue';
}) {
  return (
    <button className={`gx-nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="gx-nav-icon">{icon}</span>
      {label}
      {badge && <span className={`gx-nav-badge gx-badge-${badgeColor || 'green'}`}>{badge}</span>}
    </button>
  );
}
