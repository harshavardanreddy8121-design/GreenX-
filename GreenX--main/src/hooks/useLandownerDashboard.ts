/**
 * useLandownerDashboard
 * Centralised data-fetching hook for the Landowner Dashboard.
 * All queries auto-refresh every 30 seconds so the UI stays live
 * when experts or field managers submit new data.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { landOwner } from '@/lib/api';
import type {
    Farm,
    SoilSample,
    SoilReport,
    CropSuggestion,
    FinanceSummary,
    LandownerOverview,
    SeasonalFinance,
} from '@/lib/api';

const REFRESH_INTERVAL = 30_000; // 30 seconds

export interface LandownerDashboardData {
    // Overview
    overview: LandownerOverview | null;
    overviewLoading: boolean;
    overviewError: Error | null;

    // Farms
    farms: Farm[];
    farmsLoading: boolean;
    farmsError: Error | null;

    // Soil samples
    samples: SoilSample[];
    samplesLoading: boolean;
    samplesError: Error | null;

    // Soil reports
    soilReports: SoilReport[];
    reportsLoading: boolean;
    reportsError: Error | null;

    // Crop suggestions
    cropSuggestions: CropSuggestion[];
    suggestionsLoading: boolean;
    suggestionsError: Error | null;

    // Finance
    financeSummary: FinanceSummary | null;
    financeLoading: boolean;
    financeError: Error | null;

    // Seasonal finance
    seasonalFinance: SeasonalFinance[];
    seasonalFinanceLoading: boolean;
    seasonalFinanceError: Error | null;

    // Derived helpers
    primaryFarm: Farm | null;
    totalLandAcres: number;
    totalInputCost: number;
    samplesByStatus: Record<string, number>;

    // Actions
    refetchAll: () => void;
}

export function useLandownerDashboard(userId: string | undefined): LandownerDashboardData {
    const queryClient = useQueryClient();

    // ── Overview ──────────────────────────────────────────────────────────────
    const {
        data: overview = null,
        isLoading: overviewLoading,
        error: overviewError,
    } = useQuery({
        queryKey: ['lo-overview', userId],
        queryFn: () => landOwner.getDashboardOverview(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
        // If the dedicated endpoint doesn't exist yet, swallow the error
        // gracefully — derived values from other queries will fill the gap.
        throwOnError: false,
    });

    // ── Farms ─────────────────────────────────────────────────────────────────
    const {
        data: farms = [],
        isLoading: farmsLoading,
        error: farmsError,
    } = useQuery({
        queryKey: ['lo-farms', userId],
        queryFn: () => landOwner.getFarms(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
    });

    // ── Soil Samples ──────────────────────────────────────────────────────────
    const {
        data: samples = [],
        isLoading: samplesLoading,
        error: samplesError,
    } = useQuery({
        queryKey: ['lo-samples', userId],
        queryFn: () => landOwner.getSamples(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
    });

    // ── Soil Reports ──────────────────────────────────────────────────────────
    const {
        data: soilReports = [],
        isLoading: reportsLoading,
        error: reportsError,
    } = useQuery({
        queryKey: ['lo-soil-reports', userId],
        queryFn: () => landOwner.getSoilReports(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
    });

    // ── Crop Suggestions ──────────────────────────────────────────────────────
    const {
        data: cropSuggestions = [],
        isLoading: suggestionsLoading,
        error: suggestionsError,
    } = useQuery({
        queryKey: ['lo-crop-suggestions', userId],
        queryFn: () => landOwner.getCropSuggestions(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
    });

    // ── Finance Summary ───────────────────────────────────────────────────────
    const {
        data: financeSummary = null,
        isLoading: financeLoading,
        error: financeError,
    } = useQuery({
        queryKey: ['lo-finance-summary', userId],
        queryFn: () => landOwner.getFinanceSummary(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
        throwOnError: false,
    });

    // ── Seasonal Finance ──────────────────────────────────────────────────────
    const {
        data: seasonalFinance = [],
        isLoading: seasonalFinanceLoading,
        error: seasonalFinanceError,
    } = useQuery({
        queryKey: ['lo-seasonal-finance', userId],
        queryFn: () => landOwner.getSeasonalFinance(),
        enabled: !!userId,
        refetchInterval: REFRESH_INTERVAL,
        retry: 2,
        throwOnError: false,
    });

    // ── Derived values ────────────────────────────────────────────────────────
    const primaryFarm: Farm | null = (farms as Farm[])[0] ?? null;

    const totalLandAcres = (farms as Farm[]).reduce(
        (sum, f) => sum + (f.totalLand ?? 0),
        0
    );

    const totalInputCost =
        (financeSummary as FinanceSummary | null)?.totalCosts ??
        (seasonalFinance as SeasonalFinance[]).reduce(
            (sum, sf) => sum + (sf.totalExpenses ?? 0),
            0
        );

    const samplesByStatus = (samples as SoilSample[]).reduce<Record<string, number>>(
        (acc, s) => {
            const key = (s.status ?? 'UNKNOWN').toUpperCase();
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        },
        {}
    );

    // ── Refetch all ───────────────────────────────────────────────────────────
    const refetchAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['lo-overview'] });
        queryClient.invalidateQueries({ queryKey: ['lo-farms'] });
        queryClient.invalidateQueries({ queryKey: ['lo-samples'] });
        queryClient.invalidateQueries({ queryKey: ['lo-soil-reports'] });
        queryClient.invalidateQueries({ queryKey: ['lo-crop-suggestions'] });
        queryClient.invalidateQueries({ queryKey: ['lo-finance-summary'] });
        queryClient.invalidateQueries({ queryKey: ['lo-seasonal-finance'] });
    }, [queryClient]);

    return {
        overview,
        overviewLoading,
        overviewError: overviewError as Error | null,

        farms: farms as Farm[],
        farmsLoading,
        farmsError: farmsError as Error | null,

        samples: samples as SoilSample[],
        samplesLoading,
        samplesError: samplesError as Error | null,

        soilReports: soilReports as SoilReport[],
        reportsLoading,
        reportsError: reportsError as Error | null,

        cropSuggestions: cropSuggestions as CropSuggestion[],
        suggestionsLoading,
        suggestionsError: suggestionsError as Error | null,

        financeSummary: financeSummary as FinanceSummary | null,
        financeLoading,
        financeError: financeError as Error | null,

        seasonalFinance: seasonalFinance as SeasonalFinance[],
        seasonalFinanceLoading,
        seasonalFinanceError: seasonalFinanceError as Error | null,

        primaryFarm,
        totalLandAcres,
        totalInputCost,
        samplesByStatus,

        refetchAll,
    };
}
