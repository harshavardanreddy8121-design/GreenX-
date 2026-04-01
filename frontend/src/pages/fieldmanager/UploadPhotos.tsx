import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { fieldManagerMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { compressImageFile } from '@/utils/imageCompression';
import { enqueueOfflineAction, flushOfflineActions } from '@/utils/offlineQueue';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function UploadPhotos() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [farmId, setFarmId] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

    const { data: farms = [] } = useQuery({
        queryKey: ['up-farms', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const assign = await javaApi.select('farm_assignments', { eq: { user_id: user?.id, role: 'fieldmanager' } });
            const rows = assign.success && assign.data ? (assign.data as any[]) : [];
            const farmRows = await Promise.all(rows.map((r: any) => javaApi.select('farms', { eq: { id: r.farm_id } })));
            return farmRows.filter((r: any) => r.success && r.data && (r.data as any[]).length > 0).map((r: any) => (r.data as any[])[0]);
        },
    });

    const { data: photos = [] } = useQuery({
        queryKey: ['uploaded-photos', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('farm_photos', { eq: { uploaded_by: user?.id }, order: { field: 'created_at', ascending: false } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const uploadPhoto = useMutation({
        mutationFn: async () => {
            const selectedFarm = farmId || farms[0]?.id;
            if (!selectedFarm) throw new Error('No farm selected');
            if (!photoUrl.trim()) throw new Error('Enter photo URL/path');

            const payload = {
                farm_id: selectedFarm,
                photo_url: photoUrl.trim(),
                caption: caption.trim() || null,
                uploaded_by: user?.id,
            };

            const writePhoto = async (item: typeof payload) => {
                const res = await javaApi.insert('farm_photos', {
                    id: crypto.randomUUID(),
                    farm_id: item.farm_id,
                    photo_url: item.photo_url,
                    caption: item.caption,
                    uploaded_by: item.uploaded_by,
                    created_at: new Date().toISOString(),
                });
                if (!res.success) throw new Error(res.error || 'Failed to save photo');

                await emitWorkflowTrigger({
                    farmId: item.farm_id,
                    eventKey: 'field_operation_logged',
                    triggeredBy: 'fieldmanager',
                    note: 'Field photo uploaded for live monitoring.',
                });
            };

            if (!navigator.onLine) {
                enqueueOfflineAction('field_photo_upload', payload);
                return;
            }

            await writePhoto(payload);
        },
        onSuccess: () => {
            if (!navigator.onLine) {
                toast.success('Offline: photo queued for sync');
            } else {
                toast.success('Photo uploaded');
            }
            setPhotoUrl('');
            setCaption('');
            queryClient.invalidateQueries({ queryKey: ['uploaded-photos'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to upload photo'),
    });

    useEffect(() => {
        const handleOnline = async () => {
            const flushed = await flushOfflineActions({
                field_photo_upload: async (payload) => {
                    const item = payload as any;
                    const res = await javaApi.insert('farm_photos', {
                        id: crypto.randomUUID(),
                        farm_id: item.farm_id,
                        photo_url: item.photo_url,
                        caption: item.caption || null,
                        uploaded_by: item.uploaded_by,
                        created_at: new Date().toISOString(),
                    });
                    if (!res.success) throw new Error(res.error || 'Failed queued photo sync');

                    await emitWorkflowTrigger({
                        farmId: item.farm_id,
                        eventKey: 'field_operation_logged',
                        triggeredBy: 'fieldmanager',
                        note: 'Offline photo synced to live feed.',
                    });
                },
            });

            if (flushed > 0) {
                toast.success(`Synced ${flushed} offline photo upload(s)`);
                queryClient.invalidateQueries({ queryKey: ['uploaded-photos'] });
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
            const compressedDataUrl = await compressImageFile(file, { maxWidth: 1600, quality: 0.72 });
            setPhotoUrl(compressedDataUrl);
            toast.success('Photo compressed and ready to upload');
        } catch (error: any) {
            toast.error(error.message || 'Failed to compress photo');
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <DashboardShell menuItems={fieldManagerMenuItems} role="Field Manager">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Upload Photos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Attach field images for live monitoring</p>
                </div>

                <Card className="p-4 space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                        <select value={farmId || farms[0]?.id || ''} onChange={(e) => setFarmId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                            {farms.map((farm: any) => <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>)}
                        </select>
                        <input type="file" accept="image/*" onChange={onPhotoPicked} className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <Button onClick={() => uploadPhoto.mutate()} disabled={uploadPhoto.isPending || isCompressing}>Upload</Button>
                    </div>
                    <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Or paste a photo URL/data URI" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    <p className="text-xs text-muted-foreground">{isCompressing ? 'Compressing image...' : navigator.onLine ? 'Online mode' : 'Offline mode: uploads will sync when connected'}</p>
                </Card>

                <div className="space-y-3">
                    {photos.map((photo: any) => (
                        <Card key={photo.id} className="p-4">
                            <p className="font-medium">{photo.caption || 'Field photo'}</p>
                            <p className="text-sm text-muted-foreground break-all">{photo.photo_url}</p>
                            <p className="text-xs text-muted-foreground mt-1">{photo.created_at ? new Date(photo.created_at).toLocaleString() : 'N/A'}</p>
                        </Card>
                    ))}
                    {photos.length === 0 && <Card className="p-6 text-center text-muted-foreground">No photos uploaded yet</Card>}
                </div>
            </div>
        </DashboardShell>
    );
}
