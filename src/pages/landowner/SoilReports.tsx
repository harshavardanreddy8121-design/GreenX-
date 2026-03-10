import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { Card } from '@/components/ui/card';
import { FlaskConical, Droplets, Leaf, Waves, Download, Calendar, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';

export default function SoilReports() {
    const { user } = useAuth();

    const { data: farms = [] } = useQuery({
        queryKey: ['landowner-farms-soil', user?.id],
        queryFn: async () => {
            const ownedResponse = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const owned = ownedResponse.success && ownedResponse.data ? ownedResponse.data as any[] : [];

            const farmsWithDetails = await Promise.all(
                owned.map(async (farm: any) => {
                    const detailsResponse = await javaApi.select('farm_details', { eq: { farm_id: farm.id } });
                    const details = detailsResponse.success && detailsResponse.data && (detailsResponse.data as any[]).length > 0
                        ? (detailsResponse.data as any[])[0]
                        : null;
                    return { ...farm, soil_details: details };
                })
            );

            return farmsWithDetails;
        },
        enabled: !!user?.id,
    });

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Soil Test Reports</h1>
                    <p className="text-sm text-muted-foreground mt-1">View detailed soil analysis and test results for your farms</p>
                </div>

                {farms.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">No soil reports available yet</Card>
                ) : (
                    <div className="grid gap-6">
                        {farms.map((farm: any) => (
                            <Card key={farm.id} className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{farm.name || `Farm ${farm.farm_code}`}</h2>
                                        <p className="text-sm text-muted-foreground">{farm.village}, {farm.district}</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" /> Download Report
                                    </Button>
                                </div>

                                {farm.soil_details ? (
                                    <>
                                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                                            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                                <Droplets className="w-6 h-6 text-blue-600 mb-2" />
                                                <p className="text-xs text-muted-foreground">pH Level</p>
                                                <p className="text-2xl font-bold text-blue-800">{farm.soil_details.soil_ph || 'N/A'}</p>
                                                <p className="text-xs text-blue-700">{parseFloat(farm.soil_details.soil_ph) >= 6.5 && parseFloat(farm.soil_details.soil_ph) <= 7.5 ? <><CheckCircle className="inline w-3 h-3" /> Optimal</> : <><AlertTriangle className="inline w-3 h-3" /> Needs attention</>}</p>
                                            </Card>

                                            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                                <Leaf className="w-6 h-6 text-green-600 mb-2" />
                                                <p className="text-xs text-muted-foreground">Nitrogen (N)</p>
                                                <p className="text-2xl font-bold text-green-800">{farm.soil_details.soil_nitrogen || 'N/A'}<span className="text-sm"> kg/ha</span></p>
                                                <p className="text-xs text-green-700">{parseFloat(farm.soil_details.soil_nitrogen) >= 280 ? <><CheckCircle className="inline w-3 h-3" /> High</> : parseFloat(farm.soil_details.soil_nitrogen) >= 140 ? <><Zap className="inline w-3 h-3" /> Medium</> : <><AlertTriangle className="inline w-3 h-3" /> Low</>}</p>
                                            </Card>

                                            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                                <FlaskConical className="w-6 h-6 text-amber-600 mb-2" />
                                                <p className="text-xs text-muted-foreground">Phosphorus (P)</p>
                                                <p className="text-2xl font-bold text-amber-800">{farm.soil_details.soil_phosphorus || 'N/A'}<span className="text-sm"> kg/ha</span></p>
                                                <p className="text-xs text-amber-700">{parseFloat(farm.soil_details.soil_phosphorus) >= 22 ? <><CheckCircle className="inline w-3 h-3" /> High</> : parseFloat(farm.soil_details.soil_phosphorus) >= 11 ? <><Zap className="inline w-3 h-3" /> Medium</> : <><AlertTriangle className="inline w-3 h-3" /> Low</>}</p>
                                            </Card>

                                            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                                                <Waves className="w-6 h-6 text-purple-600 mb-2" />
                                                <p className="text-xs text-muted-foreground">Potassium (K)</p>
                                                <p className="text-2xl font-bold text-purple-800">{farm.soil_details.soil_potassium || 'N/A'}<span className="text-sm"> kg/ha</span></p>
                                                <p className="text-xs text-purple-700">{parseFloat(farm.soil_details.soil_potassium) >= 280 ? <><CheckCircle className="inline w-3 h-3" /> High</> : parseFloat(farm.soil_details.soil_potassium) >= 110 ? <><Zap className="inline w-3 h-3" /> Medium</> : <><AlertTriangle className="inline w-3 h-3" /> Low</>}</p>
                                            </Card>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Card className="p-4 bg-muted/50">
                                                <p className="text-sm font-semibold text-muted-foreground mb-2">Additional Parameters</p>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between"><span>Moisture:</span><span className="font-semibold">{farm.soil_details.soil_moisture || 'N/A'}%</span></div>
                                                    <div className="flex justify-between"><span>Organic Carbon:</span><span className="font-semibold">{farm.soil_details.soil_organic_carbon || 'N/A'}%</span></div>
                                                    <div className="flex justify-between"><span>EC (Electrical Conductivity):</span><span className="font-semibold">{farm.soil_details.soil_ec || 'N/A'} dS/m</span></div>
                                                </div>
                                            </Card>

                                            <Card className="p-4 bg-emerald-50 border-emerald-200">
                                                <p className="text-sm font-semibold text-emerald-900 mb-2">Expert Recommendation</p>
                                                <p className="text-sm text-emerald-800">
                                                    {farm.soil_details.recommendations || 'Waiting for expert analysis and recommendations.'}
                                                </p>
                                            </Card>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            <span>Last tested: {farm.soil_details.created_at ? new Date(farm.soil_details.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                                        <p className="text-muted-foreground">No soil test data available yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Soil sampling will be scheduled soon by your field manager</p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
