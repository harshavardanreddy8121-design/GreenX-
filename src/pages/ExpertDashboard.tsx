import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expert } from '@/lib/api';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'overview' | 'farms' | 'samples' | 'results' | 'report' | 'past' | 'suggest' | 'calendar' | 'weather' | 'pest' | 'prescription' | 'photos' | 'cropdb' | 'soillib' | 'pestindex';

export default function ExpertDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [prescription, setPrescription] = useState('');
  const [pestName, setPestName] = useState('');
  const [severity, setSeverity] = useState('Moderate (10-25% infestation)');
  const [chemical, setChemical] = useState('');
  const [dose, setDose] = useState('');
  const [method, setMethod] = useState('Foliar Spray');
  const [phi, setPhi] = useState('');
  const [fmInstructions, setFmInstructions] = useState('');

  // Soil test form
  const [soilPh, setSoilPh] = useState('');
  const [soilN, setSoilN] = useState('');
  const [soilP, setSoilP] = useState('');
  const [soilK, setSoilK] = useState('');
  const [soilOC, setSoilOC] = useState('');
  const [soilMoisture, setSoilMoisture] = useState('');
  const [soilEC, setSoilEC] = useState('');
  const [soilZn, setSoilZn] = useState('');
  const [soilB, setSoilB] = useState('');
  const [expertRemarks, setExpertRemarks] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState('');

  // Crop suggestion form (3 crops)
  const emptyCrop = () => ({ cropName: '', cropVariety: '', season: 'Kharif', yieldMin: '', yieldMax: '', profit: '', inputCost: '', duration: '', score: '', notes: '' });
  const [selectedSuggestFarm, setSelectedSuggestFarm] = useState<any>(null);
  const [sugCrops, setSugCrops] = useState([emptyCrop(), emptyCrop(), emptyCrop()]);
  const updateSugCrop = (idx: number, field: string, value: string) =>
    setSugCrops(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

  const handleLogout = () => { logout(); navigate('/'); };

  const { data: pendingSamples = [] } = useQuery({
    queryKey: ['expert-pending-samples', user?.id],
    queryFn: () => expert.getPendingSamples().catch(() => []),
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const { data: myFarms = [] } = useQuery({
    queryKey: ['expert-farms'],
    queryFn: () => expert.getAssignedFarms().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: myReports = [] } = useQuery({
    queryKey: ['expert-reports'],
    queryFn: () => expert.getMyReports().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: farmsAwaiting = [] } = useQuery({
    queryKey: ['expert-farms-awaiting'],
    queryFn: () => expert.getFarmsAwaitingSuggestions().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: pestAlerts = [] } = useQuery({
    queryKey: ['expert-pest-alerts'],
    queryFn: () => expert.getPestAlerts().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: myPrescriptions = [] } = useQuery({
    queryKey: ['expert-prescriptions'],
    queryFn: () => expert.getMyPrescriptions().catch(() => []),
    enabled: !!user?.id,
  });

  const { data: stats = {} as any } = useQuery({
    queryKey: ['expert-stats'],
    queryFn: () => expert.getStats().catch(() => ({})),
    enabled: !!user?.id,
  });

  const submitReport = useMutation({
    mutationFn: (farmId: string) => expert.submitSoilReport({
      farmId,
      expertId: user?.id || '',
      phLevel: parseFloat(soilPh) || undefined,
      nitrogenKgHa: parseFloat(soilN) || undefined,
      phosphorusKgHa: parseFloat(soilP) || undefined,
      potassiumKgHa: parseFloat(soilK) || undefined,
      organicMatterPct: parseFloat(soilOC) || undefined,
      moisturePct: parseFloat(soilMoisture) || undefined,
      ecDsM: parseFloat(soilEC) || undefined,
      zincPpm: parseFloat(soilZn) || undefined,
      boronPpm: parseFloat(soilB) || undefined,
      expertRemarks,
      overallRating: 'GOOD',
    }),
    onSuccess: () => {
      toast.success('Soil report uploaded & shared to all dashboards!');
      queryClient.invalidateQueries({ queryKey: ['expert-reports'] });
      queryClient.invalidateQueries({ queryKey: ['expert-pending-samples'] });
      setSoilPh(''); setSoilN(''); setSoilP(''); setSoilK('');
      setSoilOC(''); setSoilMoisture(''); setSoilEC('');
      setSoilZn(''); setSoilB(''); setExpertRemarks('');
      setSelectedFarm('');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to submit soil report'),
  });

  const saveCropSuggestionMut = useMutation({
    mutationFn: () => {
      if (!selectedSuggestFarm) throw new Error('No farm selected');
      const toSave = sugCrops
        .filter(c => c.cropName.trim())
        .map(c => ({
          farmId: selectedSuggestFarm.id,
          expertId: user?.id || '',
          cropName: c.cropName,
          cropVariety: c.cropVariety || undefined,
          season: c.season || undefined,
          expectedYieldMin: parseFloat(c.yieldMin) || undefined,
          expectedYieldMax: parseFloat(c.yieldMax) || undefined,
          profitPerAcre: parseFloat(c.profit) || undefined,
          inputCostEstimate: parseFloat(c.inputCost) || undefined,
          durationDays: parseInt(c.duration) || undefined,
          suitabilityScore: parseFloat(c.score) || undefined,
          expertNotes: c.notes || undefined,
        }));
      if (toSave.length === 0) throw new Error('Please fill at least one crop name');
      return expert.saveCropSuggestions(toSave);
    },
    onSuccess: () => {
      const saved = sugCrops.filter(c => c.cropName.trim()).length;
      toast.success(`${saved} crop suggestion${saved > 1 ? 's' : ''} saved and visible to Land Owner!`);
      queryClient.invalidateQueries({ queryKey: ['expert-farms-awaiting'] });
      setSelectedSuggestFarm(null);
      setSugCrops([emptyCrop(), emptyCrop(), emptyCrop()]);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to save crop suggestions'),
  });

  const issuePrescriptionMut = useMutation({
    mutationFn: (alertId: string) => expert.issuePrescription({
      alertId,
      expertId: user?.id || '',
      chemicalName: chemical,
      dose,
      applicationMethod: method,
      preHarvestInterval: phi,
      fmInstructions: `${pestName} (${severity}): ${fmInstructions}`,
    }),
    onSuccess: () => {
      toast.success('Prescription sent to Field Manager! Land Owner & Cluster Admin notified.');
      queryClient.invalidateQueries({ queryKey: ['expert-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['expert-pest-alerts'] });
      setPestName(''); setChemical(''); setDose(''); setPhi(''); setFmInstructions('');
      setSelectedAlertId('');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to issue prescription'),
  });

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Expert';

  return (
    <div className="gx-dashboard ex-accent">
      <MobileHeader title="Expert Lab" roleIcon="🔬" />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-blue-dim)' }}>🔬</div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">EXPERT · SOIL & AGRONOMY</div>
        </div>

        <div className="gx-nav-group-label">Lab Work</div>
        <SideNavItem icon="📊" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <SideNavItem icon="🌾" label="My Assigned Farms" active={activeTab === 'farms'} onClick={() => setActiveTab('farms')} badge={myFarms.length > 0 ? String(myFarms.length) : undefined} badgeColor="green" />
        <SideNavItem icon="📥" label="Pending Samples" active={activeTab === 'samples'} onClick={() => setActiveTab('samples')} badge={pendingSamples.length > 0 ? String(pendingSamples.length) : undefined} badgeColor="red" />
        <SideNavItem icon="⚗️" label="Enter Test Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
        <SideNavItem icon="📤" label="Upload & Share Report" active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
        <SideNavItem icon="🗄️" label="All Past Reports" active={activeTab === 'past'} onClick={() => setActiveTab('past')} />

        <div className="gx-nav-group-label">Crop Planning</div>
        <SideNavItem icon="🌾" label="Suggest Crops" active={activeTab === 'suggest'} onClick={() => setActiveTab('suggest')} badge={farmsAwaiting.length > 0 ? String(farmsAwaiting.length) : undefined} badgeColor="blue" />
        <SideNavItem icon="📅" label="Build Crop Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <SideNavItem icon="🌡️" label="Weather Integration" active={activeTab === 'weather'} onClick={() => setActiveTab('weather')} />

        <div className="gx-nav-group-label">Field Support</div>
        <SideNavItem icon="🐛" label="Pest Alert Inbox" active={activeTab === 'pest'} onClick={() => setActiveTab('pest')} badge={pestAlerts.length > 0 ? String(pestAlerts.length) : undefined} badgeColor="red" />
        <SideNavItem icon="💊" label="Issue Prescriptions" active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')} />
        <SideNavItem icon="📷" label="Field Photo Review" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />

        <div className="gx-nav-group-label">Knowledge Base</div>
        <SideNavItem icon="📚" label="Crop Database" />
        <SideNavItem icon="🧬" label="Soil Reference Library" />
        <SideNavItem icon="⚠️" label="Pest & Disease Index" />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Expert Lab — {userName} 🔬</div>
          <div className="gx-page-sub">{pendingSamples.length} samples pending · {myFarms.length} assigned farms · {pestAlerts.length} pest alerts open</div>
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (<>
          {pestAlerts.length > 0 && (
            <div className="gx-alert-box gx-alert-red">
              <span>🐛</span>
              <div><strong>Pest Alert from Field Manager:</strong> {pestAlerts[0]?.pestName || 'Infestation'} reported. Photos uploaded. Issue prescription now.</div>
            </div>
          )}

          <div className="gx-stats-row">
            <div className="gx-stat-card blue"><div className="gx-stat-label">Samples Pending</div><div className="gx-stat-value">{pendingSamples.length}</div><div className="gx-stat-change gx-down">{pendingSamples.length > 0 ? 'Needs attention' : 'All clear'}</div></div>
            <div className="gx-stat-card green"><div className="gx-stat-label">Reports Uploaded (Season)</div><div className="gx-stat-value">{myReports.length}</div><div className="gx-stat-change gx-up">↑ All shared to dashboards</div></div>
            <div className="gx-stat-card gold"><div className="gx-stat-label">Crop Calendars Built</div><div className="gx-stat-value">{stats?.calendarsBuilt || 0}</div><div className="gx-stat-change gx-neutral">{farmsAwaiting.length} awaiting crop approval</div></div>
            <div className="gx-stat-card orange"><div className="gx-stat-label">Prescriptions Issued</div><div className="gx-stat-value">{myPrescriptions.length}</div><div className="gx-stat-change gx-up">This season</div></div>
          </div>

          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">📥 Pending Samples</div><span className="gx-status gx-s-pending">{pendingSamples.length}</span></div>
              <div className="gx-card-body">
                {pendingSamples.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No pending samples. All clear!</div>
                ) : pendingSamples.slice(0, 3).map((s: any, i: number) => (
                  <div key={s.id || i} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'var(--gx-blue-dim)' }}>🧪</div>
                    <div>
                      <div className="gx-act-text"><strong>{s.sampleCode || s.farmId || 'Sample'}</strong> — Farm {s.farmId || ''}</div>
                      <div className="gx-act-time">{s.collectionDate ? new Date(s.collectionDate).toLocaleDateString('en-IN') : ''} · {s.status || 'Pending'}</div>
                    </div>
                  </div>
                ))}
                {pendingSamples.length > 3 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('samples')}>View All →</button>}
              </div>
            </div>
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">🐛 Active Pest Alerts</div><span className="gx-status gx-s-alert">{pestAlerts.length}</span></div>
              <div className="gx-card-body">
                {pestAlerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No active pest alerts.</div>
                ) : pestAlerts.slice(0, 3).map((a: any, i: number) => (
                  <div key={a.id || i} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>🐛</div>
                    <div>
                      <div className="gx-act-text"><strong>{a.pestName || 'Pest Alert'}</strong> — {a.severity || 'Moderate'}</div>
                      <div className="gx-act-time">{a.farmId || ''} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : ''}</div>
                    </div>
                  </div>
                ))}
                {pestAlerts.length > 3 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('pest')}>View All →</button>}
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MY ASSIGNED FARMS TAB ═══ */}
        {activeTab === 'farms' && (<>
          <div className="gx-section-divider">🌾 My Assigned Farms</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌾 Farms Under My Expertise</div><span className="gx-status gx-s-done">{myFarms.length} Farms</span></div>
            <div className="gx-card-body">
              {myFarms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No farms assigned yet.</div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Farm</th><th>Village</th><th>Acres</th><th>Crop</th><th>Soil Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {myFarms.map((f: any, i: number) => (
                      <tr key={f.id || i}>
                        <td>{i + 1}</td>
                        <td>{f.name || f.farmCode || f.id}</td>
                        <td>{f.village || '—'}{f.district ? `, ${f.district}` : ''}</td>
                        <td>{f.totalLand || '—'}</td>
                        <td>{f.currentCrop || '—'}</td>
                        <td>{f.soilType || '—'}</td>
                        <td><span className={`gx-status ${f.status === 'ACTIVE' ? 'gx-s-done' : 'gx-s-pending'}`}>{f.status || 'PENDING'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ PENDING SAMPLES TAB ═══ */}
        {activeTab === 'samples' && (<>
          <div className="gx-section-divider">📥 Pending Soil Samples</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📥 Samples Awaiting Testing</div><span className="gx-status gx-s-pending">{pendingSamples.length} Pending</span></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Sample Code</th><th>Farm</th><th>Collected By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {pendingSamples.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No pending samples</td></tr>
                  ) : pendingSamples.map((s: any, i: number) => (
                    <tr key={s.id || i}>
                      <td>{i + 1}</td>
                      <td>{s.sampleCode || '—'}</td>
                      <td>{s.farmId || '—'}</td>
                      <td>{s.collectorName || '—'}</td>
                      <td>{s.collectionDate ? new Date(s.collectionDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`gx-status ${s.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{s.status || 'Pending'}</span></td>
                      <td><button className="gx-btn gx-btn-blue" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => { setSelectedFarm(s.farmId); setActiveTab('results'); }}>⚗️ Enter Results</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ═══ ENTER TEST RESULTS TAB ═══ */}
        {activeTab === 'results' && (<>
          <div className="gx-section-divider">⚗️ Enter Soil Test Results</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🧪 Upload Soil Test Report</div><span className="gx-status gx-s-pending">Test In Progress</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid three" style={{ marginBottom: 14 }}>
                <div className="gx-form-group">
                  <label className="gx-label">Farm</label>
                  <select className="gx-select" value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}>
                    <option value="">Select farm...</option>
                    {myFarms.map((f: any) => (<option key={f.id} value={f.id}>{f.farmCode || f.id}{f.name ? ` — ${f.name}` : ''}{f.village ? ` (${f.village})` : ''}</option>))}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Sample Date</label><input type="date" className="gx-input" /></div>
                <div className="gx-form-group"><label className="gx-label">No. of Sample Points</label><input type="number" className="gx-input" defaultValue={8} /></div>
              </div>
              <div className="gx-section-divider" style={{ marginTop: 0 }}>Soil Parameters</div>
              <div className="gx-form-grid three">
                <div className="gx-form-group"><label className="gx-label">pH Level</label><input type="number" step="0.1" className="gx-input" value={soilPh} onChange={e => setSoilPh(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Nitrogen (N) kg/ha</label><input type="number" className="gx-input" value={soilN} onChange={e => setSoilN(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Phosphorus (P) kg/ha</label><input type="number" className="gx-input" value={soilP} onChange={e => setSoilP(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Potassium (K) kg/ha</label><input type="number" className="gx-input" value={soilK} onChange={e => setSoilK(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Organic Matter %</label><input type="number" step="0.1" className="gx-input" value={soilOC} onChange={e => setSoilOC(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Moisture Content %</label><input type="number" className="gx-input" value={soilMoisture} onChange={e => setSoilMoisture(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">EC (dS/m)</label><input type="number" step="0.01" className="gx-input" value={soilEC} onChange={e => setSoilEC(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Zinc (Zn) ppm</label><input type="number" step="0.1" className="gx-input" value={soilZn} onChange={e => setSoilZn(e.target.value)} /></div>
                <div className="gx-form-group"><label className="gx-label">Boron (B) ppm</label><input type="number" step="0.1" className="gx-input" value={soilB} onChange={e => setSoilB(e.target.value)} /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 14 }}>
                <label className="gx-label">Expert Interpretation & Remarks</label>
                <textarea className="gx-textarea" value={expertRemarks} onChange={e => setExpertRemarks(e.target.value)} placeholder="Soil is well-suited for Kharif crops. Nitrogen is deficient — recommend 80 kg Urea/acre split in 2 doses..." />
              </div>
              <div className="gx-btn-row">
                <button
                  className="gx-btn gx-btn-blue"
                  disabled={submitReport.isPending}
                  onClick={() => {
                    if (!selectedFarm) { toast.error('Please select a farm first'); return; }
                    submitReport.mutate(selectedFarm);
                  }}
                >{submitReport.isPending ? '⏳ Uploading...' : '📤 Upload & Share to All Dashboards'}</button>
                <button className="gx-btn gx-btn-ghost">Save Draft</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ UPLOAD & SHARE REPORT TAB ═══ */}
        {activeTab === 'report' && (<>
          <div className="gx-section-divider">📤 Upload & Share Report</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📤 Share Completed Reports</div></div>
            <div className="gx-card-body">
              {myReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
                  <div>No reports to share. Enter test results first.</div>
                  <button className="gx-btn gx-btn-blue" style={{ marginTop: 16 }} onClick={() => setActiveTab('results')}>⚗️ Enter Test Results</button>
                </div>
              ) : myReports.slice(0, 10).map((r: any, i: number) => (
                <div key={r.id || i} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: 'var(--gx-blue-dim)' }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div className="gx-act-text"><strong>{r.farmId || 'Report'}</strong> — pH: {r.phLevel || '—'}, N: {r.nitrogenKgHa || '—'}</div>
                    <div className="gx-act-time">{r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-IN') : r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}</div>
                  </div>
                  <span className="gx-status gx-s-done">Shared</span>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ PAST REPORTS TAB ═══ */}
        {activeTab === 'past' && (<>
          <div className="gx-section-divider">🗄️ All Past Reports</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🗄️ Report Archive</div><span className="gx-status gx-s-done">{myReports.length} Reports</span></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Farm</th><th>pH</th><th>N (kg/ha)</th><th>P (kg/ha)</th><th>K (kg/ha)</th><th>Rating</th><th>Date</th></tr></thead>
                <tbody>
                  {myReports.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No reports submitted yet</td></tr>
                  ) : myReports.map((r: any, i: number) => (
                    <tr key={r.id || i}>
                      <td>{i + 1}</td>
                      <td>{r.farmId || '—'}</td>
                      <td>{r.phLevel || '—'}</td>
                      <td>{r.nitrogenKgHa || '—'}</td>
                      <td>{r.phosphorusKgHa || '—'}</td>
                      <td>{r.potassiumKgHa || '—'}</td>
                      <td><span className={`gx-status ${r.overallRating === 'GOOD' ? 'gx-s-done' : 'gx-s-pending'}`}>{r.overallRating || '—'}</span></td>
                      <td>{r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ═══ SUGGEST CROPS TAB ═══ */}
        {activeTab === 'suggest' && (<>
          <div className="gx-section-divider">🌾 Suggest Crops</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌾 Farms Awaiting Crop Suggestions</div><span className="gx-status gx-s-pending">{farmsAwaiting.length} Awaiting</span></div>
            <div className="gx-card-body">
              {farmsAwaiting.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
                  <div>All farms have been served. No pending suggestions needed.</div>
                </div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Farm Code</th><th>Owner</th><th>Village</th><th>Area (ac)</th><th>Soil Report</th><th>Action</th></tr></thead>
                  <tbody>
                    {farmsAwaiting.map((f: any, i: number) => (
                      <tr key={f.id || i}>
                        <td>{i + 1}</td>
                        <td>{f.farmCode || '—'}</td>
                        <td>{f.name || '—'}</td>
                        <td>{f.village || '—'}</td>
                        <td>{f.totalLand || '—'}</td>
                        <td><span className="gx-status gx-s-done">Ready</span></td>
                        <td><button className="gx-btn gx-btn-blue" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => { setSelectedSuggestFarm(f); setSugCrops([emptyCrop(), emptyCrop(), emptyCrop()]); }}>🌾 Suggest Crops</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Crop Suggestion Form (3 crops) ── */}
          {selectedSuggestFarm && (
            <div className="gx-card" style={{ marginTop: 16 }}>
              <div className="gx-card-header">
                <div className="gx-card-title">🌾 Suggest Crops for {selectedSuggestFarm.farmCode || selectedSuggestFarm.name}</div>
                <button className="gx-btn gx-btn-ghost" style={{ fontSize: 11 }} onClick={() => setSelectedSuggestFarm(null)}>✕ Cancel</button>
              </div>
              <div className="gx-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {sugCrops.map((crop, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--gx-border)', borderRadius: 8, padding: 14, background: 'var(--gx-surface)' }}>
                      <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--gx-accent)', fontSize: 13 }}>🌱 Crop {idx + 1}{idx === 0 ? ' *' : ' (optional)'}</div>
                      <div className="gx-form-group">
                        <label className="gx-label">Crop Name{idx === 0 ? ' *' : ''}</label>
                        <input className="gx-input" value={crop.cropName} onChange={e => updateSugCrop(idx, 'cropName', e.target.value)} placeholder="e.g. Rice, Wheat" />
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Variety</label>
                        <input className="gx-input" value={crop.cropVariety} onChange={e => updateSugCrop(idx, 'cropVariety', e.target.value)} placeholder="e.g. IR-64" />
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Season</label>
                        <select className="gx-input" value={crop.season} onChange={e => updateSugCrop(idx, 'season', e.target.value)}>
                          <option>Kharif</option>
                          <option>Rabi</option>
                          <option>Zaid</option>
                          <option>Annual</option>
                        </select>
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Duration (days)</label>
                        <input className="gx-input" type="number" value={crop.duration} onChange={e => updateSugCrop(idx, 'duration', e.target.value)} placeholder="e.g. 120" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div className="gx-form-group">
                          <label className="gx-label">Yield Min (q/ac)</label>
                          <input className="gx-input" type="number" value={crop.yieldMin} onChange={e => updateSugCrop(idx, 'yieldMin', e.target.value)} placeholder="20" />
                        </div>
                        <div className="gx-form-group">
                          <label className="gx-label">Yield Max (q/ac)</label>
                          <input className="gx-input" type="number" value={crop.yieldMax} onChange={e => updateSugCrop(idx, 'yieldMax', e.target.value)} placeholder="30" />
                        </div>
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Profit / Acre (₹)</label>
                        <input className="gx-input" type="number" value={crop.profit} onChange={e => updateSugCrop(idx, 'profit', e.target.value)} placeholder="15000" />
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Input Cost (₹)</label>
                        <input className="gx-input" type="number" value={crop.inputCost} onChange={e => updateSugCrop(idx, 'inputCost', e.target.value)} placeholder="8000" />
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Suitability (0–10)</label>
                        <input className="gx-input" type="number" min="0" max="10" step="0.1" value={crop.score} onChange={e => updateSugCrop(idx, 'score', e.target.value)} placeholder="8.5" />
                      </div>
                      <div className="gx-form-group">
                        <label className="gx-label">Expert Notes</label>
                        <textarea className="gx-textarea" value={crop.notes} onChange={e => updateSugCrop(idx, 'notes', e.target.value)} placeholder="Recommendations..." rows={2} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="gx-btn-row" style={{ marginTop: 16 }}>
                  <button
                    className="gx-btn gx-btn-green"
                    disabled={!sugCrops.some(c => c.cropName.trim()) || saveCropSuggestionMut.isPending}
                    onClick={() => {
                      if (!sugCrops.some(c => c.cropName.trim())) { toast.error('Please enter at least one crop name'); return; }
                      saveCropSuggestionMut.mutate();
                    }}
                  >
                    {saveCropSuggestionMut.isPending ? '⏳ Saving...' : '✅ Save All Suggestions'}
                  </button>
                  <button className="gx-btn gx-btn-ghost" onClick={() => setSelectedSuggestFarm(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ BUILD CROP CALENDAR TAB ═══ */}
        {activeTab === 'calendar' && (<>
          <div className="gx-section-divider">📅 Build Crop Calendar</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📅 Crop Calendar Builder</div><span className="gx-status gx-s-done">Ready to Build</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid" style={{ marginBottom: 16 }}>
                <div className="gx-form-group"><label className="gx-label">Sowing Date</label><input type="date" className="gx-input" /></div>
                <div className="gx-form-group"><label className="gx-label">Expected Harvest Date</label><input type="date" className="gx-input" /></div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header" /><div className="gx-cal-cell header">W1</div><div className="gx-cal-cell header">W2</div><div className="gx-cal-cell header">W3</div><div className="gx-cal-cell header">W4</div><div className="gx-cal-cell header">W5</div><div className="gx-cal-cell header">W6</div><div className="gx-cal-cell header">Harvest</div>
                </div>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header">Sowing</div><div className="gx-cal-cell task">🌱 Sow seeds</div><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" />
                </div>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header">Fertilizer</div><div className="gx-cal-cell fertilize">Basal dose</div><div className="gx-cal-cell" /><div className="gx-cal-cell fertilize">Top dress</div><div className="gx-cal-cell" /><div className="gx-cal-cell fertilize">K₂O</div><div className="gx-cal-cell" /><div className="gx-cal-cell" />
                </div>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header">Irrigation</div><div className="gx-cal-cell irrigate">Sowing</div><div className="gx-cal-cell irrigate">Knee-high</div><div className="gx-cal-cell irrigate">Tasseling</div><div className="gx-cal-cell irrigate">Silking</div><div className="gx-cal-cell irrigate">Grain fill</div><div className="gx-cal-cell" /><div className="gx-cal-cell" />
                </div>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header">Pest Scout</div><div className="gx-cal-cell" /><div className="gx-cal-cell pest">Scout FAW</div><div className="gx-cal-cell pest">Scout Aphids</div><div className="gx-cal-cell pest">Stem borer</div><div className="gx-cal-cell pest">Scout FAW</div><div className="gx-cal-cell" /><div className="gx-cal-cell" />
                </div>
                <div className="gx-cal-week">
                  <div className="gx-cal-cell header">Harvest</div><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell" /><div className="gx-cal-cell task">🌾 Harvest</div>
                </div>
              </div>
              <div className="gx-btn-row" style={{ marginTop: 16 }}>
                <button className="gx-btn gx-btn-blue">📤 Publish Calendar to Field Manager</button>
                <button className="gx-btn gx-btn-ghost">Preview Full Calendar</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ WEATHER TAB ═══ */}
        {activeTab === 'weather' && (<>
          <div className="gx-section-divider">🌡️ Weather Integration</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌡️ Weather Data</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌤️</div>
                <div>Weather integration shows local conditions for farm locations.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Temperature, humidity, rainfall data will help plan field operations.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ PEST ALERT INBOX TAB ═══ */}
        {activeTab === 'pest' && (<>
          <div className="gx-section-divider">🐛 Pest Alert Inbox</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🐛 Active Pest Alerts</div><span className="gx-status gx-s-alert">{pestAlerts.length} Open</span></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Pest/Disease</th><th>Farm</th><th>Severity</th><th>Reported</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {pestAlerts.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No active pest alerts</td></tr>
                  ) : pestAlerts.map((a: any, i: number) => (
                    <tr key={a.id || i}>
                      <td>{i + 1}</td>
                      <td><strong>{a.pestName || '—'}</strong></td>
                      <td>{a.farmId || '—'}</td>
                      <td><span className={`gx-status ${a.severity === 'HIGH' || a.severity === 'CRITICAL' ? 'gx-s-alert' : 'gx-s-pending'}`}>{a.severity || '—'}</span></td>
                      <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`gx-status ${a.status === 'RESOLVED' ? 'gx-s-done' : 'gx-s-alert'}`}>{a.status || 'OPEN'}</span></td>
                      <td><button className="gx-btn gx-btn-blue" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setActiveTab('prescription')}>💊 Prescribe</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ═══ ISSUE PRESCRIPTIONS TAB ═══ */}
        {activeTab === 'prescription' && (<>
          <div className="gx-section-divider">💊 Issue Pest Prescription</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">🐛 Pest Prescription</div><span className="gx-status gx-s-alert">Urgent</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <div className="gx-form-group">
                  <label className="gx-label">Pest Alert (select the alert you are responding to)</label>
                  <select className="gx-select" value={selectedAlertId} onChange={e => {
                    setSelectedAlertId(e.target.value);
                    const alert = pestAlerts.find((a: any) => a.id === e.target.value);
                    if (alert) { setPestName((alert as any).pestName || ''); setSeverity((alert as any).severity || 'Moderate (10-25% infestation)'); }
                  }}>
                    <option value="">Select pest alert...</option>
                    {pestAlerts.map((a: any) => (<option key={a.id} value={a.id}>{a.pestName || 'Alert'} — {a.farmId || ''} ({a.severity || ''})</option>))}
                  </select>
                </div>
                <div className="gx-form-group"><label className="gx-label">Pest / Disease Identified</label><input type="text" className="gx-input" value={pestName} onChange={e => setPestName(e.target.value)} placeholder="e.g. Aphids (Aphis maydis)" /></div>
                <div className="gx-form-group"><label className="gx-label">Severity Level</label><select className="gx-select" value={severity} onChange={e => setSeverity(e.target.value)}><option>Low</option><option>Moderate (10-25% infestation)</option><option>High</option></select></div>
                <div className="gx-form-group"><label className="gx-label">Recommended Chemical</label><input type="text" className="gx-input" value={chemical} onChange={e => setChemical(e.target.value)} placeholder="e.g. Imidacloprid 17.8% SL" /></div>
                <div className="gx-form-group"><label className="gx-label">Dose</label><input type="text" className="gx-input" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 0.5 ml / Litre of water" /></div>
                <div className="gx-form-group"><label className="gx-label">Application Method</label><select className="gx-select" value={method} onChange={e => setMethod(e.target.value)}><option>Foliar Spray</option><option>Soil Drench</option><option>Seed Treatment</option></select></div>
                <div className="gx-form-group"><label className="gx-label">Pre-Harvest Interval (PHI)</label><input type="text" className="gx-input" value={phi} onChange={e => setPhi(e.target.value)} placeholder="e.g. 14 days before harvest" /></div>
              </div>
              <div className="gx-form-group full" style={{ marginTop: 12 }}>
                <label className="gx-label">Field Manager Instructions</label>
                <textarea className="gx-textarea" value={fmInstructions} onChange={e => setFmInstructions(e.target.value)} placeholder="Spray in early morning or late evening. Avoid spray during flowering. Cover underside of leaves..." />
              </div>
              <div className="gx-btn-row">
                <button
                  className="gx-btn gx-btn-blue"
                  disabled={issuePrescriptionMut.isPending}
                  onClick={() => {
                    if (!selectedAlertId) { toast.error('Please select a pest alert to respond to'); return; }
                    if (!chemical) { toast.error('Please enter the recommended chemical'); return; }
                    issuePrescriptionMut.mutate(selectedAlertId);
                  }}
                >{issuePrescriptionMut.isPending ? '⏳ Sending...' : '💊 Send Prescription to Field Manager'}</button>
              </div>
            </div>
          </div>

          {/* Existing prescriptions list */}
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📋 Issued Prescriptions</div><span className="gx-status gx-s-done">{myPrescriptions.length} Total</span></div>
            <div className="gx-card-body">
              {myPrescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No prescriptions issued yet.</div>
              ) : myPrescriptions.map((p: any, i: number) => (
                <div key={p.id || i} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: 'var(--gx-blue-dim)' }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div className="gx-act-text"><strong>{p.chemicalName || 'Prescription'}</strong> — {p.dose || ''}</div>
                    <div className="gx-act-time">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''} · {p.isacknowledged ? '✅ Acknowledged' : '⏳ Pending'}</div>
                  </div>
                  <span className={`gx-status ${p.isacknowledged ? 'gx-s-done' : 'gx-s-pending'}`}>{p.isacknowledged ? 'ACK' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ FIELD PHOTOS TAB ═══ */}
        {activeTab === 'photos' && (<>
          <div className="gx-section-divider">📷 Field Photo Review</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📷 Photos from Field</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                <div>Field photos uploaded by Field Manager will appear here for review.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Photos help assess pest damage, crop health, and field conditions remotely.</div>
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
