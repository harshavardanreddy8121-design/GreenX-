/**
 * SoilSamplesSection
 * Shows soil sample counts broken down by status with progress cards.
 * Clickable cards navigate to the soil tab for details.
 */

import React from 'react';
import { TestTubes, FlaskConical, Microscope, CheckCircle2, Clock } from 'lucide-react';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import type { SoilSample } from '@/lib/api';

interface SoilSamplesSectionProps {
    samples: SoilSample[];
    loading: boolean;
    onViewSample?: (sampleId: string) => void;
    onViewAll?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    COLLECTED: {
        label: 'Collected',
        icon: <TestTubes size={18} />,
        color: 'var(--gx-gold)',
        bgColor: 'var(--gx-gold-dim)',
    },
    AT_LAB: {
        label: 'At Lab',
        icon: <FlaskConical size={18} />,
        color: 'var(--gx-blue, #3b82f6)',
        bgColor: 'rgba(59,130,246,0.1)',
    },
    TESTING: {
        label: 'Testing',
        icon: <Microscope size={18} />,
        color: 'var(--gx-orange, #f97316)',
        bgColor: 'rgba(249,115,22,0.1)',
    },
    COMPLETED: {
        label: 'Completed',
        icon: <CheckCircle2 size={18} />,
        color: 'var(--gx-green)',
        bgColor: 'var(--gx-green-dim)',
    },
    PENDING: {
        label: 'Pending',
        icon: <Clock size={18} />,
        color: 'var(--gx-text2)',
        bgColor: 'var(--gx-surface2)',
    },
};

export function SoilSamplesSection({
    samples,
    loading,
    onViewSample,
    onViewAll,
}: SoilSamplesSectionProps) {
    if (loading) return <CardSkeleton rows={4} />;

    // Group samples by status
    const byStatus = samples.reduce<Record<string, SoilSample[]>>((acc, s) => {
        const key = (s.status ?? 'PENDING').toUpperCase();
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const statusOrder = ['COLLECTED', 'AT_LAB', 'TESTING', 'COMPLETED', 'PENDING'];
    const displayStatuses = statusOrder.filter(
        s => byStatus[s]?.length > 0
    );

    return (
        <div className="gx-card">
            <div className="gx-card-header">
                <div className="gx-card-title">
                    <TestTubes className="inline-block w-4 h-4 mr-1 align-middle" />
                    Soil Sample Status
                </div>
                <span className="gx-status gx-s-pending">{samples.length} total</span>
            </div>
            <div className="gx-card-body">
                {samples.length === 0 ? (
                    <EmptyState
                        icon={<TestTubes size={40} strokeWidth={1.5} />}
                        title="No soil samples yet"
                        message="Samples will appear here once your field manager collects them."
                    />
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
                            {displayStatuses.map(status => {
                                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                                const count = byStatus[status]?.length ?? 0;
                                const pct = samples.length > 0 ? Math.round((count / samples.length) * 100) : 0;
                                return (
                                    <div
                                        key={status}
                                        style={{
                                            padding: '12px 14px',
                                            background: 'var(--gx-surface2)',
                                            borderRadius: 10,
                                            border: `1px solid var(--gx-border)`,
                                            cursor: onViewAll ? 'pointer' : 'default',
                                        }}
                                        onClick={onViewAll}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ color: cfg.color, background: cfg.bgColor, borderRadius: 6, padding: 4, display: 'flex' }}>
                                                {cfg.icon}
                                            </div>
                                            <span style={{ fontSize: 12, color: 'var(--gx-text2)', fontWeight: 500 }}>{cfg.label}</span>
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                                            {count}
                                        </div>
                                        <div style={{ marginTop: 6 }}>
                                            <div style={{ height: 3, background: 'var(--gx-border)', borderRadius: 2 }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                                            </div>
                                            <div style={{ fontSize: 10, color: 'var(--gx-text2)', marginTop: 3 }}>{pct}% of total</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent samples list */}
                        <div style={{ borderTop: '1px solid var(--gx-border)', paddingTop: 12 }}>
                            <div style={{ fontSize: 12, color: 'var(--gx-text2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Recent Samples
                            </div>
                            {samples.slice(0, 5).map(s => {
                                const cfg = STATUS_CONFIG[(s.status ?? 'PENDING').toUpperCase()] ?? STATUS_CONFIG.PENDING;
                                return (
                                    <div
                                        key={s.id}
                                        className="gx-activity-item"
                                        style={{ cursor: onViewSample ? 'pointer' : 'default' }}
                                        onClick={() => onViewSample?.(s.id)}
                                    >
                                        <div className="gx-act-icon" style={{ background: cfg.bgColor, color: cfg.color }}>
                                            {cfg.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="gx-act-text">
                                                <strong>{s.sampleCode || `Sample #${s.id.slice(-6)}`}</strong>
                                                {s.soilTexture ? ` · ${s.soilTexture}` : ''}
                                            </div>
                                            <div className="gx-act-time">
                                                {s.collectionDate
                                                    ? new Date(s.collectionDate).toLocaleDateString('en-IN')
                                                    : s.createdAt
                                                    ? new Date(s.createdAt).toLocaleDateString('en-IN')
                                                    : '—'}
                                                {s.collectorName ? ` · ${s.collectorName}` : ''}
                                            </div>
                                        </div>
                                        <span
                                            className="gx-status"
                                            style={{ background: cfg.bgColor, color: cfg.color, border: `1px solid ${cfg.color}` }}
                                        >
                                            {cfg.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {samples.length > 5 && onViewAll && (
                            <div className="gx-btn-row" style={{ marginTop: 10 }}>
                                <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onViewAll}>
                                    View all {samples.length} samples →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.4 }}>{icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13 }}>{message}</div>
        </div>
    );
}
