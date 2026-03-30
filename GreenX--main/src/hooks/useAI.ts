/**
 * useAI — React hook for the GreenX AI Agent.
 * Provides: analyze(), ask(), recommendations state, auto-analyze on data changes.
 */
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    aiAnalyze,
    analyzeSoilReport,
    analyzePestAlert,
    analyzeOperation,
    recommendCrops,
    askAI,
    type AiRecommendation,
    type AnalysisType,
    type SoilInput,
    type PestInput,
    type OperationInput,
} from '@/ai/aiAgent';

export function useAI() {
    const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const addRecommendation = useCallback((rec: AiRecommendation) => {
        setRecommendations(prev => [rec, ...prev].slice(0, 50)); // keep last 50
    }, []);

    const clearRecommendations = useCallback(() => setRecommendations([]), []);

    const analyze = useCallback(
        (type: AnalysisType, data: any): AiRecommendation => {
            setIsAnalyzing(true);
            try {
                const result = aiAnalyze(type, data);
                addRecommendation(result);
                return result;
            } finally {
                setIsAnalyzing(false);
            }
        },
        [addRecommendation],
    );

    const analyzeSoil = useCallback(
        (input: SoilInput) => {
            const r = analyzeSoilReport(input);
            addRecommendation(r);
            return r;
        },
        [addRecommendation],
    );

    const analyzePest = useCallback(
        (input: PestInput) => {
            const r = analyzePestAlert(input);
            addRecommendation(r);
            return r;
        },
        [addRecommendation],
    );

    const analyzeOp = useCallback(
        (input: OperationInput) => {
            const r = analyzeOperation(input);
            addRecommendation(r);
            return r;
        },
        [addRecommendation],
    );

    const getCropRecs = useCallback(
        (input: { region?: string; season?: string; soilType?: string; ph?: number }) => {
            const r = recommendCrops(input);
            addRecommendation(r);
            return r;
        },
        [addRecommendation],
    );

    const ask = useCallback(
        (question: string) => {
            const r = askAI(question);
            addRecommendation(r);
            return r;
        },
        [addRecommendation],
    );

    return {
        recommendations,
        isAnalyzing,
        analyze,
        analyzeSoil,
        analyzePest,
        analyzeOp,
        getCropRecs,
        ask,
        clearRecommendations,
        addRecommendation,
    };
}
