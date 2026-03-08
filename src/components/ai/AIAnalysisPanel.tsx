import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { javaApi } from '@/integrations/java-api/client';
import { CropHealthCard } from './CropHealthCard';
import { AlertsPanel } from './AlertsPanel';
import { HealthCharts } from './HealthCharts';
import { RecommendationsPanel } from './RecommendationsPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIAnalysisPanelProps {
    farmId: string;
    farmData?: Record<string, any>;
    onDataLoaded?: (data: any) => void;
}

export function AIAnalysisPanel(props: AIAnalysisPanelProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: analysis, isLoading, error, refetch } = useQuery({
        queryKey: ['ai-analysis', props.farmId],
        queryFn: async () => {
            if (!props.farmData) return null;

            const response = await javaApi.call<any>(
                '/api/ai/analyze',
                'POST',
                props.farmData
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to analyze farm');
            }

            return response.data;
        },
        enabled: !!props.farmData && !!props.farmId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    });

    if (error) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Analysis Error</h3>
                <p className="text-sm text-red-700 mb-4">{(error as Error).message}</p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                    Retry
                </Button>
            </Card>
        );
    }

    if (isLoading || !analysis) {
        return (
            <Card className="p-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Analyzing farm data...</p>
                </div>
            </Card>
        );
    }

    const health = analysis.health || {};
    const alerts = analysis.alerts || [];
    const recommendations = analysis.recommendations || [];
    const summary = analysis.summary || {};

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Overall Health</p>
                    <p className="text-3xl font-bold text-blue-600">{summary.overallHealth || 0}/100</p>
                    <p className="text-xs text-blue-700 mt-1">Status: {summary.overallHealth >= 80 ? '✅ Excellent' : summary.overallHealth >= 60 ? '✅ Good' : '⚠️ needs attention'}</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                    <p className="text-3xl font-bold text-orange-600">{alerts.length}</p>
                    <p className="text-xs text-orange-700 mt-1">
                        Risk: {(summary.riskLevel || 'medium').toUpperCase()}
                    </p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Recommendations</p>
                    <p className="text-3xl font-bold text-green-600">{recommendations.length}</p>
                    <p className="text-xs text-green-700 mt-1">AI-Powered Actions</p>
                </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Health</TabsTrigger>
                    <TabsTrigger value="charts">Analytics</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="recommendations">Tips</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <CropHealthCard
                        overallScore={health.overallScore || 0}
                        status={health.status || 'Unknown'}
                        color={health.color || 'gray'}
                        metrics={health.metrics || {
                            soilHealth: { name: 'Soil', score: 0, status: 'Unknown', color: 'gray' },
                            nutrients: { name: 'Nutrients', score: 0, status: 'Unknown', color: 'gray' },
                            moisture: { name: 'Moisture', score: 0, status: 'Unknown', color: 'gray' },
                            stemAndRoot: { name: 'Stem & Root', score: 0, status: 'Unknown', color: 'gray' },
                            disease: { name: 'Disease Resistance', score: 0, status: 'Unknown', color: 'gray' }
                        }}
                        lastAnalyzed={summary.lastAnalyzed}
                        onRefresh={() => refetch()}
                    />
                </TabsContent>

                {/* Charts Tab */}
                <TabsContent value="charts" className="space-y-4">
                    <HealthCharts
                        soilScore={health.soilScore}
                        nutrientScore={health.nutrientScore}
                        moistureScore={health.moistureScore}
                        stemAndRootScore={health.stemAndRootScore}
                        diseaseScore={health.diseaseScore}
                        soilData={props.farmData ? {
                            nitrogen: props.farmData.soil_nitrogen,
                            phosphorus: props.farmData.soil_phosphorus,
                            potassium: props.farmData.soil_potassium,
                            ph: props.farmData.soil_ph,
                            moisture: props.farmData.soil_moisture,
                            organicCarbon: props.farmData.soil_organic_carbon
                        } : undefined}
                    />
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <AlertsPanel alerts={alerts} />
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                    <RecommendationsPanel recommendations={recommendations} />
                </TabsContent>
            </Tabs>

            {/* Last updated info */}
            <div className="text-center text-xs text-gray-500 py-2">
                <p>Last analyzed: {new Date(summary.lastAnalyzed || Date.now()).toLocaleString()}</p>
            </div>
        </div>
    );
}
