import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Beaker, ClipboardCheck, Leaf, Microscope, ShieldCheck, Sprout, UserCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GreenXLogo } from '@/components/GreenXLogo';
import { javaApi } from '@/integrations/java-api/client';

interface WorkflowStep {
  id: string;
  text: string;
  owner: string;
}

interface Phase {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
  cardClass: string;
  steps: WorkflowStep[];
}

type FlowStatus = 'pending' | 'in-progress' | 'completed';

interface DataFlowRow {
  id: string;
  event: string;
  doneBy: string;
  systemDoes: string;
  notifies: string;
}

interface FarmFlowData {
  assignments: any[];
  diagnostics: any[];
  cropPlans: any[];
  tasks: any[];
  photos: any[];
  harvests: any[];
  costs: any[];
  timeline: any[];
  workflowEvents: any[];
}

const phases: Phase[] = [
  {
    title: 'Phase 1',
    subtitle: 'Land Onboarding',
    icon: ClipboardCheck,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardClass: 'from-emerald-50 to-lime-100 border-emerald-200',
    steps: [
      {
        id: '01',
        text: 'Land Owner registers land and submits details (location, size, documents) in the cluster.',
        owner: 'Land Owner',
      },
      {
        id: '02',
        text: 'Cluster Admin reviews submission, verifies land, and activates the land in the system.',
        owner: 'Cluster Admin',
      },
      {
        id: '03',
        text: 'Cluster Admin assigns a Field Manager to that farm. Field Manager becomes responsible for that land.',
        owner: 'Cluster Admin',
      },
      {
        id: '04',
        text: 'Land Owner receives confirmation that land is active and assigned in GreenX.',
        owner: 'App Auto',
      },
    ],
  },
  {
    title: 'Phase 2',
    subtitle: 'Soil Sampling',
    icon: Beaker,
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    cardClass: 'from-cyan-50 to-blue-100 border-cyan-200',
    steps: [
      {
        id: '05',
        text: 'Field Manager visits farm, collects samples at multiple points, and logs GPS, time, and photos instantly.',
        owner: 'Field Manager',
      },
      {
        id: '06',
        text: 'App notifies Land Owner: "Soil sampling started on your farm" with date and photos.',
        owner: 'App Auto',
      },
      {
        id: '07',
        text: 'Field Manager physically delivers samples to nearest cluster facility or lab.',
        owner: 'Field Manager',
      },
      {
        id: '08',
        text: 'Cluster Admin logs sample receipt and assigns it to Expert in the lab.',
        owner: 'Cluster Admin',
      },
    ],
  },
  {
    title: 'Phase 3',
    subtitle: 'Clinical Testing and Crop Planning',
    icon: Microscope,
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-300',
    cardClass: 'from-violet-50 to-indigo-100 border-violet-200',
    steps: [
      {
        id: '09',
        text: 'Expert runs full clinical tests (pH, NPK, organic matter, moisture, micronutrients) and enters results in system.',
        owner: 'Expert',
      },
      {
        id: '10',
        text: 'Expert uploads Soil Report visible instantly on Cluster Admin, Field Manager, and Land Owner dashboards.',
        owner: 'Expert',
      },
      {
        id: '11',
        text: 'Expert suggests best crops with predicted yield, input needs, and profit potential.',
        owner: 'Expert',
      },
      {
        id: '12',
        text: 'Land Owner reviews options, selects crop, and Expert receives selection notification.',
        owner: 'Land Owner',
      },
      {
        id: '13',
        text: 'Expert builds full week-by-week crop calendar (sowing, fertilizer, irrigation, pest scouting, harvest date).',
        owner: 'Expert',
      },
      {
        id: '14',
        text: 'Crop Calendar is published to Field Manager dashboard and season plan becomes active and locked.',
        owner: 'App Auto',
      },
    ],
  },
  {
    title: 'Phase 4',
    subtitle: 'Live Field Operations',
    icon: Leaf,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    cardClass: 'from-amber-50 to-orange-100 border-amber-200',
    steps: [
      {
        id: '15',
        text: 'Field Manager opens crop calendar daily; app shows today\'s tasks and manager assigns work to workers.',
        owner: 'Field Manager',
      },
      {
        id: '16',
        text: 'Workers complete sowing; Field Manager logs seed variety, quantity, date, method, and photos. Land Owner notified.',
        owner: 'Field Manager',
      },
      {
        id: '17',
        text: 'Every operation (irrigation, fertilizer, weeding) is logged live with product, dose, zone, and cost; synced to dashboards.',
        owner: 'Field Manager',
      },
      {
        id: '18',
        text: 'When pest or disease is detected: Field Manager flags with photos, Expert reviews remotely, issues prescription, and manager executes.',
        owner: 'Field Manager',
      },
      {
        id: '19',
        text: 'At each milestone (germination, flowering, grain fill), updates and photos are logged and Land Owner gets live notifications.',
        owner: 'App Auto',
      },
    ],
  },
  {
    title: 'Phase 5',
    subtitle: 'Harvest, Sales and Payment',
    icon: Sprout,
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    cardClass: 'from-rose-50 to-pink-100 border-rose-200',
    steps: [
      {
        id: '20',
        text: 'Expert confirms harvest readiness. Cluster Admin schedules harvest date and invites Land Owner for transparency.',
        owner: 'Expert',
      },
      {
        id: '21',
        text: 'Field Manager leads harvest; total produce is weighed and logged with photos or video evidence. Land Owner notified.',
        owner: 'Field Manager',
      },
      {
        id: '22',
        text: 'Cluster Admin manages sale (local market or international export) and enters sale details in system.',
        owner: 'Cluster Admin',
      },
      {
        id: '23',
        text: 'System auto-calculates split: 70% to Land Owner and 30% to GreenX, then sends payment summary.',
        owner: 'App Auto',
      },
      {
        id: '24',
        text: 'Full season report is auto-generated (yield vs prediction, costs, profit earned, and next-season recommendation).',
        owner: 'App Auto',
      },
    ],
  },
];

