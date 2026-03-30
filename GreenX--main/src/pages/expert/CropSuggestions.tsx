import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function CropSuggestions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [farmId, setFarmId] = useState('');
    const [suggestions, setSuggestions] = useState([
        { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
        { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
        { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
    ]);

    const { data: farms = [] } = useQuery({
        queryKey: ['expert-suggestion-farms', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('farms', {});
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const { data: plans = [] } = useQuery({
        queryKey: ['expert-crop-plans'],
        queryFn: async () => {
            const res = await javaApi.select('crop_plans', { order: { field: 'created_at', ascending: false } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const createPlan = useMutation({
        mutationFn: async () => {
            const selectedFarm = farmId || farms[0]?.id;
            if (!selectedFarm) throw new Error('Select farm');

            const validSuggestions = suggestions.filter((item) => item.cropName.trim());
            if (validSuggestions.length !== 3) throw new Error('Enter exactly 3 crop suggestions');

            const insertResults = await Promise.all(
                validSuggestions.map((item) =>
                    javaApi.insert('crop_plans', {
                        id: crypto.randomUUID(),
                        farm_id: selectedFarm,
                        crop_name: item.cropName.trim(),
                        predicted_yield: item.yieldPrediction || null,
                        estimated_profit: item.profitPrediction || null,
                        expert_notes: item.notes.trim() || null,
                        status: 'pending',
                        created_by: user?.id,
                        created_at: new Date().toISOString(),
                    })
                )
            );

            const failed = insertResults.find((res) => !res.success);
            if (failed) throw new Error(failed.error || 'Failed to create crop suggestions');

            await emitWorkflowTrigger({
                farmId: selectedFarm,
                eventKey: 'crop_suggestions_sent',
                triggeredBy: 'expert',
                note: 'Expert sent crop suggestions for land owner approval.',
            });
        },
        onSuccess: () => {
            toast.success('3 crop suggestions shared to landowner');
            setSuggestions([
                { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
                { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
                { cropName: '', yieldPrediction: '', profitPrediction: '', notes: '' },
            ]);
            queryClient.invalidateQueries({ queryKey: ['expert-crop-plans'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to save suggestion'),
    });

    const updateSuggestion = (index: number, field: 'cropName' | 'yieldPrediction' | 'profitPrediction' | 'notes', value: string) => {
        setSuggestions((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Crop Suggestions</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create and publish crop recommendations for farms</p>
                </div>

                <Card className="p-4">
                    <div className="grid md:grid-cols-5 gap-3 mb-4">
                        <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                            {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
                        </select>
                        <div className="md:col-span-3 flex items-center text-xs text-muted-foreground">Enter exactly 3 crop options with yield, profit, and notes.</div>
                        <Button onClick={() => createPlan.mutate()} disabled={createPlan.isPending}>Publish 3 Suggestions</Button>
                    </div>

                    <div className="space-y-3">
                        {suggestions.map((item, index) => (
                            <div key={index} className="grid md:grid-cols-4 gap-3">
                                <input value={item.cropName} onChange={(e) => updateSuggestion(index, 'cropName', e.target.value)} placeholder={`Crop ${index + 1} name`} className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                                <input value={item.yieldPrediction} onChange={(e) => updateSuggestion(index, 'yieldPrediction', e.target.value)} placeholder="Predicted yield" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                                <input value={item.profitPrediction} onChange={(e) => updateSuggestion(index, 'profitPrediction', e.target.value)} placeholder="Estimated profit" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                                <input value={item.notes} onChange={(e) => updateSuggestion(index, 'notes', e.target.value)} placeholder="Notes" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-3">
                    {plans.map((plan: any) => (
                        <Card key={plan.id} className="p-4">
                            <p className="font-medium text-foreground">{plan.crop_name || 'Crop'} - Farm {plan.farm_id}</p>
                            <p className="text-sm text-muted-foreground">Yield: {plan.predicted_yield || 'N/A'} | Profit: {plan.estimated_profit || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Status: {plan.status || 'pending'}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
