import { useState } from 'react';
import { Plus, Bell, CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PhaseTimeline from './PhaseTimeline';
import TaskCard from './TaskCard';
import AddTaskDialog from './AddTaskDialog';
import type { CropCalendarDetail, CalendarTask, TaskStatus, PhaseType } from '@/types/cropCalendar';
import { phaseLabel } from '@/types/cropCalendar';

interface CalendarDetailViewProps {
    calendar: CropCalendarDetail;
    onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
    onAddTask: (task: Omit<CalendarTask, 'id' | 'calendarId'>) => void;
    onEditTask: (taskId: string, updates: Partial<CalendarTask>) => void;
}

function UpcomingTasksBanner({ phases }: { phases: CropCalendarDetail['phases'] }) {
    const today = new Date().toISOString().split('T')[0];
    const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const upcoming = phases
        .flatMap((p) => p.tasks)
        .filter(
            (t) =>
                t.status === 'pending' &&
                t.scheduledDate >= today &&
                t.scheduledDate <= in7Days
        )
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    const overdue = phases
        .flatMap((p) => p.tasks)
        .filter((t) => t.status === 'pending' && t.scheduledDate < today);

    if (upcoming.length === 0 && overdue.length === 0) return null;

    return (
        <div className="space-y-2">
            {overdue.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            {overdue.length} overdue task{overdue.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                            {overdue.map((t) => t.name).join(' · ')}
                        </p>
                    </div>
                </div>
            )}
            {upcoming.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-800">
                            {upcoming.length} task{upcoming.length > 1 ? 's' : ''} due in the next 7 days
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            {upcoming.map((t) => `${t.name} (${t.scheduledDate})`).join(' · ')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProgressSummary({ phases }: { phases: CropCalendarDetail['phases'] }) {
    const allTasks = phases.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === 'completed').length;
    const inProgress = allTasks.filter((t) => t.status === 'in-progress').length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Overall Progress</h3>
                <span className="ml-auto text-sm font-bold text-primary">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-lg font-bold text-green-700">{completed}</p>
                    <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-lg font-bold text-blue-700">{inProgress}</p>
                    <p className="text-xs text-blue-600">In Progress</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">{pending}</p>
                    <p className="text-xs text-amber-600">Pending</p>
                </div>
            </div>
        </Card>
    );
}

export default function CalendarDetailView({
    calendar,
    onTaskStatusChange,
    onAddTask,
    onEditTask,
}: CalendarDetailViewProps) {
    const [activePhase, setActivePhase] = useState<string>(
        calendar.phases[0]?.phaseType ?? 'pre-sowing'
    );
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);

    const currentPhase = calendar.phases.find((p) => p.phaseType === activePhase);

    const handleEditTask = (task: CalendarTask) => {
        setEditingTask(task);
        setAddDialogOpen(true);
    };

    const handleSaveTask = (taskData: Omit<CalendarTask, 'id' | 'calendarId'>) => {
        if (editingTask) {
            onEditTask(editingTask.id, taskData);
        } else {
            onAddTask(taskData);
        }
        setEditingTask(null);
    };

    const handleCloseDialog = () => {
        setAddDialogOpen(false);
        setEditingTask(null);
    };

    return (
        <div className="space-y-5">
            {/* Calendar header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-foreground">{calendar.cropName}</h2>
                        <Badge
                            variant={calendar.status === 'PUBLISHED' || calendar.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {calendar.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Farm: {calendar.farmName || calendar.farmId}
                        {calendar.season && ` · ${calendar.season}`}
                    </p>
                    {calendar.sowingDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            🌱 Sowing: {calendar.sowingDate}
                            {calendar.harvestDate && ` → 🌾 Harvest: ${calendar.harvestDate}`}
                        </p>
                    )}
                </div>
                <Button
                    size="sm"
                    onClick={() => setAddDialogOpen(true)}
                    className="shrink-0"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                </Button>
            </div>

            {/* Notifications */}
            <UpcomingTasksBanner phases={calendar.phases} />

            {/* Progress summary */}
            <ProgressSummary phases={calendar.phases} />

            {/* Phase timeline */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Phases
                </h3>
                <PhaseTimeline
                    phases={calendar.phases}
                    activePhase={activePhase}
                    onSelectPhase={setActivePhase}
                />
            </div>

            {/* Task list for selected phase */}
            {currentPhase && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">
                            {phaseLabel(currentPhase.phaseType as PhaseType)} Tasks
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                ({currentPhase.tasks.length} tasks)
                            </span>
                        </h3>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setAddDialogOpen(true)}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add to Phase
                        </Button>
                    </div>

                    {currentPhase.tasks.length === 0 ? (
                        <Card className="p-6 text-center text-muted-foreground">
                            <p className="text-sm">No tasks in this phase yet.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-3"
                                onClick={() => setAddDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add First Task
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {currentPhase.tasks
                                .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
                                .map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onStatusChange={onTaskStatusChange}
                                        onEdit={handleEditTask}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit task dialog */}
            <AddTaskDialog
                open={addDialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveTask}
                defaultPhase={activePhase as PhaseType}
                editTask={editingTask}
            />
        </div>
    );
}
