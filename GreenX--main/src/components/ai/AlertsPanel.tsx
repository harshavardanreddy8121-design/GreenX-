import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Alert {
    id: string;
    title: string;
    message: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    read?: boolean;
}

interface AlertsPanelProps {
    alerts: Alert[];
    onDismiss?: (alertId: string) => void;
    onRead?: (alertId: string) => void;
    maxDisplay?: number;
}

export function AlertsPanel(props: AlertsPanelProps) {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const visibleAlerts = props.alerts
        .filter(a => !dismissedAlerts.has(a.id))
        .slice(0, props.maxDisplay || 5);

    const handleDismiss = (alertId: string) => {
        const newDismissed = new Set(dismissedAlerts);
        newDismissed.add(alertId);
        setDismissedAlerts(newDismissed);
        props.onDismiss?.(alertId);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'medium':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'low':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Info className="w-5 h-5 text-gray-600" />;
        }
    };

    const getSeverityBadgeColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (props.alerts.length === 0) {
        return (
            <Card className="p-6 border-green-200 bg-green-50">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">No Active Alerts</h3>
                        <p className="text-sm text-green-700">Your farm is in good condition</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Active Alerts ({visibleAlerts.length}/{props.alerts.length})
                </h3>
            </div>

            {visibleAlerts.map((alert) => (
                <Card
                    key={alert.id}
                    className={`p-4 border-2 ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}
                >
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadgeColor(alert.severity)}`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDismiss(alert.id)}
                                    className="flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            {props.alerts.length > (props.maxDisplay || 5) && (
                <p className="text-xs text-gray-600 text-center">
                    +{props.alerts.length - (props.maxDisplay || 5)} more alerts
                </p>
            )}
        </div>
    );
}
