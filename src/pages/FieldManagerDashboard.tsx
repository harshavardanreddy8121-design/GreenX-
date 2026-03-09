import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldManager } from '@/lib/api';
import { javaApi } from '@/integrations/java-api/client';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'overview' | 'tasks' | 'farms' | 'calendar' | 'rx' | 'soil' | 'operation' | 'photos' | 'pest' | 'irrigation' | 'sowing' | 'assign' | 'complete' | 'attendance' | 'reports';

export default function FieldManagerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Log operation form
  const [opFarmId, setOpFarmId] = useState('');
  const [opType, setOpType] = useState('Ploughing');
  const [opArea, setOpArea] = useState('');
  const [opLabour, setOpLabour] = useState('');
  const [opChemical, setOpChemical] = useState('');
  const [opDose, setOpDose] = useState('');
  const [opMachine, setOpMachine] = useState('');
  const [opCost, setOpCost] = useState('');
  const [opNotes, setOpNotes] = useState('');
  // Log soil sample form
  const [sampleFarmId, setSampleFarmId] = useState('');
  const [samplePoints, setSamplePoints] = useState('');
  const [sampleDepth, setSampleDepth] = useState('15');
  const [sampleGPS, setSampleGPS] = useState('');
  const [sampleCondition, setSampleCondition] = useState('Moist');
  const [sampleNotes, setSampleNotes] = useState('');
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoFarmId, setPhotoFarmId] = useState('');
  const [photoType, setPhotoType] = useState('Crop Progress');
  const [photoNotes, setPhotoNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  // Operation photos
  const [opPhotos, setOpPhotos] = useState<File[]>([]);
  // Pest report form
  const [pestName, setPestName] = useState('');
  const [pestSeverity, setPestSeverity] = useState('Low');
  const [pestArea, setPestArea] = useState('');
  const [pestCropStage, setPestCropStage] = useState('');
  const [pestNotes, setPestNotes] = useState('');
  const [pestPhotos, setPestPhotos] = useState<File[]>([]);
  // Assign task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Normal');
  const [taskWorker, setTaskWorker] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  // Irrigation form
  const [irrMethod, setIrrMethod] = useState('Flood');
  const [irrDuration, setIrrDuration] = useState('');
  const [irrArea, setIrrArea] = useState('');
  const [irrSource, setIrrSource] = useState('');
  const [irrNotes, setIrrNotes] = useState('');
  // Sowing form
  const [sowCrop, setSowCrop] = useState('');
  const [sowVariety, setSowVariety] = useState('');
  const [sowSeedQty, setSowSeedQty] = useState('');
  const [sowArea, setSowArea] = useState('');
  const [sowMethod, setSowMethod] = useState('Direct Seeding');
  const [sowSpacing, setSowSpacing] = useState('');
  const [sowNotes, setSowNotes] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  const { data: myFarms = [] } = useQuery({
    queryKey: ['fm-farms', user?.id],
    queryFn: () => fieldManager.getAssignedFarms().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['fm-tasks', user?.id],
    queryFn: () => fieldManager.getTodayTasks().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['fm-prescriptions', user?.id],
    queryFn: () => fieldManager.getPrescriptions().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: stats = {} as any } = useQuery({
    queryKey: ['fm-stats', user?.id],
    queryFn: () => fieldManager.getStats().catch(() => ({})),
    enabled: !!user?.id,
  });

  const { data: sampleTrack = [] } = useQuery({
    queryKey: ['fm-samples', user?.id],
    queryFn: () => fieldManager.getSamples().catch(() => []),
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const logOperation = useMutation({
    mutationFn: (overrideType: string | undefined) => {
      const payload = {
        farmId: opFarmId,
        fieldManagerId: user?.id || '',
        operationType: overrideType || opType,
        operationDate: new Date().toISOString(),
        areaCoveredAcres: parseFloat(opArea) || undefined,
        workersDeployed: parseInt(opLabour) || undefined,
        productUsed: opChemical || undefined,
        quantityUsed: opDose || undefined,
        costIncurred: parseFloat(opCost) || undefined,
        observations: opNotes,
      };
      if (opPhotos.length > 0) {
        const fd = new FormData();
        fd.append('data', JSON.stringify(payload));
        opPhotos.forEach(f => fd.append('photos', f));
        return fieldManager.logOperation(fd);
      }
      return fieldManager.logOperationJson(payload);
    },
    onSuccess: () => {
      toast.success('Operation logged! Visible to Land Owner & Cluster Admin.');
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
      setOpNotes(''); setOpArea(''); setOpLabour(''); setOpChemical(''); setOpDose(''); setOpMachine(''); setOpCost(''); setOpPhotos([]);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to log operation'),
  });

  const uploadPhotos = useMutation({
    mutationFn: async () => {
      if (!photoFarmId) throw new Error('Please select a farm');
      if (!photoFiles.length) throw new Error('Please select at least one photo');

      const oversized = photoFiles.find((f) => f.size > 10 * 1024 * 1024);
      if (oversized) throw new Error(`File too large: ${oversized.name}. Max 10MB per photo.`);

      const fd = new FormData();
      fd.append('data', JSON.stringify({
        farmId: photoFarmId,
        operationType: 'PHOTO_UPDATE',
        operationDate: new Date().toISOString(),
        observations: `${photoType}${photoNotes ? `: ${photoNotes}` : ''}`,
      }));
      photoFiles.forEach((f) => fd.append('photos', f));
      return fieldManager.logOperation(fd);
    },
    onSuccess: () => {
      toast.success(`Uploaded ${photoFiles.length} photo(s) successfully`);
      setPhotoFiles([]);
      setPhotoNotes('');
      setPhotoType('Crop Progress');
      queryClient.invalidateQueries({ queryKey: ['fm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to upload photos'),
  });

  const reportPest = useMutation({
    mutationFn: () => {
      if (!opFarmId) throw new Error('Please select a farm');
      if (!pestName) throw new Error('Please enter the pest/disease name');
      const fd = new FormData();
      fd.append('data', JSON.stringify({
        farmId: opFarmId,
        reportedBy: user?.id || '',
        pestName,
        severity: pestSeverity,
        affectedAreaPct: parseFloat(pestArea) || undefined,
        fieldLocation: pestCropStage || undefined,
        description: pestNotes || undefined,
      }));
      pestPhotos.forEach(f => fd.append('photos', f));
      return fieldManager.reportPest(fd);
    },
    onSuccess: () => {
      toast.success('Pest alert sent to Expert! They will prescribe treatment.');
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
      setPestName(''); setPestSeverity('Low'); setPestArea(''); setPestCropStage(''); setPestNotes(''); setPestPhotos([]);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to report pest'),
  });

  const logSample = useMutation({
    mutationFn: () => {
      const selectedFarm = (myFarms as any[]).find((f: any) => f.id === sampleFarmId);
      const sampleData = {
        farmId: sampleFarmId,
        assignedExpertId: selectedFarm?.expertId || undefined,
        numPoints: parseInt(samplePoints) || 8,
        depthCm: parseInt(sampleDepth) || 15,
        gpsCoordinates: sampleGPS || undefined,
        samplingMethod: sampleCondition,
        collectionNotes: sampleNotes || undefined,
        collectionDate: sampleDate,
        status: 'COLLECTED',
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(sampleData));
      return fieldManager.logSampleCollection(fd);
    },
    onSuccess: () => {
      toast.success('Soil sample logged! Expert has been notified for testing.');
      queryClient.invalidateQueries({ queryKey: ['fm-farms'] });
      setSamplePoints(''); setSampleGPS(''); setSampleNotes('');
      setSampleDate(new Date().toISOString().split('T')[0]);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to log soil sample'),
  });

  const ackPrescription = useMutation({
    mutationFn: (id: string) => fieldManager.acknowledgePrescription(id),
    onSuccess: () => {
      toast.success('Prescription acknowledged! Will begin treatment.');
      queryClient.invalidateQueries({ queryKey: ['fm-prescriptions'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fieldManager.updateTaskStatus(id, status),
    onSuccess: () => {
      toast.success('Task updated!');
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
    },
  });

  const assignTask = useMutation({
    mutationFn: async () => {
      if (!opFarmId) throw new Error('Please select a farm');
      if (!taskTitle) throw new Error('Please enter a task title');
      if (!taskWorker) throw new Error('Please enter a worker name or ID');
      const r = await javaApi.insert('TASKS', {
        id: crypto.randomUUID(),
        farm_id: opFarmId,
        assigned_to: taskWorker,
        title: taskTitle,
        description: taskDesc || undefined,
        status: 'pending',
        due_date: taskDueDate || new Date().toISOString().split('T')[0],
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (!r.success) throw new Error(r.error || 'Failed to assign task');
    },
    onSuccess: () => {
      toast.success('Task assigned to worker! They will see it in their dashboard.');
      queryClient.invalidateQueries({ queryKey: ['fm-tasks'] });
      setTaskTitle(''); setTaskWorker(''); setTaskDesc(''); setTaskPriority('Normal');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to assign task'),
  });

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Field Manager';
  const pendingRx = prescriptions.filter((p: any) => p.status !== 'ACKNOWLEDGED');

  return (
    <div className="gx-dashboard fm-accent">
      <MobileHeader title="Field Manager" roleIcon="🚜" />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-orange-dim)' }}>🚜</div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">FIELD MANAGER · OPS</div>
          <div className="gx-theme-switch">
            <span>Theme</span>
            <ThemeToggle className="gx-theme-toggle" />
          </div>
        </div>

        <div className="gx-nav-group-label">My Work</div>
        <SideNavItem icon="📋" label="Today's Tasks" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} badge={tasks.length > 0 ? String(tasks.length) : undefined} badgeColor="red" />
        <SideNavItem icon="🌾" label="My Assigned Farms" active={activeTab === 'farms'} onClick={() => setActiveTab('farms')} badge={String(myFarms.length)} badgeColor="green" />
        <SideNavItem icon="📅" label="Crop Calendar View" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <SideNavItem icon="💊" label="Prescription Inbox" active={activeTab === 'rx'} onClick={() => setActiveTab('rx')} badge={pendingRx.length > 0 ? String(pendingRx.length) : undefined} badgeColor="red" />

        <div className="gx-nav-group-label">Data Collection</div>
        <SideNavItem icon="🧪" label="Log Soil Sample" active={activeTab === 'soil'} onClick={() => setActiveTab('soil')} />
        <SideNavItem icon="🚜" label="Record Field Operation" active={activeTab === 'operation'} onClick={() => setActiveTab('operation')} />
        <SideNavItem icon="📷" label="Upload Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
        <SideNavItem icon="🐛" label="Report Pest / Disease" active={activeTab === 'pest'} onClick={() => setActiveTab('pest')} />
        <SideNavItem icon="💧" label="Log Irrigation" active={activeTab === 'irrigation'} onClick={() => setActiveTab('irrigation')} />
        <SideNavItem icon="🌱" label="Log Sowing" active={activeTab === 'sowing'} onClick={() => setActiveTab('sowing')} />

        <div className="gx-nav-group-label">Workers</div>
        <SideNavItem icon="👥" label="Assign Tasks" active={activeTab === 'assign'} onClick={() => setActiveTab('assign')} />
        <SideNavItem icon="✅" label="Mark Complete" active={activeTab === 'complete'} onClick={() => setActiveTab('complete')} />
        <SideNavItem icon="📊" label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />

        <div className="gx-nav-group-label">Reports</div>
        <SideNavItem icon="📈" label="My Activity Log" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Field Operations — {userName} 🚜</div>
          <div className="gx-page-sub">{tasks.length} tasks today · {myFarms.length} assigned farms · {sampleTrack.length} samples tracked</div>
        </div>

        {/* ═══ OVERVIEW / TODAY'S TASKS TAB ═══ */}
        {(activeTab === 'overview' || activeTab === 'tasks') && (<>
          {pendingRx.length > 0 && (
            <div className="gx-alert-box gx-alert-red">
              <span>💊</span>
              <div><strong>New Prescription from Expert:</strong> {pendingRx[0]?.fmInstructions || pendingRx[0]?.chemicalName || 'Treatment'} — Read instructions & start immediately.</div>
            </div>
          )}

          <div className="gx-stats-row">
            <div className="gx-stat-card orange"><div className="gx-stat-label">Today's Tasks</div><div className="gx-stat-value">{tasks.length}</div><div className="gx-stat-change gx-down">{tasks.filter((t: any) => t.status === 'COMPLETED').length} completed</div></div>
            <div className="gx-stat-card green"><div className="gx-stat-label">Assigned Farms</div><div className="gx-stat-value">{myFarms.length}</div><div className="gx-stat-change gx-up">Active management</div></div>
            <div className="gx-stat-card blue"><div className="gx-stat-label">Operations Logged</div><div className="gx-stat-value">{stats?.operationsLogged || 0}</div><div className="gx-stat-change gx-up">This season</div></div>
            <div className="gx-stat-card gold"><div className="gx-stat-label">Samples Tracked</div><div className="gx-stat-value">{sampleTrack.length}</div><div className="gx-stat-change gx-neutral">Live status</div></div>
          </div>

          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">🧪 Soil Sample Live Track</div><span className="gx-status gx-s-pending">{sampleTrack.length}</span></div>
            <div className="gx-card-body">
              {sampleTrack.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No samples tracked yet for your farms.</div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>Sample</th><th>Farm</th><th>Expert</th><th>Status</th></tr></thead>
                  <tbody>
                    {sampleTrack.slice(0, 8).map((s: any) => {
                      const farm = (myFarms as any[]).find((f: any) => f.id === s.farmId);
                      return (
                        <tr key={s.id}>
                          <td>{s.sampleCode || s.id}</td>
                          <td>{farm?.farmCode || farm?.name || s.farmId}</td>
                          <td>{s.assignedExpertId ? 'Assigned' : 'Unassigned'}</td>
                          <td><span className={`gx-status ${s.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{s.status || 'PENDING'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="gx-section-divider">📋 Today's Task List</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">📋 Tasks Assigned</div><span className="gx-status gx-s-pending">{tasks.length} Tasks</span></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Task</th><th>Farm</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, opacity: .5 }}>No tasks assigned today</td></tr>
                  ) : tasks.map((t: any, i: number) => (
                    <tr key={t.id || i}>
                      <td>{i + 1}</td>
                      <td>{t.title || t.observations || 'Task'}</td>
                      <td>{t.farm_code || t.farmId || '—'}</td>
                      <td><span className={`gx-status ${t.priority === 'HIGH' ? 'gx-s-alert' : 'gx-s-done'}`}>{t.priority || 'Normal'}</span></td>
                      <td><span className={`gx-status ${t.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{t.status || 'Pending'}</span></td>
                      <td>
                        {t.status !== 'COMPLETED' && (
                          <button className="gx-btn gx-btn-orange" style={{ padding: '4px 12px', fontSize: 11 }}
                            onClick={() => updateTask.mutate({ id: t.id, status: t.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED' })}>
                            {t.status === 'IN_PROGRESS' ? '✅ Done' : '▶ Start'}
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

        {/* ═══ MY ASSIGNED FARMS TAB ═══ */}
        {activeTab === 'farms' && (<>
          <div className="gx-section-divider">🌾 My Assigned Farms</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌾 Farms Under My Management</div><span className="gx-status gx-s-done">{myFarms.length} Active</span></div>
            <div className="gx-card-body">
              {myFarms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
                  <div>No farms assigned yet. Cluster Admin will assign farms to you.</div>
                </div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Farm Code</th><th>Owner</th><th>Village</th><th>Area (ac)</th><th>Crop</th><th>Status</th></tr></thead>
                  <tbody>
                    {myFarms.map((f: any, i: number) => (
                      <tr key={f.id || i}>
                        <td>{i + 1}</td>
                        <td>{f.farmCode || '—'}</td>
                        <td>{f.name || '—'}</td>
                        <td>{f.village || '—'}</td>
                        <td>{f.totalLand || '—'}</td>
                        <td>{f.currentCrop || '—'}</td>
                        <td><span className="gx-status gx-s-done">{f.status || 'Active'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ CROP CALENDAR VIEW TAB ═══ */}
        {activeTab === 'calendar' && (<>
          <div className="gx-section-divider">📅 Crop Calendar View</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📅 Season Calendar & Scheduled Tasks</div><span className="gx-status gx-s-done">Published</span></div>
            <div className="gx-card-body">
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <div>No calendar tasks available. Expert will publish after crop selection.</div>
                </div>
              ) : tasks.map((t: any, idx: number) => (
                <div key={t.id || idx} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: t.status === 'COMPLETED' ? 'var(--gx-green-dim)' : 'var(--gx-orange-dim)' }}>
                    {t.taskType === 'SOWING' ? '🌱' : t.taskType === 'FERTILIZER' ? '🧪' : t.taskType === 'IRRIGATION' ? '💧' : t.taskType === 'PEST_SCOUT' ? '🐛' : '📋'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="gx-act-text"><strong>{t.taskTitle || t.taskType || 'Task'}</strong></div>
                    <div className="gx-act-time">{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString('en-IN') : ''} · {t.farmId || ''}</div>
                  </div>
                  <span className={`gx-status ${t.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{t.status || 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ PRESCRIPTION INBOX TAB ═══ */}
        {activeTab === 'rx' && (<>
          <div className="gx-section-divider">💊 Prescription Inbox</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">💊 Expert Prescriptions</div><span className="gx-status gx-s-alert">{pendingRx.length} Pending</span></div>
            <div className="gx-card-body">
              {prescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
                  <div>No prescriptions received. Expert will send when pest is detected.</div>
                </div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Pest/Disease</th><th>Chemical</th><th>Dose</th><th>Method</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {prescriptions.map((p: any, i: number) => (
                      <tr key={p.id || i}>
                        <td>{i + 1}</td>
                        <td><strong>{p.fmInstructions || p.chemicalName || '—'}</strong></td>
                        <td>{p.chemicalName || '—'}</td>
                        <td>{p.dose || '—'}</td>
                        <td>{p.applicationMethod || '—'}</td>
                        <td><span className={`gx-status ${p.isacknowledged || p.status === 'ACKNOWLEDGED' ? 'gx-s-done' : 'gx-s-alert'}`}>{p.isacknowledged || p.status === 'ACKNOWLEDGED' ? 'ACK' : 'Pending'}</span></td>
                        <td>
                          {!(p.isacknowledged || p.status === 'ACKNOWLEDGED') && (
                            <button className="gx-btn gx-btn-orange" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => ackPrescription.mutate(p.id)}>✅ Acknowledge</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ LOG SOIL SAMPLE TAB ═══ */}
        {activeTab === 'soil' && (<>
          <div className="gx-section-divider">🧪 Log Soil Sample Collection</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🧪 Collect & Send to Expert Lab</div><span className="gx-status gx-s-pending">Collection</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={sampleFarmId} onChange={e => setSampleFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">No. of Sample Points</label><input type="number" className="gx-input" value={samplePoints} onChange={e => setSamplePoints(e.target.value)} placeholder="e.g. 8" /></div>
                <div className="gx-form-group"><label className="gx-label">Depth (cm)</label><input type="number" className="gx-input" value={sampleDepth} onChange={e => setSampleDepth(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">GPS Coordinates</label><input type="text" className="gx-input" value={sampleGPS} onChange={e => setSampleGPS(e.target.value)} placeholder="17.3850, 78.4867" /></div>
                <div className="gx-form-group">
                  <label className="gx-label">Soil Condition</label>
                  <select className="gx-select" value={sampleCondition} onChange={e => setSampleCondition(e.target.value)}>
                    <option>Dry</option><option>Moist</option><option>Wet</option></select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Collection Date</label><input type="date" className="gx-input" value={sampleDate} onChange={e => setSampleDate(e.target.value)} /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Field Manager Notes</label>
                <textarea className="gx-textarea" value={sampleNotes} onChange={e => setSampleNotes(e.target.value)}
                  placeholder="Collected from 8 zig-zag points across the field. Composite sample mixed in bucket..." />
              </div>
              <div className="gx-btn-row">
                <button
                  className="gx-btn gx-btn-orange"
                  disabled={logSample.isPending}
                  onClick={() => {
                    if (!sampleFarmId) { toast.error('Please select a farm first'); return; }
                    logSample.mutate();
                  }}
                >{logSample.isPending ? '⏳ Saving...' : '🧪 Log Sample & Send to Expert'}</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ RECORD FIELD OPERATION TAB ═══ */}
        {activeTab === 'operation' && (<>
          <div className="gx-section-divider">🚜 Log Field Operation</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📝 Record Operation</div><span className="gx-status gx-s-done">Ready</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={opFarmId} onChange={e => setOpFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id} — {f.landownerName || 'Farm'}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Operation Type</label>
                  <select className="gx-select" value={opType} onChange={e => setOpType(e.target.value)}>
                    <option>Ploughing</option><option>Sowing</option><option>Weeding</option><option>Fertilizer Application</option>
                    <option>Pesticide Spray</option><option>Irrigation</option><option>Harvesting</option><option>Other</option>
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Date</label><input type="date" className="gx-input" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                <div className="gx-form-group"><label className="gx-label">Area Covered (acres)</label><input type="number" step="0.5" className="gx-input" value={opArea} onChange={e => setOpArea(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Labour Count</label><input type="number" className="gx-input" value={opLabour} onChange={e => setOpLabour(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Chemical / Fertilizer Used</label><input type="text" className="gx-input" value={opChemical} onChange={e => setOpChemical(e.target.value)} placeholder="e.g. Urea 46-0-0" /></div>
                <div className="gx-form-group"><label className="gx-label">Dose / Quantity</label><input type="text" className="gx-input" value={opDose} onChange={e => setOpDose(e.target.value)} placeholder="e.g. 50 kg/acre" /></div>
                <div className="gx-form-group"><label className="gx-label">Machine Used</label><input type="text" className="gx-input" value={opMachine} onChange={e => setOpMachine(e.target.value)} placeholder="e.g. Tractor + Rotavator" /></div>
                <div className="gx-form-group"><label className="gx-label">Cost (₹)</label><input type="number" className="gx-input" value={opCost} onChange={e => setOpCost(e.target.value)} /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Notes / Observations</label>
                <textarea className="gx-textarea" value={opNotes} onChange={e => setOpNotes(e.target.value)}
                  placeholder="Soil was dry, needed extra depth. Applied fertilizer post-irrigation..." />
              </div>
              <div className="gx-upload-box">
                <div className="gx-upload-label">📷 Attach Field Photos (optional)</div>
                <div style={{ fontSize: 11, opacity: .5 }}>Drag & drop or click · JPEG/PNG · Max 10MB</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []).slice(0, 5);
                    setOpPhotos(selected);
                  }}
                  style={{ marginTop: 10 }}
                />
                {opPhotos.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gx-text2)' }}>
                    Selected: {opPhotos.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={logOperation.isPending} onClick={() => { if (!opFarmId) { toast.error('Please select a farm'); return; } logOperation.mutate(undefined); }}>{logOperation.isPending ? '⏳ Saving...' : '📤 Log Operation & Notify'}</button>
                <button className="gx-btn gx-btn-ghost" onClick={() => toast.success('Draft saved locally.')}>Save Draft</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ UPLOAD PHOTOS TAB ═══ */}
        {activeTab === 'photos' && (<>
          <div className="gx-section-divider">📷 Upload Field Photos</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📷 Field Photo Upload</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={photoFarmId} onChange={e => setPhotoFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Photo Type</label>
                  <select className="gx-select" value={photoType} onChange={e => setPhotoType(e.target.value)}>
                    <option>Crop Progress</option><option>Pest / Disease</option><option>Soil Condition</option><option>Irrigation</option><option>Post-Operation</option>
                  </select>
                </div>
              </div>
              <div className="gx-upload-box" style={{ marginTop: 14 }}>
                <div className="gx-upload-label">📷 Select or Capture Photos</div>
                <div style={{ fontSize: 11, opacity: .5 }}>JPEG/PNG · Max 10MB each · Up to 5 photos</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []).slice(0, 5);
                    setPhotoFiles(selected);
                  }}
                  style={{ marginTop: 10 }}
                />
                {photoFiles.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gx-text2)' }}>
                    Selected: {photoFiles.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Caption / Notes</label>
                <textarea className="gx-textarea" value={photoNotes} onChange={e => setPhotoNotes(e.target.value)} placeholder="Describe what the photo shows..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={uploadPhotos.isPending} onClick={() => uploadPhotos.mutate()}>
                  {uploadPhotos.isPending ? '⏳ Uploading...' : '📤 Upload & Share'}
                </button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ REPORT PEST / DISEASE TAB ═══ */}
        {activeTab === 'pest' && (<>
          <div className="gx-section-divider">🐛 Report Pest / Disease</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🐛 Pest / Disease Alert</div><span className="gx-status gx-s-alert">Send to Expert</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={opFarmId} onChange={e => setOpFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Pest / Disease Name</label><input type="text" className="gx-input" value={pestName} onChange={e => setPestName(e.target.value)} placeholder="e.g. Fall Armyworm, Aphids" /></div>
                <div className="gx-form-group">
                  <label className="gx-label">Severity</label>
                  <select className="gx-select" value={pestSeverity} onChange={e => setPestSeverity(e.target.value)}><option value="Low">Low (&lt;10%)</option><option value="Moderate">Moderate (10-25%)</option><option value="High">High (&gt;25%)</option><option value="Critical">Critical</option></select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Affected Area (acres)</label><input type="number" step="0.5" className="gx-input" value={pestArea} onChange={e => setPestArea(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Crop Stage</label><input type="text" className="gx-input" value={pestCropStage} onChange={e => setPestCropStage(e.target.value)} placeholder="e.g. Vegetative, Flowering" /></div>
                <div className="gx-form-group"><label className="gx-label">Date Detected</label><input type="date" className="gx-input" defaultValue={new Date().toISOString().split('T')[0]} /></div>
              </div>
              <div className="gx-upload-box" style={{ marginTop: 14 }}>
                <div className="gx-upload-label">📷 Attach Pest / Damage Photos</div>
                <div style={{ fontSize: 11, opacity: .5 }}>Photos help expert identify and prescribe accurately</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []).slice(0, 5);
                    setPestPhotos(selected);
                  }}
                  style={{ marginTop: 10 }}
                />
                {pestPhotos.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gx-text2)' }}>
                    Selected: {pestPhotos.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Field Manager Observations</label>
                <textarea className="gx-textarea" value={pestNotes} onChange={e => setPestNotes(e.target.value)} placeholder="Describe symptoms, affected parts, spread pattern..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={reportPest.isPending} onClick={() => reportPest.mutate()}>
                  {reportPest.isPending ? '⏳ Sending...' : '🐛 Send Pest Alert to Expert'}
                </button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ LOG IRRIGATION TAB ═══ */}
        {activeTab === 'irrigation' && (<>
          <div className="gx-section-divider">💧 Log Irrigation</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">💧 Record Irrigation Event</div><span className="gx-status gx-s-done">Ready</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={opFarmId} onChange={e => setOpFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group">
                  <label className="gx-label">Irrigation Method</label>
                  <select className="gx-select" value={irrMethod} onChange={e => setIrrMethod(e.target.value)}><option>Flood</option><option>Drip</option><option>Sprinkler</option><option>Furrow</option><option>Canal</option></select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Duration (hours)</label><input type="number" step="0.5" className="gx-input" value={irrDuration} onChange={e => setIrrDuration(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Area Irrigated (acres)</label><input type="number" step="0.5" className="gx-input" value={irrArea} onChange={e => setIrrArea(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Water Source</label><input type="text" className="gx-input" value={irrSource} onChange={e => setIrrSource(e.target.value)} placeholder="e.g. Borewell, Canal" /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Notes</label>
                <textarea className="gx-textarea" value={irrNotes} onChange={e => setIrrNotes(e.target.value)} placeholder="Soil moisture level before irrigation, any issues observed..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={logOperation.isPending} onClick={() => {
                  if (!opFarmId) { toast.error('Please select a farm'); return; }
                  setOpArea(irrArea); setOpNotes(`Irrigation: ${irrMethod}, Duration: ${irrDuration}h, Source: ${irrSource}. ${irrNotes}`);
                  logOperation.mutate('Irrigation');
                  setIrrMethod('Flood'); setIrrDuration(''); setIrrArea(''); setIrrSource(''); setIrrNotes('');
                }}>{logOperation.isPending ? '⏳ Saving...' : '💧 Log Irrigation'}</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ LOG SOWING TAB ═══ */}
        {activeTab === 'sowing' && (<>
          <div className="gx-section-divider">🌱 Log Sowing</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌱 Record Sowing Event</div><span className="gx-status gx-s-done">Ready</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={opFarmId} onChange={e => setOpFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Crop Name</label><input type="text" className="gx-input" value={sowCrop} onChange={e => setSowCrop(e.target.value)} placeholder="e.g. Maize, Rice, Cotton" /></div>
                <div className="gx-form-group"><label className="gx-label">Variety / Hybrid</label><input type="text" className="gx-input" value={sowVariety} onChange={e => setSowVariety(e.target.value)} placeholder="e.g. NK6240, Pioneer 30V92" /></div>
                <div className="gx-form-group"><label className="gx-label">Seed Quantity (kg)</label><input type="number" className="gx-input" value={sowSeedQty} onChange={e => setSowSeedQty(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Area Sown (acres)</label><input type="number" step="0.5" className="gx-input" value={sowArea} onChange={e => setSowArea(e.target.value)} /></div>
                <div className="gx-form-group">
                  <label className="gx-label">Sowing Method</label>
                  <select className="gx-select" value={sowMethod} onChange={e => setSowMethod(e.target.value)}><option>Direct Seeding</option><option>Transplanting</option><option>Dibbling</option><option>Broadcasting</option><option>Line Sowing</option></select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Spacing (cm × cm)</label><input type="text" className="gx-input" value={sowSpacing} onChange={e => setSowSpacing(e.target.value)} placeholder="e.g. 60 × 20" /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Notes</label>
                <textarea className="gx-textarea" value={sowNotes} onChange={e => setSowNotes(e.target.value)} placeholder="Seed treatment done, soil moisture was adequate..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={logOperation.isPending} onClick={() => {
                  if (!opFarmId) { toast.error('Please select a farm'); return; }
                  setOpArea(sowArea); setOpNotes(`Sowing: ${sowCrop} (${sowVariety}), Qty: ${sowSeedQty}kg, Method: ${sowMethod}, Spacing: ${sowSpacing}. ${sowNotes}`);
                  logOperation.mutate('Sowing');
                  setSowCrop(''); setSowVariety(''); setSowSeedQty(''); setSowArea(''); setSowMethod('Direct Seeding'); setSowSpacing(''); setSowNotes('');
                }}>{logOperation.isPending ? '⏳ Saving...' : '🌱 Log Sowing & Notify'}</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ ASSIGN TASKS TAB ═══ */}
        {activeTab === 'assign' && (<>
          <div className="gx-section-divider">👥 Assign Tasks to Workers</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">👥 Task Assignment</div></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three">
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={opFarmId} onChange={e => setOpFarmId(e.target.value)}>
                    <option value="">Select Farm...</option>
                    {myFarms.map((f: any) => <option key={f.id} value={f.id}>{f.farmCode || f.id}</option>)}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Task Title</label><input type="text" className="gx-input" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Apply Urea to Field A" /></div>
                <div className="gx-form-group">
                  <label className="gx-label">Priority</label>
                  <select className="gx-select" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}><option>Normal</option><option>HIGH</option><option>Urgent</option></select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Assign To (Worker)</label><input type="text" className="gx-input" value={taskWorker} onChange={e => setTaskWorker(e.target.value)} placeholder="Worker name or ID" /></div>
                <div className="gx-form-group"><label className="gx-label">Due Date</label><input type="date" className="gx-input" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Task Description</label>
                <textarea className="gx-textarea" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Detailed instructions for the worker..." />
              </div>
              <div className="gx-btn-row">
                <button className="gx-btn gx-btn-orange" disabled={assignTask.isPending} onClick={() => {
                  if (!opFarmId) { toast.error('Please select a farm'); return; }
                  if (!taskTitle) { toast.error('Please enter a task title'); return; }
                  assignTask.mutate();
                }}>{assignTask.isPending ? '⏳ Assigning...' : '📤 Assign Task'}</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MARK COMPLETE TAB ═══ */}
        {activeTab === 'complete' && (<>
          <div className="gx-section-divider">✅ Mark Tasks Complete</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">✅ Pending Completion</div><span className="gx-status gx-s-pending">{tasks.filter((t: any) => t.status === 'IN_PROGRESS').length} In Progress</span></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Task</th><th>Farm</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {tasks.filter((t: any) => t.status !== 'COMPLETED').length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>All tasks completed! 🎉</td></tr>
                  ) : tasks.filter((t: any) => t.status !== 'COMPLETED').map((t: any, i: number) => (
                    <tr key={t.id || i}>
                      <td>{i + 1}</td>
                      <td>{t.title || t.observations || 'Task'}</td>
                      <td>{t.farm_code || t.farmId || '—'}</td>
                      <td><span className={`gx-status gx-s-pending`}>{t.status || 'Pending'}</span></td>
                      <td><button className="gx-btn gx-btn-green" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => updateTask.mutate({ id: t.id, status: 'COMPLETED' })}>✅ Complete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ═══ ATTENDANCE TAB ═══ */}
        {activeTab === 'attendance' && (<>
          <div className="gx-section-divider">📊 Worker Attendance</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📊 Today's Attendance</div><span className="gx-status gx-s-done">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div>Worker attendance tracking. Workers check in/out from their dashboards.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Attendance records sync automatically for your assigned farms.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ ACTIVITY LOG / REPORTS TAB ═══ */}
        {activeTab === 'reports' && (<>
          <div className="gx-section-divider">📈 My Activity Log</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📈 Operations & Activity History</div><span className="gx-status gx-s-done">{stats?.operationsLogged || 0} Logged</span></div>
            <div className="gx-card-body">
              <div className="gx-stats-row" style={{ marginBottom: 16 }}>
                <div className="gx-stat-card orange"><div className="gx-stat-label">Operations</div><div className="gx-stat-value">{stats?.operationsLogged || 0}</div></div>
                <div className="gx-stat-card blue"><div className="gx-stat-label">Samples</div><div className="gx-stat-value">{stats?.samplesCollected || 0}</div></div>
                <div className="gx-stat-card green"><div className="gx-stat-label">Tasks Done</div><div className="gx-stat-value">{tasks.filter((t: any) => t.status === 'COMPLETED').length}</div></div>
                <div className="gx-stat-card gold"><div className="gx-stat-label">Photos</div><div className="gx-stat-value">{stats?.photosUploaded || 0}</div></div>
              </div>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No activity logged yet this season.</div>
              ) : tasks.slice(0, 10).map((t: any, idx: number) => (
                <div key={t.id || idx} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: t.status === 'COMPLETED' ? 'var(--gx-green-dim)' : 'var(--gx-orange-dim)' }}>
                    {t.status === 'COMPLETED' ? '✅' : '📋'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="gx-act-text"><strong>{t.title || t.operation_type || 'Activity'}</strong></div>
                    <div className="gx-act-time">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : ''} · {t.farm_code || t.farmId || ''}</div>
                  </div>
                  <span className={`gx-status ${t.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{t.status || 'Pending'}</span>
                </div>
              ))}
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
