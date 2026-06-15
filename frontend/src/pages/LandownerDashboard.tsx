import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landOwner, notifications } from '@/lib/api';
import { AlertTriangle, Banknote, BarChart3, Bell, Bot, Bug, Calendar, Camera, CheckCircle2, ClipboardList, CloudSun, Droplets, FileText, FolderOpen, Home, Leaf, Lightbulb, Loader2, LogOut, Map, MapPin, MessageSquare, Receipt, Settings, Sprout, Star, TestTubes, Trash2, Wallet, Wheat, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import { useAI } from '@/hooks/useAI';
import { AiInsightPanel } from '@/components/AiInsightPanel';
import { AiAssistant } from '@/components/AiAssistant';
import { useNotifications } from '@/hooks/useNotifications';
import WeatherWidget from '@/components/WeatherWidget';

type Tab = 'overview' | 'land' | 'soil' | 'crops' | 'calendar' | 'photos' | 'costs' | 'profit' | 'notifications' | 'contract' | 'settings' | 'farmmap' | 'payments' | 'messages' | 'seasonreport' | 'ai';

export default function LandownerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleLogout = () => { logout(); navigate('/'); };

  const { data: myFarms = [], isError: farmsError, error: farmsErr } = useQuery({
    queryKey: ['landowner-farms', user?.id],
    queryFn: () => landOwner.getFarms(),
    enabled: !!user?.id,
    retry: 2,
  });

  const farm: any = myFarms[0];

  // ── Dashboard live-data queries ──────────────────────────────────────────

  const { data: overviewData, isLoading: overviewLoading, isError: overviewError } = useQuery({
    queryKey: ['lo-dashboard-overview', user?.id],
    queryFn: () => landOwner.getOverviewData(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: soilSamples = [], isLoading: soilSamplesLoading, isError: soilSamplesError } = useQuery({
    queryKey: ['lo-dashboard-soil-samples', user?.id],
    queryFn: () => landOwner.getDashboardSoilSamples(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: soilReports = [], isLoading: soilReportsLoading, isError: soilReportsError } = useQuery({
    queryKey: ['lo-dashboard-soil-reports', user?.id],
    queryFn: () => landOwner.getDashboardSoilReports(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: cropSuggestions = [], isLoading: cropSuggestionsLoading, isError: cropSuggestionsError } = useQuery({
    queryKey: ['lo-dashboard-crop-suggestions', user?.id],
    queryFn: () => landOwner.getDashboardCropSuggestions(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: financeData, isLoading: financeLoading, isError: financeError } = useQuery({
    queryKey: ['lo-dashboard-finance', user?.id],
    queryFn: () => landOwner.getDashboardFinanceSummary(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: fieldUpdates = [], isLoading: fieldUpdatesLoading, isError: fieldUpdatesError } = useQuery({
    queryKey: ['lo-dashboard-field-updates', user?.id],
    queryFn: () => landOwner.getFieldUpdates(),
    enabled: !!user?.id,
    refetchInterval: 15000,
    retry: 2,
  });

  const { data: scheduleItems = [], isLoading: scheduleLoading, isError: scheduleError } = useQuery({
    queryKey: ['lo-dashboard-schedule', user?.id],
    queryFn: () => landOwner.getSchedule(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  // Legacy queries kept for backward-compat sections
  const { data: costs = [] } = useQuery({
    queryKey: ['farm-costs', farm?.id],
    queryFn: () => landOwner.getFinanceSummary(),
    enabled: !!farm?.id,
    retry: 2,
  });

  const { data: cropPlans = [] } = useQuery({
    queryKey: ['crop-plans', user?.id],
    queryFn: () => landOwner.getDashboardCropSuggestions(),
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['farm-timeline', farm?.id],
    queryFn: () => landOwner.getOperationsFeed(),
    enabled: !!farm?.id,
    retry: 2,
  });

  const { data: sampleTrack = [], isError: samplesError, error: samplesErr } = useQuery({
    queryKey: ['landowner-samples', user?.id],
    queryFn: () => landOwner.getDashboardSoilSamples(),
    enabled: !!user?.id,
    refetchInterval: 15000,
    retry: 2,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['lo-unread-count'],
    queryFn: () => notifications.unreadCount('LAND_OWNER').catch(() => 0),
    refetchInterval: 30000,
  });

  const { notifications: realNotifications, markRead: markNotifRead } = useNotifications({
    userId: user?.id ?? null,
    role: 'LAND_OWNER',
    onNew: (n) => toast({ title: n.title, description: n.message }),
  });

  const approveCropPlan = useMutation({
    mutationFn: ({ planId }: { planId: string }) => landOwner.selectCrop(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lo-dashboard-crop-suggestions'] });
      toast({ title: 'Crop selected! Expert notified. Calendar coming soon.' });
    },
  });

  const costsArr = Array.isArray(costs) ? costs : [];
  const totalCosts = costsArr.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const ai = useAI();

  // Derived values from live dashboard data
  const liveTotalLand = overviewData?.totalLand ?? (myFarms.reduce((s: number, f: any) => s + (f.totalLand || 0), 0));
  const liveTotalCosts = financeData?.totalExpenses ?? overviewData?.totalCosts ?? totalCosts;
  const liveTotalSamples = overviewData?.totalSamples ?? sampleTrack.length;
  const latestSoilReport: any = soilReports[0] ?? null;

  return (
    <div className="gx-dashboard lo-accent">
      <MobileHeader title="Land Owner" roleIcon={<Home size={18} />} />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-gold-dim)' }}><Home size={22} /></div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">LAND OWNER</div>
          <div className="gx-theme-switch">
            <span>Theme</span>
            <ThemeToggle className="gx-theme-toggle" />
          </div>
        </div>

        <div className="gx-nav-group-label">My Farm</div>
        <SideNavItem icon={<Leaf size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <SideNavItem icon={<MapPin size={18} />} label="My Land Details" active={activeTab === 'land'} onClick={() => setActiveTab('land')} />
        <SideNavItem icon={<Map size={18} />} label="Farm Map & Location" active={activeTab === 'farmmap'} onClick={() => setActiveTab('farmmap')} />

        <div className="gx-nav-group-label">Reports & Data</div>
        <SideNavItem icon={<TestTubes size={18} />} label="Soil Test Reports" active={activeTab === 'soil'} onClick={() => setActiveTab('soil')} badge="New" badgeColor="gold" />
        <SideNavItem icon={<Wheat size={18} />} label="Crop Suggestions" active={activeTab === 'crops'} onClick={() => setActiveTab('crops')} badge={cropSuggestions.length > 0 ? String(cropSuggestions.length) : undefined} badgeColor="gold" />
        <SideNavItem icon={<Calendar size={18} />} label="Crop Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <SideNavItem icon={<Camera size={18} />} label="Live Field Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />

        <div className="gx-nav-group-label">Finance</div>
        <SideNavItem icon={<Wallet size={18} />} label="Input Costs & Usage" active={activeTab === 'costs'} onClick={() => setActiveTab('costs')} />
        <SideNavItem icon={<BarChart3 size={18} />} label="Yield & Profit Tracker" active={activeTab === 'profit'} onClick={() => setActiveTab('profit')} />
        <SideNavItem icon={<Receipt size={18} />} label="Payment History" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />

        <div className="gx-nav-group-label">Communication</div>
        <SideNavItem icon={<Bell size={18} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount > 0 ? String(unreadCount) : undefined} badgeColor="red" />
        <SideNavItem icon={<MessageSquare size={18} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
        <SideNavItem icon={<ClipboardList size={18} />} label="Season Reports" active={activeTab === 'seasonreport'} onClick={() => setActiveTab('seasonreport')} />

        <div className="gx-nav-group-label">Intelligence</div>
        <SideNavItem icon={<Bot size={18} />} label="AI Farm Advisor" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} badge={ai.recommendations.length > 0 ? String(ai.recommendations.length) : undefined} badgeColor="gold" />

        <div className="gx-nav-group-label">Account</div>
        <SideNavItem icon={<FileText size={18} />} label="My Contract" active={activeTab === 'contract'} onClick={() => setActiveTab('contract')} />
        <SideNavItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Good morning, {userName.split(' ')[0]} <Sprout className="inline-block w-4 h-4 mr-1 align-middle" /></div>
          <div className="gx-page-sub">
            {farm ? `Your farm in ${farm.village || 'AP'} — ${farm.crop || 'Kharif'} Season is active` : 'Welcome to your GreenX dashboard'}
          </div>
          <div style={{ position: 'absolute', right: 18, top: 14 }}><NotificationBell role="LAND_OWNER" /></div>
        </div>

        {(farmsError || samplesError) && (
          <div className="gx-alert-box gx-alert-red">
            <span><AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /></span>
            <div><strong>Backend Connection Error:</strong> {(farmsErr || samplesErr)?.message || 'Could not load data from the server.'}</div>
          </div>
        )}

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (<>
          {farm && (
            <div style={{ marginBottom: 24 }}>
              <WeatherWidget village={farm.village} pincode={farm.pincode} compact={false} />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="gx-btn gx-btn-ghost gx-btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  onClick={() => navigate('/landowner/weather', { state: { farm } })}
                >
                  <CloudSun size={14} /> View Detailed Weather &amp; Forecast →
                </button>
              </div>
            </div>
          )}

          {cropSuggestions.length > 0 && cropSuggestions.every((p: any) => !p.isselected) && (
            <div className="gx-alert-box gx-alert-gold">
              <span><Zap className="inline-block w-4 h-4 mr-1 align-middle" /></span>
              <div><strong>Action Required:</strong> Expert has suggested {cropSuggestions.length} crop(s) for your soil. Please review and select your preferred crop to unlock the season plan.</div>
            </div>
          )}

          <div className="gx-stats-row">
            <div className="gx-stat-card gold">
              <div className="gx-stat-label">Total Land Area</div>
              <div className="gx-stat-value">
                {overviewLoading ? <Loader2 size={18} className="animate-spin inline-block" /> : liveTotalLand.toFixed(1)}
                <span className="gx-stat-unit"> ac</span>
              </div>
              <div className="gx-stat-change gx-up">✓ {overviewData?.farmCount ?? myFarms.length} field(s) active</div>
            </div>
            <div className="gx-stat-card green">
              <div className="gx-stat-label">Predicted Yield</div>
              <div className="gx-stat-value">{farm?.expectedRevenue ? (parseFloat(farm.expectedRevenue) / 50000).toFixed(1) : '—'}<span className="gx-stat-unit"> T</span></div>
              <div className="gx-stat-change gx-up">↑ Based on soil analysis</div>
            </div>
            <div className="gx-stat-card blue">
              <div className="gx-stat-label">Input Costs So Far</div>
              <div className="gx-stat-value">
                {financeLoading ? <Loader2 size={18} className="animate-spin inline-block" /> : `₹${liveTotalCosts > 0 ? `${(Number(liveTotalCosts) / 1000).toFixed(0)}K` : '0'}`}
              </div>
              <div className="gx-stat-change gx-neutral">{financeData ? `Revenue: ₹${(Number(financeData.totalRevenue) / 1000).toFixed(0)}K` : 'Budget tracking'}</div>
            </div>
            <div className="gx-stat-card orange">
              <div className="gx-stat-label">Soil Samples</div>
              <div className="gx-stat-value">
                {overviewLoading ? <Loader2 size={18} className="animate-spin inline-block" /> : liveTotalSamples}
              </div>
              <div className="gx-stat-change gx-neutral">Live tracking</div>
            </div>
          </div>

          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Latest Soil Report</div><span className="gx-status gx-s-done">{soilReports.length > 0 ? 'Recent' : 'Pending'}</span></div>
              <div className="gx-card-body">
                {soilReportsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)' }}><Loader2 size={20} className="animate-spin inline-block" /> Loading report...</div>
                ) : soilReportsError ? (
                  <div style={{ color: 'var(--gx-red)', fontSize: 13, padding: '12px 0' }}><AlertTriangle size={14} className="inline-block mr-1" /> Failed to load soil reports.</div>
                ) : latestSoilReport ? (<>
                  <SoilMetric label="pH Level" value={latestSoilReport.phLevel} good={latestSoilReport.phLevel >= 6 && latestSoilReport.phLevel <= 7.5} />
                  <SoilMetric label="Nitrogen (N)" value={latestSoilReport.nitrogenKgHa ? `${latestSoilReport.nitrogenKgHa} kg/ha` : undefined} good={latestSoilReport.nitrogenKgHa >= 200} />
                  <SoilMetric label="Phosphorus (P)" value={latestSoilReport.phosphorusKgHa ? `${latestSoilReport.phosphorusKgHa} kg/ha` : undefined} good />
                  <SoilMetric label="Potassium (K)" value={latestSoilReport.potassiumKgHa ? `${latestSoilReport.potassiumKgHa} kg/ha` : undefined} good />
                  <SoilMetric label="Moisture Content" value={latestSoilReport.moisturePct ? `${latestSoilReport.moisturePct}%` : undefined} />
                  <SoilMetric label="Organic Matter" value={latestSoilReport.organicMatterPct ? `${latestSoilReport.organicMatterPct}%` : undefined} good={false} />
                  {latestSoilReport.reportDate && <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 6 }}>Report date: {new Date(latestSoilReport.reportDate).toLocaleDateString('en-IN')}</div>}
                </>) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)', fontSize: 13 }}><TestTubes size={32} strokeWidth={1.5} className="mx-auto mb-2" /><div>No soil report yet. Expert will submit after lab analysis.</div></div>
                )}
                <div className="gx-btn-row"><button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('soil')}><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> View Full Report</button></div>
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Expert Crop Suggestions</div><span className="gx-status gx-s-pending">{cropSuggestions.length > 0 ? 'Select Required' : 'Awaiting'}</span></div>
              <div className="gx-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cropSuggestionsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)' }}><Loader2 size={18} className="animate-spin inline-block" /> Loading suggestions...</div>
                  ) : cropSuggestionsError ? (
                    <div style={{ color: 'var(--gx-red)', fontSize: 13 }}><AlertTriangle size={14} className="inline-block mr-1" /> Failed to load crop suggestions.</div>
                  ) : cropSuggestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> No crop suggestions yet. Expert will submit after soil report.</div>
                  ) : cropSuggestions.slice(0, 2).map((plan: any, i: number) => (
                    <div key={plan.id} className={i === 0 ? 'gx-crop-option recommended' : 'gx-crop-option default'}>
                      <div>
                        <div style={{ fontWeight: 600, color: i === 0 ? 'var(--gx-green)' : 'var(--gx-text)', fontSize: 14 }}>{plan.cropName}</div>
                        <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                          Yield: {plan.expectedYieldMin ? `${plan.expectedYieldMin}–${plan.expectedYieldMax}` : '—'} {plan.yieldUnit || 'T/ac'} · Profit: ₹{parseFloat(plan.profitPerAcre || 0).toLocaleString()}/ac
                        </div>
                      </div>
                      <button className={`gx-btn gx-btn-sm ${plan.isselected ? 'gx-btn-green' : i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`} onClick={() => !plan.isselected && approveCropPlan.mutate({ planId: plan.id })} disabled={plan.isselected}>{plan.isselected ? <><CheckCircle2 size={14} className="inline-block mr-1" />Selected</> : 'Select'}</button>
                    </div>
                  ))}
                  {cropSuggestions.length > 2 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('crops')}>View All {cropSuggestions.length} Suggestions →</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Sample Live Track</div><span className="gx-status gx-s-pending">{soilSamples.length}</span></div>
              <div className="gx-card-body">
                {soilSamplesLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)' }}><Loader2 size={18} className="animate-spin inline-block" /> Loading samples...</div>
                ) : soilSamplesError ? (
                  <div style={{ color: 'var(--gx-red)', fontSize: 13 }}><AlertTriangle size={14} className="inline-block mr-1" /> Failed to load samples.</div>
                ) : soilSamples.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No samples logged for your farms yet.</div>
                ) : soilSamples.slice(0, 6).map((s: any) => (
                  <div key={s.id} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'var(--gx-gold-dim)' }}><TestTubes size={18} /></div>
                    <div>
                      <div className="gx-act-text"><strong>{s.sampleCode || s.id}</strong> · <span className={`gx-status ${s.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{s.status || 'PENDING'}</span></div>
                      <div className="gx-act-time">{s.collectionDate ? new Date(s.collectionDate).toLocaleDateString('en-IN') : s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Live Field Updates</div><span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Auto-synced · {fieldUpdates.length} updates</span></div>
              <div className="gx-card-body">
                {fieldUpdatesLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)' }}><Loader2 size={18} className="animate-spin inline-block" /> Loading updates...</div>
                ) : fieldUpdatesError ? (
                  <div style={{ color: 'var(--gx-red)', fontSize: 13 }}><AlertTriangle size={14} className="inline-block mr-1" /> Failed to load field updates.</div>
                ) : fieldUpdates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No field updates yet. Activity will sync automatically.</div>
                ) : fieldUpdates.slice(0, 4).map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: event.updateType === 'expense' ? 'rgba(239,68,68,0.1)' : event.updateType === 'income' ? 'var(--gx-green-dim)' : 'var(--gx-gold-dim)' }}>
                      {event.updateType === 'photo' ? <Camera size={18} /> : event.updateType === 'expense' ? <Wallet size={18} /> : event.updateType === 'income' ? <Banknote size={18} /> : <Sprout size={18} />}
                    </div>
                    <div>
                      <div className="gx-act-text"><strong>{event.title || event.updateType || 'Update'}</strong>{event.description ? ` — ${event.description}` : ''}</div>
                      <div className="gx-act-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}{event.amount ? ` · ₹${parseFloat(event.amount).toLocaleString()}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Season Finance Tracker</div></div>
              <div className="gx-card-body">
                {financeLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-text2)' }}><Loader2 size={18} className="animate-spin inline-block" /> Loading finance data...</div>
                ) : financeError ? (
                  <div style={{ color: 'var(--gx-red)', fontSize: 13 }}><AlertTriangle size={14} className="inline-block mr-1" /> Failed to load finance data.</div>
                ) : financeData ? (<>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Investment</span><span className="gx-metric-value">₹{Number(financeData.totalInvestment).toLocaleString()}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Expenses</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{Number(financeData.totalExpenses).toLocaleString()}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Revenue</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{Number(financeData.totalRevenue).toLocaleString()}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label" style={{ color: 'var(--gx-text)' }}>Net Profit</span><span className="gx-metric-value" style={{ color: Number(financeData.profit) >= 0 ? 'var(--gx-green)' : 'var(--gx-red)' }}>₹{Number(financeData.profit).toLocaleString()}</span></div>
                  <div style={{ marginTop: 14 }}>
                    <div className="gx-progress-label"><span>Expenses vs Revenue</span><span>{financeData.totalRevenue > 0 ? `${Math.round((Number(financeData.totalExpenses) / Number(financeData.totalRevenue)) * 100)}%` : '—'}</span></div>
                    <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${financeData.totalRevenue > 0 ? Math.min((Number(financeData.totalExpenses) / Number(financeData.totalRevenue)) * 100, 100) : 0}%`, background: 'var(--gx-gold)' }} /></div>
                  </div>
                </>) : (<>
                  <div className="gx-metric-row"><span className="gx-metric-label">Seeds & Planting</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Fertilizers</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Pesticides</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Labour</span><span className="gx-metric-value">—</span></div>
                </>)}
                <div className="gx-btn-row" style={{ marginTop: 12 }}><button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('costs')}>View Full Finance →</button></div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MY LAND DETAILS TAB ═══ */}
        {activeTab === 'land' && (<>
          <div className="gx-section-divider"><MapPin className="inline-block w-4 h-4 mr-1 align-middle" /> My Land Details</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title"><Home className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Information</div><span className="gx-status gx-s-done">{farm?.status || 'Active'}</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <div className="gx-metric-row"><span className="gx-metric-label">Farm Code</span><span className="gx-metric-value">{farm?.farmCode || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Total Area</span><span className="gx-metric-value">{farm?.totalLand || '—'} acres</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Village</span><span className="gx-metric-value">{farm?.village || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">District</span><span className="gx-metric-value">{farm?.district || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">State</span><span className="gx-metric-value">{farm?.state || 'Andhra Pradesh'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Soil Type</span><span className="gx-metric-value">{farm?.soilType || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Water Source</span><span className="gx-metric-value">{farm?.waterSource || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Current Crop</span><span className="gx-metric-value">{farm?.currentCrop || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Current Stage</span><span className="gx-metric-value">{farm?.currentStage || '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Contract Date</span><span className="gx-metric-value">{farm?.contract_date ? new Date(farm.contract_date).toLocaleDateString('en-IN') : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Your Share</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{farm?.landowner_share_pct || 80}%</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">GreenX Share</span><span className="gx-metric-value">{farm?.greenx_share_pct || 20}%</span></div>
              </div>
            </div>
          </div>
          {myFarms.length > 1 && (
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><FolderOpen className="inline-block w-4 h-4 mr-1 align-middle" /> All My Farms ({myFarms.length})</div></div>
              <div className="gx-card-body">
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Farm Code</th><th>Village</th><th>Area (ac)</th><th>Crop</th><th>Status</th></tr></thead>
                  <tbody>
                    {myFarms.map((f: any, i: number) => (
                      <tr key={f.id || i}><td>{i + 1}</td><td>{f.farmCode || '—'}</td><td>{f.village || '—'}</td><td>{f.totalLand || '—'}</td><td>{f.currentCrop || '—'}</td><td><span className="gx-status gx-s-done">{f.status || 'Active'}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ SOIL TEST REPORTS TAB ═══ */}
        {activeTab === 'soil' && (<>
          <div className="gx-section-divider"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Test Reports</div>
          {soilReportsLoading ? (
            <div className="gx-card"><div className="gx-card-body" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><Loader2 size={28} className="animate-spin inline-block mb-2" /><div>Loading soil reports...</div></div></div>
          ) : soilReportsError ? (
            <div className="gx-card"><div className="gx-card-body"><div style={{ color: 'var(--gx-red)', padding: '20px 0' }}><AlertTriangle size={16} className="inline-block mr-2" />Failed to load soil reports. Please try again.</div></div></div>
          ) : soilReports.length === 0 ? (
            <div className="gx-card"><div className="gx-card-body" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><TestTubes size={48} strokeWidth={1.5} className="mx-auto mb-3" /><div>No soil reports yet. Expert will submit after lab analysis.</div></div></div>
          ) : soilReports.map((report: any, idx: number) => (
            <div key={report.id} className="gx-card" style={{ marginBottom: 16 }}>
              <div className="gx-card-header">
                <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Report #{idx + 1} {idx === 0 ? '(Latest)' : ''}</div>
                <span className="gx-status gx-s-done">{report.overallRating || 'Submitted'}</span>
              </div>
              <div className="gx-card-body">
                <div className="gx-form-grid">
                  <SoilMetric label="pH Level" value={report.phLevel} good={report.phLevel >= 6 && report.phLevel <= 7.5} />
                  <SoilMetric label="Nitrogen (N)" value={report.nitrogenKgHa ? `${report.nitrogenKgHa} kg/ha` : undefined} good={report.nitrogenKgHa >= 200} />
                  <SoilMetric label="Phosphorus (P)" value={report.phosphorusKgHa ? `${report.phosphorusKgHa} kg/ha` : undefined} good />
                  <SoilMetric label="Potassium (K)" value={report.potassiumKgHa ? `${report.potassiumKgHa} kg/ha` : undefined} good />
                  <SoilMetric label="Organic Matter" value={report.organicMatterPct ? `${report.organicMatterPct}%` : undefined} good={false} />
                  <SoilMetric label="Moisture Content" value={report.moisturePct ? `${report.moisturePct}%` : undefined} />
                  <SoilMetric label="EC (dS/m)" value={report.ecDsM} />
                  <SoilMetric label="Zinc (ppm)" value={report.zincPpm} />
                  <SoilMetric label="Boron (ppm)" value={report.boronPpm} />
                  <SoilMetric label="Sulphur (ppm)" value={report.sulphurPpm} />
                </div>
                {report.expertRemarks && (
                  <div style={{ marginTop: 16, padding: 14, background: 'var(--gx-surface2)', borderRadius: 8, borderLeft: '3px solid var(--gx-gold)' }}>
                    <div style={{ fontSize: 12, color: 'var(--gx-gold)', fontWeight: 600, marginBottom: 6 }}>Expert Interpretation</div>
                    <div style={{ fontSize: 13, color: 'var(--gx-text2)', lineHeight: 1.6 }}>{report.expertRemarks}</div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 10 }}>
                  Report date: {report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-IN') : '—'}
                </div>
                <div className="gx-btn-row" style={{ marginTop: 16 }}>
                  <button className="gx-btn gx-btn-ghost" onClick={() => toast({ title: 'PDF report download will be available soon.' })}><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> Download PDF Report</button>
                </div>
              </div>
            </div>
          ))}
        </>)}

        {/* ═══ CROP SUGGESTIONS TAB ═══ */}
        {activeTab === 'crops' && (<>
          <div className="gx-section-divider"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Crop Suggestions</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Expert Crop Suggestions</div><span className="gx-status gx-s-pending">{cropSuggestions.length} Options</span></div>
            <div className="gx-card-body">
              {cropSuggestionsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><Loader2 size={28} className="animate-spin inline-block mb-2" /><div>Loading crop suggestions...</div></div>
              ) : cropSuggestionsError ? (
                <div style={{ color: 'var(--gx-red)', padding: '20px 0' }}><AlertTriangle size={16} className="inline-block mr-2" />Failed to load crop suggestions. Please try again.</div>
              ) : cropSuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Wheat size={48} strokeWidth={1.5} /></div>
                  <div>No crop suggestions yet. Expert will submit after soil report.</div>
                </div>
              ) : cropSuggestions.map((plan: any, i: number) => (
                <div key={plan.id} style={{ padding: 16, background: 'var(--gx-surface2)', borderRadius: 10, marginBottom: 12, border: i === 0 ? '1px solid var(--gx-green)' : '1px solid var(--gx-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: i === 0 ? 'var(--gx-green)' : 'var(--gx-text)' }}>{i === 0 ? <><Star className="inline-block w-4 h-4 mr-1 align-middle" /> </> : ''}{plan.cropName} {plan.cropVariety ? `(${plan.cropVariety})` : ''}</div>
                      <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>{plan.season || 'Kharif'} Season · {plan.durationDays || '—'} days</div>
                    </div>
                    <button className={`gx-btn ${plan.isselected ? 'gx-btn-green' : i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`} onClick={() => !plan.isselected && approveCropPlan.mutate({ planId: plan.id })} disabled={plan.isselected}>{plan.isselected ? <><CheckCircle2 className="inline-block w-4 h-4 mr-1 align-middle" /> Selected</> : 'Select Crop'}</button>
                  </div>
                  <div className="gx-form-grid">
                    <div className="gx-metric-row"><span className="gx-metric-label">Expected Yield</span><span className="gx-metric-value">{plan.expectedYieldMin || '—'} – {plan.expectedYieldMax || '—'} {plan.yieldUnit || 'T/ac'}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Profit/Acre</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{parseFloat(plan.profitPerAcre || 0).toLocaleString()}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Input Cost Est.</span><span className="gx-metric-value">₹{parseFloat(plan.inputCostEstimate || 0).toLocaleString()}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Suitability Score</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>{plan.suitabilityScore || '—'}/10</span></div>
                  </div>
                  {plan.expertNotes && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gx-text2)', fontStyle: 'italic' }}><Lightbulb className="inline-block w-4 h-4 mr-1 align-middle" /> {plan.expertNotes}</div>}
                  {plan.createdAt && <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 6 }}>Submitted: {new Date(plan.createdAt).toLocaleDateString('en-IN')}</div>}
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ CROP CALENDAR TAB ═══ */}
        {activeTab === 'calendar' && (<>
          <div className="gx-section-divider"><Calendar className="inline-block w-4 h-4 mr-1 align-middle" /> Crop Calendar</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Calendar className="inline-block w-4 h-4 mr-1 align-middle" /> Season Schedule & Tasks</div><span className="gx-status gx-s-done">{scheduleItems.length} Items</span></div>
            <div className="gx-card-body">
              {scheduleLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><Loader2 size={28} className="animate-spin inline-block mb-2" /><div>Loading schedule...</div></div>
              ) : scheduleError ? (
                <div style={{ color: 'var(--gx-red)', padding: '20px 0' }}><AlertTriangle size={16} className="inline-block mr-2" />Failed to load schedule. Please try again.</div>
              ) : scheduleItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Calendar size={48} strokeWidth={1.5} /></div>
                  <div>No schedule published yet. Expert will build after crop selection.</div>
                </div>
              ) : (
                <div>{scheduleItems.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: item.status === 'COMPLETED' ? 'var(--gx-green-dim)' : item.status === 'IN_PROGRESS' ? 'var(--gx-gold-dim)' : 'var(--gx-surface2)' }}>
                      <ClipboardList size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="gx-act-text"><strong>{item.operationName || 'Task'}</strong></div>
                      {item.description && <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>{item.description}</div>}
                      <div className="gx-act-time">
                        {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('en-IN') : ''}
                        {item.scheduledEndDate ? ` → ${new Date(item.scheduledEndDate).toLocaleDateString('en-IN')}` : ''}
                      </div>
                    </div>
                    <span className={`gx-status ${item.status === 'COMPLETED' ? 'gx-s-done' : item.status === 'IN_PROGRESS' ? 'gx-s-active' : 'gx-s-pending'}`}>{item.status || 'Pending'}</span>
                  </div>
                ))}</div>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ LIVE FIELD PHOTOS TAB ═══ */}
        {activeTab === 'photos' && (<>
          <div className="gx-section-divider"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Live Field Photos</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Field Photo Gallery</div><span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Auto-synced from Field Manager</span></div>
            <div className="gx-card-body">
              {fieldUpdatesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><Loader2 size={28} className="animate-spin inline-block mb-2" /><div>Loading field updates...</div></div>
              ) : fieldUpdatesError ? (
                <div style={{ color: 'var(--gx-red)', padding: '20px 0' }}><AlertTriangle size={16} className="inline-block mr-2" />Failed to load field updates.</div>
              ) : (() => {
                const photoUpdates = fieldUpdates.filter((e: any) => e.updateType === 'photo' || e.photoUrl);
                return photoUpdates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Camera size={48} strokeWidth={1.5} /></div>
                    <div>No field photos uploaded yet. Photos will appear here when Field Manager uploads them.</div>
                  </div>
                ) : photoUpdates.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'var(--gx-green-dim)' }}><Camera size={18} /></div>
                    <div>
                      <div className="gx-act-text"><strong>{event.title || 'Photo Update'}</strong>{event.description ? ` — ${event.description}` : ''}</div>
                      <div className="gx-act-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}</div>
                    </div>
                    {event.photoUrl && (
                      <a href={event.photoUrl} target="_blank" rel="noopener noreferrer" className="gx-btn gx-btn-ghost gx-btn-sm">View</a>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </>)}

        {/* ═══ INPUT COSTS TAB ═══ */}
        {activeTab === 'costs' && (<>
          <div className="gx-section-divider"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Input Costs & Usage</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Season Input Costs Breakdown</div></div>
            <div className="gx-card-body">
              {fieldUpdatesLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)' }}><Loader2 size={24} className="animate-spin inline-block mb-2" /><div>Loading cost data...</div></div>
              ) : fieldUpdatesError ? (
                <div style={{ color: 'var(--gx-red)', padding: '16px 0' }}><AlertTriangle size={14} className="inline-block mr-2" />Failed to load cost data.</div>
              ) : (
                <table className="gx-data-table">
                  <thead><tr><th>#</th><th>Type</th><th>Title / Description</th><th>Amount (₹)</th><th>Date</th></tr></thead>
                  <tbody>
                    {fieldUpdates.filter((u: any) => u.updateType === 'expense' || u.transactionType === 'expense').length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No expense records yet</td></tr>
                    ) : fieldUpdates.filter((u: any) => u.updateType === 'expense' || u.transactionType === 'expense').map((c: any, i: number) => (
                      <tr key={c.id || i}><td>{i + 1}</td><td>{c.updateType || '—'}</td><td>{c.title || c.description || '—'}</td><td style={{ color: 'var(--gx-gold)' }}>₹{parseFloat(c.amount || 0).toLocaleString()}</td><td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="gx-metric-row" style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--gx-border)' }}>
                <span className="gx-metric-label" style={{ fontWeight: 700, color: 'var(--gx-text)' }}>Total Expenses</span>
                <span className="gx-metric-value" style={{ color: 'var(--gx-gold)', fontSize: 18 }}>
                  {financeLoading ? <Loader2 size={16} className="animate-spin inline-block" /> : `₹${Number(financeData?.totalExpenses ?? 0).toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ YIELD & PROFIT TAB ═══ */}
        {activeTab === 'profit' && (<>
          <div className="gx-section-divider"><BarChart3 className="inline-block w-4 h-4 mr-1 align-middle" /> Yield & Profit Tracker</div>
          {financeLoading ? (
            <div className="gx-card"><div className="gx-card-body" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}><Loader2 size={28} className="animate-spin inline-block mb-2" /><div>Loading finance data...</div></div></div>
          ) : financeError ? (
            <div className="gx-card"><div className="gx-card-body"><div style={{ color: 'var(--gx-red)', padding: '20px 0' }}><AlertTriangle size={16} className="inline-block mr-2" />Failed to load finance data.</div></div></div>
          ) : (
          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><BarChart3 className="inline-block w-4 h-4 mr-1 align-middle" /> Season Summary</div></div>
              <div className="gx-card-body">
                <div className="gx-metric-row"><span className="gx-metric-label">Total Investment</span><span className="gx-metric-value" style={{ color: 'var(--gx-text)' }}>₹{Number(financeData?.totalInvestment ?? 0).toLocaleString()}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Total Expenses</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{Number(financeData?.totalExpenses ?? 0).toLocaleString()}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Total Revenue</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{Number(financeData?.totalRevenue ?? 0).toLocaleString()}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Net Profit</span><span className="gx-metric-value" style={{ color: Number(financeData?.profit ?? 0) >= 0 ? 'var(--gx-green)' : 'var(--gx-red)' }}>₹{Number(financeData?.profit ?? 0).toLocaleString()}</span></div>
                <div style={{ marginTop: 14 }}>
                  <div className="gx-progress-label">
                    <span>Expenses vs Revenue</span>
                    <span>{financeData && Number(financeData.totalRevenue) > 0 ? `${Math.round((Number(financeData.totalExpenses) / Number(financeData.totalRevenue)) * 100)}%` : '—'}</span>
                  </div>
                  <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${financeData && Number(financeData.totalRevenue) > 0 ? Math.min((Number(financeData.totalExpenses) / Number(financeData.totalRevenue)) * 100, 100) : 0}%`, background: 'var(--gx-gold)' }} /></div>
                </div>
              </div>
            </div>
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><Banknote className="inline-block w-4 h-4 mr-1 align-middle" /> Your Share ({farm?.profitShare || 70}% Split)</div></div>
              <div className="gx-card-body">
                <div className="gx-profit-box">
                  <div style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Your Share ({farm?.profitShare || 70}%)</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gx-green)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    ₹{financeData && Number(financeData.totalRevenue) > 0
                      ? Math.round((Number(financeData.totalRevenue) * (farm?.profitShare || 70)) / 100).toLocaleString()
                      : '—'}
                  </div>
                </div>
                <div className="gx-metric-row" style={{ marginTop: 16 }}><span className="gx-metric-label">GreenX Share ({100 - (farm?.profitShare || 70)}%)</span><span className="gx-metric-value">₹{financeData && Number(financeData.totalRevenue) > 0 ? Math.round((Number(financeData.totalRevenue) * (100 - (farm?.profitShare || 70))) / 100).toLocaleString() : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Farms Tracked</span><span className="gx-metric-value">{financeData?.farmCount ?? myFarms.length}</span></div>
              </div>
            </div>
          </div>
          )}
        </>)}

        {/* ═══ NOTIFICATIONS TAB ═══ */}
        {activeTab === 'notifications' && (<>
          <div className="gx-section-divider"><Bell className="inline-block w-4 h-4 mr-1 align-middle" /> Notifications</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Bell className="inline-block w-4 h-4 mr-1 align-middle" /> All Notifications</div></div>
            <div className="gx-card-body">
              {realNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Bell size={48} strokeWidth={1.5} /></div>
                  <div>No notifications yet. You'll be notified when something happens on your farm.</div>
                </div>
              ) : realNotifications.map((notif: any) => (
                <div key={notif.id} className={`gx-activity-item ${!notif.isread ? 'cursor-pointer' : ''}`} onClick={() => !notif.isread && markNotifRead(notif.id)}>
                  <div className="gx-act-icon" style={{ background: notif.type === 'URGENT' || notif.type === 'ALERT' ? 'rgba(239,68,68,0.15)' : 'var(--gx-gold-dim)' }}><Bell size={18} /></div>
                  <div>
                    <div className="gx-act-text"><strong>{notif.title || 'Notification'}</strong> — {notif.message || ''}</div>
                    <div className="gx-act-time">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</div>
                    {!notif.isread && <span className="gx-status gx-s-pending" style={{ marginTop: 4, display: 'inline-flex' }}>Unread</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ CONTRACT TAB ═══ */}
        {activeTab === 'contract' && (<>
          <div className="gx-section-divider"><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> My Contract</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> Contract Details</div><span className="gx-status gx-s-done">Active</span></div>
            <div className="gx-card-body">
              <div className="gx-metric-row"><span className="gx-metric-label">Farm Code</span><span className="gx-metric-value">{farm?.farm_code || '—'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Contract Date</span><span className="gx-metric-value">{farm?.contract_date ? new Date(farm.contract_date).toLocaleDateString('en-IN') : '—'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Land Owner Share</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{farm?.landowner_share_pct || 70}%</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">GreenX Share</span><span className="gx-metric-value">{farm?.greenx_share_pct || 30}%</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Season</span><span className="gx-metric-value">{farm?.season || 'Kharif 2026'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Status</span><span className="gx-metric-value"><span className="gx-status gx-s-done">{farm?.status || 'ACTIVE'}</span></span></div>
            </div>
          </div>
        </>)}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (<>
          <div className="gx-section-divider"><Settings className="inline-block w-4 h-4 mr-1 align-middle" /> Settings</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Settings className="inline-block w-4 h-4 mr-1 align-middle" /> Profile Settings</div></div>
            <div className="gx-card-body">
              <div className="gx-metric-row"><span className="gx-metric-label">Full Name</span><span className="gx-metric-value">{profile?.full_name || userName}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Email</span><span className="gx-metric-value">{user?.email || '—'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Role</span><span className="gx-metric-value">Land Owner</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Phone</span><span className="gx-metric-value">{profile?.phone || '—'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Member Since</span><span className="gx-metric-value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : '—'}</span></div>
            </div>
          </div>
        </>)}

        {/* ═══ FARM MAP TAB ═══ */}
        {activeTab === 'farmmap' && (<>
          <div className="gx-section-divider"><Map className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Map & Location</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Map className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Location</div></div>
            <div className="gx-card-body">
              {farm ? (
                <div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Village</span><span className="gx-metric-value">{farm.village || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Mandal</span><span className="gx-metric-value">{farm.mandal || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">District</span><span className="gx-metric-value">{farm.district || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Area</span><span className="gx-metric-value">{farm.totalAcres || farm.total_acres || '—'} acres</span></div>
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)', marginTop: 16 }}>
                    <div style={{ fontSize: 40 }}><Map size={40} strokeWidth={1.5} /></div>
                    <div style={{ marginTop: 8 }}>Interactive map view coming soon.</div>
                  </div>
                </div>
              ) : <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gx-text2)' }}>No farm registered yet.</div>}
            </div>
          </div>
        </>)}

        {/* ═══ PAYMENT HISTORY TAB ═══ */}
        {activeTab === 'payments' && (<>
          <div className="gx-section-divider"><Receipt className="inline-block w-4 h-4 mr-1 align-middle" /> Payment History</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Receipt className="inline-block w-4 h-4 mr-1 align-middle" /> Payment Records</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Receipt size={48} strokeWidth={1.5} /></div>
                <div>Payment history and transaction records will appear here.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Once payments are processed through the system, your full history will be available.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MESSAGES TAB ═══ */}
        {activeTab === 'messages' && (<>
          <div className="gx-section-divider"><MessageSquare className="inline-block w-4 h-4 mr-1 align-middle" /> Messages</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><MessageSquare className="inline-block w-4 h-4 mr-1 align-middle" /> Message Center</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><MessageSquare size={48} strokeWidth={1.5} /></div>
                <div>Direct messaging with your Field Manager and Expert.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Messaging feature is being developed. You will be notified when it's available.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ AI FARM ADVISOR TAB ═══ */}
        {activeTab === 'ai' && (<>
          <div className="gx-section-divider"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI Farm Advisor</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> Smart Crop & Soil Advisor</div><span className="gx-status gx-s-done">{ai.recommendations.length} Insights</span></div>
            <div className="gx-card-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button className="gx-btn gx-btn-gold" style={{ fontSize: 12 }} onClick={() => { ai.getCropRecs({ region: farm?.state || 'Andhra Pradesh', season: 'Kharif', soilType: farm?.soilType, ph: farm?.soil_ph }); toast({ title: <><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Crop recommendations from AI generated</> }); }}><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Get Crop Recommendations</button>
                {farm?.soil_ph && <button className="gx-btn gx-btn-blue" style={{ fontSize: 12 }} onClick={() => { ai.analyzeSoil({ ph: farm.soil_ph || 0, nitrogen: farm.soil_nitrogen || 0, phosphorus: farm.soil_phosphorus || 0, potassium: farm.soil_potassium || 0, organicCarbon: farm.soil_organic_carbon || 0, currentCrop: farm.currentCrop || '', region: farm.state || 'AP' }); toast({ title: <><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI analyzing your soil data...</> }); }}><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Analyze My Soil</button>}
                <button className="gx-btn gx-btn-ghost" style={{ fontSize: 12 }} onClick={() => ai.clearRecommendations()}><Trash2 className="inline-block w-4 h-4 mr-1 align-middle" /> Clear</button>
              </div>
              <AiInsightPanel
                recommendations={ai.recommendations}
                isAnalyzing={ai.isAnalyzing}
                onAsk={(q) => ai.ask(q)}
                title="Farm Intelligence"
              />
            </div>
          </div>

          {/* Generative AI Chat */}
          <div className="gx-section-divider"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI Chat Assistant</div>
          <AiAssistant
            userId={user?.id}
            farmId={farm?.id}
            farmData={farm}
            contextMessage="**Land Owner AI Advisor** — I can help you understand your farm's performance, predict revenue, analyze crop suggestions from your expert, and plan for the next season. Ask me anything!"
          />
        </>)}

        {/* ═══ SEASON REPORTS TAB ═══ */}
        {activeTab === 'seasonreport' && (<>
          <div className="gx-section-divider"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Season Reports</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Season Summary Reports</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><ClipboardList size={48} strokeWidth={1.5} /></div>
                <div>End-of-season reports with yield analysis, cost breakdown, and recommendations.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Reports will be generated at the end of each crop season.</div>
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

/* ── Helpers ── */
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

function SoilMetric({ label, value, good }: { label: string; value?: any; good?: boolean }) {
  const color = value == null ? undefined : good ? 'var(--gx-green)' : good === false ? 'var(--gx-gold)' : undefined;
  return (
    <div className="gx-metric-row">
      <span className="gx-metric-label">{label}</span>
      <span className="gx-metric-value" style={color ? { color } : undefined}>
        {value ?? '—'}{good === true ? ' ✓' : good === false ? ' — Low' : ''}
      </span>
    </div>
  );
}