const roleViews = [
  {
    role: 'Land Owner Dashboard',
    icon: UserCheck,
    items: [
      'My farm location and status',
      'Soil test report and results',
      'Crop options and approval',
      'Live field photos and milestones',
      'Input usage and costs tracker',
      'Yield prediction vs actual',
      'Revenue, profit, and payment',
      'Season-end report',
    ],
    style: 'from-emerald-50 to-lime-100 border-emerald-200',
  },
  {
    role: 'Cluster Admin Dashboard',
    icon: ShieldCheck,
    items: [
      'All lands in cluster (map view)',
      'Assign Field Manager to farm',
      'Receive and route soil samples',
      'All farm activity status',
      'Cluster-level KPIs and performance',
      'Inventory and input stock',
      'Export pipeline management',
      'Profitability per farm',
    ],
    style: 'from-sky-50 to-cyan-100 border-sky-200',
  },
  {
    role: 'Expert Dashboard',
    icon: Microscope,
    items: [
      'Pending soil samples queue',
      'Enter and upload test results',
      'Crop suggestion builder',
      'Crop calendar creation tool',
      'Pest and disease alert inbox',
      'Prescription issuance',
      'Historical farm soil records',
      'All farms under expert care',
    ],
    style: 'from-violet-50 to-indigo-100 border-violet-200',
  },
  {
    role: 'Field Manager Dashboard',
    icon: Users,
    items: [
      'Today\'s tasks from crop calendar',
      'Assigned farms (map and list)',
      'Log every field operation live',
      'Upload photos at each stage',
      'Flag pest and disease issues',
      'Expert prescription inbox',
      'Worker task assignments',
      'Input usage log',
    ],
    style: 'from-amber-50 to-orange-100 border-amber-200',
  },
];

