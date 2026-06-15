/**
 * LatestReportsSection
 * Shows the latest soil reports (newest first) with farm name, date, status,
 * and expert name. Clickable rows open the full report detail.
 * Auto-refreshes every 30 s via the parent hook.
 */

import React from 'react';
import { FileText, TestTubes, User, Calendar, ChevronRight } from 'lucide-react';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import type { SoilReport } from '@/lib/api';

interface LatestReportsSectionProps {
    reports: SoilReport[];
    loading: boolean;
    onViewReport?: (reportId: string) => void;
    onViewAll?: () => void;
}

const RATING_COLOR: Record<string, string> = {
    EXCELLENT: 'var(--gx-green)',
    GOOD: 'var(--gx-green)',
    FAIR: 'var(--gx-gold)',
    POOR: 'var(--gx-red, #ef4444)',
};

export function LatestReportsSection({
    reports,
    loading,
    onViewReport,
    onViewAll,
}: LatestReportsSectionProps) {
    if (loading) return <CardSkeleton rows={4} />;

    // Sort newest first
    const sorted = [...reports].sort((a, b) => {
        const da = new Date(a.reportDate ?? a.createdAt ?? 0).getTime();
        const db = new Date(b.reportDate ?? b.createdAt ?? 0).getTime();
        return db - da;
    });

    return (
        <div className="gx-card">
            <div className="gx-card-header">
                <div className="gx-card-title">
                    <FileText className="inline-block w-4 h-4 mr-1 align-middle" />
                    Latest Soil Reports
                </div>
                <span className="gx-status gx-s-done">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="gx-card-body">
                {sorted.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.4 }}>
                            <TestTubes size={40} strokeWidth={1.5} />
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>No reports yet</div>
                        <div style={{ fontSize: 13 }}>
                            Soil reports will appear here once your expert submits analysis results.
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {sorted.slice(0, 6).map(report => {
                                const ratingColor = RATING_COLOR[(report.overallRating ?? '').toUpperCase()] ?? 'var(--gx-text2)';
                                const reportDate = report.reportDate ?? report.createdAt;
                                return (
                                    <div
                                        key={report.id}
                                        className="gx-activity-item"
                                        style={{
                                            cursor: onViewReport ? 'pointer' : 'default',
                                            borderRadius: 8,
                                            padding: '10px 8px',
                                            transition: 'background 0.15s',
                                        }}
                                        onClick={() => onViewReport?.(report.id)}
                                    >
                                        <div className="gx-act-icon" style={{ background: 'var(--gx-green-dim)', color: 'var(--gx-green)' }}>
                                            <TestTubes size={18} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="gx-act-text" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <strong style={{ fontSize: 13 }}>
                                                    Farm {report.farmId?.slice(-6) ?? '—'}
                                                </strong>
                                                {report.overallRating && (
                                                    <span style={{ fontSize: 11, color: ratingColor, fontWeight: 600 }}>
                                                        {report.overallRating}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="gx-act-time" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 3 }}>
                                                {reportDate && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <Calendar size={11} />
                                                        {new Date(reportDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                )}
                                                {report.expertId && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <User size={11} />
                                                        Expert #{report.expertId.slice(-4)}
                                                    </span>
                                                )}
                                                {report.phLevel != null && (
                                                    <span>pH {report.phLevel}</span>
                                                )}
                                            </div>
                                        </div>
                                        {onViewReport && (
                                            <ChevronRight size={16} style={{ color: 'var(--gx-text2)', flexShrink: 0 }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {sorted.length > 6 && onViewAll && (
                            <div className="gx-btn-row" style={{ marginTop: 10 }}>
                                <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onViewAll}>
                                    View all {sorted.length} reports →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
