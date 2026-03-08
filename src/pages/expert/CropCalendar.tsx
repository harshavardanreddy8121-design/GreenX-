import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function CropCalendar() {
    const queryClient = useQueryClient();
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [calendarText, setCalendarText] = useState('');

    const { data: plans = [] } = useQuery({
        queryKey: ['expert-calendar-plans'],
        queryFn: async () => {
            const res = await javaApi.select('crop_plans', { order: { field: 'created_at', ascending: false } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const publishCalendar = useMutation({
        mutationFn: async () => {
            const planId = selectedPlanId || plans[0]?.id;
            if (!planId || !calendarText.trim()) throw new Error('Select crop plan and enter calendar');

            const selectedPlan = plans.find((p: any) => p.id === planId);
            const farmId = selectedPlan?.farm_id;

            const res = await javaApi.update('crop_plans', planId, {
                crop_calendar: calendarText.trim(),
                calendar_published_at: new Date().toISOString(),
            });
            if (!res.success) throw new Error(res.error || 'Failed to publish calendar');

            await emitWorkflowTrigger({
                farmId,
                eventKey: 'crop_calendar_published',
                triggeredBy: 'expert',
                note: 'Expert published crop calendar for field execution.',
            });
        },
        onSuccess: () => {
            toast.success('Crop calendar published');
            setCalendarText('');
            queryClient.invalidateQueries({ queryKey: ['expert-calendar-plans'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to publish calendar'),
    });

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Crop Calendar</h1>
                    <p className="text-sm text-muted-foreground mt-1">Build weekly activity plan and publish to field manager</p>
                </div>

                <Card className="p-4 space-y-3">
                    <select value={selectedPlanId || plans[0]?.id || ''} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                        {plans.map((plan: any) => (
                            <option key={plan.id} value={plan.id}>{plan.crop_name || 'Crop'} - Farm {plan.farm_id}</option>
                        ))}
                    </select>
                    <textarea
                        value={calendarText}
                        onChange={(e) => setCalendarText(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        placeholder="Week 1: Sowing\nWeek 2: Irrigation\nWeek 3: Top dressing..."
                    />
                    <Button onClick={() => publishCalendar.mutate()} disabled={publishCalendar.isPending}>Publish Calendar</Button>
                </Card>

                <div className="space-y-3">
                    {plans.map((plan: any) => (
                        <Card key={plan.id} className="p-4">
                            <p className="font-medium">{plan.crop_name || 'Crop'} - Farm {plan.farm_id}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{plan.crop_calendar || 'Calendar not published yet'}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
