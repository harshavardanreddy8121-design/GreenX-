import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

const COMMON_CROPS = [
    'Rice',
    'Wheat',
    'Maize',
    'Cotton',
    'Sugarcane',
    'Tomato',
    'Potato',
    'Onion',
    'Chickpea',
    'Soybean',
    'Groundnut',
    'Mustard',
    'Watermelon',
    'Cucumber',
    'Chili',
    'Turmeric',
    'Ginger',
];

export default function CropCalendar() {
    const queryClient = useQueryClient();

    // Crop selection: dropdown value + optional custom text when "Other" is chosen
    const [selectedCrop, setSelectedCrop] = useState('');
    const [cropName, setCropName] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [selectedSuggestionId, setSelectedSuggestionId] = useState('');
    const [season, setSeason] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [harvestDate, setHarvestDate] = useState('');

    // Load farms assigned to this expert
    const { data: farms = [], isLoading: farmsLoading } = useQuery({
        queryKey: ['expert-assigned-farms'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/farms', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    // Load crop suggestions (optional — form works without them)
    const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
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

    // Derive the effective crop name from dropdown + optional custom input
    const effectiveCropName = selectedCrop === 'Other' ? cropName : selectedCrop;

    // Handle crop dropdown change
    const handleCropSelect = (value: string) => {
        setSelectedCrop(value);
        if (value !== 'Other') setCropName('');
    };

    // When a suggestion is selected, auto-fill crop name and farm
    const handleSuggestionChange = (suggestionId: string) => {
        setSelectedSuggestionId(suggestionId);
        if (suggestionId) {
            const suggestion = suggestions.find((s: any) => s.id === suggestionId);
            if (suggestion) {
                const name = suggestion.cropName || suggestion.cropname || suggestion.crop_name || '';
                const fid = suggestion.farmId || suggestion.farmid || suggestion.farm_id || '';
                if (name) {
                    const matched = COMMON_CROPS.find(
                        (c) => c.toLowerCase() === name.toLowerCase()
                    );
                    if (matched) {
                        setSelectedCrop(matched);
                        setCropName('');
                    } else {
                        setSelectedCrop('Other');
                        setCropName(name);
                    }
                }
                if (fid) setSelectedFarmId(fid);
            }
        }
    };

    const isLoading = farmsLoading || suggestionsLoading;

    const createCalendar = useMutation({
        mutationFn: async () => {
            const finalCropName = effectiveCropName.trim();
            if (!finalCropName) {
                throw new Error('Please select a crop from the dropdown, or choose "Other" and enter a custom crop name.');
            }

            const farmId = selectedFarmId || farms[0]?.id || '';
            if (!farmId) {
                throw new Error('Please select a farm.');
            }

            const payload: Record<string, any> = {
                farmId,
                cropName: finalCropName,
                suggestionId: selectedSuggestionId || null,
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
            setSelectedCrop('');
            setCropName('');
            setSelectedFarmId('');
            setSelectedSuggestionId('');
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

                <Card className="p-4 space-y-4">
                    {/* Crop Name — dropdown with common crops + "Other" for custom entry */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Crop Name <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={selectedCrop}
                            onChange={(e) => handleCropSelect(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            <option value="">— Select a crop —</option>
                            {COMMON_CROPS.map((crop) => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                            <option value="Other">Other (enter custom crop name)</option>
                        </select>
                    </div>

                    {/* Custom crop name — shown only when "Other" is selected */}
                    {selectedCrop === 'Other' && (
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Custom Crop Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                value={cropName}
                                onChange={(e) => setCropName(e.target.value)}
                                placeholder="Enter crop name…"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Farm selection */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Farm <span className="text-destructive">*</span>
                        </label>
                        {farmsLoading ? (
                            <p className="text-xs text-muted-foreground py-2">Loading farms…</p>
                        ) : (
                            <select
                                value={selectedFarmId || farms[0]?.id || ''}
                                onChange={(e) => setSelectedFarmId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            >
                                {farms.length === 0 ? (
                                    <option value="">No farms assigned</option>
                                ) : (
                                    farms.map((farm: any) => (
                                        <option key={farm.id} value={farm.id}>
                                            {farm.name || farm.farm_code || farm.id}
                                        </option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>

                    {/* Optional: pick from existing suggestions to auto-fill */}
                    {suggestionsLoading ? (
                        <p className="text-xs text-muted-foreground">Loading suggestions…</p>
                    ) : suggestions.length > 0 ? (
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Use a Crop Suggestion (optional — auto-fills crop name &amp; farm)
                            </label>
                            <select
                                value={selectedSuggestionId}
                                onChange={(e) => handleSuggestionChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            >
                                <option value="">— Select a suggestion —</option>
                                {suggestions.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.cropName || s.cropname || s.crop_name || 'Unknown crop'} — Farm {s.farmId || s.farmid || s.farm_id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}

                    {/* Season, Sowing Date, Harvest Date (all optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Season (optional)</label>
                            <input
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                placeholder="e.g. Kharif 2024"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Sowing Date (optional)</label>
                            <input
                                type="date"
                                value={sowingDate}
                                onChange={(e) => setSowingDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Harvest Date (optional)</label>
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
                        disabled={createCalendar.isPending || isLoading}
                    >
                        {createCalendar.isPending ? 'Creating…' : isLoading ? 'Loading…' : 'Create & Publish Calendar'}
                    </Button>
                </Card>

                <div className="space-y-3">
                    {calendars.length === 0 && (
                        <p className="text-sm text-muted-foreground">No calendars created yet.</p>
                    )}
                    {calendars.map((cal: any) => (
                        <Card key={cal.id} className="p-4">
                            <p className="font-medium">{cal.cropName} — Farm {cal.farmId}</p>
                            <p className="text-sm text-muted-foreground">Season: {cal.season || '—'} | Status: {cal.status || 'DRAFT'}</p>
                            {cal.sowingDate ? (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sowing: {cal.sowingDate} → Harvest: {cal.harvestDate || '—'}
                                </p>
                            ) : null}
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
