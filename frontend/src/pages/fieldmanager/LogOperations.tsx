import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { compressImageFile } from '@/utils/imageCompression';
import { enqueueOfflineAction, flushOfflineActions } from '@/utils/offlineQueue';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function LogOperations() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [farmId, setFarmId] = useState('');
    const [operationType, setOperationType] = useState('Irrigation');
    const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [productUsed, setProductUsed] = useState('');
    const [quantity, setQuantity] = useState('');
    const [areaCovered, setAreaCovered] = useState('');
    const [workersDeployed, setWorkersDeployed] = useState('');
    const [costIncurred, setCostIncurred] = useState('');
    const [weather, setWeather] = useState('');
    const [notes, setNotes] = useState('');
    const [photoDataUrl, setPhotoDataUrl] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

    const { data: farms = [] } = useQuery({
        queryKey: ['log-ops-farms', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const assignments = await javaApi.select('farm_assignments', { eq: { user_id: user?.id, role: 'fieldmanager' } });
            const rows = assignments.success && assignments.data ? (assignments.data as any[]) : [];
            const farms = await Promise.all(rows.map((a: any) => javaApi.select('farms', { eq: { id: a.farm_id } })));
            return farms
                .filter((r: any) => r.success && r.data && (r.data as any[]).length > 0)
                .map((r: any) => (r.data as any[])[0]);
        },
    });

    const { data: operations = [] } = useQuery({
        queryKey: ['field-operations', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('farm_timeline', { eq: { user_id: user?.id }, order: { field: 'created_at', ascending: false } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const createOperation = useMutation({
        mutationFn: async () => {
            const selectedFarm = farmId || farms[0]?.id;
            if (!selectedFarm) throw new Error('No farm selected');
            if (!notes.trim()) throw new Error('Please enter operation notes');
            if (!photoDataUrl) throw new Error('Field photo is required for operation log');

            const payload = {
                farm_id: selectedFarm,
                operation_type: operationType,
                operation_at: dateTime,
                product_used: productUsed.trim() || null,
                quantity: quantity.trim() || null,
                area_covered: areaCovered.trim() || null,
                workers_deployed: workersDeployed.trim() || null,
                cost_incurred: Number(costIncurred || 0),
                weather: weather.trim() || null,
                notes: notes.trim(),
                photo_url: photoDataUrl,
                user_id: user?.id,
            };

            const writeOperation = async (op: typeof payload) => {
                const operationLine = [
                    `Type: ${op.operation_type}`,
                    `Date/Time: ${op.operation_at || 'N/A'}`,
                    `Product: ${op.product_used || 'N/A'}`,
                    `Quantity: ${op.quantity || 'N/A'}`,
                    `Area Covered: ${op.area_covered || 'N/A'}`,
                    `Workers: ${op.workers_deployed || 'N/A'}`,
                    `Cost: INR ${Number(op.cost_incurred || 0).toFixed(2)}`,
                    `Weather: ${op.weather || 'N/A'}`,
                    `Observations: ${op.notes || 'N/A'}`,
                ].join(' | ');

                const res = await javaApi.insert('farm_timeline', {
                    id: crypto.randomUUID(),
                    farm_id: op.farm_id,
                    event_type: 'field_operation_logged',
                    event_title: op.operation_type,
                    event_description: operationLine,
                    user_id: op.user_id,
                    user_role: 'fieldmanager',
                    created_at: new Date().toISOString(),
                });

                if (!res.success) throw new Error(res.error || 'Failed to log operation');

                await javaApi.insert('farm_photos', {
                    id: crypto.randomUUID(),
                    farm_id: op.farm_id,
                    photo_url: op.photo_url,
                    caption: `${op.operation_type} operation proof photo`,
                    uploaded_by: op.user_id,
                    photo_type: 'operation',
                    created_at: new Date().toISOString(),
                });

                if (Number(op.cost_incurred || 0) > 0) {
                    await javaApi.insert('costs', {
                        id: crypto.randomUUID(),
                        farm_id: op.farm_id,
                        cost_category: 'labor',
                        description: `${op.operation_type}: ${op.notes}`,
                        amount: Number(op.cost_incurred || 0),
                        date_incurred: (op.operation_at || new Date().toISOString()).split('T')[0],
                        approved: 'N',
                        entered_by: op.user_id,
                        notes: `Workers: ${op.workers_deployed || 'N/A'} | Product: ${op.product_used || 'N/A'}`,
                    });
                }

                await emitWorkflowTrigger({
                    farmId: op.farm_id,
                    eventKey: 'field_operation_logged',
                    triggeredBy: 'fieldmanager',
                    note: `${op.operation_type} operation logged with photo and cost data.`,
                });
            };

            if (!navigator.onLine) {
                enqueueOfflineAction('field_operation', payload);
                return;
            }

            await writeOperation(payload);
        },
        onSuccess: () => {
            if (!navigator.onLine) {
                toast.success('Offline: operation saved and queued for sync');
            } else {
                toast.success('Field operation logged');
            }
            setDateTime(new Date().toISOString().slice(0, 16));
            setProductUsed('');
            setQuantity('');
            setAreaCovered('');
            setWorkersDeployed('');
            setCostIncurred('');
            setWeather('');
            setNotes('');
            setPhotoDataUrl('');
            queryClient.invalidateQueries({ queryKey: ['field-operations'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to log operation'),
    });

    useEffect(() => {
        const handleOnline = async () => {
            const flushed = await flushOfflineActions({
                field_operation: async (payload) => {
                    const op = payload as any;
                    const operationLine = [
                        `Type: ${op.operation_type}`,
                        `Date/Time: ${op.operation_at || 'N/A'}`,
                        `Product: ${op.product_used || 'N/A'}`,
                        `Quantity: ${op.quantity || 'N/A'}`,
                        `Area Covered: ${op.area_covered || 'N/A'}`,
                        `Workers: ${op.workers_deployed || 'N/A'}`,
                        `Cost: INR ${Number(op.cost_incurred || 0).toFixed(2)}`,
                        `Weather: ${op.weather || 'N/A'}`,
                        `Observations: ${op.notes || 'N/A'}`,
                    ].join(' | ');

                    const res = await javaApi.insert('farm_timeline', {
                        id: crypto.randomUUID(),
                        farm_id: op.farm_id,
                        event_type: 'field_operation_logged',
                        event_title: op.operation_type,
                        event_description: operationLine,
                        user_id: op.user_id,
                        user_role: 'fieldmanager',
                        created_at: new Date().toISOString(),
                    });
                    if (!res.success) throw new Error(res.error || 'Failed queued operation sync');

                    await javaApi.insert('farm_photos', {
                        id: crypto.randomUUID(),
                        farm_id: op.farm_id,
                        photo_url: op.photo_url,
                        caption: `${op.operation_type} operation proof photo`,
                        uploaded_by: op.user_id,
                        photo_type: 'operation',
                        created_at: new Date().toISOString(),
                    });

                    if (Number(op.cost_incurred || 0) > 0) {
                        await javaApi.insert('costs', {
                            id: crypto.randomUUID(),
                            farm_id: op.farm_id,
                            cost_category: 'labor',
                            description: `${op.operation_type}: ${op.notes}`,
                            amount: Number(op.cost_incurred || 0),
                            date_incurred: (op.operation_at || new Date().toISOString()).split('T')[0],
                            approved: 'N',
                            entered_by: op.user_id,
                            notes: `Workers: ${op.workers_deployed || 'N/A'} | Product: ${op.product_used || 'N/A'}`,
                        });
                    }

                    await emitWorkflowTrigger({
                        farmId: op.farm_id,
                        eventKey: 'field_operation_logged',
                        triggeredBy: 'fieldmanager',
                        note: `${op.operation_type} operation synced from offline queue.`,
                    });
                },
            });

            if (flushed > 0) {
                toast.success(`Synced ${flushed} offline field operation(s)`);
                queryClient.invalidateQueries({ queryKey: ['field-operations'] });
            }
        };

        if (navigator.onLine) {
            void handleOnline();
        }

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [queryClient]);

    const onPhotoPicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsCompressing(true);
            const compressed = await compressImageFile(file, { maxWidth: 1600, quality: 0.72 });
            setPhotoDataUrl(compressed);
            toast.success('Photo compressed and attached');
        } catch (error: any) {
            toast.error(error.message || 'Failed to process photo');
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Log Operations</h1>
                    <p className="text-sm text-muted-foreground mt-1">Record irrigation, fertilizer, pesticide, and field operations</p>
                </div>

                <Card className="p-4 space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                        <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                            {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
                        </select>
                        <select value={operationType} onChange={(e) => setOperationType(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                            <option>Irrigation</option>
                            <option>Sowing</option>
                            <option>Fertilizer Application</option>
                            <option>Pesticide Spray</option>
                            <option>Pest Scouting</option>
                            <option>General Observation</option>
                        </select>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                    </div>
                    <div className="grid md:grid-cols-4 gap-3">
                        <input value={productUsed} onChange={(e) => setProductUsed(e.target.value)} placeholder="Product used" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input value={areaCovered} onChange={(e) => setAreaCovered(e.target.value)} placeholder="Area covered" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input value={workersDeployed} onChange={(e) => setWorkersDeployed(e.target.value)} placeholder="Workers deployed" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                        <input value={costIncurred} onChange={(e) => setCostIncurred(e.target.value)} placeholder="Cost incurred (INR)" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="Weather conditions" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <input type="file" accept="image/*" onChange={onPhotoPicked} className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Describe what was done in this operation"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {isCompressing ? 'Compressing photo...' : photoDataUrl ? 'Photo attached (compressed)' : 'Attach a photo to submit operation'}
                        </p>
                        <Button onClick={() => createOperation.mutate()} disabled={createOperation.isPending || isCompressing}>Submit Operation</Button>
                    </div>
                </Card>

                <div className="space-y-3">
                    {operations.map((item: any) => (
                        <Card key={item.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <ClipboardCheck className="w-4 h-4 mt-1 text-primary" />
                                <div>
                                    <p className="font-medium">{item.event_title || item.event_type}</p>
                                    <p className="text-sm text-muted-foreground">{item.event_description || 'No details'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {operations.length === 0 && <Card className="p-6 text-center text-muted-foreground">No operations logged yet</Card>}
                </div>
            </div>
        </DashboardShell>
    );
}
