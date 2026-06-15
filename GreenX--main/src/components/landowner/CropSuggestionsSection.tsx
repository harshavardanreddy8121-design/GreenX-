/**
 * CropSuggestionsSection
 * Displays expert-approved crop suggestions with crop name, expected yield,
 * season, and expert info. Clickable to view full suggestion details.
 */

import React from 'react';
import { Wheat, Star, ChevronRight, Sprout, TrendingUp, DollarSign } from 'lucide-react';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import type { CropSuggestion } from '@/lib/api';

interface CropSuggestionsSectionProps {
    suggestions: CropSuggestion[];
    loading: boolean;
    onSelect?: (id: string) => void;
    onViewAll?: () => void;
    onViewDetail?: (id: string) => void;
    selectedSeason?: string;
}

const SEASON_COLORS: Record<string, string> = {
    Kharif: 'var(--gx-green)',
    Rabi: 'var(--gx-gold)',
    Zaid: 'var(--gx-blue, #3b82f6)',
};

export function CropSuggestionsSection({
    suggestions,
    loading,
    onSelect,
    onViewAll,
    onViewDetail,
    selectedSeason,
}: CropSuggestionsSectionProps) {
    if (loading) return <CardSkeleton rows={4} />;

    const filtered = selectedSeason
        ? suggestions.filter(s => s.season === selectedSeason)
        : suggestions;

    const seasons = Array.from(new Set(suggestions.map(s => s.season).filter(Boolean)));

    return (
        <div className="gx-card">
            <div className="gx-card-header">
                <div className="gx-card-title">
                    <Wheat className="inline-block w-4 h-4 mr-1 align-middle" />
                    Crop Suggestions
                </div>
                <span className="gx-status gx-s-pending">{suggestions.length} option{suggestions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="gx-card-body">
                {suggestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.4 }}>
                            <Wheat size={40} strokeWidth={1.5} />
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>No crop suggestions yet</div>
                        <div style={{ fontSize: 13 }}>
                            Your expert will submit crop recommendations after reviewing the soil report.
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Season filter pills */}
                        {seasons.length > 1 && (
                            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                                {seasons.map(season => (
                                    <span
                                        key={season}
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            background: SEASON_COLORS[season ?? ''] ? `${SEASON_COLORS[season ?? '']}22` : 'var(--gx-surface2)',
                                            color: SEASON_COLORS[season ?? ''] ?? 'var(--gx-text2)',
                                            border: `1px solid ${SEASON_COLORS[season ?? ''] ?? 'var(--gx-border)'}`,
                                        }}
                                    >
                                        {season}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filtered.slice(0, 4).map((s, i) => {
                                const isTop = i === 0;
                                const seasonColor = SEASON_COLORS[s.season ?? ''] ?? 'var(--gx-text2)';
                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            padding: '12px 14px',
                                            background: isTop ? 'var(--gx-green-dim)' : 'var(--gx-surface2)',
                                            borderRadius: 10,
                                            border: isTop ? '1px solid var(--gx-green)' : '1px solid var(--gx-border)',
                                            cursor: onViewDetail ? 'pointer' : 'default',
                                            transition: 'box-shadow 0.15s',
                                        }}
                                        onClick={() => onViewDetail?.(s.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    {isTop && <Star size={13} style={{ color: 'var(--gx-green)', flexShrink: 0 }} />}
                                                    <span style={{ fontWeight: 700, fontSize: 14, color: isTop ? 'var(--gx-green)' : 'var(--gx-text)' }}>
                                                        {s.cropName}
                                                        {s.cropVariety ? ` (${s.cropVariety})` : ''}
                                                    </span>
                                                    {s.season && (
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: seasonColor, background: `${seasonColor}22`, padding: '1px 7px', borderRadius: 10 }}>
                                                            {s.season}
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                                    {(s.expectedYieldMin != null || s.expectedYieldMax != null) && (
                                                        <span style={{ fontSize: 12, color: 'var(--gx-text2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <TrendingUp size={11} />
                                                            {s.expectedYieldMin ?? '—'}–{s.expectedYieldMax ?? '—'} {s.yieldUnit ?? 'T/ac'}
                                                        </span>
                                                    )}
                                                    {s.profitPerAcre != null && (
                                                        <span style={{ fontSize: 12, color: 'var(--gx-green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <DollarSign size={11} />
                                                            ₹{Number(s.profitPerAcre).toLocaleString()}/ac
                                                        </span>
                                                    )}
                                                    {s.suitabilityScore != null && (
                                                        <span style={{ fontSize: 12, color: 'var(--gx-gold)' }}>
                                                            ★ {s.suitabilityScore}/10
                                                        </span>
                                                    )}
                                                    {s.durationDays != null && (
                                                        <span style={{ fontSize: 12, color: 'var(--gx-text2)' }}>
                                                            {s.durationDays}d
                                                        </span>
                                                    )}
                                                </div>

                                                {s.expertNotes && (
                                                    <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 6, fontStyle: 'italic' }}>
                                                        "{s.expertNotes}"
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                                {s.isselected ? (
                                                    <span className="gx-status gx-s-done" style={{ fontSize: 11 }}>
                                                        ✓ Selected
                                                    </span>
                                                ) : onSelect ? (
                                                    <button
                                                        className={`gx-btn gx-btn-sm ${isTop ? 'gx-btn-primary' : 'gx-btn-ghost'}`}
                                                        onClick={e => { e.stopPropagation(); onSelect(s.id); }}
                                                    >
                                                        Select
                                                    </button>
                                                ) : null}
                                                {onViewDetail && (
                                                    <ChevronRight size={14} style={{ color: 'var(--gx-text2)' }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filtered.length > 4 && onViewAll && (
                            <div className="gx-btn-row" style={{ marginTop: 12 }}>
                                <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onViewAll}>
                                    View all {filtered.length} suggestions →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
