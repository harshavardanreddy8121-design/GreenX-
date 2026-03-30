import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { files } from '@/lib/api';
import { Bot, Camera, CheckCircle2, CircleDot, CircleX, ClipboardList, Clock, HardHat, Lightbulb, Loader2, LogOut, Package, Square, Trash2, Upload, Wheat } from 'lucide-react';
import { toast } from 'sonner';
import { upsertWorkflowEvent } from '@/utils/workflowEvents';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAI } from '@/hooks/useAI';
import { AiInsightPanel } from '@/components/AiInsightPanel';

type Tab = 'attendance' | 'tasks' | 'farms' | 'photos' | 'requests' | 'ai';

export default function WorkerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoType, setPhotoType] = useState('crop_progress');
  const [workerPhotoFarmId, setWorkerPhotoFarmId] = useState('');
  const [workerPhotoFiles, setWorkerPhotoFiles] = useState<File[]>([]);
  // Material request
  const [reqFarmId, setReqFarmId] = useState('');
  const [reqMaterial, setReqMaterial] = useState('Seeds');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };
  const today = new Date().toISOString().split('T')[0];
  const ai = useAI();

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

  const uploadWorkerPhotos = useMutation({
    mutationFn: async () => {
      if (!workerPhotoFarmId) throw new Error('Please select a farm');
      if (!workerPhotoFiles.length) throw new Error('Please select at least one photo');
      const oversized = workerPhotoFiles.find(f => f.size > 10 * 1024 * 1024);
      if (oversized) throw new Error(`File too large: ${oversized.name}. Max 10MB.`);
      for (const file of workerPhotoFiles) {
        await files.upload(file, photoType, workerPhotoFarmId);
      }
    },
    onSuccess: () => {
      toast.success(`Uploaded ${workerPhotoFiles.length} photo(s) successfully`);
      setWorkerPhotoFiles([]); setPhotoCaption('');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to upload photos'),
  });

  const submitMaterialRequest = useMutation({
    mutationFn: async () => {
      if (!reqFarmId) throw new Error('Please select a farm');
      if (!reqQuantity) throw new Error('Please enter quantity');
      const r = await javaApi.insert('equipment_requests', {
        id: crypto.randomUUID(),
        user_id: user?.id,
        farm_id: reqFarmId,
        material_type: reqMaterial,
        quantity: reqQuantity,
        notes: reqNotes || undefined,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });
      if (!r.success) throw new Error(r.error || 'Failed to submit request');
    },
    onSuccess: () => {
      toast.success('Material request submitted to Field Manager!');
      setReqQuantity(''); setReqNotes('');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to submit request'),
  });

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Worker';
  const pendingTasks = myTasks.filter((t: any) => t.status !== 'completed');
  const completedTasks = myTasks.filter((t: any) => t.status === 'completed');

  return (
    <div className="gx-dashboard" style={{ '--role-accent': '#22c55e', '--role-accent-dim': 'rgba(34,197,94,.12)' } as React.CSSProperties}>
      <MobileHeader title="Worker" roleIcon={<HardHat size={18} />} />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'rgba(34,197,94,.15)' }}><HardHat size={22} /></div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">WORKER · FIELD</div>
          <div className="gx-theme-switch">
            <span>Theme</span>
            <ThemeToggle className="gx-theme-toggle" />
          </div>
        </div>

        <div className="gx-nav-group-label">Daily</div>
        <SideNavItem icon={<Clock size={18} />} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
        <SideNavItem icon={<ClipboardList size={18} />} label="My Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} badge={pendingTasks.length > 0 ? String(pendingTasks.length) : undefined} badgeColor="red" />

        <div className="gx-nav-group-label">Farm</div>
        <SideNavItem icon={<Wheat size={18} />} label="Assigned Farms" active={activeTab === 'farms'} onClick={() => setActiveTab('farms')} badge={String(myFarms.length)} badgeColor="green" />
        <SideNavItem icon={<Camera size={18} />} label="Upload Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />

        <div className="gx-nav-group-label">Support</div>
        <SideNavItem icon={<Package size={18} />} label="Material Request" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
        <SideNavItem icon={<Bot size={18} />} label="AI Work Tips" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} badge={ai.recommendations.length > 0 ? String(ai.recommendations.length) : undefined} badgeColor="gold" />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Worker Dashboard — {userName} <HardHat className="inline-block w-4 h-4 mr-1 align-middle" /></div>
          <div className="gx-page-sub">{pendingTasks.length} tasks pending · {myFarms.length} farms</div>
        </div>

        {/* Stats Row — always visible */}
        <div className="gx-stats-row">
          <div className="gx-stat-card green">
            <div className="gx-stat-label">Attendance</div>
            <div className="gx-stat-value">{todayAttendance ? (todayAttendance.check_out ? <><CheckCircle2 className="inline-block w-4 h-4 mr-1 align-middle" /> Done</> : <><CircleDot className="inline-block w-4 h-4 mr-1 align-middle" /> In</>) : <><Square className="inline-block w-4 h-4 mr-1 align-middle" /> Not Yet</>}</div>
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
          <div className="gx-section-divider"><Clock className="inline-block w-4 h-4 mr-1 align-middle" /> Daily Attendance</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header">
              <div className="gx-card-title"><Clock className="inline-block w-4 h-4 mr-1 align-middle" /> Today's Attendance — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <span className={`gx-status ${todayAttendance ? 'gx-s-done' : 'gx-s-pending'}`}>{todayAttendance ? 'Checked In' : 'Not Checked In'}</span>
            </div>
            <div className="gx-card-body">
              {!todayAttendance ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Clock size={48} strokeWidth={1.5} /></div>
                  <div style={{ marginBottom: 16, opacity: .7 }}>You haven't checked in today. Tap the button to mark attendance.</div>
                  <button className="gx-btn gx-btn-green" onClick={() => markAttendance.mutate('checkin')}><CheckCircle2 className="inline-block w-4 h-4 mr-1 align-middle" /> Check In Now</button>
                </div>
              ) : !todayAttendance.check_out ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><CircleDot size={48} strokeWidth={1.5} /></div>
                  <div style={{ marginBottom: 8, color: 'var(--gx-green)' }}>Checked in at {new Date(todayAttendance.check_in).toLocaleTimeString('en-IN')}</div>
                  <div style={{ marginBottom: 16, opacity: .5 }}>Working... Tap below when shift is done.</div>
                  <button className="gx-btn gx-btn-orange" onClick={() => markAttendance.mutate('checkout')}><CircleX className="inline-block w-4 h-4 mr-1 align-middle" /> Check Out</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={48} strokeWidth={1.5} /></div>
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
          <div className="gx-section-divider"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> My Tasks</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header">
              <div className="gx-card-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Assigned Tasks</div>
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
                            {t.status === 'pending' ? '▶ Start' : <><CheckCircle2 className="inline-block w-4 h-4 mr-1 align-middle" /> Done</>}
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
          <div className="gx-section-divider"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Assigned Farms</div>
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> My Farms</div>
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
          <div className="gx-section-divider"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Upload Field Photos</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Photo Upload</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={workerPhotoFarmId} onChange={e => setWorkerPhotoFarmId(e.target.value)}>
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
                <div className="gx-upload-label"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Select or Capture Photos</div>
                <div style={{ fontSize: 11, opacity: .5 }}>JPEG/PNG · Max 10MB each · Up to 5 photos</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []).slice(0, 5);
                    setWorkerPhotoFiles(selected);
                  }}
                  style={{ marginTop: 10 }}
                />
                {workerPhotoFiles.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gx-text2)' }}>
                    Selected: {workerPhotoFiles.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Caption / Notes</label>
                <textarea className="gx-textarea" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Describe what the photo shows..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-green" disabled={uploadWorkerPhotos.isPending} onClick={() => uploadWorkerPhotos.mutate()}>
                  {uploadWorkerPhotos.isPending ? <><Loader2 className="inline-block w-4 h-4 mr-1 align-middle" /> Uploading...</> : <><Upload className="inline-block w-4 h-4 mr-1 align-middle" /> Upload Photos</>}
                </button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MATERIAL REQUEST TAB ═══ */}
        {activeTab === 'requests' && (<>
          <div className="gx-section-divider"><Package className="inline-block w-4 h-4 mr-1 align-middle" /> Material Request</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Package className="inline-block w-4 h-4 mr-1 align-middle" /> Request Materials / Supplies</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={reqFarmId} onChange={e => setReqFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Material Type</label>
                  <select className="gx-select" value={reqMaterial} onChange={e => setReqMaterial(e.target.value)}>
                    <option>Seeds</option><option>Fertilizer</option><option>Pesticide</option><option>Tools</option><option>Fuel</option><option>Other</option>
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Quantity</label><input type="text" className="gx-input" value={reqQuantity} onChange={e => setReqQuantity(e.target.value)} placeholder="e.g. 50 kg, 2 litres" /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Reason / Notes</label>
                <textarea className="gx-textarea" value={reqNotes} onChange={e => setReqNotes(e.target.value)} placeholder="Explain why the material is needed, urgency level..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-green" disabled={submitMaterialRequest.isPending} onClick={() => submitMaterialRequest.mutate()}>
                  {submitMaterialRequest.isPending ? <><Loader2 className="inline-block w-4 h-4 mr-1 align-middle" /> Submitting...</> : <><Upload className="inline-block w-4 h-4 mr-1 align-middle" /> Submit Request</>}
                </button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ AI WORK TIPS TAB ═══ */}
        {activeTab === 'ai' && (<>
          <div className="gx-section-divider"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI Work Tips & Guidance</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> Smart Work Assistant</div><span className="gx-status gx-s-done">{ai.recommendations.length} Tips</span></div>
            <div className="gx-card-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {pendingTasks.length > 0 && <button className="gx-btn gx-btn-green" style={{ fontSize: 12 }} onClick={() => {
                  pendingTasks.slice(0, 3).forEach((t: any) => ai.analyzeOp({ operationType: t.title || 'Field Work', cropName: '', observations: t.description || '' }));
                  toast.success('AI generated tips for your tasks');
                }}><Lightbulb className="inline-block w-4 h-4 mr-1 align-middle" /> Get Tips for My Tasks</button>}
                <button className="gx-btn gx-btn-ghost" style={{ fontSize: 12 }} onClick={() => ai.clearRecommendations()}><Trash2 className="inline-block w-4 h-4 mr-1 align-middle" /> Clear</button>
              </div>
              <AiInsightPanel
                recommendations={ai.recommendations}
                isAnalyzing={ai.isAnalyzing}
                onAsk={(q) => ai.ask(q)}
                title="Work Guidance"
              />
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function SideNavItem({ icon, label, active, onClick, badge, badgeColor }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void;
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
