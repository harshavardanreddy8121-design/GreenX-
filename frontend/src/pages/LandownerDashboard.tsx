import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landOwner, notifications, DashboardSoilReport, DashboardCropSuggestion, DashboardTimelineStage } from '@/lib/api';
import { AlertTriangle, Banknote, BarChart3, Bell, Bot, Bug, Calendar, Camera, CheckCircle2, Circle, ClipboardList, CloudSun, Droplets, FileText, FolderOpen, Home, Leaf, Lightbulb, Loader2, LogOut, Map, MapPin, MessageSquare, Receipt, RefreshCw, Settings, Sprout, Star, TestTubes, Trash2, TrendingDown, TrendingUp, Wallet, Wheat, X, Zap } from 'lucide-react';
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

// ─── Auto-refresh interval (30 seconds) ──────────────────────────────────────
const REFRESH_INTERVAL = 30_000;

export default function LandownerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedReport, setSelectedReport] = useState<DashboardSoilReport | null>(null);

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Core farm data ────────────────────────────────────────────────────────
  const { data: myFarms = [], isError: farmsError, error: farmsErr, isLoading: farmsLoading } = useQuery({
    queryKey: ['landowner-farms', user?.id],
    queryFn: () => landOwner.getFarms(),
    enabled: !!user?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  const farm: any = myFarms[0];

  // ── MODULE 1: Dashboard Overview ─────────────────────────────────────────
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-overview', user?.id],
    queryFn: () => landOwner.getDashboardOverview(),
    enabled: !!user?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── MODULE 2: Soil Samples ────────────────────────────────────────────────
  const {
    data: soilSamplesData,
    isLoading: soilSamplesLoading,
    isError: soilSamplesError,
    refetch: refetchSoilSamples,
  } = useQuery({
    queryKey: ['dashboard-soil-samples', farm?.id],
    queryFn: () => landOwner.getDashboardSoilSamples(farm.id),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── MODULE 3: Soil Reports ────────────────────────────────────────────────
  const {
    data: soilReports = [],
    isLoading: soilReportsLoading,
    isError: soilReportsError,
    refetch: refetchSoilReports,
  } = useQuery({
    queryKey: ['dashboard-soil-reports', farm?.id],
    queryFn: () => landOwner.getDashboardSoilReports(farm.id),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── MODULE 4: Crop Suggestions ────────────────────────────────────────────
  const {
    data: cropSuggestions = [],
    isLoading: cropSuggestionsLoading,
    isError: cropSuggestionsError,
    refetch: refetchCropSuggestions,
  } = useQuery({
    queryKey: ['dashboard-crop-suggestions', farm?.id],
    queryFn: () => landOwner.getDashboardCropSuggestions(farm.id),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── MODULE 5: Soil Sample Timeline ────────────────────────────────────────
  const {
    data: soilTimeline,
    isLoading: timelineLoading,
    isError: timelineError,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ['dashboard-soil-timeline', farm?.id],
    queryFn: () => landOwner.getDashboardSoilTimeline(farm.id),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── MODULE 6: Finance Summary ─────────────────────────────────────────────
  const {
    data: financeSummary,
    isLoading: financeLoading,
    isError: financeError,
    refetch: refetchFinance,
  } = useQuery({
    queryKey: ['dashboard-finance', farm?.id],
    queryFn: () => landOwner.getDashboardFinanceSummary(farm.id),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── Legacy queries (operations feed, notifications) ───────────────────────
  const { data: timeline = [] } = useQuery({
    queryKey: ['farm-timeline', farm?.id],
    queryFn: () => landOwner.getOperationsFeed(),
    enabled: !!farm?.id,
    retry: 2,
    refetchInterval: REFRESH_INTERVAL,
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

  // ── Mutations ─────────────────────────────────────────────────────────────
  const approveCropPlan = useMutation({
    mutationFn: ({ planId }: { planId: string }) => landOwner.selectCrop(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-crop-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['crop-plans'] });
      toast({ title: 'Crop selected! Expert notified. Calendar coming soon.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to select crop', description: err?.message, variant: 'destructive' });
    },
  });

  // ── Derived values ────────────────────────────────────────────────────────
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const ai = useAI();

  // Finance helpers
  const totalInvestment = financeSummary?.totalInvestment ?? 0;
  const revenue = financeSummary?.revenue ?? 0;
  const profitLoss = financeSummary?.profitLoss ?? 0;
  const budgetLimit = financeSummary?.budgetLimit ?? 50000;
  const budgetPct = Math.min((totalInvestment / budgetLimit) * 100, 100);

  // Overview helpers (fall back to derived values when overview API is loading)
  const overviewTotalLand = overview?.totalLandArea ?? myFarms.reduce((s: number, f: any) => s + (f.totalLand ?? 0), 0);
  const overviewSamples = overview?.totalSoilSamples ?? (soilSamplesData?.totalSamples ?? 0);
  const overviewCosts = overview?.totalInputCosts ?? totalInvestment;

  return (
    <div className="gx-dashboard lo-accent">
      <MobileHeader title="Land Owner" roleIcon={<Home size={18} />} />

      {/* ── Soil Report Detail Modal ── */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--gx-surface)', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--gx-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gx-text)' }}><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Analysis Report</div>
              <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setSelectedReport(null)}><X size={16} /></button>
            </div>
            {selectedReport.expertName && <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginBottom: 12 }}>Expert: <strong>{selectedReport.expertName}</strong> · {selectedReport.submittedDate ? new Date(selectedReport.submittedDate).toLocaleDateString('en-IN') : '—'}</div>}
            <div className="gx-form-grid">
              <SoilMetric label="pH Level" value={selectedReport.ph} good={selectedReport.ph != null && selectedReport.ph >= 6 && selectedReport.ph <= 7.5} />
              <SoilMetric label="Nitrogen (kg/ha)" value={selectedReport.nitrogen != null ? `${selectedReport.nitrogen} kg/ha` : undefined} good={selectedReport.nitrogen != null && selectedReport.nitrogen >= 200} />
              <SoilMetric label="Phosphorus (kg/ha)" value={selectedReport.phosphorus != null ? `${selectedReport.phosphorus} kg/ha` : undefined} good />
              <SoilMetric label="Potassium (kg/ha)" value={selectedReport.potassium != null ? `${selectedReport.potassium} kg/ha` : undefined} good />
              <SoilMetric label="Organic Matter (%)" value={selectedReport.organicMatter != null ? `${selectedReport.organicMatter}%` : undefined} good={selectedReport.organicMatter != null && selectedReport.organicMatter >= 2} />
              <SoilMetric label="Moisture (%)" value={selectedReport.moisture != null ? `${selectedReport.moisture}%` : undefined} />
              {selectedReport.ecDsM != null && <SoilMetric label="EC (dS/m)" value={selectedReport.ecDsM} />}
              {selectedReport.zincPpm != null && <SoilMetric label="Zinc (ppm)" value={selectedReport.zincPpm} />}
              {selectedReport.boronPpm != null && <SoilMetric label="Boron (ppm)" value={selectedReport.boronPpm} />}
              {selectedReport.sulphurPpm != null && <SoilMetric label="Sulphur (ppm)" value={selectedReport.sulphurPpm} />}
              {selectedReport.ironPpm != null && <SoilMetric label="Iron (ppm)" value={selectedReport.ironPpm} />}
            </div>
            {selectedReport.overallRating && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--gx-green-dim)', borderRadius: 6, fontSize: 13, color: 'var(--gx-green)', fontWeight: 600 }}>
                Overall Rating: {selectedReport.overallRating}
              </div>
            )}
            {selectedReport.notes && (
              <div style={{ marginTop: 12, padding: 14, background: 'var(--gx-surface2)', borderRadius: 8, borderLeft: '3px solid var(--gx-gold)' }}>
                <div style={{ fontSize: 12, color: 'var(--gx-gold)', fontWeight: 600, marginBottom: 6 }}>Expert Remarks</div>
                <div style={{ fontSize: 13, color: 'var(--gx-text2)', lineHeight: 1.6 }}>{selectedReport.notes}</div>
              </div>
            )}
            <div className="gx-btn-row" style={{ marginTop: 16 }}>
              <button className="gx-btn gx-btn-ghost" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
        <SideNavItem icon={<TestTubes size={18} />} label="Soil Test Reports" active={activeTab === 'soil'} onClick={() => setActiveTab('soil')} badge={soilReports.length > 0 ? String(soilReports.length) : undefined} badgeColor="gold" />
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
            {farm ? `Your farm in ${farm.village || 'AP'} — ${farm.currentCrop || 'Kharif'} Season is active` : 'Welcome to your GreenX dashboard'}
          </div>
          <div style={{ position: 'absolute', right: 18, top: 14 }}><NotificationBell role="LAND_OWNER" /></div>
        </div>

        {farmsError && (
          <div className="gx-alert-box gx-alert-red" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle className="inline-block w-4 h-4 flex-shrink-0" />
            <div style={{ flex: 1 }}><strong>Connection Error:</strong> {farmsErr?.message || 'Could not load farm data.'}</div>
            <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['landowner-farms'] })}><RefreshCw size={14} /> Retry</button>
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

          {cropSuggestions.length > 0 && !cropSuggestions.some(s => s.selected) && (
            <div className="gx-alert-box gx-alert-gold">
              <span><Zap className="inline-block w-4 h-4 mr-1 align-middle" /></span>
              <div><strong>Action Required:</strong> Expert has suggested {cropSuggestions.length} crop(s) for your soil. Please review and select your preferred crop to unlock the season plan.</div>
            </div>
          )}

          {/* ── Overview Stats ── */}
          <div className="gx-stats-row">
            <div className="gx-stat-card gold">
              <div className="gx-stat-label">Total Land Area</div>
              <div className="gx-stat-value">
                {overviewLoading ? <Loader2 size={20} className="animate-spin" /> : <>{overviewTotalLand.toFixed(1)}<span className="gx-stat-unit"> ac</span></>}
              </div>
              <div className="gx-stat-change gx-up">✓ {overview?.farmsCount ?? myFarms.length} farm(s)</div>
            </div>
            <div className="gx-stat-card green">
              <div className="gx-stat-label">Active Status</div>
              <div className="gx-stat-value" style={{ fontSize: 16 }}>
                {overviewLoading ? <Loader2 size={20} className="animate-spin" /> : (overview?.activeStatus ?? 'Loading...')}
              </div>
              <div className="gx-stat-change gx-up">↑ Live from database</div>
            </div>
            <div className="gx-stat-card blue">
              <div className="gx-stat-label">Input Costs So Far</div>
              <div className="gx-stat-value">
                {overviewLoading ? <Loader2 size={20} className="animate-spin" /> : <>₹{overviewCosts > 0 ? `${(overviewCosts / 1000).toFixed(1)}K` : '0'}</>}
              </div>
              <div className="gx-stat-change gx-neutral">Budget: ₹{(budgetLimit / 1000).toFixed(0)}K</div>
            </div>
            <div className="gx-stat-card orange">
              <div className="gx-stat-label">Soil Samples</div>
              <div className="gx-stat-value">
                {overviewLoading ? <Loader2 size={20} className="animate-spin" /> : overviewSamples}
              </div>
              <div className="gx-stat-change gx-neutral">Live tracking</div>
            </div>
          </div>

          <div className="gx-content-grid">
            {/* Latest Soil Report card */}
            <div className="gx-card">
              <div className="gx-card-header">
                <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Latest Soil Report</div>
                {soilReportsLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="gx-status gx-s-done">{soilReports.length > 0 ? 'Available' : 'Pending'}</span>}
              </div>
              <div className="gx-card-body">
                {soilReportsLoading ? (
                  <LoadingSkeleton rows={5} />
                ) : soilReportsError ? (
                  <ErrorRetry message="Could not load soil reports" onRetry={refetchSoilReports} />
                ) : soilReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>
                    <TestTubes size={32} strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                    No soil reports yet. Expert will submit after analysis.
                  </div>
                ) : (() => {
                  const r = soilReports[0];
                  return (<>
                    {r.expertName && <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginBottom: 10 }}>By <strong>{r.expertName}</strong> · {r.submittedDate ? new Date(r.submittedDate).toLocaleDateString('en-IN') : '—'}</div>}
                    <SoilMetric label="pH Level" value={r.ph} good={r.ph != null && r.ph >= 6 && r.ph <= 7.5} />
                    <SoilMetric label="Nitrogen (kg/ha)" value={r.nitrogen != null ? `${r.nitrogen} kg/ha` : undefined} good={r.nitrogen != null && r.nitrogen >= 200} />
                    <SoilMetric label="Phosphorus (kg/ha)" value={r.phosphorus != null ? `${r.phosphorus} kg/ha` : undefined} good />
                    <SoilMetric label="Potassium (kg/ha)" value={r.potassium != null ? `${r.potassium} kg/ha` : undefined} good />
                    <SoilMetric label="Organic Matter" value={r.organicMatter != null ? `${r.organicMatter}%` : undefined} good={r.organicMatter != null && r.organicMatter >= 2} />
                    <div className="gx-btn-row" style={{ marginTop: 10 }}>
                      <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setSelectedReport(r)}><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> View Full Report</button>
                      {soilReports.length > 1 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('soil')}>All {soilReports.length} Reports →</button>}
                    </div>
                  </>);
                })()}
              </div>
            </div>

            {/* Expert Crop Suggestions card */}
            <div className="gx-card">
              <div className="gx-card-header">
                <div className="gx-card-title"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Expert Crop Suggestions</div>
                {cropSuggestionsLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="gx-status gx-s-pending">{cropSuggestions.length} Options</span>}
              </div>
              <div className="gx-card-body">
                {cropSuggestionsLoading ? (
                  <LoadingSkeleton rows={3} />
                ) : cropSuggestionsError ? (
                  <ErrorRetry message="Could not load crop suggestions" onRetry={refetchCropSuggestions} />
                ) : cropSuggestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>
                    <Wheat size={32} strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                    No crop suggestions yet. Expert will submit after soil report.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cropSuggestions.slice(0, 2).map((plan, i) => (
                      <div key={plan.id} className={i === 0 ? 'gx-crop-option recommended' : 'gx-crop-option default'}>
                        <div>
                          <div style={{ fontWeight: 600, color: i === 0 ? 'var(--gx-green)' : 'var(--gx-text)', fontSize: 14 }}>{plan.cropName} {plan.variety ? `(${plan.variety})` : ''}</div>
                          <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                            {plan.profitPerAcre != null ? `₹${plan.profitPerAcre.toLocaleString()}/ac` : '—'}
                            {plan.suitabilityScore != null ? ` · Score: ${plan.suitabilityScore}/10` : ''}
                          </div>
                        </div>
                        <button
                          className={`gx-btn gx-btn-sm ${plan.selected ? 'gx-btn-green' : i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`}
                          onClick={() => !plan.selected && approveCropPlan.mutate({ planId: plan.id })}
                          disabled={plan.selected || approveCropPlan.isPending}
                        >
                          {plan.selected ? <><CheckCircle2 size={14} className="inline-block mr-1" /> Selected</> : 'Select'}
                        </button>
                      </div>
                    ))}
                    {cropSuggestions.length > 2 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('crops')}>View All {cropSuggestions.length} Suggestions →</button>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="gx-content-grid">
            {/* Soil Sample Live Track */}
            <div className="gx-card">
              <div className="gx-card-header">
                <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Sample Live Track</div>
                {soilSamplesLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="gx-status gx-s-pending">{soilSamplesData?.totalSamples ?? 0}</span>}
              </div>
              <div className="gx-card-body">
                {soilSamplesLoading ? (
                  <LoadingSkeleton rows={3} />
                ) : soilSamplesError ? (
                  <ErrorRetry message="Could not load soil samples" onRetry={refetchSoilSamples} />
                ) : !soilSamplesData || soilSamplesData.samples.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No samples logged for your farm yet.</div>
                ) : soilSamplesData.samples.slice(0, 6).map(s => (
                  <div key={s.id} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: s.status === 'COMPLETED' ? 'var(--gx-green-dim)' : 'var(--gx-gold-dim)' }}><TestTubes size={18} /></div>
                    <div>
                      <div className="gx-act-text"><strong>{s.sampleCode}</strong> · <span className={`gx-status ${s.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{s.status}</span></div>
                      <div className="gx-act-time">{s.collectedBy ? `By ${s.collectedBy}` : ''}{s.collectionDate ? ` · ${new Date(s.collectionDate).toLocaleDateString('en-IN')}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Field Updates */}
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title"><Camera className="inline-block w-4 h-4 mr-1 align-middle" /> Live Field Updates</div><span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Auto-synced</span></div>
              <div className="gx-card-body">
                {timeline.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No field updates yet. Activity will sync automatically.</div>
                ) : timeline.slice(0, 4).map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: event.operationType === 'PEST_ALERT' ? 'rgba(239,68,68,0.1)' : 'var(--gx-green-dim)' }}>
                      {event.operationType === 'IRRIGATION' ? <Droplets size={18} /> : event.operationType === 'PEST_ALERT' ? <AlertTriangle size={18} /> : <Sprout size={18} />}
                    </div>
                    <div>
                      <div className="gx-act-text"><strong>{event.operationType || 'Update'}</strong> — {event.observations || ''}</div>
                      <div className="gx-act-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Season Finance Tracker */}
            <div className="gx-card">
              <div className="gx-card-header">
                <div className="gx-card-title"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Season Finance Tracker</div>
                {financeLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              </div>
              <div className="gx-card-body">
                {financeLoading ? (
                  <LoadingSkeleton rows={4} />
                ) : financeError ? (
                  <ErrorRetry message="Could not load finance data" onRetry={refetchFinance} />
                ) : (<>
                  {financeSummary && Object.entries(financeSummary.expenses).slice(0, 4).map(([type, amt]) => (
                    <div key={type} className="gx-metric-row">
                      <span className="gx-metric-label" style={{ textTransform: 'capitalize' }}>{type}</span>
                      <span className="gx-metric-value">₹{amt.toLocaleString()}</span>
                    </div>
                  ))}
                  {(!financeSummary || Object.keys(financeSummary.expenses).length === 0) && (<>
                    <div className="gx-metric-row"><span className="gx-metric-label">Seeds & Planting</span><span className="gx-metric-value">—</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Fertilizers</span><span className="gx-metric-value">—</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Labour</span><span className="gx-metric-value">—</span></div>
                  </>)}
                  <div className="gx-metric-row" style={{ borderTop: '1px solid var(--gx-border)', paddingTop: 8, marginTop: 4 }}>
                    <span className="gx-metric-label" style={{ color: 'var(--gx-text)', fontWeight: 700 }}>Total Spent</span>
                    <span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{totalInvestment.toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="gx-progress-label"><span>Budget Used</span><span>₹{(totalInvestment / 1000).toFixed(1)}K / ₹{(budgetLimit / 1000).toFixed(0)}K</span></div>
                    <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? 'var(--gx-red)' : 'var(--gx-gold)' }} /></div>
                  </div>
                  <div className="gx-btn-row" style={{ marginTop: 12 }}><button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('costs')}>View Full Finance →</button></div>
                </>)}
              </div>
            </div>
          </div>

          {/* Soil Sample Timeline */}
          {farm && (
            <div className="gx-card" style={{ marginTop: 0 }}>
              <div className="gx-card-header">
                <div className="gx-card-title"><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Sample Progress</div>
                {timelineLoading ? <Loader2 size={14} className="animate-spin" /> : soilTimeline?.currentStage ? <span className="gx-status gx-s-pending">{soilTimeline.currentStage}</span> : null}
              </div>
              <div className="gx-card-body">
                {timelineLoading ? (
                  <LoadingSkeleton rows={3} />
                ) : timelineError ? (
                  <ErrorRetry message="Could not load timeline" onRetry={refetchTimeline} />
                ) : soilTimeline ? (
                  <SoilTimeline stages={soilTimeline.timeline} />
                ) : null}
              </div>
            </div>
          )}
        </>)}

        {/* ═══ MY LAND DETAILS TAB ═══ */}
        {activeTab === 'land' && (<>
          <div className="gx-section-divider"><MapPin className="inline-block w-4 h-4 mr-1 align-middle" /> My Land Details</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title"><Home className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Information</div><span className="gx-status gx-s-done">{farm?.status || 'Active'}</span></div>
            <div className="gx-card-body">
              {farmsLoading ? <LoadingSkeleton rows={8} /> : (
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
                  <div className="gx-metric-row"><span className="gx-metric-label">Your Share</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{farm?.profitShare || 70}%</span></div>
                </div>
              )}
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
          <div className="gx-section-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Soil Test Reports</span>
            <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetchSoilReports()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={13} /> Refresh</button>
          </div>
          {soilReportsLoading ? (
            <div className="gx-card"><div className="gx-card-body"><LoadingSkeleton rows={8} /></div></div>
          ) : soilReportsError ? (
            <div className="gx-card"><div className="gx-card-body"><ErrorRetry message="Could not load soil reports" onRetry={refetchSoilReports} /></div></div>
          ) : soilReports.length === 0 ? (
            <div className="gx-card">
              <div className="gx-card-body" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <TestTubes size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                <div>No soil reports yet. Expert will submit after soil analysis.</div>
              </div>
            </div>
          ) : soilReports.map((r, idx) => (
            <div key={r.id} className="gx-card" style={{ marginBottom: 16 }}>
              <div className="gx-card-header">
                <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Report #{idx + 1} {r.expertName ? `— ${r.expertName}` : ''}</div>
                <span className="gx-status gx-s-done">{r.status}</span>
              </div>
              <div className="gx-card-body">
                {r.submittedDate && <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginBottom: 10 }}>Submitted: {new Date(r.submittedDate).toLocaleDateString('en-IN')}</div>}
                <div className="gx-form-grid">
                  <SoilMetric label="pH Level" value={r.ph} good={r.ph != null && r.ph >= 6 && r.ph <= 7.5} />
                  <SoilMetric label="Nitrogen (kg/ha)" value={r.nitrogen != null ? `${r.nitrogen} kg/ha` : undefined} good={r.nitrogen != null && r.nitrogen >= 200} />
                  <SoilMetric label="Phosphorus (kg/ha)" value={r.phosphorus != null ? `${r.phosphorus} kg/ha` : undefined} good />
                  <SoilMetric label="Potassium (kg/ha)" value={r.potassium != null ? `${r.potassium} kg/ha` : undefined} good />
                  <SoilMetric label="Organic Matter (%)" value={r.organicMatter != null ? `${r.organicMatter}%` : undefined} good={r.organicMatter != null && r.organicMatter >= 2} />
                  <SoilMetric label="Moisture (%)" value={r.moisture != null ? `${r.moisture}%` : undefined} />
                </div>
                {r.overallRating && <div style={{ marginTop: 10, padding: '6px 12px', background: 'var(--gx-green-dim)', borderRadius: 6, fontSize: 13, color: 'var(--gx-green)', fontWeight: 600, display: 'inline-block' }}>Rating: {r.overallRating}</div>}
                {r.notes && (
                  <div style={{ marginTop: 12, padding: 14, background: 'var(--gx-surface2)', borderRadius: 8, borderLeft: '3px solid var(--gx-gold)' }}>
                    <div style={{ fontSize: 12, color: 'var(--gx-gold)', fontWeight: 600, marginBottom: 6 }}>Expert Remarks</div>
                    <div style={{ fontSize: 13, color: 'var(--gx-text2)', lineHeight: 1.6 }}>{r.notes}</div>
                  </div>
                )}
                <div className="gx-btn-row" style={{ marginTop: 12 }}>
                  <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setSelectedReport(r)}><FileText className="inline-block w-4 h-4 mr-1 align-middle" /> View Full Report</button>
                </div>
              </div>
            </div>
          ))}
        </>)}

        {/* ═══ CROP SUGGESTIONS TAB ═══ */}
        {activeTab === 'crops' && (<>
          <div className="gx-section-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Crop Suggestions</span>
            <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetchCropSuggestions()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={13} /> Refresh</button>
          </div>
          {cropSuggestionsLoading ? (
            <div className="gx-card"><div className="gx-card-body"><LoadingSkeleton rows={6} /></div></div>
          ) : cropSuggestionsError ? (
            <div className="gx-card"><div className="gx-card-body"><ErrorRetry message="Could not load crop suggestions" onRetry={refetchCropSuggestions} /></div></div>
          ) : cropSuggestions.length === 0 ? (
            <div className="gx-card">
              <div className="gx-card-body" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <Wheat size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                <div>No crop suggestions yet. Expert will submit after soil report.</div>
              </div>
            </div>
          ) : cropSuggestions.map((plan, i) => (
            <div key={plan.id} style={{ padding: 16, background: 'var(--gx-surface)', borderRadius: 10, marginBottom: 12, border: plan.selected ? '1px solid var(--gx-green)' : i === 0 ? '1px solid var(--gx-gold)' : '1px solid var(--gx-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: plan.selected ? 'var(--gx-green)' : i === 0 ? 'var(--gx-gold)' : 'var(--gx-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i === 0 && !plan.selected && <Star size={14} />}
                    {plan.selected && <CheckCircle2 size={14} />}
                    {plan.cropName} {plan.variety ? `(${plan.variety})` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                    {plan.season || 'Kharif'} Season · {plan.durationDays ? `${plan.durationDays} days` : '—'}
                    {plan.expertName ? ` · By ${plan.expertName}` : ''}
                  </div>
                </div>
                <button
                  className={`gx-btn ${plan.selected ? 'gx-btn-green' : i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`}
                  onClick={() => !plan.selected && approveCropPlan.mutate({ planId: plan.id })}
                  disabled={plan.selected || approveCropPlan.isPending}
                >
                  {plan.selected ? <><CheckCircle2 size={14} className="inline-block mr-1" /> Selected</> : 'Select Crop'}
                </button>
              </div>
              <div className="gx-form-grid">
                <div className="gx-metric-row"><span className="gx-metric-label">Expected Yield</span><span className="gx-metric-value">{plan.expectedYieldMin ?? '—'} – {plan.expectedYieldMax ?? '—'} {plan.yieldUnit || 'T/ac'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Profit/Acre</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{plan.profitPerAcre != null ? plan.profitPerAcre.toLocaleString() : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Input Cost Est.</span><span className="gx-metric-value">₹{plan.inputCostEstimate != null ? plan.inputCostEstimate.toLocaleString() : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Suitability Score</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>{plan.suitabilityScore != null ? `${plan.suitabilityScore}/10` : '—'}</span></div>
              </div>
              {plan.reasoning && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gx-text2)', fontStyle: 'italic' }}><Lightbulb className="inline-block w-4 h-4 mr-1 align-middle" /> {plan.reasoning}</div>}
              {plan.submittedDate && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--gx-text2)' }}>Submitted: {new Date(plan.submittedDate).toLocaleDateString('en-IN')}</div>}
            </div>
          ))}
        </>)}

        {/* ═══ CROP CALENDAR TAB ═══ */}
        {activeTab === 'calendar' && (<>
          <div className="gx-section-divider"><Calendar className="inline-block w-4 h-4 mr-1 align-middle" /> Crop Calendar</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title"><Calendar className="inline-block w-4 h-4 mr-1 align-middle" /> Season Calendar & Tasks</div><span className="gx-status gx-s-done">Published</span></div>
            <div className="gx-card-body">
              {timeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <Calendar size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                  <div>No calendar published yet. Expert will build after crop selection.</div>
                </div>
              ) : (
                <div>{timeline.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: event.status === 'COMPLETED' ? 'var(--gx-green-dim)' : 'var(--gx-gold-dim)' }}>
                      {event.taskType === 'SOWING' ? <Sprout size={18} /> : event.taskType === 'FERTILIZER' ? <TestTubes size={18} /> : event.taskType === 'IRRIGATION' ? <Droplets size={18} /> : event.taskType === 'PEST_SCOUT' ? <Bug size={18} /> : event.taskType === 'HARVEST' ? <Wheat size={18} /> : <ClipboardList size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="gx-act-text"><strong>{event.taskTitle || event.operationType || 'Task'}</strong></div>
                      <div className="gx-act-time">{event.scheduledDate ? new Date(event.scheduledDate).toLocaleDateString('en-IN') : event.createdAt ? new Date(event.createdAt).toLocaleDateString('en-IN') : ''}</div>
                    </div>
                    <span className={`gx-status ${event.status === 'COMPLETED' ? 'gx-s-done' : 'gx-s-pending'}`}>{event.status || 'Pending'}</span>
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
              {timeline.filter((e: any) => e.photos).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <Camera size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                  <div>No field photos uploaded yet. Photos will appear here when Field Manager uploads them.</div>
                </div>
              ) : timeline.filter((e: any) => e.photos).map((event: any, idx: number) => (
                <div key={event.id || idx} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: 'var(--gx-green-dim)' }}><Camera size={18} /></div>
                  <div>
                    <div className="gx-act-text"><strong>{event.operationType || 'Photo Update'}</strong></div>
                    <div className="gx-act-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ INPUT COSTS TAB ═══ */}
        {activeTab === 'costs' && (<>
          <div className="gx-section-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Input Costs & Usage</span>
            <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => refetchFinance()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={13} /> Refresh</button>
          </div>
          {financeLoading ? (
            <div className="gx-card"><div className="gx-card-body"><LoadingSkeleton rows={6} /></div></div>
          ) : financeError ? (
            <div className="gx-card"><div className="gx-card-body"><ErrorRetry message="Could not load finance data" onRetry={refetchFinance} /></div></div>
          ) : (
            <div className="gx-card" style={{ marginBottom: 20 }}>
              <div className="gx-card-header"><div className="gx-card-title"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Season Input Costs Breakdown</div></div>
              <div className="gx-card-body">
                {financeSummary && Object.keys(financeSummary.expenses).length > 0 ? (
                  <table className="gx-data-table">
                    <thead><tr><th>#</th><th>Category</th><th>Amount (₹)</th></tr></thead>
                    <tbody>
                      {Object.entries(financeSummary.expenses).map(([type, amt], i) => (
                        <tr key={type}><td>{i + 1}</td><td style={{ textTransform: 'capitalize' }}>{type}</td><td style={{ color: 'var(--gx-gold)' }}>₹{amt.toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)', opacity: 0.6 }}>No expense records yet</div>
                )}
                <div className="gx-metric-row" style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--gx-border)' }}>
                  <span className="gx-metric-label" style={{ fontWeight: 700, color: 'var(--gx-text)' }}>Total Investment</span>
                  <span className="gx-metric-value" style={{ color: 'var(--gx-gold)', fontSize: 18 }}>₹{totalInvestment.toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="gx-progress-label"><span>Budget Used</span><span>₹{(totalInvestment / 1000).toFixed(1)}K / ₹{(budgetLimit / 1000).toFixed(0)}K</span></div>
                  <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? 'var(--gx-red)' : 'var(--gx-gold)' }} /></div>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ YIELD & PROFIT TAB ═══ */}
        {activeTab === 'profit' && (<>
          <div className="gx-section-divider"><BarChart3 className="inline-block w-4 h-4 mr-1 align-middle" /> Yield & Profit Tracker</div>
          {financeLoading ? (
            <div className="gx-card"><div className="gx-card-body"><LoadingSkeleton rows={6} /></div></div>
          ) : (
            <div className="gx-content-grid">
              <div className="gx-card">
                <div className="gx-card-header"><div className="gx-card-title"><BarChart3 className="inline-block w-4 h-4 mr-1 align-middle" /> Season Finance Summary</div></div>
                <div className="gx-card-body">
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Investment</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{totalInvestment.toLocaleString()}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Revenue</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{revenue > 0 ? revenue.toLocaleString() : '—'}</span></div>
                  <div className="gx-metric-row">
                    <span className="gx-metric-label">Profit / Loss</span>
                    <span className="gx-metric-value" style={{ color: profitLoss >= 0 ? 'var(--gx-green)' : 'var(--gx-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {profitLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      ₹{Math.abs(profitLoss).toLocaleString()}
                    </span>
                  </div>
                  {financeSummary && financeSummary.profitMargin !== 0 && (
                    <div className="gx-metric-row"><span className="gx-metric-label">Profit Margin</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{financeSummary.profitMargin.toFixed(1)}%</span></div>
                  )}
                  <div style={{ marginTop: 14 }}>
                    <div className="gx-progress-label"><span>Budget Used</span><span>₹{(totalInvestment / 1000).toFixed(1)}K / ₹{(budgetLimit / 1000).toFixed(0)}K</span></div>
                    <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? 'var(--gx-red)' : 'var(--gx-gold)' }} /></div>
                  </div>
                  {financeSummary?.lastUpdated && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--gx-text2)' }}>Last updated: {new Date(financeSummary.lastUpdated).toLocaleString()}</div>}
                </div>
              </div>
              <div className="gx-card">
                <div className="gx-card-header"><div className="gx-card-title"><Banknote className="inline-block w-4 h-4 mr-1 align-middle" /> Your Share ({farm?.profitShare || 70}%)</div></div>
                <div className="gx-card-body">
                  <div className="gx-profit-box">
                    <div style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Your Share ({farm?.profitShare || 70}%)</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gx-green)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                      ₹{revenue > 0 ? ((revenue * (farm?.profitShare || 70)) / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—'}
                    </div>
                  </div>
                  <div className="gx-metric-row" style={{ marginTop: 16 }}><span className="gx-metric-label">GreenX Share ({100 - (farm?.profitShare || 70)}%)</span><span className="gx-metric-value">₹{revenue > 0 ? ((revenue * (100 - (farm?.profitShare || 70))) / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Expected Revenue</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{farm?.expectedRevenue ? parseFloat(String(farm.expectedRevenue)).toLocaleString() : '—'}</span></div>
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
                  <Bell size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
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
              <div className="gx-metric-row"><span className="gx-metric-label">Farm Code</span><span className="gx-metric-value">{farm?.farmCode || '—'}</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Land Owner Share</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{farm?.profitShare || 70}%</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">GreenX Share</span><span className="gx-metric-value">{100 - (farm?.profitShare || 70)}%</span></div>
              <div className="gx-metric-row"><span className="gx-metric-label">Status</span><span className="gx-metric-value"><span className="gx-status gx-s-done">{farm?.status || 'ACTIVE'}</span></span></div>
              {farm?.contractSummary && <div style={{ marginTop: 12, padding: 14, background: 'var(--gx-surface2)', borderRadius: 8, fontSize: 13, color: 'var(--gx-text2)', lineHeight: 1.6 }}>{farm.contractSummary}</div>}
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
                  <div className="gx-metric-row"><span className="gx-metric-label">District</span><span className="gx-metric-value">{farm.district || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">State</span><span className="gx-metric-value">{farm.state || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Area</span><span className="gx-metric-value">{farm.totalLand || '—'} acres</span></div>
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)', marginTop: 16 }}>
                    <Map size={40} strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                    <div>Interactive map view coming soon.</div>
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
                <Receipt size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
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
                <MessageSquare size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
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
                <button className="gx-btn gx-btn-gold" style={{ fontSize: 12 }} onClick={() => { ai.getCropRecs({ region: farm?.state || 'Andhra Pradesh', season: 'Kharif', soilType: farm?.soilType, ph: soilReports[0]?.ph }); toast({ title: 'Crop recommendations from AI generated' }); }}><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Get Crop Recommendations</button>
                {soilReports[0]?.ph && <button className="gx-btn gx-btn-blue" style={{ fontSize: 12 }} onClick={() => { const r = soilReports[0]; ai.analyzeSoil({ ph: r.ph || 0, nitrogen: r.nitrogen || 0, phosphorus: r.phosphorus || 0, potassium: r.potassium || 0, organicCarbon: r.organicMatter || 0, currentCrop: farm?.currentCrop || '', region: farm?.state || 'AP' }); toast({ title: 'AI analyzing your soil data...' }); }}><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Analyze My Soil</button>}
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
                <ClipboardList size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
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

/* ── Helper Components ── */

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
        {value ?? '—'}{good === true ? ' ✓' : good === false ? ' ↓ Low' : ''}
      </span>
    </div>
  );
}

function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 18, borderRadius: 6, background: 'var(--gx-surface2)', opacity: 0.6, animation: 'pulse 1.5s ease-in-out infinite', width: i % 2 === 0 ? '100%' : '75%' }} />
      ))}
    </div>
  );
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--gx-text2)' }}>
      <AlertTriangle size={16} style={{ color: 'var(--gx-red)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13 }}>{message}</span>
      <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );
}

function SoilTimeline({ stages }: { stages: DashboardTimelineStage[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stages.map((stage, idx) => (
        <div key={stage.stage} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Icon column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: stage.status === 'COMPLETED' ? 'var(--gx-green-dim)' : stage.status === 'IN_PROGRESS' ? 'var(--gx-gold-dim)' : 'var(--gx-surface2)',
              border: `2px solid ${stage.status === 'COMPLETED' ? 'var(--gx-green)' : stage.status === 'IN_PROGRESS' ? 'var(--gx-gold)' : 'var(--gx-border)'}`,
              flexShrink: 0,
            }}>
              {stage.status === 'COMPLETED' ? <CheckCircle2 size={14} style={{ color: 'var(--gx-green)' }} /> :
               stage.status === 'IN_PROGRESS' ? <Loader2 size={14} style={{ color: 'var(--gx-gold)', animation: 'spin 1s linear infinite' }} /> :
               <Circle size={14} style={{ color: 'var(--gx-border)' }} />}
            </div>
            {idx < stages.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 20, background: stage.status === 'COMPLETED' ? 'var(--gx-green)' : 'var(--gx-border)', margin: '2px 0' }} />
            )}
          </div>
          {/* Content column */}
          <div style={{ paddingBottom: idx < stages.length - 1 ? 16 : 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: stage.status === 'COMPLETED' ? 'var(--gx-text)' : stage.status === 'IN_PROGRESS' ? 'var(--gx-gold)' : 'var(--gx-text2)' }}>
              {stage.stage}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>{stage.description}</div>
            {stage.date && <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 2, opacity: 0.7 }}>{new Date(stage.date).toLocaleDateString('en-IN')}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
