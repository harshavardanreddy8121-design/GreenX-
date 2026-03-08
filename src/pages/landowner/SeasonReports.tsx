import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';

const workflowStages = [
    'land_registered',
    'fm_assigned',
    'soil_sample_received',
    'soil_report_uploaded',
    'crop_selected',
    'crop_calendar_created',
    'sowing_completed',
    'field_operation_logged',
    'pest_alert_raised',
    'prescription_issued',
    'harvest_completed',
    'payment_released',
];

export default function SeasonReports() {
    const { user } = useAuth();

    const { data: reportRows = [], isLoading } = useQuery({
        queryKey: ['season-reports', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const farmsRes = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const farms = farmsRes.success && farmsRes.data ? (farmsRes.data as any[]) : [];

            const result = await Promise.all(
                farms.map(async (farm: any) => {
                    const eventsRes = await javaApi.select('workflow_events', { eq: { farm_id: farm.id } });
                    const events = eventsRes.success && eventsRes.data ? (eventsRes.data as any[]) : [];

                    const completed = events.filter((e: any) => e.status === 'completed').map((e: any) => e.event_key);
                    const progressPct = Math.round((completed.length / workflowStages.length) * 100);

                    return {
                        farm,
                        progressPct,
                        completedCount: completed.length,
                        pendingStages: workflowStages.filter((s) => !completed.includes(s)),
                    };
                })
            );

            return result;
        },
    });

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Season Reports</h1>
                    <p className="text-sm text-muted-foreground mt-1">Farm lifecycle progress across all workflow stages</p>
                </div>

                {isLoading ? (
                    <Card className="p-6 text-center">Loading season reports...</Card>
                ) : (
                    <div className="space-y-4">
                        {reportRows.map((row: any) => (
                            <Card key={row.farm.id} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-semibold">{row.farm.name || row.farm.farm_code}</p>
                                        <p className="text-sm text-muted-foreground">{row.farm.village}, {row.farm.district}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{row.progressPct}%</p>
                                        <p className="text-xs text-muted-foreground">{row.completedCount}/{workflowStages.length} stages complete</p>
                                    </div>
                                </div>

                                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${row.progressPct}%` }} />
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Pending Stages</p>
                                    <div className="flex flex-wrap gap-2">
                                        {row.pendingStages.length ? row.pendingStages.map((stage: string) => (
                                            <span key={stage} className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-900">
                                                {stage}
                                            </span>
                                        )) : <span className="text-xs text-emerald-600 font-medium">All stages completed</span>}
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {reportRows.length === 0 && <Card className="p-8 text-center text-muted-foreground">No farms found for season report</Card>}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
