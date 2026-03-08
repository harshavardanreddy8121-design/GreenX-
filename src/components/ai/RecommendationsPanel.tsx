import { Lightbulb, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RecommendationsProps {
    recommendations: string[];
    maxDisplay?: number;
}

export function RecommendationsPanel(props: RecommendationsProps) {
    const displayedRecs = props.recommendations.slice(0, props.maxDisplay || 10);

    const getIcon = (rec: string) => {
        if (rec.includes('🔴')) return '🔴';
        if (rec.includes('⚠️')) return '⚠️';
        if (rec.includes('💧')) return '💧';
        if (rec.includes('🌾')) return '🌾';
        if (rec.includes('✅')) return '✅';
        if (rec.includes('🚨')) return '🚨';
        if (rec.includes('🐛')) return '🐛';
        if (rec.includes('🦠')) return '🦠';
        return '💡';
    };

    const getIconColor = (rec: string) => {
        if (rec.includes('🔴') || rec.includes('🚨')) return 'text-red-600';
        if (rec.includes('⚠️')) return 'text-yellow-600';
        if (rec.includes('✅')) return 'text-green-600';
        if (rec.includes('💧') || rec.includes('🌾')) return 'text-blue-600';
        if (rec.includes('🐛') || rec.includes('🦠')) return 'text-orange-600';
        return 'text-blue-600';
    };

    const getCardBg = (rec: string) => {
        if (rec.includes('🔴') || rec.includes('🚨')) return 'bg-red-50 border-red-200';
        if (rec.includes('⚠️')) return 'bg-yellow-50 border-yellow-200';
        if (rec.includes('✅')) return 'bg-green-50 border-green-200';
        if (rec.includes('💧')) return 'bg-blue-50 border-blue-200';
        if (rec.includes('🌾')) return 'bg-emerald-50 border-emerald-200';
        if (rec.includes('🐛') || rec.includes('🦠')) return 'bg-orange-50 border-orange-200';
        return 'bg-blue-50 border-blue-200';
    };

    if (props.recommendations.length === 0) {
        return (
            <Card className="p-6 border-green-200 bg-green-50">
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">No Recommendations</h3>
                        <p className="text-sm text-green-700">Farm conditions are optimal</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Recommendations ({displayedRecs.length}/{props.recommendations.length})
                </h3>
            </div>

            {displayedRecs.map((rec, idx) => (
                <Card
                    key={idx}
                    className={`p-4 border-2 ${getCardBg(rec)} transition-all hover:shadow-md`}
                >
                    <div className="flex gap-3">
                        <div className={`text-2xl flex-shrink-0 ${getIconColor(rec)}`}>
                            {getIcon(rec)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-relaxed">
                                {rec.replace(/^[🔴⚠️💧🌾✅🚨🐛🦠💡]\s*/, '')}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}

            {props.recommendations.length > (props.maxDisplay || 10) && (
                <p className="text-xs text-gray-600 text-center py-2">
                    +{props.recommendations.length - (props.maxDisplay || 10)} more recommendations
                </p>
            )}
        </div>
    );
}
