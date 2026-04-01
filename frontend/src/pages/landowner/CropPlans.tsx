import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Calendar, TrendingUp, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { upsertWorkflowEvent } from '@/utils/workflowEvents';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';

export default function CropPlans() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedFarmId, setSelectedFarmId] = useState<string>('');

    const { data: farms = [] } = useQuery({
        queryKey: ['landowner-crop-plans', user?.id],
        queryFn: async () => {
            const ownedResponse = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const owned = ownedResponse.success && ownedResponse.data ? ownedResponse.data as any[] : [];

            const farmsWithPlans = await Promise.all(
                owned.map(async (farm: any) => {
                    const plansResponse = await javaApi.select('crop_plans', {
                        eq: { farm_id: farm.id },
                        order: { field: 'created_at', ascending: false }
                    });
                    const plans = plansResponse.success && plansResponse.data ? plansResponse.data as any[] : [];
                    return { ...farm, plans };
                })
            );

            return farmsWithPlans;
        },
        enabled: !!user?.id,
    });

    const approvePlan = useMutation({
        mutationFn: async ({ planId, farmId }: { planId: string; farmId: string }) => {
            await javaApi.update('crop_plans', planId, { status: 'approved', approved_at: new Date().toISOString() });
            await upsertWorkflowEvent({
                farmId,
                eventKey: 'crop_selected',
                status: 'completed',
                doneBy: 'Land Owner',
                note: 'Crop plan approved by landowner'
            });

            await emitWorkflowTrigger({
                farmId,
                eventKey: 'landowner_selected_crop',
                triggeredBy: 'landowner',
                note: 'Land owner approved crop plan and unlocked season workflow.',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landowner-crop-plans'] });
            toast.success('Crop plan approved successfully!');
        },
    });

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Crop Plans & Approval</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review expert crop recommendations and approve your season plan</p>
                </div>

            {farms.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">No crop plans available yet</Card>
            ) : (
                <div className="space-y-6">
                    {farms.map((farm: any) => (
                        <Card key={farm.id} className="p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4">{farm.name || `Farm ${farm.farm_code}`}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{farm.village}, {farm.district}</p>

                            {farm.plans.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                                    <p className="text-muted-foreground">No crop plans yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Expert will create crop plans after soil analysis</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {farm.plans.map((plan: any) => (
                                        <Card key={plan.id} className={`p-4 ${plan.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Sprout className="w-6 h-6 text-emerald-600" />
                                                        <h3 className="text-lg font-bold text-foreground">{plan.crop_name}</h3>
                                                        {plan.status === 'approved' ? (
                                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-900 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Approved
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> Pending Approval
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Season Duration</p>
                                                            <p className="text-sm font-semibold flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {plan.season_duration || 'N/A'} days
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Expected Yield</p>
                                                            <p className="text-sm font-semibold flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3" /> {plan.predicted_yield || 'N/A'} quintals
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Estimated Profit</p>
                                                            <p className="text-sm font-semibold flex items-center gap-1 text-green-600">
                                                                <DollarSign className="w-3 h-3" /> ₹{plan.estimated_profit || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {plan.expert_notes && (
                                                        <Card className="p-3 bg-white/70 border border-blue-200">
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Expert Recommendation</p>
                                                            <p className="text-sm text-foreground">{plan.expert_notes}</p>
                                                        </Card>
                                                    )}

                                                    {plan.crop_calendar && (
                                                        <Card className="p-3 bg-white/70 border border-emerald-200 mt-2">
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Crop Calendar</p>
                                                            <p className="text-sm text-foreground whitespace-pre-wrap">{plan.crop_calendar}</p>
                                                        </Card>
                                                    )}
                                                </div>

                                                {plan.status !== 'approved' && (
                                                    <Button
                                                        onClick={() => approvePlan.mutate({ planId: plan.id, farmId: farm.id })}
                                                        className="ml-4"
                                                        disabled={approvePlan.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        {approvePlan.isPending ? 'Approving...' : 'Approve Plan'}
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="mt-3 text-xs text-muted-foreground">
                                                Created by expert on {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            </div>
        </DashboardShell>
    );
}
