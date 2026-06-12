import { CheckCircle2, Circle, Clock, SkipForward } from 'lucide-react';
import type { CalendarPhase, TaskStatus } from '@/types/cropCalendar';
import { phaseColor } from '@/types/cropCalendar';

interface PhaseTimelineProps {
    phases: CalendarPhase[];
    activePhase: string | null;
    onSelectPhase: (phase: string) => void;
}

function completionStats(tasks: CalendarPhase['tasks']) {
    if (tasks.length === 0) return { done: 0, total: 0, pct: 0 };
    const done = tasks.filter((t) => t.status === 'completed').length;
    return { done, total: tasks.length, pct: Math.round((done / tasks.length) * 100) };
}

const PHASE_ICONS: Record<string, string> = {
    'pre-sowing': '🌱',
    sowing: '🌾',
    growth: '🌿',
    harvesting: '🌾',
};

const PHASE_BG: Record<string, string> = {
    'pre-sowing': 'from-amber-50 to-yellow-50 border-amber-200',
    sowing: 'from-green-50 to-emerald-50 border-green-200',
    growth: 'from-blue-50 to-cyan-50 border-blue-200',
    harvesting: 'from-orange-50 to-red-50 border-orange-200',
};

const PHASE_ACTIVE: Record<string, string> = {
    'pre-sowing': 'ring-2 ring-amber-400',
    sowing: 'ring-2 ring-green-400',
    growth: 'ring-2 ring-blue-400',
    harvesting: 'ring-2 ring-orange-400',
};

const PHASE_BAR: Record<string, string> = {
    'pre-sowing': 'bg-amber-400',
    sowing: 'bg-green-500',
    growth: 'bg-blue-500',
    harvesting: 'bg-orange-500',
};

function StatusIcon({ status }: { status: TaskStatus }) {
    if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
    if (status === 'in-progress') return <Clock className="w-3.5 h-3.5 text-blue-600" />;
    if (status === 'skipped') return <SkipForward className="w-3.5 h-3.5 text-gray-400" />;
    return <Circle className="w-3.5 h-3.5 text-gray-300" />;
}

export default function PhaseTimeline({ phases, activePhase, onSelectPhase }: PhaseTimelineProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {phases.map((phase, idx) => {
                const { done, total, pct } = completionStats(phase.tasks);
                const isActive = activePhase === phase.phaseType;
                const color = phaseColor(phase.phaseType);

                return (
                    <button
                        key={phase.phaseType}
                        onClick={() => onSelectPhase(phase.phaseType)}
                        className={`
                            relative text-left p-4 rounded-xl border bg-gradient-to-br transition-all
                            hover:shadow-md cursor-pointer
                            ${PHASE_BG[phase.phaseType]}
                            ${isActive ? PHASE_ACTIVE[phase.phaseType] : ''}
                        `}
                    >
                        {/* Phase number badge */}
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {idx + 1}
                        </span>

                        <div className="text-2xl mb-2">{PHASE_ICONS[phase.phaseType]}</div>
                        <p className="font-semibold text-sm text-foreground leading-tight">{phase.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {phase.startDate} → {phase.endDate}
                        </p>

                        {/* Task mini-list */}
                        <div className="mt-2 space-y-0.5">
                            {phase.tasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center gap-1.5">
                                    <StatusIcon status={task.status} />
                                    <span className="text-xs text-muted-foreground truncate">{task.name}</span>
                                </div>
                            ))}
                            {phase.tasks.length > 3 && (
                                <p className="text-xs text-muted-foreground pl-5">
                                    +{phase.tasks.length - 3} more
                                </p>
                            )}
                        </div>

                        {/* Progress bar */}
                        {total > 0 && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>{done}/{total} tasks</span>
                                    <span>{pct}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${PHASE_BAR[phase.phaseType]}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
