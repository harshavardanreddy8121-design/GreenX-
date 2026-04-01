import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { upsertWorkflowEvent } from '@/utils/workflowEvents';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';

export default function SoilSampleQueue() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [expandedFarm, setExpandedFarm] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const { data: farms = [], isLoading } = useQuery({
        queryKey: ['expert-soil-queue', user?.id],
        queryFn: async () => {
            const assignResponse = await javaApi.select('farm_assignments', {
                eq: { user_id: user?.id, role: 'expert' }
            });

            let farms: any[] = [];
            if (assignResponse.success && assignResponse.data) {
                const assignments = assignResponse.data as any[];
                if (assignments?.length) {
                    const farmResults = await Promise.all(
                        assignments.map((a: any) => javaApi.select('farms', { eq: { id: a.farm_id } }))
                    );
                    farms = farmResults
                        .filter((r) => r.success && r.data && (r.data as any[]).length > 0)
                        .map((r) => (r.data as any[])[0]);
                }
            }

            if (!farms.length) {
                const allResponse = await javaApi.select('farms', {});
                if (allResponse.success && allResponse.data) {
                    farms = allResponse.data as any[];
                }
            }

            const farmsWithDetails = await Promise.all(
                farms.map(async (farm: any) => {
                    const detailsRes = await javaApi.select('farm_details', { eq: { farm_id: farm.id } });
                    const details = detailsRes.success && detailsRes.data && (detailsRes.data as any[]).length > 0
                        ? (detailsRes.data as any[])[0]
                        : null;
                    return { ...farm, soil_details: details };
                })
            );

            // Return farms without soil details (pending samples)
            return farmsWithDetails.filter((f: any) => !f.soil_details);
        },
        enabled: !!user?.id,
    });

    const submitSoilReport = useMutation({
        mutationFn: async (farmId: string) => {
            const data = formData[farmId];
            if (!data || !data.soil_ph || !data.soil_nitrogen) {
                throw new Error('Please fill required soil parameters');
            }

            const payload = {
                farm_id: farmId,
                ...data,
                tested_by: user?.id,
                tested_at: new Date().toISOString(),
            };

            const existingRes = await javaApi.select('farm_details', { eq: { farm_id: farmId } });
            const existing = existingRes.success && existingRes.data && (existingRes.data as any[]).length > 0
                ? (existingRes.data as any[])[0]
                : null;

            if (existing) {
                await javaApi.update('farm_details', existing.id, payload);
            } else {
                await javaApi.insert('farm_details', { id: crypto.randomUUID(), ...payload });
            }

            await upsertWorkflowEvent({
                farmId,
                eventKey: 'soil_report_uploaded',
                status: 'completed',
                doneBy: 'Expert',
                note: 'Soil test completed and report uploaded'
            });

            await emitWorkflowTrigger({
                farmId,
                eventKey: 'soil_report_uploaded',
                triggeredBy: 'expert',
                note: 'Expert uploaded soil report and shared with all role dashboards.',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expert-soil-queue'] });
            setFormData({});
            setExpandedFarm(null);
            toast.success('Soil report submitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to submit report');
        },
    });

    const updateField = (farmId: string, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [farmId]: { ...(prev[farmId] || {}), [field]: value }
        }));
    };

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Soil Sample Queue</h1>
                <p className="text-sm text-muted-foreground mt-1">Pending soil samples for testing and analysis</p>
            </div>

            {isLoading ? (
                <Card className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></Card>
            ) : farms.length === 0 ? (
                <Card className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending soil samples</p>
                    <p className="text-sm text-muted-foreground mt-1">All farms have been tested</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {farms.map((farm: any) => (
                        <Card key={farm.id} className="p-6 border-l-4 border-l-amber-500">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{farm.name || `Farm ${farm.farm_code}`}</h2>
                                    <p className="text-sm text-muted-foreground">{farm.village}, {farm.district} - {farm.acres} acres</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-900 mt-2">
                                        <Clock className="w-3 h-3" /> Pending Analysis
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedFarm(expandedFarm === farm.id ? null : farm.id)}
                                >
                                    {expandedFarm === farm.id ? 'Collapse' : 'Enter Results'}
                                </Button>
                            </div>

                            {expandedFarm === farm.id && (
                                <Card className="p-4 bg-muted/50">
                                    <p className="text-sm font-semibold mb-3">Enter Soil Test Results</p>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">pH Level *</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="6.5"
                                                value={formData[farm.id]?.soil_ph || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_ph', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Nitrogen (kg/ha) *</label>
                                            <input
                                                type="number"
                                                placeholder="280"
                                                value={formData[farm.id]?.soil_nitrogen || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_nitrogen', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Phosphorus (kg/ha)</label>
                                            <input
                                                type="number"
                                                placeholder="22"
                                                value={formData[farm.id]?.soil_phosphorus || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_phosphorus', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Potassium (kg/ha)</label>
                                            <input
                                                type="number"
                                                placeholder="280"
                                                value={formData[farm.id]?.soil_potassium || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_potassium', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Moisture (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="25"
                                                value={formData[farm.id]?.soil_moisture || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_moisture', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Organic Carbon (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="0.5"
                                                value={formData[farm.id]?.soil_organic_carbon || ''}
                                                onChange={(e) => updateField(farm.id, 'soil_organic_carbon', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-xs font-medium text-muted-foreground">Expert Recommendations</label>
                                        <textarea
                                            placeholder="Enter your recommendations based on soil test results..."
                                            rows={3}
                                            value={formData[farm.id]?.recommendations || ''}
                                            onChange={(e) => updateField(farm.id, 'recommendations', e.target.value)}
                                            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => submitSoilReport.mutate(farm.id)}
                                        disabled={submitSoilReport.isPending}
                                        className="w-full"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {submitSoilReport.isPending ? 'Submitting...' : 'Submit Soil Report'}
                                    </Button>
                                </Card>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
        </DashboardShell>
    );
}
