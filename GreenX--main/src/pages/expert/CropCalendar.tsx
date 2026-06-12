import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, Plus, Sprout } from 'lucide-react';
import CalendarDetailView from '@/components/calendar/CalendarDetailView';
import {
    useCreateCalendarWithPhases,
    useAddTask,
    useUpdateTask,
    useUpdateTaskStatus,
    useCalendarTasks,
    mergeTasksIntoCalendar,
} from '@/hooks/useCropCalendar';
import type { CalendarTask, TaskStatus } from '@/types/cropCalendar';

// ─── Common crop list ──────────────────────────────────────────────────────────

const COMMON_CROPS = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato',
    'Onion', 'Chickpea', 'Soybean', 'Groundnut', 'Mustard', 'Watermelon',
    'Cucumber', 'Chili', 'Turmeric', 'Ginger',
];

// ─── Create Calendar Form ─────────────────────────────────────────────────────

interface CreateFormProps {
    farms: any[];
    suggestions: any[];
    farmsLoading: boolean;
    suggestionsLoading: boolean;
    onCreated: () => void;
}

function CreateCalendarForm({
    farms,
    suggestions,
    farmsLoading,
    suggestionsLoading,
    onCreated,
}: CreateFormProps) {
    const [selectedCrop, setSelectedCrop] = useState('');
    const [cropName, setCropName] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [selectedSuggestionId, setSelectedSuggestionId] = useState('');
    const [season, setSeason] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [harvestDate, setHarvestDate] = useState('');

    const createCalendar = useCreateCalendarWithPhases();

    const effectiveCropName = selectedCrop === 'Other' ? cropName : selectedCrop;

    const handleCropSelect = (value: string) => {
        setSelectedCrop(value);
        if (value !== 'Other') setCropName('');
    };

    const handleSuggestionChange = (suggestionId: string) => {
        setSelectedSuggestionId(suggestionId);
        if (suggestionId) {
            const s = suggestions.find((s: any) => s.id === suggestionId);
            if (s) {
                const name = s.cropName || s.cropname || s.crop_name || '';
                const fid = s.farmId || s.farmid || s.farm_id || '';
                if (name) {
                    const matched = COMMON_CROPS.find(
                        (c) => c.toLowerCase() === name.toLowerCase()
                    );
                    if (matched) { setSelectedCrop(matched); setCropName(''); }
                    else { setSelectedCrop('Other'); setCropName(name); }
                }
                if (fid) setSelectedFarmId(fid);
            }
        }
    };

    const handleSubmit = () => {
        const finalCropName = effectiveCropName.trim();
        if (!finalCropName) {
            toast.error('Please select or enter a crop name.');
            return;
        }
        const farmId = selectedFarmId || farms[0]?.id || '';
        if (!farmId) { toast.error('Please select a farm.'); return; }
        if (!sowingDate) { toast.error('Sowing date is required to generate the full calendar.'); return; }
        if (!harvestDate) { toast.error('Harvest date is required to generate the full calendar.'); return; }
        if (harvestDate <= sowingDate) {
            toast.error('Harvest date must be after sowing date.');
            return;
        }

        createCalendar.mutate(
            {
                farmId,
                cropName: finalCropName,
                season: season.trim() || null,
                sowingDate,
                harvestDate,
                suggestionId: selectedSuggestionId || null,
            },
            { onSuccess: onCreated }
        );
    };

    const inputCls =
        'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

    return (
        <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Sprout className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">New Crop Calendar</h2>
            </div>

            <p className="text-xs text-muted-foreground -mt-2">
                Enter sowing and harvest dates to auto-generate all four phases with
                pre-filled tasks, schedules, and responsibilities.
            </p>

            {/* Crop Name */}
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Crop Name <span className="text-destructive">*</span>
                </label>
                <select
                    value={selectedCrop}
                    onChange={(e) => handleCropSelect(e.target.value)}
                    className={inputCls}
                >
                    <option value="">— Select a crop —</option>
                    {COMMON_CROPS.map((crop) => (
                        <option key={crop} value={crop}>{crop}</option>
                    ))}
                    <option value="Other">Other (enter custom crop name)</option>
                </select>
            </div>

            {selectedCrop === 'Other' && (
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Custom Crop Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        placeholder="Enter crop name…"
                        className={inputCls}
                        autoFocus
                    />
                </div>
            )}

            {/* Farm */}
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
                        className={inputCls}
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

            {/* Suggestion auto-fill */}
            {!suggestionsLoading && suggestions.length > 0 && (
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Use a Crop Suggestion (optional — auto-fills crop &amp; farm)
                    </label>
                    <select
                        value={selectedSuggestionId}
                        onChange={(e) => handleSuggestionChange(e.target.value)}
                        className={inputCls}
                    >
                        <option value="">— Select a suggestion —</option>
                        {suggestions.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.cropName || s.cropname || s.crop_name || 'Unknown crop'} — Farm{' '}
                                {s.farmId || s.farmid || s.farm_id}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Season + Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Season (optional)
                    </label>
                    <input
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        placeholder="e.g. Kharif 2024"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Sowing Date <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="date"
                        value={sowingDate}
                        onChange={(e) => setSowingDate(e.target.value)}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Harvest Date <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="date"
                        value={harvestDate}
                        onChange={(e) => setHarvestDate(e.target.value)}
                        className={inputCls}
                    />
                </div>
            </div>

            {/* Phase preview */}
            {sowingDate && harvestDate && harvestDate > sowingDate && (
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Auto-generated phases preview
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[
                            { label: '🌱 Pre-Sowing', desc: '45 days before sowing', tasks: 6 },
                            { label: '🌾 Sowing', desc: 'Sowing date ± 7 days', tasks: 6 },
                            { label: '🌿 Growth', desc: 'Sowing → Harvest', tasks: 9 },
                            { label: '🌾 Harvesting', desc: '7 days around harvest', tasks: 7 },
                        ].map((phase) => (
                            <div key={phase.label} className="p-2 rounded-lg bg-background border border-border">
                                <p className="font-medium text-foreground">{phase.label}</p>
                                <p className="text-muted-foreground mt-0.5">{phase.desc}</p>
                                <p className="text-primary font-semibold mt-1">{phase.tasks} tasks</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Total: <strong>28 tasks</strong> auto-scheduled with dates, assignments, and resources.
                    </p>
                </div>
            )}

            <Button
                onClick={handleSubmit}
                disabled={createCalendar.isPending || farmsLoading}
                className="w-full"
            >
                {createCalendar.isPending
                    ? 'Creating calendar with all phases…'
                    : 'Create & Publish Comprehensive Calendar'}
            </Button>
        </Card>
    );
}

// ─── Calendar list card ────────────────────────────────────────────────────────

function CalendarListCard({
    calendar,
    onSelect,
}: {
    calendar: any;
    onSelect: (id: string) => void;
}) {
    const cropName = calendar.cropName || calendar.cropname || calendar.crop_name || 'Crop';
    const farmId = calendar.farmId || calendar.farmid || calendar.farm_id || '—';
    const sowingDate = calendar.sowingDate || calendar.sowingdate || calendar.sowing_date;
    const harvestDate = calendar.harvestDate || calendar.harvestdate || calendar.harvest_date;
    const status = calendar.status || 'DRAFT';

    return (
        <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            onClick={() => onSelect(calendar.id)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{cropName}</p>
                        <Badge
                            variant={
                                status === 'PUBLISHED' || status === 'ACTIVE'
                                    ? 'default'
                                    : 'secondary'
                            }
                            className="text-xs"
                        >
                            {status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Farm: {farmId}
                        {calendar.season && ` · ${calendar.season}`}
                    </p>
                    {sowingDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                            🌱 {sowingDate} → 🌾 {harvestDate || '—'}
                        </p>
                    )}
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                    View Details
                </Button>
            </div>
        </Card>
    );
}

// ─── Calendar detail wrapper (loads tasks from API) ───────────────────────────

function CalendarDetailWrapper({
    calendar,
    onBack,
}: {
    calendar: any;
    onBack: () => void;
}) {
    const { data: apiTasks = [] } = useCalendarTasks(calendar.id);
    const addTask = useAddTask(calendar.id);
    const updateTask = useUpdateTask(calendar.id);
    const updateStatus = useUpdateTaskStatus(calendar.id);

    const calendarDetail = mergeTasksIntoCalendar(calendar, apiTasks);

    const handleStatusChange = (taskId: string, status: TaskStatus) => {
        updateStatus.mutate({ taskId, status });
    };

    const handleAddTask = (task: Omit<CalendarTask, 'id' | 'calendarId'>) => {
        addTask.mutate(task);
    };

    const handleEditTask = (taskId: string, updates: Partial<CalendarTask>) => {
        updateTask.mutate({ taskId, updates });
    };

    return (
        <div className="space-y-4">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to all calendars
            </button>

            <CalendarDetailView
                calendar={calendarDetail}
                onTaskStatusChange={handleStatusChange}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
            />
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CropCalendar() {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

    // Load farms
    const { data: farms = [], isLoading: farmsLoading } = useQuery({
        queryKey: ['expert-assigned-farms'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/farms', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    // Load suggestions
    const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
        queryKey: ['expert-crop-suggestions'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/crop-suggestions', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    // Load calendars
    const { data: calendars = [], isLoading: calendarsLoading } = useQuery({
        queryKey: ['expert-calendars'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/calendars', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const selectedCalendar = calendars.find((c: any) => c.id === selectedCalendarId);

    const handleSelectCalendar = (id: string) => {
        setSelectedCalendarId(id);
        setView('detail');
    };

    const handleCreated = () => {
        setView('list');
    };

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
                {/* Page header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <CalendarDays className="w-8 h-8 text-primary" />
                            Crop Calendar
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Comprehensive crop management — pre-sowing to post-harvest
                        </p>
                    </div>
                    {view === 'list' && (
                        <Button onClick={() => setView('create')} className="shrink-0">
                            <Plus className="w-4 h-4 mr-1" /> New Calendar
                        </Button>
                    )}
                    {view === 'create' && (
                        <Button
                            variant="outline"
                            onClick={() => setView('list')}
                            className="shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                    )}
                </div>

                {/* Create form */}
                {view === 'create' && (
                    <CreateCalendarForm
                        farms={farms}
                        suggestions={suggestions}
                        farmsLoading={farmsLoading}
                        suggestionsLoading={suggestionsLoading}
                        onCreated={handleCreated}
                    />
                )}

                {/* Calendar detail */}
                {view === 'detail' && selectedCalendar && (
                    <CalendarDetailWrapper
                        calendar={selectedCalendar}
                        onBack={() => setView('list')}
                    />
                )}

                {/* Calendar list */}
                {view === 'list' && (
                    <div className="space-y-3">
                        {calendarsLoading ? (
                            <Card className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                            </Card>
                        ) : calendars.length === 0 ? (
                            <Card className="p-10 text-center">
                                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                                <p className="text-muted-foreground font-medium">No calendars yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Create your first comprehensive crop calendar to get started.
                                </p>
                                <Button className="mt-4" onClick={() => setView('create')}>
                                    <Plus className="w-4 h-4 mr-1" /> Create First Calendar
                                </Button>
                            </Card>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {calendars.length} calendar{calendars.length > 1 ? 's' : ''} — click to view phases and tasks
                                </p>
                                {calendars.map((cal: any) => (
                                    <CalendarListCard
                                        key={cal.id}
                                        calendar={cal}
                                        onSelect={handleSelectCalendar}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