const dataFlowRows: DataFlowRow[] = [
  {
    id: 'land_submitted',
    event: 'Land submitted on app',
    doneBy: 'Land Owner',
    systemDoes: 'Creates farm record and alerts cluster.',
    notifies: 'Cluster Admin: "New land submitted. Review and assign."',
  },
  {
    id: 'field_manager_assigned',
    event: 'Field Manager assigned to farm',
    doneBy: 'Cluster Admin',
    systemDoes: 'Links manager to farm and unlocks farm tasks.',
    notifies: 'Field Manager: "You are assigned to Farm #[X]." Land Owner: "Your farm manager is [Name]."',
  },
  {
    id: 'soil_samples_collected',
    event: 'Soil samples collected and logged',
    doneBy: 'Field Manager',
    systemDoes: 'Creates sample record with GPS and photos.',
    notifies: 'Land Owner: "Soil sampling done" with photos and date. Cluster Admin: Samples pending in lab.',
  },
  {
    id: 'soil_sample_received',
    event: 'Soil sample received at lab',
    doneBy: 'Cluster Admin',
    systemDoes: 'Assigns sample to Expert queue.',
    notifies: 'Expert: "New sample assigned for Farm #[X]."',
  },
  {
    id: 'soil_report_uploaded',
    event: 'Expert uploads soil report',
    doneBy: 'Expert',
    systemDoes: 'Pushes report instantly to all relevant dashboards.',
    notifies: 'Land Owner, Cluster Admin, Field Manager: "Soil report ready. View results."',
  },
  {
    id: 'crop_calendar_built',
    event: 'Expert suggests crops and builds calendar',
    doneBy: 'Expert',
    systemDoes: 'Sends crop options to Land Owner and calendar to Field Manager.',
    notifies: 'Land Owner: "Select your crop for this season." Field Manager: Calendar pending crop approval.',
  },
  {
    id: 'crop_selected',
    event: 'Land Owner selects crop',
    doneBy: 'Land Owner',
    systemDoes: 'Activates crop calendar and releases tasks.',
    notifies: 'Field Manager: "Season started. [Crop name] calendar is live." Expert: Crop confirmed notification.',
  },
  {
    id: 'field_operation_logged',
    event: 'Field operation logged (spray, irrigate, sow)',
    doneBy: 'Field Manager',
    systemDoes: 'Updates farm activity log and cost tracker.',
    notifies: 'Land Owner: Activity feed updated with photos. Cluster Admin: KPI dashboard updated.',
  },
  {
    id: 'pest_flagged',
    event: 'Pest or disease flagged',
    doneBy: 'Field Manager',
    systemDoes: 'Raises immediate alert to Expert.',
    notifies: 'Expert: "Pest alert on Farm #[X]. Review and prescribe." Land Owner and Cluster Admin: Alert notification.',
  },
  {
    id: 'prescription_issued',
    event: 'Expert issues prescription',
    doneBy: 'Expert',
    systemDoes: 'Sends prescription into Field Manager task list.',
    notifies: 'Field Manager: "Prescription received. Apply [product, dose, zone]."',
  },
  {
    id: 'harvest_completed',
    event: 'Harvest completed and produce weighed',
    doneBy: 'Field Manager',
    systemDoes: 'Logs final yield and triggers revenue calculation.',
    notifies: 'Land Owner: "Harvest complete - [X] quintals. Payment coming." Cluster Admin: Ready for sale/export.',
  },
  {
    id: 'sale_completed',
    event: 'Sale or export completed',
    doneBy: 'Cluster Admin',
    systemDoes: 'Auto-calculates 70/30 split and generates report.',
    notifies: 'Land Owner: Full season report and payment breakdown on dashboard.',
  },
];

const statusStyle: Record<FlowStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  'in-progress': 'bg-amber-100 text-amber-900 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-200',
};

const statusLabel: Record<FlowStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const hasTimelineKeyword = (timeline: any[], pattern: RegExp) =>
  timeline.some((item) => {
    const title = String(item?.event_title || item?.event_type || '');
    const description = String(item?.event_description || '');
    return pattern.test(`${title} ${description}`);
  });

