import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function YieldProfit() {
    const { user } = useAuth();

    const { data: summary, isLoading } = useQuery({
        queryKey: ['yield-profit-summary', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const farmsRes = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const farms = farmsRes.success && farmsRes.data ? (farmsRes.data as any[]) : [];

            const [harvestRows, costRows] = await Promise.all([
                Promise.all(farms.map((f: any) => javaApi.select('harvests', { eq: { farm_id: f.id } }))),
                Promise.all(farms.map((f: any) => javaApi.select('costs', { eq: { farm_id: f.id } }))),
            ]);

            const harvests = harvestRows.flatMap((res: any) => (res.success && res.data ? (res.data as any[]) : []));
            const costs = costRows.flatMap((res: any) => (res.success && res.data ? (res.data as any[]) : []));

            const totalRevenue = harvests.reduce((sum: number, h: any) => sum + Number(h.revenue || 0), 0);
            const totalYield = harvests.reduce((sum: number, h: any) => sum + Number(h.total_yield || h.yield || 0), 0);
            const totalCost = costs.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);
            const totalProfit = totalRevenue - totalCost;

            return { totalRevenue, totalYield, totalCost, totalProfit, farms, harvests };
        },
    });

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Yield & Profit</h1>
                    <p className="text-sm text-muted-foreground mt-1">Season output, revenue, and net profitability</p>
                </div>

                {isLoading ? (
                    <Card className="p-6 text-center">Loading profit summary...</Card>
                ) : (
                    <>
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card className="p-5">
                                <p className="text-sm text-muted-foreground">Total Yield</p>
                                <p className="text-2xl font-bold">{Number(summary?.totalYield || 0).toLocaleString()}</p>
                            </Card>
                            <Card className="p-5">
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold inline-flex items-center gap-1"><DollarSign className="w-4 h-4" />{Number(summary?.totalRevenue || 0).toLocaleString()}</p>
                            </Card>
                            <Card className="p-5">
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="text-2xl font-bold inline-flex items-center gap-1"><DollarSign className="w-4 h-4" />{Number(summary?.totalCost || 0).toLocaleString()}</p>
                            </Card>
                            <Card className="p-5">
                                <p className="text-sm text-muted-foreground">Net Profit</p>
                                <p className={`text-2xl font-bold inline-flex items-center gap-1 ${Number(summary?.totalProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    <TrendingUp className="w-4 h-4" />{Number(summary?.totalProfit || 0).toLocaleString()}
                                </p>
                            </Card>
                        </div>

                        <Card className="p-5">
                            <p className="font-semibold text-foreground mb-3">Harvest Entries</p>
                            <div className="space-y-2">
                                {(summary?.harvests || []).map((h: any) => (
                                    <div key={h.id} className="flex items-center justify-between border rounded-lg p-3">
                                        <div>
                                            <p className="text-sm font-medium">{h.crop_name || 'Crop'} - {h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : 'Date N/A'}</p>
                                            <p className="text-xs text-muted-foreground">Yield: {h.total_yield || h.yield || 0}</p>
                                        </div>
                                        <p className="font-semibold">Rs {Number(h.revenue || 0).toLocaleString()}</p>
                                    </div>
                                ))}
                                {(summary?.harvests || []).length === 0 && <p className="text-sm text-muted-foreground">No harvest records yet.</p>}
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
