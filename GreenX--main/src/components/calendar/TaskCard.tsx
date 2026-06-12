import { useState } from 'react';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Edit2,
    SkipForward,
    User,
    Wrench,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CalendarTask, TaskStatus } from '@/types/cropCalendar';
import { statusColor, priorityColor, roleLabel } from '@/types/cropCalendar';

interface TaskCardProps {
    task: CalendarTask;
    onStatusChange?: (taskId: string, status: TaskStatus) => void;
    onEdit?: (task: CalendarTask) => void;
    readonly?: boolean;
}

const TASK_TYPE_ICONS: Record<string, string> = {
    preparation: '🔧',
    sowing: '🌱',
    monitoring: '🔍',
    fertilization: '💊',
    irrigation: '💧',
    'pest-control': '🐛',
    'weed-control': '🌿',
    harvesting: '🌾',
    'post-harvest': '📦',
};

export default function TaskCard({ task, onStatusChange, onEdit, readonly = false }: TaskCardProps) {
    const [expanded, setExpanded] = useState(false);

    const isOverdue =
        task.status === 'pending' &&
        task.scheduledDate < new Date().toISOString().split('T')[0];

    return (
        <div
            className={`
                rounded-xl border bg-card transition-all
                ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-border'}
                ${task.status === 'completed' ? 'opacity-70' : ''}
            `}
        >
            {/* Header row */}
            <div className="flex items-start gap-3 p-3">
                {/* Task type icon */}
                <span className="text-xl mt-0.5 shrink-0">
                    {TASK_TYPE_ICONS[task.taskType] ?? '📋'}
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm leading-tight ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.name}
                        </p>
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground"
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(task.status)}`}>
                            {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                            {task.status === 'in-progress' && <Clock className="w-3 h-3" />}
                            {task.status === 'skipped' && <SkipForward className="w-3 h-3" />}
                            {task.status}
                        </span>

                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor(task.priority)}`}>
                            <Zap className="w-3 h-3" />
                            {task.priority}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {roleLabel(task.assignedTo)}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            📅 {task.scheduledDate}
                        </span>

                        {isOverdue && (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                Overdue
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                    <p className="text-sm text-muted-foreground">{task.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Resources</p>
                                <p className="text-muted-foreground">{task.resourcesNeeded || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium text-foreground">Duration</p>
                                <p className="text-muted-foreground">{task.expectedDurationHours}h</p>
                            </div>
                        </div>
                    </div>

                    {task.notes && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                            {task.notes}
                        </p>
                    )}

                    {/* Action buttons */}
                    {!readonly && onStatusChange && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {task.status === 'pending' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => onStatusChange(task.id, 'in-progress')}
                                >
                                    <Clock className="w-3 h-3 mr-1" /> Start
                                </Button>
                            )}
                            {(task.status === 'pending' || task.status === 'in-progress') && (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => onStatusChange(task.id, 'completed')}
                                >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                                </Button>
                            )}
                            {task.status !== 'skipped' && task.status !== 'completed' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-muted-foreground"
                                    onClick={() => onStatusChange(task.id, 'skipped')}
                                >
                                    <SkipForward className="w-3 h-3 mr-1" /> Skip
                                </Button>
                            )}
                            {onEdit && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => onEdit(task)}
                                >
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
