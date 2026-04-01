import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';
import { AiInsightPanel } from '@/components/AiInsightPanel';

import { AlertTriangle, BarChart3, Bot, Bug, Building2, HardHat, Microscope, Search, ShieldAlert, Sprout, TestTubes, Tractor, Trash2, Users, Wallet, Wheat } from 'lucide-react';
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [farmSearch, setFarmSearch] = useState('');
  const [uidSearch, setUidSearch] = useState('');

  const { data: farms = [], isError: farmsError, error: farmsErr } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: () => admin.getFarms(),
    retry: 2,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
    retry: 2,
  });

  const { data: taskStats = { pending: 0, completed: 0 } } = useQuery({
    queryKey: ['admin-task-stats'],
    queryFn: () => admin.getStats().then(s => ({
      pending: (s['pendingTasks'] as number) ?? 0,
      completed: (s['completedTasks'] as number) ?? 0,
    })),
    retry: 2,
  });

  const { data: pendingSamples = [], isError: samplesError, error: samplesErr } = useQuery({
    queryKey: ['admin-pending-samples'],
    queryFn: () => admin.getPendingSamples(),
    retry: 2,
    refetchInterval: 15000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => admin.getAllAlerts(),
    retry: 2,
  });

  const { data: managers = [] } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: () => admin.getAvailableManagers(),
    retry: 2,
  });

  const { data: expertList = [] } = useQuery({
    queryKey: ['admin-expert-list'],
    queryFn: () => admin.getExperts(),
    retry: 2,
  });

  const assignManagerMutation = useMutation({
    mutationFn: ({ farmId, managerId }: { farmId: string; managerId: string }) =>
      admin.assignManager(farmId, managerId),
    onSuccess: () => {
      toast.success('Field Manager assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-farms'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to assign manager'),
  });

  const assignExpertMutation = useMutation({
    mutationFn: ({ farmId, expertId }: { farmId: string; expertId: string }) =>
      admin.assignExpert(farmId, expertId),
    onSuccess: () => {
      toast.success('Expert assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-farms'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to assign expert'),
  });

  const totalLand = farms.reduce((s: number, f: any) => s + (f.totalLand || 0), 0);
  const activeCrops = new Set(farms.map((f: any) => f.currentCrop).filter(Boolean)).size;
  const totalRevenue = farms.reduce((s: number, f: any) => s + (f.expectedRevenue || 0), 0);
  const ai = useAI();

  const experts = users.filter((u: any) => u.role === 'expert');
  const fieldManagers = users.filter((u: any) => u.role === 'fieldmanager');
  const workers = users.filter((u: any) => u.role === 'worker');
  const landowners = users.filter((u: any) => u.role === 'landowner');

  const filteredFarms = useMemo(() => {
    const search = farmSearch.trim().toLowerCase();
    if (!search) return farms;
    return farms.filter((farm: any) =>
      String(farm.farmCode || '').toLowerCase().includes(search) ||
      String(farm.name || '').toLowerCase().includes(search) ||
      String(farm.id || '').toLowerCase().includes(search)
    );
  }, [farms, farmSearch]);

  const searchedUser = useMemo(() => {
    if (uidSearch.length !== 4) return null;
    return users.find((u: any) => String(u.uid || u.id || '').endsWith(uidSearch)) ?? null;
  }, [users, uidSearch]);

  return (
    <>
      <div className="gx-page-header">
        <div className="gx-page-title">Cluster Admin — Control Center <Building2 className="inline-block w-4 h-4 mr-1 align-middle" /></div>
        <div className="gx-page-sub">{farms.length} farms · {users.length} users · {pendingSamples.length} samples pending</div>
      </div>

      {(farmsError || samplesError) && (
        <div className="gx-alert-box gx-alert-red">
          <span><AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /></span>
          <div><strong>Backend Connection Error:</strong> {(farmsErr || samplesErr)?.message || 'Could not load data from the server.'}</div>
        </div>
      )}

      {/* Alert */}
      {alerts.length > 0 && (
        <div className="gx-alert-box gx-alert-red">
          <span><ShieldAlert className="inline-block w-4 h-4 mr-1 align-middle" /></span>
          <div><strong>Active Pest Alerts:</strong> {alerts.length} unresolved alerts across farms. Review and assign experts immediately.</div>
        </div>
      )}

      {/* Stats Row */}
      <div className="gx-stats-row">
        <div className="gx-stat-card green">
          <div className="gx-stat-label">Total Farms</div>
          <div className="gx-stat-value">{farms.length}</div>
          <div className="gx-stat-change gx-up">{totalLand} acres total</div>
        </div>
        <div className="gx-stat-card blue">
          <div className="gx-stat-label">Total Users</div>
          <div className="gx-stat-value">{users.length}</div>
          <div className="gx-stat-change gx-neutral">{experts.length} experts · {fieldManagers.length} FM · {workers.length} workers</div>
        </div>
        <div className="gx-stat-card gold">
          <div className="gx-stat-label">Active Crops</div>
          <div className="gx-stat-value">{activeCrops}</div>
          <div className="gx-stat-change gx-up">Across all farms</div>
        </div>
        <div className="gx-stat-card orange">
          <div className="gx-stat-label">Pending Tasks</div>
          <div className="gx-stat-value">{taskStats.pending}</div>
          <div className="gx-stat-change gx-down">{taskStats.completed} completed</div>
        </div>
      </div>

      {/* UID + Farm Search */}
      <div className="gx-section-divider"><Search className="inline-block w-4 h-4 mr-1 align-middle" /> Quick Search</div>
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-header">
          <div className="gx-card-title"><Search className="inline-block w-4 h-4 mr-1 align-middle" /> UID + Farm Lookup</div>
        </div>
        <div className="gx-card-body">
          <div className="gx-form-grid">
            <div className="gx-form-group">
              <label className="gx-label">Enter 4-digit UID</label>
              <input type="text" className="gx-input" placeholder="e.g. 1234"
                value={uidSearch} onChange={e => setUidSearch(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
            </div>
            <div className="gx-form-group">
              <label className="gx-label">Search Farm</label>
              <input
                type="text"
                className="gx-input"
                placeholder="Farm code / name / ID"
                value={farmSearch}
                onChange={e => setFarmSearch(e.target.value)}
              />
            </div>
          </div>
          {uidSearch.length === 4 && searchedUser && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--gx-green-dim)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--gx-green)' }}>{(searchedUser as any).name || (searchedUser as any).full_name || (searchedUser as any).email}</div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>UID: {(searchedUser as any).uid || '—'} · Role: {(searchedUser as any).role || '—'}</div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Email: {(searchedUser as any).email || '—'} · Phone: {(searchedUser as any).phone || '—'}</div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Status: {(searchedUser as any).isActive === false ? 'Inactive' : 'Active'} · User ID: {(searchedUser as any).id || '—'}</div>
            </div>
          )}
          {uidSearch.length === 4 && !searchedUser && (
            <div style={{ marginTop: 12, opacity: .5, fontSize: 13 }}>No user found with UID: {uidSearch}</div>
          )}
        </div>
      </div>

      {/* Team Overview */}
      <div className="gx-section-divider"><Users className="inline-block w-4 h-4 mr-1 align-middle" /> Team Overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        <RoleCard title=<><Sprout className="inline-block w-4 h-4 mr-1 align-middle" /> Land Owners</> users={landowners} color="gold" />
        <RoleCard title=<><Microscope className="inline-block w-4 h-4 mr-1 align-middle" /> Experts</> users={experts} color="blue" />
        <RoleCard title=<><Tractor className="inline-block w-4 h-4 mr-1 align-middle" /> Field Managers</> users={fieldManagers} color="orange" />
        <RoleCard title=<><HardHat className="inline-block w-4 h-4 mr-1 align-middle" /> Workers</> users={workers} color="green" />
      </div>

      {/* Operational Status */}
      <div className="gx-section-divider"><BarChart3 className="inline-block w-4 h-4 mr-1 align-middle" /> Operational Status</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><TestTubes className="inline-block w-4 h-4 mr-1 align-middle" /> Samples Pipeline</div>
            <span className="gx-status gx-s-pending">{pendingSamples.length} Pending</span>
          </div>
          <div className="gx-card-body">
            {pendingSamples.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, opacity: .5 }}>All samples processed</div>
            ) : (
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Farm</th><th>Collected By</th><th>Priority</th></tr></thead>
                <tbody>
                  {pendingSamples.slice(0, 5).map((s: any, i: number) => (
                    <tr key={s.id || i}>
                      <td>{i + 1}</td>
                      <td>{s.farmId || s.sampleCode || '—'}</td>
                      <td>{s.collectedBy || '—'}</td>
                      <td><span className={`gx-status ${s.priority === 'HIGH' ? 'gx-s-alert' : 'gx-s-done'}`}>{s.priority || 'Normal'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title"><Bug className="inline-block w-4 h-4 mr-1 align-middle" /> Pest Alerts</div>
            <span className={`gx-status ${alerts.length > 0 ? 'gx-s-alert' : 'gx-s-done'}`}>{alerts.length} Active</span>
          </div>
          <div className="gx-card-body">
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, opacity: .5 }}>No active pest alerts</div>
            ) : (
              <table className="gx-data-table">
                <thead><tr><th>#</th><th>Pest</th><th>Severity</th><th>Farm</th><th>Status</th></tr></thead>
                <tbody>
                  {alerts.slice(0, 5).map((a: any, i: number) => (
                    <tr key={a.id || i}>
                      <td>{i + 1}</td>
                      <td>{a.pestName || '—'}</td>
                      <td><span className={`gx-status ${a.severity === 'HIGH' ? 'gx-s-alert' : 'gx-s-pending'}`}>{a.severity || '—'}</span></td>
                      <td>{a.farmId || '—'}</td>
                      <td><span className="gx-status gx-s-pending">{a.status || 'Open'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* All Farms Table */}
      <div className="gx-section-divider"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> All Farms</div>
      <div className="gx-card">
        <div className="gx-card-header">
          <div className="gx-card-title"><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Registry</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" className="gx-input" style={{ width: 220, padding: '5px 10px', fontSize: 12 }}
              placeholder="Search farm code or name..."
              value={farmSearch} onChange={e => setFarmSearch(e.target.value)} />
            <span className="gx-status gx-s-done">{filteredFarms.length} Farms</span>
          </div>
        </div>
        <div className="gx-card-body">
          {filteredFarms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, opacity: .5 }}>
              {farmSearch ? `No farm found for "${farmSearch}"` : 'No farms registered yet. Go to Farm Registration to add farms.'}
            </div>
          ) : (
            <table className="gx-data-table">
              <thead>
                <tr><th>#</th><th>Farm</th><th>Village</th><th>Acres</th><th>Crop</th><th>Field Manager</th><th>Expert</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filteredFarms.slice(0, 20).map((farm: any, i: number) => {
                  const currentManager = managers.find((m: any) => m.id === farm.fieldManagerId);
                  const currentExpert = expertList.find((e: any) => e.id === farm.expertId);
                  return (
                    <tr key={farm.id || i}>
                      <td>{i + 1}</td>
                      <td>{farm.name || farm.farmCode || farm.id}</td>
                      <td>{farm.village || '—'}{farm.pincode ? ` (${farm.pincode})` : ''}</td>
                      <td>{farm.totalLand || '—'}</td>
                      <td>{farm.crop || '—'}</td>
                      <td>
                        <select
                          className="gx-select"
                          style={{ fontSize: 12, padding: '4px 8px', minWidth: 140 }}
                          value={farm.fieldManagerId || ''}
                          onChange={e => {
                            if (e.target.value) {
                              assignManagerMutation.mutate({ farmId: farm.id, managerId: e.target.value });
                            }
                          }}
                        >
                          <option value="">{currentManager ? currentManager.name : '— Select FM —'}</option>
                          {managers.filter((m: any) => m.id !== farm.fieldManagerId).map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="gx-select"
                          style={{ fontSize: 12, padding: '4px 8px', minWidth: 140 }}
                          value={farm.expertId || ''}
                          onChange={e => {
                            if (e.target.value) {
                              assignExpertMutation.mutate({ farmId: farm.id, expertId: e.target.value });
                            }
                          }}
                        >
                          <option value="">{currentExpert ? currentExpert.name : '— Select Expert —'}</option>
                          {expertList.filter((ex: any) => ex.id !== farm.expert_id).map((ex: any) => (
                            <option key={ex.id} value={ex.id}>{ex.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`gx-status ${farm.status === 'ACTIVE' ? 'gx-s-done' : farm.status === 'REGISTERED' ? 'gx-s-pending' : 'gx-s-alert'}`}>
                          {farm.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Finance Overview */}
      {totalRevenue > 0 && (
        <>
          <div className="gx-section-divider" style={{ marginTop: 20 }}><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Revenue Projection</div>
          <div className="gx-card">
            <div className="gx-card-header">
              <div className="gx-card-title"><Wallet className="inline-block w-4 h-4 mr-1 align-middle" /> Season Finance</div>
              <span className="gx-status gx-s-done">₹{(totalRevenue / 100000).toFixed(1)}L projected</span>
            </div>
            <div className="gx-card-body">
              <div className="gx-metric-row">
                <span className="gx-metric-label">Total Revenue Projection</span>
                <span className="gx-metric-value" style={{ color: 'var(--gx-green)' }}>₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">Total Land Under Management</span>
                <span className="gx-metric-value">{totalLand} acres</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">Revenue per Acre</span>
                <span className="gx-metric-value" style={{ color: 'var(--gx-gold)' }}>₹{totalLand > 0 ? Math.round(totalRevenue / totalLand).toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Intelligence Panel */}
      <div className="gx-section-divider"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI Cluster Intelligence</div>
      <div className="gx-card" style={{ marginBottom: 20 }}>
        <div className="gx-card-header"><div className="gx-card-title"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> AI Farm Advisor</div><span className="gx-status gx-s-done">{ai.recommendations.length} Insights</span></div>
        <div className="gx-card-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button className="gx-btn gx-btn-green" style={{ fontSize: 12 }} onClick={() => { ai.getCropRecs({ region: 'Telangana', season: 'Kharif' }); toast.success('Crop recommendations generated'); }}><Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Cluster Crop Recs</button>
            <button className="gx-btn gx-btn-ghost" style={{ fontSize: 12 }} onClick={() => ai.clearRecommendations()}><Trash2 className="inline-block w-4 h-4 mr-1 align-middle" /> Clear</button>
          </div>
          <AiInsightPanel
            recommendations={ai.recommendations}
            isAnalyzing={ai.isAnalyzing}
            onAsk={(q) => ai.ask(q)}
            compact
            title="Cluster Intelligence"
          />
        </div>
      </div>
    </>
  );
}

function RoleCard({ title, users, color }: { title: string; users: any[]; color: 'green' | 'blue' | 'gold' | 'orange' }) {
  const colorVar = `var(--gx-${color})`;
  return (
    <div className="gx-card">
      <div className="gx-card-header">
        <div className="gx-card-title">{title}</div>
        <span className={`gx-status gx-s-done`}>{users.length}</span>
      </div>
      <div className="gx-card-body">
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, opacity: .5, fontSize: 13 }}>No users in this role</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {users.slice(0, 5).map((u: any) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 6, borderLeft: `3px solid ${colorVar}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name || 'Unnamed'}</div>
                  <div style={{ fontSize: 11, opacity: .5 }}>{u.email}</div>
                </div>
              </div>
            ))}
            {users.length > 5 && (
              <div style={{ fontSize: 11, opacity: .4, textAlign: 'center' }}>+{users.length - 5} more</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
