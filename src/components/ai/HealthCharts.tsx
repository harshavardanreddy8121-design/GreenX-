import { Card } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface HealthChartsProps {
    soilScore?: number;
    nutrientScore?: number;
    moistureScore?: number;
    stemAndRootScore?: number;
    diseaseScore?: number;
    soilData?: {
        nitrogen?: number;
        phosphorus?: number;
        potassium?: number;
        ph?: number;
        moisture?: number;
        organicCarbon?: number;
    };
    historicalData?: Array<{
        date: string;
        health: number;
        nitrogen?: number;
        moisture?: number;
    }>;
}

export function HealthCharts(props: HealthChartsProps) {
    // Prepare radar chart data
    const radarData = [
        { name: 'Soil', value: props.soilScore || 0 },
        { name: 'Nutrients', value: props.nutrientScore || 0 },
        { name: 'Moisture', value: props.moistureScore || 0 },
        { name: 'Stem & Root', value: props.stemAndRootScore || 0 },
        { name: 'Disease Resist.', value: props.diseaseScore || 0 }
    ];

    // Prepare soil metrics bar chart
    const soilMetricsData = [
        { name: 'pH', value: props.soilData?.ph || 0, max: 14 },
        { name: 'Nitrogen', value: Math.min((props.soilData?.nitrogen || 0) / 10, 100), max: 100 },
        { name: 'Phosphorus', value: Math.min((props.soilData?.phosphorus || 0) * 5, 100), max: 100 },
        { name: 'Potassium', value: Math.min((props.soilData?.potassium || 0) / 3, 100), max: 100 },
        { name: 'Moisture %', value: props.soilData?.moisture || 0, max: 100 },
        { name: 'Organic C %', value: Math.min((props.soilData?.organicCarbon || 0) * 50, 100), max: 100 }
    ];

    // Color palette
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart - Overall Health Metrics */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Health Dimensions</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </Card>

            {/* Soil Metrics Bar Chart */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Soil Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={soilMetricsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                            {soilMetricsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Historical Trend Chart */}
            {props.historicalData && props.historicalData.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">Health Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={props.historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="health"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Overall Health"
                            />
                            {props.historicalData[0]?.nitrogen !== undefined && (
                                <Line
                                    type="monotone"
                                    dataKey="nitrogen"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    name="Nitrogen"
                                />
                            )}
                            {props.historicalData[0]?.moisture !== undefined && (
                                <Line
                                    type="monotone"
                                    dataKey="moisture"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    name="Moisture"
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Score Summary Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Soil Health', value: props.soilScore },
                    { label: 'Nutrients', value: props.nutrientScore },
                    { label: 'Moisture', value: props.moistureScore },
                    { label: 'Stem & Root', value: props.stemAndRootScore },
                    { label: 'Disease Resist.', value: props.diseaseScore }
                ].map((score, idx) => (
                    <Card key={idx} className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <p className="text-xs text-gray-600">{score.label}</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{score.value || 0}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