function getFlowStatusMap(farm: any | null, flow: FarmFlowData | null): Record<string, FlowStatus> {
  const fallback = Object.fromEntries(dataFlowRows.map((row) => [row.id, 'pending'])) as Record<string, FlowStatus>;

  if (!farm || !flow) {
    return fallback;
  }

  const hasFieldManager = flow.assignments.some((a) => String(a.role || '').toLowerCase() === 'fieldmanager');
  const hasSoilCollectionEvidence =
    flow.photos.length > 0 || hasTimelineKeyword(flow.timeline, /soil|sample/i) || flow.diagnostics.length > 0;
  const hasSoilReport = flow.diagnostics.length > 0;
  const hasCropPlan = flow.cropPlans.length > 0;
  const cropApproved = flow.cropPlans.some((p) => String(p.status || '').toLowerCase() === 'approved');
  const hasFieldOperations =
    flow.tasks.length > 0 ||
    flow.photos.length > 0 ||
    flow.costs.length > 0 ||
    hasTimelineKeyword(flow.timeline, /task|photo|spray|irrigat|sow|field/i);

  const pestFlagged =
    flow.diagnostics.some((d) => ['medium', 'high'].includes(String(d.pest_risk || '').toLowerCase())) ||
    flow.diagnostics.some((d) => ['medium', 'high'].includes(String(d.disease_risk || '').toLowerCase())) ||
    hasTimelineKeyword(flow.timeline, /pest|disease|incident|alert/i);

  const prescriptionIssued = flow.diagnostics.some((d) => String(d.prescription || '').trim().length > 0);
  const hasHarvest = flow.harvests.length > 0;
  const saleCompleted = flow.harvests.some((h) => Number(h.revenue || 0) > 0);

  const inferredStatuses: Record<string, FlowStatus> = {
    land_submitted: 'completed',
    field_manager_assigned: hasFieldManager ? 'completed' : 'in-progress',
    soil_samples_collected: hasSoilCollectionEvidence ? 'completed' : hasFieldManager ? 'in-progress' : 'pending',
    soil_sample_received: hasSoilReport ? 'completed' : hasSoilCollectionEvidence ? 'in-progress' : 'pending',
    soil_report_uploaded: hasSoilReport ? 'completed' : hasSoilCollectionEvidence ? 'in-progress' : 'pending',
    crop_calendar_built: hasCropPlan ? 'completed' : hasSoilReport ? 'in-progress' : 'pending',
    crop_selected: cropApproved ? 'completed' : hasCropPlan ? 'in-progress' : 'pending',
    field_operation_logged: hasFieldOperations ? 'completed' : cropApproved ? 'in-progress' : 'pending',
    pest_flagged: pestFlagged ? 'completed' : hasFieldOperations ? 'in-progress' : 'pending',
    prescription_issued: prescriptionIssued ? 'completed' : pestFlagged ? 'in-progress' : 'pending',
    harvest_completed: hasHarvest ? 'completed' : hasFieldOperations ? 'in-progress' : 'pending',
    sale_completed: saleCompleted ? 'completed' : hasHarvest ? 'in-progress' : 'pending',
  };

  const explicitStatuses = (flow.workflowEvents || []).reduce((acc: Record<string, FlowStatus>, eventRow: any) => {
    const key = String(eventRow?.event_key || eventRow?.event || '');
    const rawStatus = String(eventRow?.status || '').toLowerCase();
    const mappedStatus: FlowStatus =
      rawStatus === 'completed'
        ? 'completed'
        : rawStatus === 'in-progress' || rawStatus === 'in_progress'
          ? 'in-progress'
          : 'pending';

    if (key) {
      acc[key] = mappedStatus;
    }

    return acc;
  }, {});

  return {
    ...inferredStatuses,
    ...explicitStatuses,
  };
}

