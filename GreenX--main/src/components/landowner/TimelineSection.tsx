/**
 * TimelineSection
 * Visual 5-stage soil sample timeline:
 * Requested → Collected → Lab Testing → Report Generated → Delivered
 * Color-coded by stage status (pending / in-progress / completed).
 * Fetches per-sample timeline from the API when a sampleId is provided,
 * otherwise derives the stage from the sample's status field.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { landOwner } from '@/lib/api';
import type { SoilSample, SampleTimelineStage } from '@/lib/api';

interface TimelineSectionProps {
    sample: SoilSample | null;
    /** If true, fetch the detailed timeline from the API */
    fetchTimeline?: boolean;
}

const STAGES: { key: string; label: string }[] = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'COLLECTED', label: 'Collected' },
    { key: 'AT_LAB', label: 'Lab Testing' },
    { key: 'REPORT_GENERATED', label: 'Report Generated' },
    { key: 'DELIVERED', label: 'Delivered' },
];

/** Map a sample status string to the furthest completed stage index */
function statusToStageIndex(status: string): number {
    const s = (status ?? '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
    if (s === 'REPORT_GENERATED') return 3;
    if (s === 'AT_LAB' || s === 'TESTING') return 2;
    if (s === 'COLLECTED') return 1;
    return 0; // REQUESTED / PENDING
}

function deriveStages(sample: SoilSample): SampleTimelineStage[] {
    const currentIdx = statusToStageIndex(sample.status);
    return STAGES.map((stage, i) => ({
        stage: stage.key,
        label: stage.label,
        status: i < currentIdx ? 'completed' : i === currentIdx ? 'in-progress' : 'pending',
        date:
            i === 0
                ? sample.createdAt
                : i === 1
                ? sample.collectionDate
                : undefined,
    }));
}

export function TimelineSection({ sample, fetchTimeline = false }: TimelineSectionProps) {
    const { data: apiStages, isLoading } = useQuery({
        queryKey: ['lo-sample-timeline', sample?.id],
        queryFn: () => landOwner.getSampleTimeline(sample!.id),
        enabled: !!sample?.id && fetchTimeline,
        retry: 1,
        throwOnError: false,
    });

    if (!sample) {
        return (
            <div className="gx-card">
                <div className="gx-card-header">
                    <div className="gx-card-title">
                        <Clock className="inline-block w-4 h-4 mr-1 align-middle" />
                        Sample Timeline
                    </div>
                </div>
                <div className="gx-card-body">
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>
                        Select a sample to view its timeline.
                    </div>
                </div>
            </div>
        );
    }

    const stages: SampleTimelineStage[] =
        (apiStages && Array.isArray(apiStages) && apiStages.length > 0)
            ? apiStages
            : deriveStages(sample);

    return (
        <div className="gx-card">
            <div className="gx-card-header">
                <div className="gx-card-title">
                    <Clock className="inline-block w-4 h-4 mr-1 align-middle" />
                    Sample Timeline
                </div>
                <span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>
                    {sample.sampleCode ?? `#${sample.id.slice(-6)}`}
                </span>
            </div>
            <div className="gx-card-body">
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--gx-text2)' }} />
                    </div>
                ) : (
                    <div style={{ position: 'relative', paddingLeft: 28 }}>
                        {/* Vertical connector line */}
                        <div style={{
                            position: 'absolute',
                            left: 10,
                            top: 12,
                            bottom: 12,
                            width: 2,
                            background: 'var(--gx-border)',
                            borderRadius: 1,
                        }} />

                        {stages.map((stage, i) => {
                            const isCompleted = stage.status === 'completed';
                            const isActive = stage.status === 'in-progress';
                            const isPending = stage.status === 'pending';

                            const dotColor = isCompleted
                                ? 'var(--gx-green)'
                                : isActive
                                ? 'var(--gx-gold)'
                                : 'var(--gx-border)';

                            const labelColor = isCompleted
                                ? 'var(--gx-text)'
                                : isActive
                                ? 'var(--gx-gold)'
                                : 'var(--gx-text2)';

                            return (
                                <div
                                    key={stage.stage}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        marginBottom: i < stages.length - 1 ? 20 : 0,
                                        position: 'relative',
                                    }}
                                >
                                    {/* Stage dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: -28,
                                        top: 2,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        background: isCompleted ? 'var(--gx-green)' : isActive ? 'var(--gx-gold)' : 'var(--gx-surface2)',
                                        border: `2px solid ${dotColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1,
                                    }}>
                                        {isCompleted ? (
                                            <CheckCircle2 size={12} style={{ color: '#fff' }} />
                                        ) : isActive ? (
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gx-gold)' }} />
                                        ) : (
                                            <Circle size={10} style={{ color: 'var(--gx-border)' }} />
                                        )}
                                    </div>

                                    {/* Stage content */}
                                    <div>
                                        <div style={{ fontWeight: isActive ? 700 : 500, fontSize: 13, color: labelColor }}>
                                            {stage.label}
                                            {isActive && (
                                                <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--gx-gold-dim)', color: 'var(--gx-gold)', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                        {stage.date && (
                                            <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 2 }}>
                                                {new Date(stage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        )}
                                        {stage.notes && (
                                            <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 2, fontStyle: 'italic' }}>
                                                {stage.notes}
                                            </div>
                                        )}
                                        {isPending && (
                                            <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 2 }}>
                                                Pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
