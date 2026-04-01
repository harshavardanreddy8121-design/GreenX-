import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plane } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDrones() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState('');
  const [item, setItem] = useState('Drone Surveillance');
  const [priority, setPriority] = useState('high');
  const [note, setNote] = useState('');

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-drone-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-drone-requests'],
    queryFn: async () => {
      const response = await javaApi.select('equipment_requests', {
        order: { field: 'created_at', ascending: false },
      });
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const droneRequests = useMemo(() => {
    return requests.filter((row: any) => {
      const type = String(row.equipment_type || row.category || '').toLowerCase();
      const itemName = String(row.item || row.item_name || '').toLowerCase();
      return type.includes('drone') || itemName.includes('drone');
    });
  }, [requests]);

  const farmById = useMemo(() => {
    const map = new Map<string, any>();
    farms.forEach((farm: any) => map.set(farm.id, farm));
    return map;
  }, [farms]);

  const createDroneRequest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Missing admin identity for request creation');
      if (!item.trim()) throw new Error('Please enter drone task/item name');

      const response = await javaApi.insert('equipment_requests', {
        id: crypto.randomUUID(),
        user_id: user.id,
        farm_id: farmId || null,
        equipment_type: 'drone',
        item: item.trim(),
        quantity: 1,
        priority,
        note: note.trim() || null,
        status: 'pending',
        request_date: new Date().toISOString(),
      });

      if (!response.success) throw new Error(response.error || 'Failed to create drone request');
    },
    onSuccess: () => {
      toast.success('Drone request created');
      setFarmId('');
      setItem('Drone Surveillance');
      setPriority('high');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-drone-requests'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create drone request'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await javaApi.update('equipment_requests', id, {
        status,
        updated_at: new Date().toISOString(),
      });
      if (!response.success) throw new Error(response.error || 'Failed to update drone request');
    },
    onSuccess: () => {
      toast.success('Request status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-drone-requests'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update request status'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Drone Operations</h1>

      <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Create Drone Task</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <select
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            <option value="">General (No Farm)</option>
            {farms.map((farm: any) => (
              <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>
            ))}
          </select>
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Drone task name"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => createDroneRequest.mutate()}
            disabled={createDroneRequest.isPending}
            className="dashboard-btn-primary px-4 py-2 rounded-lg text-sm"
          >
            {createDroneRequest.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add mission note (e.g. pest hotspot scan, crop stress thermal scan)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : droneRequests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl dashboard-card dashboard-card-ops">
          <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No drone tasks yet.</p>
          <p className="text-xs mt-1">Create a drone mission above to track survey/spray operations.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {droneRequests.map((request: any) => (
            <div key={request.id} className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{request.item || request.item_name || 'Drone Task'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Farm: {request.farm_id ? (farmById.get(request.farm_id)?.name || request.farm_id) : 'General'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Priority: {request.priority || request.urgency || 'N/A'} · Created: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {request.note && <p className="text-xs text-muted-foreground mt-1">{request.note}</p>}
                </div>

                <select
                  value={String(request.status || 'pending').toLowerCase()}
                  onChange={(e) => updateStatus.mutate({ id: request.id, status: e.target.value })}
                  disabled={updateStatus.isPending}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
