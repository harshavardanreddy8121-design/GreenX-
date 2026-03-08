import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { landownerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveUpdates() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [farmId, setFarmId] = useState('');
    const [note, setNote] = useState('');

    const { data: farms = [] } = useQuery({
        queryKey: ['live-updates-farms', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const { data: updates = [], isLoading } = useQuery({
        queryKey: ['landowner-live-updates', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const ownedResponse = await javaApi.select('farms', { eq: { owner_id: user?.id } });
            const owned = ownedResponse.success && ownedResponse.data ? (ownedResponse.data as any[]) : [];

            const allUpdates = await Promise.all(
                owned.map(async (farm: any) => {
                    const [timelineRes, photosRes] = await Promise.all([
                        javaApi.select('farm_timeline', { eq: { farm_id: farm.id } }),
                        javaApi.select('farm_photos', { eq: { farm_id: farm.id } }),
                    ]);

                    const timelineRows = timelineRes.success && timelineRes.data ? (timelineRes.data as any[]) : [];
                    const photoRows = photosRes.success && photosRes.data ? (photosRes.data as any[]) : [];

                    const timelineUpdates = timelineRows.map((item: any) => ({
                        id: `tl-${item.id}`,
                        farm,
                        type: 'timeline',
                        title: item.event_title || item.event_type || 'Timeline update',
                        description: item.event_description || item.note || 'No additional details',
                        created_at: item.created_at,
                    }));

                    const photoUpdates = photoRows.map((item: any) => ({
                        id: `ph-${item.id}`,
                        farm,
                        type: 'photo',
                        title: 'Field photo uploaded',
                        description: item.caption || item.description || item.photo_url || 'Photo update',
                        created_at: item.created_at,
                    }));

                    return [...timelineUpdates, ...photoUpdates];
                })
            );

            return allUpdates.flat().sort((a: any, b: any) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
        },
    });

    const selectedFarmId = useMemo(() => farmId || farms[0]?.id || '', [farmId, farms]);

    const addUpdate = useMutation({
        mutationFn: async () => {
            if (!selectedFarmId || !note.trim()) throw new Error('Please select farm and enter update note.');

            const res = await javaApi.insert('farm_timeline', {
                id: crypto.randomUUID(),
                farm_id: selectedFarmId,
                event_type: 'landowner_note',
                event_title: 'Landowner update',
                event_description: note.trim(),
                user_id: user?.id,
                user_role: 'landowner',
                created_at: new Date().toISOString(),
            });

            if (!res.success) throw new Error(res.error || 'Failed to add update');
        },
        onSuccess: () => {
            toast.success('Update posted successfully');
            setNote('');
            queryClient.invalidateQueries({ queryKey: ['landowner-live-updates'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to post update'),
    });

    return (
        <DashboardShell menuItems={landownerMenuItems} role="Landowner">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Live Updates</h1>
                    <p className="text-sm text-muted-foreground mt-1">Recent farm activity and photo feed</p>
                </div>

                <Card className="p-4">
                    <div className="grid md:grid-cols-4 gap-3">
                        <select
                            value={selectedFarmId}
                            onChange={(e) => setFarmId(e.target.value)}
                            className="md:col-span-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            {farms.map((farm: any) => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.name || farm.farm_code}
                                </option>
                            ))}
                        </select>
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="md:col-span-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            placeholder="Post update for your farm timeline"
                        />
                        <Button onClick={() => addUpdate.mutate()} disabled={addUpdate.isPending}>
                            <Send className="w-4 h-4 mr-2" />
                            {addUpdate.isPending ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </Card>

                {isLoading ? (
                    <Card className="p-6 text-center">Loading updates...</Card>
                ) : updates.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">No updates available yet</Card>
                ) : (
                    <div className="space-y-3">
                        {updates.slice(0, 50).map((item: any) => (
                            <Card key={item.id} className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full p-2 bg-muted">
                                        {item.type === 'photo' ? <Image className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{item.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {(item.farm?.name || item.farm?.farm_code || 'Farm')} · {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
