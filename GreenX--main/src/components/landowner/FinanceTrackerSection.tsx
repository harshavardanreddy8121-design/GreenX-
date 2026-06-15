/**
 * FinanceTrackerSection
 * Shows Total Investment, Expenses, Revenue, and Profit/Loss.
 * Fetches from seasonal_finance via the API and falls back to the
 * FinanceSummary endpoint. Updates dynamically when new data arrives.
 */

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import type { FinanceSummary, SeasonalFinance } from '@/lib/api';

interface FinanceTrackerSectionProps {
    financeSummary: FinanceSummary | null;
    seasonalFinance: SeasonalFinance[];
    loading: boolean;
    error: Error | null;
    onRetry?: () => void;
    onViewFull?: () => void;
}

function formatCurrency(value: number): string {
    if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
    return `₹${value.toLocaleString('en-IN')}`;
}

export function FinanceTrackerSection({
    financeSummary,
    seasonalFinance,
    loading,
    error,
    onRetry,
    onViewFull,
}: FinanceTrackerSectionProps) {
    if (loading) return <CardSkeleton rows={5} />;

    // Aggregate from seasonal finance records if available
    const totalInvestment = seasonalFinance.reduce((s, r) => s + (r.totalInvestment ?? 0), 0);
    const totalExpenses = seasonalFinance.reduce((s, r) => s + (r.totalExpenses ?? 0), 0);
    const totalRevenue = seasonalFinance.reduce((s, r) => s + (r.totalRevenue ?? 0), 0);
    const totalProfitLoss = seasonalFinance.reduce((s, r) => s + (r.profitLoss ?? 0), 0);

    // Fall back to FinanceSummary if seasonal data is empty
    const expenses = totalExpenses > 0 ? totalExpenses : (financeSummary?.totalCosts ?? 0);
    const investment = totalInvestment > 0 ? totalInvestment : expenses;
    const revenue = totalRevenue;
    const profitLoss = totalProfitLoss !== 0 ? totalProfitLoss : revenue - expenses;
    const isProfitable = profitLoss >= 0;

    // Group by season/year for the breakdown table
    const bySeason = seasonalFinance.reduce<Record<string, SeasonalFinance[]>>((acc, r) => {
        const key = `${r.season ?? 'Unknown'} ${r.year ?? ''}`.trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {});

    const hasData = expenses > 0 || revenue > 0 || seasonalFinance.length > 0;

    return (
        <div className="gx-card">
            <div className="gx-card-header">
                <div className="gx-card-title">
                    <Wallet className="inline-block w-4 h-4 mr-1 align-middle" />
                    Seasonal Finance Tracker
                </div>
                {error && onRetry && (
                    <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onRetry} style={{ fontSize: 11 }}>
                        <RefreshCw size={12} className="inline-block mr-1" /> Retry
                    </button>
                )}
            </div>
            <div className="gx-card-body">
                {!hasData && !error ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.4 }}>
                            <BarChart3 size={40} strokeWidth={1.5} />
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>No financial data yet</div>
                        <div style={{ fontSize: 13 }}>
                            Finance records will appear here once expenses and revenue are logged.
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Summary stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                            <FinanceStat
                                label="Total Investment"
                                value={formatCurrency(investment)}
                                icon={<DollarSign size={16} />}
                                color="var(--gx-gold)"
                                bg="var(--gx-gold-dim)"
                            />
                            <FinanceStat
                                label="Total Expenses"
                                value={formatCurrency(expenses)}
                                icon={<TrendingDown size={16} />}
                                color="var(--gx-red, #ef4444)"
                                bg="rgba(239,68,68,0.08)"
                            />
                            <FinanceStat
                                label="Total Revenue"
                                value={revenue > 0 ? formatCurrency(revenue) : '—'}
                                icon={<TrendingUp size={16} />}
                                color="var(--gx-green)"
                                bg="var(--gx-green-dim)"
                            />
                            <FinanceStat
                                label={isProfitable ? 'Net Profit' : 'Net Loss'}
                                value={revenue > 0 || profitLoss !== 0 ? formatCurrency(Math.abs(profitLoss)) : '—'}
                                icon={isProfitable ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                color={isProfitable ? 'var(--gx-green)' : 'var(--gx-red, #ef4444)'}
                                bg={isProfitable ? 'var(--gx-green-dim)' : 'rgba(239,68,68,0.08)'}
                                trend={revenue > 0 ? (isProfitable ? 'up' : 'down') : undefined}
                            />
                        </div>

                        {/* Budget progress bar */}
                        {investment > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div className="gx-progress-label">
                                    <span>Budget Used</span>
                                    <span>{formatCurrency(expenses)} / {formatCurrency(investment)}</span>
                                </div>
                                <div className="gx-progress-bar">
                                    <div
                                        className="gx-progress-fill"
                                        style={{
                                            width: `${Math.min((expenses / investment) * 100, 100)}%`,
                                            background: expenses > investment ? 'var(--gx-red, #ef4444)' : 'var(--gx-gold)',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cost breakdown by type */}
                        {financeSummary?.costByType && Object.keys(financeSummary.costByType).length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: 'var(--gx-text2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Cost Breakdown
                                </div>
                                {Object.entries(financeSummary.costByType).map(([type, amount]) => (
                                    <div key={type} className="gx-metric-row">
                                        <span className="gx-metric-label">{type}</span>
                                        <span className="gx-metric-value">{formatCurrency(Number(amount))}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Season breakdown */}
                        {Object.keys(bySeason).length > 0 && (
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--gx-text2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    By Season
                                </div>
                                {Object.entries(bySeason).map(([season, records]) => {
                                    const sExp = records.reduce((s, r) => s + (r.totalExpenses ?? 0), 0);
                                    const sRev = records.reduce((s, r) => s + (r.totalRevenue ?? 0), 0);
                                    const sPL = records.reduce((s, r) => s + (r.profitLoss ?? 0), 0);
                                    return (
                                        <div key={season} style={{ padding: '8px 0', borderBottom: '1px solid var(--gx-border)' }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{season}</div>
                                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gx-text2)' }}>
                                                <span>Exp: {formatCurrency(sExp)}</span>
                                                {sRev > 0 && <span>Rev: {formatCurrency(sRev)}</span>}
                                                {(sPL !== 0 || sRev > 0) && (
                                                    <span style={{ color: sPL >= 0 ? 'var(--gx-green)' : 'var(--gx-red, #ef4444)', fontWeight: 600 }}>
                                                        {sPL >= 0 ? '+' : ''}{formatCurrency(sPL)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {onViewFull && (
                            <div className="gx-btn-row" style={{ marginTop: 14 }}>
                                <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={onViewFull}>
                                    View Full Finance Report →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function FinanceStat({
    label,
    value,
    icon,
    color,
    bg,
    trend,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    trend?: 'up' | 'down';
}) {
    return (
        <div style={{
            padding: '10px 12px',
            background: bg,
            borderRadius: 8,
            border: `1px solid ${color}33`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color }}>{icon}</span>
                <span style={{ fontSize: 11, color: 'var(--gx-text2)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
            </div>
        </div>
    );
}
