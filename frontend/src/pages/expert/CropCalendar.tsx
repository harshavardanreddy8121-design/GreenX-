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
    const [selectedSuggestionId, setSelectedSuggestionId] = useState('');
    const [season, setSeason] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [harvestDate, setHarvestDate] = useState('');

    // Load crop suggestions so the expert can pick one (provides cropName + farmId)
    const { data: suggestions = [] } = useQuery({
        queryKey: ['expert-crop-suggestions'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/crop-suggestions', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    // Load existing calendars for display
    const { data: calendars = [] } = useQuery({
        queryKey: ['expert-calendars'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/calendars', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const selectedSuggestion = suggestions.find((s: any) => s.id === selectedSuggestionId) || suggestions[0];

    const createCalendar = useMutation({
        mutationFn: async () => {
            const suggestion = selectedSuggestion;

            // Validate cropName before sending — prevents the NOT NULL DB constraint error
            const cropName = suggestion?.cropname || suggestion?.crop_name || '';
            if (!cropName.trim()) {
                throw new Error('Crop name is required. Please select a valid crop suggestion.');
            }

            const farmId = suggestion?.farmid || suggestion?.farm_id || '';
            if (!farmId.trim()) {
                throw new Error('Farm ID is missing from the selected suggestion.');
            }

            const payload: Record<string, any> = {
                farmId,
                cropName: cropName.trim(),
                suggestionId: suggestion?.id || null,
                season: season.trim() || null,
            };
            if (sowingDate) payload.sowingDate = sowingDate;
            if (harvestDate) payload.harvestDate = harvestDate;

            const res = await javaApi.call<any>('/expert/calendars', 'POST', payload);
            if (!res.success) throw new Error(res.error || 'Failed to create calendar');

            const calendarId = res.data?.id;
            if (calendarId) {
                await javaApi.call(`/expert/calendars/${calendarId}/publish`, 'POST');
            }

            await emitWorkflowTrigger({
                farmId,
                eventKey: 'crop_calendar_published',
                triggeredBy: 'expert',
                note: 'Expert published crop calendar for field execution.',
            });

            return res.data;
        },
        onSuccess: () => {
            toast.success('Crop calendar created and published');
            setSeason('');
            setSowingDate('');
            setHarvestDate('');
            queryClient.invalidateQueries({ queryKey: ['expert-calendars'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create calendar'),
    });

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Crop Calendar</h1>
                    <p className="text-sm text-muted-foreground mt-1">Build weekly activity plan and publish to field manager</p>
                </div>

                <Card className="p-4 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Crop Suggestion *</label>
                        <select
                            value={selectedSuggestionId || suggestions[0]?.id || ''}
                            onChange={(e) => setSelectedSuggestionId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            {suggestions.length === 0 && (
                                <option value="">No crop suggestions available</option>
                            )}
                            {suggestions.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.cropname || s.crop_name || 'Unknown crop'} — Farm {s.farmid || s.farm_id}
                                </option>
                            ))}
                        </select>
                        {selectedSuggestion && !(selectedSuggestion.cropname || selectedSuggestion.crop_name) && (
                            <p className="text-xs text-destructive mt-1">
                                ⚠ Selected suggestion has no crop name — calendar cannot be saved.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Season</label>
                            <input
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                placeholder="e.g. Kharif 2024"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Sowing Date</label>
                            <input
                                type="date"
                                value={sowingDate}
                                onChange={(e) => setSowingDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Harvest Date</label>
                            <input
                                type="date"
                                value={harvestDate}
                                onChange={(e) => setHarvestDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => createCalendar.mutate()}
                        disabled={createCalendar.isPending || suggestions.length === 0}
                    >
                        {createCalendar.isPending ? 'Creating…' : 'Create & Publish Calendar'}
                    </Button>
                </Card>

                <div className="space-y-3">
                    {calendars.length === 0 && (
                        <p className="text-sm text-muted-foreground">No calendars created yet.</p>
                    )}
                    {calendars.map((cal: any) => (
                        <Card key={cal.id} className="p-4">
                            <p className="font-medium">{cal.cropname || cal.crop_name || 'Crop'} — Farm {cal.farmid || cal.farm_id}</p>
                            <p className="text-sm text-muted-foreground">Season: {cal.season || '—'} | Status: {cal.status || 'DRAFT'}</p>
                            {cal.sowingdate || cal.sowing_date ? (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sowing: {cal.sowingdate || cal.sowing_date} → Harvest: {cal.harvestdate || cal.harvest_date || '—'}
                                </p>
                            ) : null}
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
