/**
 * OverviewSection
 * Stat cards showing total land area, input cost, soil samples, and farm count.
 * Pulls from the LandownerOverview API or falls back to derived values.
 */

import React from 'react';
import { Home, Leaf, TestTubes, Wallet } from 'lucide-react';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import type { LandownerOverview, Farm, SoilSample, FinanceSummary } from '@/lib/api';

interface OverviewSectionProps {
    overview: LandownerOverview | null;
    farms: Farm[];
    samples: SoilSample[];
    financeSummary: FinanceSummary | null;
    totalLandAcres: number;
    totalInputCost: number;
    loading: boolean;
}

export function OverviewSection({
    overview,
    farms,
    samples,
    financeSummary,
    totalLandAcres,
    totalInputCost,
    loading,
}: OverviewSectionProps) {
    if (loading) {
        return (
            <div className="gx-stats-row">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        );
    }

    const landAcres = overview?.totalLandAcres ?? totalLandAcres;
    const inputCost = overview?.totalInputCost ?? totalInputCost;
    const sampleCount = overview?.totalSoilSamples ?? samples.length;
    const farmCount = overview?.farmCount ?? farms.length;
    const activeFarms = overview?.activeFarms ?? farms.filter(f => f.status === 'ACTIVE' || f.status === 'active').length;
    const completedReports = overview?.completedReports ?? 0;

    return (
        <div className="gx-stats-row">
            <div className="gx-stat-card gold">
                <div className="gx-stat-icon"><Home size={20} /></div>
                <div className="gx-stat-label">Total Land Area</div>
                <div className="gx-stat-value">
                    {landAcres > 0 ? landAcres.toFixed(1) : '—'}
                    <span className="gx-stat-unit"> ac</span>
                </div>
                <div className="gx-stat-change gx-up">
                    ✓ {farmCount} farm{farmCount !== 1 ? 's' : ''} registered
                </div>
            </div>

            <div className="gx-stat-card green">
                <div className="gx-stat-icon"><Wallet size={20} /></div>
                <div className="gx-stat-label">Total Input Cost</div>
                <div className="gx-stat-value">
                    {inputCost > 0
                        ? `₹${(inputCost / 1000).toFixed(1)}K`
                        : '₹0'}
                </div>
                <div className="gx-stat-change gx-neutral">
                    {financeSummary?.costByType
                        ? `${Object.keys(financeSummary.costByType).length} categories`
                        : 'Season expenses'}
                </div>
            </div>

            <div className="gx-stat-card blue">
                <div className="gx-stat-icon"><TestTubes size={20} /></div>
                <div className="gx-stat-label">Soil Samples</div>
                <div className="gx-stat-value">{sampleCount}</div>
                <div className="gx-stat-change gx-neutral">
                    {completedReports > 0
                        ? `${completedReports} report${completedReports !== 1 ? 's' : ''} ready`
                        : 'Live tracking'}
                </div>
            </div>

            <div className="gx-stat-card orange">
                <div className="gx-stat-icon"><Leaf size={20} /></div>
                <div className="gx-stat-label">Active Farms</div>
                <div className="gx-stat-value">{activeFarms > 0 ? activeFarms : farmCount}</div>
                <div className="gx-stat-change gx-up">
                    ✓ Season in progress
                </div>
            </div>
        </div>
    );
}
