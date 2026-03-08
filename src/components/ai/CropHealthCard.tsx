import { useState } from 'react';
import { Activity, AlertCircle, TrendingUp, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HealthMetric {
    name: string;
    score: number;
    status: string;
    color: string;
}

interface CropHealthCardProps {
    overallScore: number;
    status: string;
    color: string;
    metrics: {
        soilHealth: HealthMetric;
        nutrients: HealthMetric;
        moisture: HealthMetric;
        stemAndRoot: HealthMetric;
        disease: HealthMetric;
    };
    lastAnalyzed?: string;
    onRefresh?: () => void;
}

export function CropHealthCard(props: CropHealthCardProps) {
    const [expanded, setExpanded] = useState(false);

    const getColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'text-green-600';
            case 'blue': return 'text-blue-600';
            case 'yellow': return 'text-yellow-600';
            case 'orange': return 'text-orange-600';
            case 'red': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getBgColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'bg-green-50 border-green-200';
            case 'blue': return 'bg-blue-50 border-blue-200';
            case 'yellow': return 'bg-yellow-50 border-yellow-200';
            case 'orange': return 'bg-orange-50 border-orange-200';
            case 'red': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getIconBg = (color: string) => {
        switch (color) {
            case 'green': return 'bg-green-100';
            case 'blue': return 'bg-blue-100';
            case 'yellow': return 'bg-yellow-100';
            case 'orange': return 'bg-orange-100';
            case 'red': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    return (
        <Card className={`p-6 border-2 ${getBgColorClass(props.color)}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div className={`${getIconBg(props.color)} p-3 rounded-lg`}>
                        <Heart className={`w-6 h-6 ${getColorClass(props.color)}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Crop Health</h3>
                        <p className="text-sm text-gray-600">AI-Powered Analysis</p>
                    </div>
                </div>
                {props.onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={props.onRefresh}
                        className="hover:bg-white"
                    >
                        🔄 Refresh
                    </Button>
                )}
            </div>

            {/* Health Score Display */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-5xl font-bold" style={{ color: getColorClass(props.color).replace('text-', '') }}>
                        {props.overallScore}
                    </div>
                    <p className={`text-sm font-medium mt-2 ${getColorClass(props.color)}`}>
                        {props.status} Health
                    </p>
                </div>
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="55" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                            cx="60"
                            cy="60"
                            r="55"
                            fill="none"
                            stroke={getColorClass(props.color).replace('text-', '')}
                            strokeWidth="8"
                            strokeDasharray={`${(props.overallScore / 100) * 345.6} 345.6`}
                            transform="rotate(-90 60 60)"
                            className="transition-all duration-500"
                        />
                        <text x="60" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#111827">
                            {props.overallScore}%
                        </text>
                    </svg>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(props.metrics).map(([key, metric]) => (
                    <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{metric.name}</p>
                        <p className={`text-2xl font-bold ${getColorClass(metric.color)}`}>
                            {metric.score}
                        </p>
                        <p className={`text-xs ${getColorClass(metric.color)}`}>
                            {metric.status}
                        </p>
                    </div>
                ))}
            </div>

            {/* Last Updated */}
            {props.lastAnalyzed && (
                <div className="text-xs text-gray-500 text-center pt-3 border-t border-gray-200">
                    Last analyzed: {new Date(props.lastAnalyzed).toLocaleString()}
                </div>
            )}

            {/* Expand Button */}
            <Button
                variant="ghost"
                className="w-full mt-3 text-sm"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? '▼ Hide Details' : '▶ Show Details'}
            </Button>
        </Card>
    );
}
