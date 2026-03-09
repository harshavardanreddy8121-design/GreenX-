import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landOwner, notifications } from '@/lib/api';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAI } from '@/hooks/useAI';
import { AiInsightPanel } from '@/components/AiInsightPanel';

type Tab = 'overview' | 'land' | 'soil' | 'crops' | 'calendar' | 'photos' | 'costs' | 'profit' | 'notifications' | 'contract' | 'settings' | 'farmmap' | 'payments' | 'messages' | 'seasonreport' | 'ai';

export default function LandownerDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleLogout = () => { logout(); navigate('/'); };

  const { data: myFarms = [] } = useQuery({
    queryKey: ['landowner-farms', user?.id],
    queryFn: () => landOwner.getFarms().catch(() => []),
    enabled: !!user?.id,
  });

  const farm: any = myFarms[0];

  const { data: costs = [] } = useQuery({
    queryKey: ['farm-costs', farm?.id],
    queryFn: () => landOwner.getFinanceSummary().catch(() => ({})),
    enabled: !!farm?.id,
  });

  const { data: cropPlans = [] } = useQuery({
    queryKey: ['crop-plans', farm?.id],
    queryFn: () => landOwner.getCropSuggestions().catch(() => []),
    enabled: !!farm?.id,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['farm-timeline', farm?.id],
    queryFn: () => landOwner.getOperationsFeed().catch(() => []),
    enabled: !!farm?.id,
  });

  const { data: sampleTrack = [] } = useQuery({
    queryKey: ['landowner-samples', user?.id],
    queryFn: () => landOwner.getSamples().catch(() => []),
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['lo-unread-count'],
    queryFn: () => notifications.unreadCount('LAND_OWNER').catch(() => 0),
    refetchInterval: 30000,
  });

  const approveCropPlan = useMutation({
    mutationFn: ({ planId }: { planId: string }) => landOwner.selectCrop(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-plans'] });
      toast({ title: 'Crop selected! Expert notified. Calendar coming soon.' });
    },
  });

  const costsArr = Array.isArray(costs) ? costs : [];
  const totalCosts = costsArr.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const ai = useAI();

  return (
    <div className="gx-dashboard lo-accent">
      <MobileHeader title="Land Owner" roleIcon="🏡" />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-gold-dim)' }}>🏡</div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">LAND OWNER</div>
          <div className="gx-theme-switch">
            <span>Theme</span>
            <ThemeToggle className="gx-theme-toggle" />
          </div>
        </div>

        <div className="gx-nav-group-label">My Farm</div>
        <SideNavItem icon="🌿" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <SideNavItem icon="📍" label="My Land Details" active={activeTab === 'land'} onClick={() => setActiveTab('land')} />
        <SideNavItem icon="🗺️" label="Farm Map & Location" active={activeTab === 'farmmap'} onClick={() => setActiveTab('farmmap')} />

        <div className="gx-nav-group-label">Reports & Data</div>
        <SideNavItem icon="🧪" label="Soil Test Reports" active={activeTab === 'soil'} onClick={() => setActiveTab('soil')} badge="New" badgeColor="gold" />
        <SideNavItem icon="🌾" label="Crop Suggestions" active={activeTab === 'crops'} onClick={() => setActiveTab('crops')} badge={cropPlans.length > 0 ? String(cropPlans.length) : undefined} badgeColor="gold" />
        <SideNavItem icon="📅" label="Crop Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <SideNavItem icon="📸" label="Live Field Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />

        <div className="gx-nav-group-label">Finance</div>
        <SideNavItem icon="💰" label="Input Costs & Usage" active={activeTab === 'costs'} onClick={() => setActiveTab('costs')} />
        <SideNavItem icon="📊" label="Yield & Profit Tracker" active={activeTab === 'profit'} onClick={() => setActiveTab('profit')} />
        <SideNavItem icon="🧾" label="Payment History" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />

        <div className="gx-nav-group-label">Communication</div>
        <SideNavItem icon="🔔" label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount > 0 ? String(unreadCount) : undefined} badgeColor="red" />
        <SideNavItem icon="💬" label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
        <SideNavItem icon="📋" label="Season Reports" active={activeTab === 'seasonreport'} onClick={() => setActiveTab('seasonreport')} />

        <div className="gx-nav-group-label">Intelligence</div>
        <SideNavItem icon="🤖" label="AI Farm Advisor" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} badge={ai.recommendations.length > 0 ? String(ai.recommendations.length) : undefined} badgeColor="gold" />

        <div className="gx-nav-group-label">Account</div>
        <SideNavItem icon="📄" label="My Contract" active={activeTab === 'contract'} onClick={() => setActiveTab('contract')} />
        <SideNavItem icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div className="gx-page-header">
          <div className="gx-page-title">Good morning, {userName.split(' ')[0]} 🌱</div>
          <div className="gx-page-sub">
            {farm ? `Your farm in ${farm.village || 'AP'} — ${farm.crop || 'Kharif'} Season is active` : 'Welcome to your GreenX dashboard'}
          </div>
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (<>
          {cropPlans.length > 0 && (
            <div className="gx-alert-box gx-alert-gold">
              <span>⚡</span>
              <div><strong>Action Required:</strong> Expert has suggested {cropPlans.length} crop(s) for your soil. Please review and select your preferred crop to unlock the season plan.</div>
            </div>
          )}

          <div className="gx-stats-row">
            <div className="gx-stat-card gold"><div className="gx-stat-label">Total Land Area</div><div className="gx-stat-value">{farm?.totalLand || 0}<span className="gx-stat-unit"> ac</span></div><div className="gx-stat-change gx-up">✓ {myFarms.length} field(s) active</div></div>
            <div className="gx-stat-card green"><div className="gx-stat-label">Predicted Yield</div><div className="gx-stat-value">{farm?.expected_yield ? (farm.expected_yield / 1000).toFixed(1) : '—'}<span className="gx-stat-unit"> T</span></div><div className="gx-stat-change gx-up">↑ Based on soil analysis</div></div>
            <div className="gx-stat-card blue"><div className="gx-stat-label">Input Costs So Far</div><div className="gx-stat-value">₹{totalCosts > 0 ? `${(totalCosts / 1000).toFixed(0)}K` : '0'}</div><div className="gx-stat-change gx-neutral">Budget: ₹45,000</div></div>
            <div className="gx-stat-card orange"><div className="gx-stat-label">Soil Samples</div><div className="gx-stat-value">{sampleTrack.length}</div><div className="gx-stat-change gx-neutral">Live tracking</div></div>
          </div>

          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">🧪 Latest Soil Report</div><span className="gx-status gx-s-done">Recent</span></div>
              <div className="gx-card-body">
                <SoilMetric label="pH Level" value={farm?.soil_ph} good={farm?.soil_ph >= 6 && farm?.soil_ph <= 7.5} />
                <SoilMetric label="Nitrogen (N)" value={farm?.soil_nitrogen ? `${farm.soil_nitrogen} kg/ha` : undefined} good={farm?.soil_nitrogen >= 200} />
                <SoilMetric label="Phosphorus (P)" value={farm?.soil_phosphorus ? `${farm.soil_phosphorus} kg/ha` : undefined} good />
                <SoilMetric label="Potassium (K)" value={farm?.soil_potassium ? `${farm.soil_potassium} kg/ha` : undefined} good />
                <SoilMetric label="Moisture Content" value={farm?.soil_moisture ? `${farm.soil_moisture}%` : undefined} />
                <SoilMetric label="Organic Matter" value={farm?.soil_organic_carbon ? `${farm.soil_organic_carbon}%` : undefined} good={false} />
                <div className="gx-btn-row"><button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('soil')}>📄 View Full Report</button></div>
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">🌾 Expert Crop Suggestions</div><span className="gx-status gx-s-pending">Select Required</span></div>
              <div className="gx-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cropPlans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>🌾 No crop suggestions yet. Expert will submit after soil report.</div>
                  ) : cropPlans.slice(0, 2).map((plan: any, i: number) => (
                    <div key={plan.id} className={i === 0 ? 'gx-crop-option recommended' : 'gx-crop-option default'}>
                      <div>
                        <div style={{ fontWeight: 600, color: i === 0 ? 'var(--gx-green)' : 'var(--gx-text)', fontSize: 14 }}>{plan.cropName}</div>
                        <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>Yield: {plan.expected_yield || '—'} · Profit: ₹{parseFloat(plan.expected_revenue || 0).toLocaleString()}/ac</div>
                      </div>
                      <button className={`gx-btn gx-btn-sm ${i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`} onClick={() => approveCropPlan.mutate({ planId: plan.id })}>Select</button>
                    </div>
                  ))}
                  {cropPlans.length > 2 && <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('crops')}>View All {cropPlans.length} Suggestions →</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">🧪 Soil Sample Live Track</div><span className="gx-status gx-s-pending">{sampleTrack.length}</span></div>
              <div className="gx-card-body">
                {sampleTrack.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No samples logged for your farms yet.</div>
                ) : sampleTrack.slice(0, 6).map((s: any) => (
                  <div key={s.id} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'var(--gx-gold-dim)' }}>🧪</div>
                    <div>
                      <div className="gx-act-text"><strong>{s.sampleCode || s.id}</strong> · {s.status || 'PENDING'}</div>
                      <div className="gx-act-time">{s.collectionDate || s.createdAt ? new Date(s.collectionDate || s.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">📸 Live Field Updates</div><span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Auto-synced</span></div>
              <div className="gx-card-body">
                {timeline.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No field updates yet. Activity will sync automatically.</div>
                ) : timeline.slice(0, 4).map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: event.event_type === 'pest_detected' ? 'rgba(239,68,68,0.1)' : 'var(--gx-green-dim)' }}>
                      {event.event_type === 'irrigation' ? '💧' : event.event_type === 'pest_detected' ? '⚠️' : event.event_type === 'soil_report' ? '🧪' : '🌱'}
                    </div>
                    <div>
                      <div className="gx-act-text"><strong>{event.operationType || 'Update'}</strong> — {event.observations || ''}</div>
                      <div className="gx-act-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">💰 Season Finance Tracker</div></div>
              <div className="gx-card-body">
                {costsArr.length > 0 ? costsArr.slice(0, 4).map((c: any, i: number) => (
                  <div key={i} className="gx-metric-row"><span className="gx-metric-label">{c.description || c.cost_category || 'Cost'}</span><span className="gx-metric-value">₹{parseFloat(c.amount || 0).toLocaleString()}</span></div>
                )) : (<>
                  <div className="gx-metric-row"><span className="gx-metric-label">Seeds & Planting</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Fertilizers</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Pesticides</span><span className="gx-metric-value">—</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Labour</span><span className="gx-metric-value">—</span></div>
                </>)}
                <div className="gx-metric-row"><span className="gx-metric-label" style={{ color: 'var(--gx-text)' }}>Total Spent</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{totalCosts > 0 ? totalCosts.toLocaleString() : '0'}</span></div>
                <div style={{ marginTop: 14 }}>
                  <div className="gx-progress-label"><span>Budget Used</span><span>₹{(totalCosts / 1000).toFixed(1)}K / ₹45K</span></div>
                  <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${Math.min((totalCosts / 45000) * 100, 100)}%`, background: 'var(--gx-gold)' }} /></div>
                </div>
                <div className="gx-btn-row" style={{ marginTop: 12 }}><button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={() => setActiveTab('costs')}>View Full Finance →</button></div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MY LAND DETAILS TAB ═══ */}
        {activeTab === 'land' && (<>
          <div className="gx-section-divider">📍 My Land Details</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">🏡 Farm Information</div><span className="gx-status gx-s-done">{farm?.status || 'Active'}</span></div>
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
                <div className="gx-metric-row"><span className="gx-metric-label">Your Share</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>{farm?.landowner_share_pct || 70}%</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">GreenX Share</span><span className="gx-metric-value">{farm?.greenx_share_pct || 30}%</span></div>
              </div>
            </div>
          </div>
          {myFarms.length > 1 && (
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">🗂️ All My Farms ({myFarms.length})</div></div>
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
          <div className="gx-section-divider">🧪 Soil Test Reports</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🧪 Full Soil Analysis Report</div><span className="gx-status gx-s-done">Latest Report</span></div>
            <div className="gx-card-body">
              <div className="gx-form-grid">
                <SoilMetric label="pH Level" value={farm?.soil_ph} good={farm?.soil_ph >= 6 && farm?.soil_ph <= 7.5} />
                <SoilMetric label="Nitrogen (N)" value={farm?.soil_nitrogen ? `${farm.soil_nitrogen} kg/ha` : undefined} good={farm?.soil_nitrogen >= 200} />
                <SoilMetric label="Phosphorus (P)" value={farm?.soil_phosphorus ? `${farm.soil_phosphorus} kg/ha` : undefined} good />
                <SoilMetric label="Potassium (K)" value={farm?.soil_potassium ? `${farm.soil_potassium} kg/ha` : undefined} good />
                <SoilMetric label="Organic Matter" value={farm?.soil_organic_carbon ? `${farm.soil_organic_carbon}%` : undefined} good={false} />
                <SoilMetric label="Moisture Content" value={farm?.soil_moisture ? `${farm.soil_moisture}%` : undefined} />
                <SoilMetric label="EC (dS/m)" value={farm?.soil_ec} />
                <SoilMetric label="Zinc (ppm)" value={farm?.soil_zinc} />
                <SoilMetric label="Boron (ppm)" value={farm?.soil_boron} />
                <SoilMetric label="Sulphur (ppm)" value={farm?.soil_sulphur} />
              </div>
              {farm?.expert_remarks && (
                <div style={{ marginTop: 16, padding: 14, background: 'var(--gx-surface2)', borderRadius: 8, borderLeft: '3px solid var(--gx-gold)' }}>
                  <div style={{ fontSize: 12, color: 'var(--gx-gold)', fontWeight: 600, marginBottom: 6 }}>Expert Interpretation</div>
                  <div style={{ fontSize: 13, color: 'var(--gx-text2)', lineHeight: 1.6 }}>{farm.expert_remarks}</div>
                </div>
              )}
              <div className="gx-btn-row" style={{ marginTop: 16 }}>
                <button className="gx-btn gx-btn-ghost" onClick={() => toast({ title: 'PDF report download will be available soon.' })}>📄 Download PDF Report</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ CROP SUGGESTIONS TAB ═══ */}
        {activeTab === 'crops' && (<>
          <div className="gx-section-divider">🌾 Crop Suggestions</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🌾 Expert Crop Suggestions</div><span className="gx-status gx-s-pending">{cropPlans.length} Options</span></div>
            <div className="gx-card-body">
              {cropPlans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
                  <div>No crop suggestions yet. Expert will submit after soil report.</div>
                </div>
              ) : cropPlans.map((plan: any, i: number) => (
                <div key={plan.id} style={{ padding: 16, background: 'var(--gx-surface2)', borderRadius: 10, marginBottom: 12, border: i === 0 ? '1px solid var(--gx-green)' : '1px solid var(--gx-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: i === 0 ? 'var(--gx-green)' : 'var(--gx-text)' }}>{i === 0 ? '⭐ ' : ''}{plan.cropName} {plan.cropVariety ? `(${plan.cropVariety})` : ''}</div>
                      <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>{plan.season || 'Kharif'} Season · {plan.durationDays || '—'} days</div>
                    </div>
                    <button className={`gx-btn ${plan.isselected ? 'gx-btn-green' : i === 0 ? 'gx-btn-primary' : 'gx-btn-ghost'}`} onClick={() => !plan.isselected && approveCropPlan.mutate({ planId: plan.id })} disabled={plan.isselected}>{plan.isselected ? '✅ Selected' : 'Select Crop'}</button>
                  </div>
                  <div className="gx-form-grid">
                    <div className="gx-metric-row"><span className="gx-metric-label">Expected Yield</span><span className="gx-metric-value">{plan.expectedYieldMin || '—'} – {plan.expectedYieldMax || '—'} {plan.yieldUnit || 'T/ac'}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Profit/Acre</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{parseFloat(plan.profitPerAcre || 0).toLocaleString()}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Input Cost Est.</span><span className="gx-metric-value">₹{parseFloat(plan.inputCostEstimate || 0).toLocaleString()}</span></div>
                    <div className="gx-metric-row"><span className="gx-metric-label">Suitability Score</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>{plan.suitabilityScore || '—'}/10</span></div>
                  </div>
                  {plan.expertNotes && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gx-text2)', fontStyle: 'italic' }}>💡 {plan.expertNotes}</div>}
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ CROP CALENDAR TAB ═══ */}
        {activeTab === 'calendar' && (<>
          <div className="gx-section-divider">📅 Crop Calendar</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📅 Season Calendar & Tasks</div><span className="gx-status gx-s-done">Published</span></div>
            <div className="gx-card-body">
              {timeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <div>No calendar published yet. Expert will build after crop selection.</div>
                </div>
              ) : (
                <div>{timeline.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: event.status === 'COMPLETED' ? 'var(--gx-green-dim)' : 'var(--gx-gold-dim)' }}>
                      {event.taskType === 'SOWING' ? '🌱' : event.taskType === 'FERTILIZER' ? '🧪' : event.taskType === 'IRRIGATION' ? '💧' : event.taskType === 'PEST_SCOUT' ? '🐛' : event.taskType === 'HARVEST' ? '🌾' : '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="gx-act-text"><strong>{event.taskTitle || event.title || event.operationType || 'Task'}</strong></div>
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
          <div className="gx-section-divider">📸 Live Field Photos</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📸 Field Photo Gallery</div><span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Auto-synced from Field Manager</span></div>
            <div className="gx-card-body">
              {timeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                  <div>No field photos uploaded yet. Photos will appear here when Field Manager uploads them.</div>
                </div>
              ) : (
                timeline.filter((e: any) => e.photo_url || e.photos).map((event: any, idx: number) => (
                  <div key={event.id || idx} className="gx-activity-item">
                    <div className="gx-act-icon" style={{ background: 'var(--gx-green-dim)' }}>📷</div>
                    <div>
                      <div className="gx-act-text"><strong>{event.event_title || event.operation_type || 'Photo Update'}</strong></div>
                      <div className="gx-act-time">{event.created_at ? new Date(event.created_at).toLocaleString() : ''}{event.user_name ? ` · ${event.user_name}` : ''}</div>
                    </div>
                  </div>
                ))
              )}
              {timeline.length > 0 && timeline.filter((e: any) => e.photo_url || e.photos).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                  <div>No photos in recent updates. Photos will appear here when uploaded.</div>
                </div>
              )}
            </div>
          </div>
        </>)}

        {/* ═══ INPUT COSTS TAB ═══ */}
        {activeTab === 'costs' && (<>
          <div className="gx-section-divider">💰 Input Costs & Usage</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">💰 Season Input Costs Breakdown</div></div>
            <div className="gx-card-body">
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Category</th><th>Description</th><th>Amount (₹)</th><th>Date</th></tr></thead>
                <tbody>
                  {costsArr.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, opacity: .5 }}>No costs recorded yet</td></tr>
                  ) : costsArr.map((c: any, i: number) => (
                    <tr key={i}><td>{i + 1}</td><td>{c.cost_category || c.operation_type || '—'}</td><td>{c.description || c.product_used || '—'}</td><td style={{ color: 'var(--gx-gold)' }}>₹{parseFloat(c.amount || c.cost_incurred || 0).toLocaleString()}</td><td>{c.date ? new Date(c.date).toLocaleDateString('en-IN') : '—'}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="gx-metric-row" style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--gx-border)' }}>
                <span className="gx-metric-label" style={{ fontWeight: 700, color: 'var(--gx-text)' }}>Total Input Costs</span>
                <span className="gx-metric-value" style={{ color: 'var(--gx-gold)', fontSize: 18 }}>₹{totalCosts > 0 ? totalCosts.toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ YIELD & PROFIT TAB ═══ */}
        {activeTab === 'profit' && (<>
          <div className="gx-section-divider">📊 Yield & Profit Tracker</div>
          <div className="gx-content-grid">
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">📊 Season Summary</div></div>
              <div className="gx-card-body">
                <div className="gx-metric-row"><span className="gx-metric-label">Total Input Costs</span><span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{totalCosts > 0 ? totalCosts.toLocaleString() : '0'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Expected Revenue</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{farm?.expected_revenue ? parseFloat(farm.expected_revenue).toLocaleString() : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Net Profit (Est.)</span><span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{farm?.expected_revenue ? (parseFloat(farm.expected_revenue) - totalCosts).toLocaleString() : '—'}</span></div>
                <div style={{ marginTop: 14 }}>
                  <div className="gx-progress-label"><span>Budget Used</span><span>₹{(totalCosts / 1000).toFixed(1)}K / ₹45K</span></div>
                  <div className="gx-progress-bar"><div className="gx-progress-fill" style={{ width: `${Math.min((totalCosts / 45000) * 100, 100)}%`, background: 'var(--gx-gold)' }} /></div>
                </div>
              </div>
            </div>
            <div className="gx-card">
              <div className="gx-card-header"><div className="gx-card-title">💵 Your Share (70/30 Split)</div></div>
              <div className="gx-card-body">
                <div className="gx-profit-box">
                  <div style={{ fontSize: 12, color: 'var(--gx-text2)' }}>Your Share ({farm?.landowner_share_pct || 70}%)</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gx-green)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>₹{farm?.expected_revenue ? ((parseFloat(farm.expected_revenue) * (farm?.landowner_share_pct || 70)) / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—'}</div>
                </div>
                <div className="gx-metric-row" style={{ marginTop: 16 }}><span className="gx-metric-label">GreenX Share ({farm?.greenx_share_pct || 30}%)</span><span className="gx-metric-value">₹{farm?.expected_revenue ? ((parseFloat(farm.expected_revenue) * (farm?.greenx_share_pct || 30)) / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '—'}</span></div>
                <div className="gx-metric-row"><span className="gx-metric-label">Predicted Yield</span><span className="gx-metric-value">{farm?.expected_yield ? `${(farm.expected_yield / 1000).toFixed(1)} T` : '—'}</span></div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ NOTIFICATIONS TAB ═══ */}
        {activeTab === 'notifications' && (<>
          <div className="gx-section-divider">🔔 Notifications</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🔔 All Notifications</div></div>
            <div className="gx-card-body">
              {timeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                  <div>No notifications yet. You'll be notified when something happens on your farm.</div>
                </div>
              ) : timeline.map((event: any, idx: number) => (
                <div key={event.id || idx} className="gx-activity-item">
                  <div className="gx-act-icon" style={{ background: 'var(--gx-gold-dim)' }}>🔔</div>
                  <div>
                    <div className="gx-act-text"><strong>{event.event_title || event.title || 'Notification'}</strong> — {event.event_description || event.message || ''}</div>
                    <div className="gx-act-time">{event.created_at ? new Date(event.created_at).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ═══ CONTRACT TAB ═══ */}
        {activeTab === 'contract' && (<>
          <div className="gx-section-divider">📄 My Contract</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📄 Contract Details</div><span className="gx-status gx-s-done">Active</span></div>
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
          <div className="gx-section-divider">⚙️ Settings</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">⚙️ Profile Settings</div></div>
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
          <div className="gx-section-divider">🗺️ Farm Map & Location</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🗺️ Farm Location</div></div>
            <div className="gx-card-body">
              {farm ? (
                <div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Village</span><span className="gx-metric-value">{farm.village || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Mandal</span><span className="gx-metric-value">{farm.mandal || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">District</span><span className="gx-metric-value">{farm.district || '—'}</span></div>
                  <div className="gx-metric-row"><span className="gx-metric-label">Total Area</span><span className="gx-metric-value">{farm.totalAcres || farm.total_acres || '—'} acres</span></div>
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)', marginTop: 16 }}>
                    <div style={{ fontSize: 40 }}>🗺️</div>
                    <div style={{ marginTop: 8 }}>Interactive map view coming soon.</div>
                  </div>
                </div>
              ) : <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gx-text2)' }}>No farm registered yet.</div>}
            </div>
          </div>
        </>)}

        {/* ═══ PAYMENT HISTORY TAB ═══ */}
        {activeTab === 'payments' && (<>
          <div className="gx-section-divider">🧾 Payment History</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">🧾 Payment Records</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                <div>Payment history and transaction records will appear here.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Once payments are processed through the system, your full history will be available.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ MESSAGES TAB ═══ */}
        {activeTab === 'messages' && (<>
          <div className="gx-section-divider">💬 Messages</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">💬 Message Center</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div>Direct messaging with your Field Manager and Expert.</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Messaging feature is being developed. You will be notified when it's available.</div>
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ AI FARM ADVISOR TAB ═══ */}
        {activeTab === 'ai' && (<>
          <div className="gx-section-divider">🤖 AI Farm Advisor</div>
          <div className="gx-card" style={{ marginBottom: 20 }}>
            <div className="gx-card-header"><div className="gx-card-title">🤖 Smart Crop & Soil Advisor</div><span className="gx-status gx-s-done">{ai.recommendations.length} Insights</span></div>
            <div className="gx-card-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button className="gx-btn gx-btn-gold" style={{ fontSize: 12 }} onClick={() => { ai.getCropRecs({ region: farm?.state || 'Andhra Pradesh', season: 'Kharif', soilType: farm?.soilType, ph: farm?.soil_ph }); toast({ title: '🌾 Crop recommendations from AI generated' }); }}>🌾 Get Crop Recommendations</button>
                {farm?.soil_ph && <button className="gx-btn gx-btn-blue" style={{ fontSize: 12 }} onClick={() => { ai.analyzeSoil({ ph: farm.soil_ph || 0, nitrogen: farm.soil_nitrogen || 0, phosphorus: farm.soil_phosphorus || 0, potassium: farm.soil_potassium || 0, organicCarbon: farm.soil_organic_carbon || 0, currentCrop: farm.currentCrop || '', region: farm.state || 'AP' }); toast({ title: '🤖 AI analyzing your soil data...' }); }}>🧪 Analyze My Soil</button>}
                <button className="gx-btn gx-btn-ghost" style={{ fontSize: 12 }} onClick={() => ai.clearRecommendations()}>🗑 Clear</button>
              </div>
              <AiInsightPanel
                recommendations={ai.recommendations}
                isAnalyzing={ai.isAnalyzing}
                onAsk={(q) => ai.ask(q)}
                title="Farm Intelligence"
              />
            </div>
          </div>
        </>)}

        {/* ═══ SEASON REPORTS TAB ═══ */}
        {activeTab === 'seasonreport' && (<>
          <div className="gx-section-divider">📋 Season Reports</div>
          <div className="gx-card">
            <div className="gx-card-header"><div className="gx-card-title">📋 Season Summary Reports</div></div>
            <div className="gx-card-body">
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
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
