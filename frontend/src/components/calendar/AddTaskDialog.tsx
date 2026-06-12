import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type {
    CalendarTask,
    PhaseType,
    TaskType,
    TaskPriority,
    AssignedRole,
} from '@/types/cropCalendar';

interface AddTaskDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (task: Omit<CalendarTask, 'id' | 'calendarId'>) => void;
    defaultPhase?: PhaseType;
    editTask?: CalendarTask | null;
}

const PHASE_OPTIONS: { value: PhaseType; label: string }[] = [
    { value: 'pre-sowing', label: 'Pre-Sowing' },
    { value: 'sowing', label: 'Sowing' },
    { value: 'growth', label: 'Growth Monitoring' },
    { value: 'harvesting', label: 'Harvesting' },
];

const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
    { value: 'preparation', label: 'Preparation' },
    { value: 'sowing', label: 'Sowing' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'fertilization', label: 'Fertilization' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'pest-control', label: 'Pest Control' },
    { value: 'weed-control', label: 'Weed Control' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'post-harvest', label: 'Post-Harvest' },
];

const ROLE_OPTIONS: { value: AssignedRole; label: string }[] = [
    { value: 'expert', label: 'Expert' },
    { value: 'field_manager', label: 'Field Manager' },
    { value: 'worker', label: 'Worker' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const inputCls =
    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddTaskDialog({
    open,
    onClose,
    onSave,
    defaultPhase = 'growth',
    editTask,
}: AddTaskDialogProps) {
    const [form, setForm] = useState<{
        phaseType: PhaseType;
        taskType: TaskType;
        name: string;
        description: string;
        scheduledDate: string;
        assignedTo: AssignedRole;
        priority: TaskPriority;
        resourcesNeeded: string;
        expectedDurationHours: number;
        notes: string;
    }>({
        phaseType: editTask?.phaseType ?? defaultPhase,
        taskType: editTask?.taskType ?? 'monitoring',
        name: editTask?.name ?? '',
        description: editTask?.description ?? '',
        scheduledDate: editTask?.scheduledDate ?? new Date().toISOString().split('T')[0],
        assignedTo: editTask?.assignedTo ?? 'field_manager',
        priority: editTask?.priority ?? 'medium',
        resourcesNeeded: editTask?.resourcesNeeded ?? '',
        expectedDurationHours: editTask?.expectedDurationHours ?? 2,
        notes: editTask?.notes ?? '',
    });

    const set = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = () => {
        if (!form.name.trim()) return;
        onSave({
            phaseType: form.phaseType,
            taskType: form.taskType,
            name: form.name.trim(),
            description: form.description.trim(),
            scheduledDate: form.scheduledDate,
            assignedTo: form.assignedTo,
            status: editTask?.status ?? 'pending',
            priority: form.priority,
            resourcesNeeded: form.resourcesNeeded.trim(),
            expectedDurationHours: Number(form.expectedDurationHours) || 1,
            completedAt: editTask?.completedAt ?? null,
            notes: form.notes.trim() || null,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {/* Phase */}
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Phase</Label>
                        <select
                            value={form.phaseType}
                            onChange={(e) => set('phaseType', e.target.value)}
                            className={inputCls}
                        >
                            {PHASE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Task name */}
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                            Task Name <span className="text-destructive">*</span>
                        </Label>
                        <input
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Apply fungicide spray"
                            className={inputCls}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={2}
                            placeholder="Detailed instructions for this task"
                            className={inputCls}
                        />
                    </div>

                    {/* Task type + Scheduled date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Task Type</Label>
                            <select
                                value={form.taskType}
                                onChange={(e) => set('taskType', e.target.value)}
                                className={inputCls}
                            >
                                {TASK_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Scheduled Date</Label>
                            <input
                                type="date"
                                value={form.scheduledDate}
                                onChange={(e) => set('scheduledDate', e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Assigned to + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Assigned To</Label>
                            <select
                                value={form.assignedTo}
                                onChange={(e) => set('assignedTo', e.target.value)}
                                className={inputCls}
                            >
                                {ROLE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
                            <select
                                value={form.priority}
                                onChange={(e) => set('priority', e.target.value)}
                                className={inputCls}
                            >
                                {PRIORITY_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Resources + Duration */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Resources Needed</Label>
                            <input
                                value={form.resourcesNeeded}
                                onChange={(e) => set('resourcesNeeded', e.target.value)}
                                placeholder="e.g. Sprayer, fungicide"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Duration (hours)</Label>
                            <input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={form.expectedDurationHours}
                                onChange={(e) => set('expectedDurationHours', e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</Label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            rows={2}
                            placeholder="Any additional notes or observations"
                            className={inputCls}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!form.name.trim()}>
                        {editTask ? 'Save Changes' : 'Add Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