const Workflow = () => {
  const navigate = useNavigate();
  const [selectedFarmId, setSelectedFarmId] = useState('');

  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['workflow-farms'],
    queryFn: async () => {
      try {
        const response = await javaApi.select('farms', {});
        return response.success && response.data ? (response.data as any[]) : [];
      } catch {
        return [];
      }
    },
  });

  useEffect(() => {
    if (!selectedFarmId && farms.length > 0) {
      setSelectedFarmId(String(farms[0].id));
    }
  }, [selectedFarmId, farms]);

  const selectedFarm = useMemo(
    () => farms.find((farm: any) => String(farm.id) === String(selectedFarmId)) || null,
    [farms, selectedFarmId]
  );

  const { data: flowData = null, isLoading: flowLoading } = useQuery({
    queryKey: ['workflow-live-flow', selectedFarmId],
    enabled: !!selectedFarmId,
    queryFn: async () => {
      const fetchFarmRows = async (tableName: string) => {
        try {
          const response = await javaApi.select(tableName, { eq: { farm_id: selectedFarmId } });
          return response.success && response.data ? (response.data as any[]) : [];
        } catch {
          return [];
        }
      };

      const [assignments, diagnostics, cropPlans, tasks, photos, harvests, costs, timeline, workflowEvents] = await Promise.all([
        fetchFarmRows('farm_assignments'),
        fetchFarmRows('diagnostics'),
        fetchFarmRows('crop_plans'),
        fetchFarmRows('tasks'),
        fetchFarmRows('farm_photos'),
        fetchFarmRows('harvests'),
        fetchFarmRows('costs'),
        fetchFarmRows('farm_timeline'),
        fetchFarmRows('workflow_events'),
      ]);

      return {
        assignments,
        diagnostics,
        cropPlans,
        tasks,
        photos,
        harvests,
        costs,
        timeline,
        workflowEvents,
      } as FarmFlowData;
    },
  });

  const flowStatusMap = useMemo(() => getFlowStatusMap(selectedFarm, flowData), [selectedFarm, flowData]);
  const completedCount = useMemo(
    () => Object.values(flowStatusMap).filter((status) => status === 'completed').length,
    [flowStatusMap]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted/70 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <GreenXLogo size="sm" />
          <button
            onClick={() => navigate('/login')}
            className="btn-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-10">
        <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-cyan-50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">GreenX Process</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">End-to-End Cluster Farming Workflow</h1>
          <p className="mt-3 text-sm md:text-base text-slate-700 max-w-4xl">
            This workflow defines how Land Owners, Cluster Admins, Field Managers, Experts, and automated app flows run a full season from onboarding to payment.
          </p>
        </section>

        <section className="space-y-6">
          {phases.map((phase) => {
            const PhaseIcon = phase.icon;
            return (
              <article key={phase.title} className={`rounded-2xl border bg-gradient-to-br ${phase.cardClass} p-5 md:p-6`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${phase.badgeClass}`}>
                    <PhaseIcon className="h-4 w-4" />
                    {phase.title}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">{phase.subtitle}</h2>
                </div>

                <div className="space-y-3">
                  {phase.steps.map((step) => (
                    <div key={step.id} className="rounded-xl border border-white/70 bg-white/70 p-4 md:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-slate-700">{step.id}</span>
                        <span className="text-xs md:text-sm font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-white">
                          {step.owner}
                        </span>
                      </div>
                      <p className="mt-2 text-sm md:text-base text-slate-800">{step.text}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Data Flow</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Live status is derived from farm records, assignments, diagnostics, plans, tasks, photos, harvests, and timeline events.
          </p>

          <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Track Live Status by Farm</p>
                <p className="text-xs text-muted-foreground">Progress: {completedCount}/{dataFlowRows.length} events completed</p>
              </div>

              <div className="w-full md:w-96">
                <label htmlFor="workflow-farm" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected Farm
                </label>
                <select
                  id="workflow-farm"
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  disabled={farmsLoading || farms.length === 0}
                >
                  {farms.length === 0 ? (
                    <option value="">No farms found</option>
                  ) : (
                    farms.map((farm: any) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name || `Farm #${farm.id}`} ({farm.village || 'No village'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {selectedFarm && (
              <p className="text-xs text-muted-foreground">
                Live context: <span className="font-semibold text-foreground">{selectedFarm.name || `Farm #${selectedFarm.id}`}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            <div className="hidden md:grid md:grid-cols-12 bg-slate-900 text-white text-xs font-semibold uppercase tracking-wide">
              <div className="col-span-3 px-4 py-3">Event or Action</div>
              <div className="col-span-2 px-4 py-3">Done By</div>
              <div className="col-span-3 px-4 py-3">System Does</div>
              <div className="col-span-3 px-4 py-3">Who Gets Notified and What They See</div>
              <div className="col-span-1 px-4 py-3">Status</div>
            </div>

            <div className="divide-y divide-border">
              {dataFlowRows.map((row) => {
                const status = flowStatusMap[row.id] || 'pending';
                return (
                  <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 bg-background/70">
                    <div className="md:col-span-3 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Event or Action</p>
                      <p className="text-sm font-semibold text-foreground">{row.event}</p>
                    </div>
                    <div className="md:col-span-2 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Done By</p>
                      <span className="inline-flex rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-1 text-xs font-semibold border border-emerald-200">
                        {row.doneBy}
                      </span>
                    </div>
                    <div className="md:col-span-3 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">System Does</p>
                      <p className="text-sm text-foreground">{row.systemDoes}</p>
                    </div>
                    <div className="md:col-span-3 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Notifications</p>
                      <p className="text-sm text-foreground">{row.notifies}</p>
                    </div>
                    <div className="md:col-span-1 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">Status</p>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>
                        {flowLoading ? 'Loading' : statusLabel[status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">What Each Role Sees</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {roleViews.map((view) => {
              const ViewIcon = view.icon;
              return (
                <article key={view.role} className={`rounded-2xl border bg-gradient-to-br ${view.style} p-5`}>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ViewIcon className="h-5 w-5" />
                    {view.role}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {view.items.map((item) => (
                      <li key={item} className="text-sm text-slate-800 flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Workflow;
