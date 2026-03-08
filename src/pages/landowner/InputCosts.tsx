import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function InputCosts() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [farmId, setFarmId] = useState('');
    const [category, setCategory] = useState('Seeds');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const { data: farms = [] } = useQuery({
        queryKey: ['cost-farms', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const { data: costs = [] } = useQuery({
        queryKey: ['landowner-costs', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const owned = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const farmRows = owned.success && owned.data ? (owned.data as any[]) : [];
            const allRows = await Promise.all(
                farmRows.map(async (farm: any) => {
                    const res = await javaApi.select('costs', { eq: { farm_id: farm.id } });
                    const items = res.success && res.data ? (res.data as any[]) : [];
                    return items.map((item: any) => ({ ...item, farm }));
                })
            );
            return allRows.flat().sort((a: any, b: any) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
        },
    });

    const addCost = useMutation({
        mutationFn: async () => {
            const selectedFarmId = farmId || farms[0]?.id;
            if (!selectedFarmId) throw new Error('No farm available');
            if (!amount || Number(amount) <= 0) throw new Error('Enter valid cost amount');

            const res = await javaApi.insert('costs', {
                id: crypto.randomUUID(),
                farm_id: selectedFarmId,
                category,
                amount: Number(amount),
                description: notes || null,
                approved: 'Y',
                created_by: user?.id,
                created_at: new Date().toISOString(),
            });

            if (!res.success) throw new Error(res.error || 'Failed to add cost');
        },
        onSuccess: () => {
            toast.success('Input cost added');
            setAmount('');
            setNotes('');
            queryClient.invalidateQueries({ queryKey: ['landowner-costs'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to save cost'),
    });

    const total = costs.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Input Costs</h1>
                    <p className="text-sm text-muted-foreground mt-1">Track seeds, fertilizer, labor, and operation expenses</p>
                </div>

                <Card className="p-4">
                    <div className="grid md:grid-cols-5 gap-3">
                        <select
                            value={farmId || farms[0]?.id || ''}
                            onChange={(e) => setFarmId(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            {farms.map((farm: any) => (
                                <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>
                            ))}
                        </select>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                            <option>Seeds</option>
                            <option>Fertilizer</option>
                            <option>Pesticide</option>
                            <option>Labor</option>
                            <option>Irrigation</option>
                            <option>Other</option>
                        </select>
                        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <Button onClick={() => addCost.mutate()} disabled={addCost.isPending}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Cost
                        </Button>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Total Recorded Costs</p>
                        <p className="text-2xl font-bold text-foreground inline-flex items-center gap-1">
                            <DollarSign className="w-5 h-5" /> {total.toLocaleString()}
                        </p>
                    </div>
                </Card>

                <div className="space-y-3">
                    {costs.map((item: any) => (
                        <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">{item.category || 'Cost'} - {item.farm?.name || item.farm?.farm_code || 'Farm'}</p>
                                    <p className="text-sm text-muted-foreground">{item.description || 'No notes'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Rs {Number(item.amount || 0).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {costs.length === 0 && <Card className="p-6 text-center text-muted-foreground">No cost entries yet</Card>}
                </div>
            </div>
        </DashboardShell>
    );
}
