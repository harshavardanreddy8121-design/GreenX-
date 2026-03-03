import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ConnectionTestResult {
    success: boolean;
    message: string;
    details?: Record<string, any>;
}

export function useApiConnectionTest() {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<ConnectionTestResult | null>(null);

    const testConnection = async () => {
        setTesting(true);
        setResult(null);

        try {
            const apiUrl = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

            // Test 1: Health check
            const healthResponse = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!healthResponse.ok) {
                throw new Error(`Health check failed: ${healthResponse.status}`);
            }

            const healthData = await healthResponse.json();

            if (!healthData.success) {
                throw new Error('Health check returned error');
            }

            setResult({
                success: true,
                message: 'Successfully connected to Java backend!',
                details: {
                    apiUrl,
                    status: healthData.data?.status,
                    service: healthData.data?.service,
                    version: healthData.data?.version,
                },
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Connection failed',
                details: {
                    apiUrl: import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api',
                },
            });
        } finally {
            setTesting(false);
        }
    };

    return { testConnection, testing, result };
}

export function ApiConnectionTester() {
    const { testConnection, testing, result } = useApiConnectionTest();

    return (
        <div className="p-4 space-y-4 max-w-md">
            <h2 className="text-lg font-semibold">API Connection Test</h2>

            <button
                onClick={testConnection}
                disabled={testing}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {testing ? (
                    <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Testing...
                    </>
                ) : (
                    'Test Connection'
                )}
            </button>

            {result && (
                <div
                    className={`p-4 rounded-lg border flex gap-3 ${result.success
                            ? 'bg-green-50 border-green-200 text-green-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                >
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className="font-semibold">{result.message}</p>
                        {result.details && (
                            <div className="mt-2 text-sm space-y-1">
                                {Object.entries(result.details).map(([key, value]) => (
                                    <p key={key}>
                                        <span className="font-medium">{key}:</span> {String(value)}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
