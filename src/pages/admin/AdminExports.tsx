import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { Ship } from 'lucide-react';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

type PaymentStatus = 'all' | 'pending' | 'partial' | 'paid';

export default function AdminExports() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-export-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const { data: harvests = [], isLoading } = useQuery({
    queryKey: ['admin-export-harvests'],
    queryFn: async () => {
      const response = await javaApi.select('harvests', {
        order: { field: 'created_at', ascending: false },
      });
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const exportOrders = useMemo(() => {
    return harvests.filter((h: any) => {
      const buyerType = String(h.buyer_type || '').toLowerCase();
      return buyerType === 'export' || !!h.export_country;
    });
  }, [harvests]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return exportOrders;
    return exportOrders.filter((o: any) => String(o.payment_status || 'pending').toLowerCase() === statusFilter);
  }, [exportOrders, statusFilter]);

  const farmById = useMemo(() => {
    const map = new Map<string, any>();
    farms.forEach((farm: any) => map.set(farm.id, farm));
    return map;
  }, [farms]);

  const stats = useMemo(() => {
    const totalRevenue = exportOrders.reduce((sum: number, row: any) => sum + Number(row.revenue || row.sale_price || 0), 0);
    const paidCount = exportOrders.filter((row: any) => String(row.payment_status || '').toLowerCase() === 'paid').length;
    const pendingCount = exportOrders.filter((row: any) => String(row.payment_status || '').toLowerCase() !== 'paid').length;
    return { totalRevenue, paidCount, pendingCount };
  }, [exportOrders]);

  const updatePayment = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: 'pending' | 'partial' | 'paid' }) => {
      const payload: Record<string, any> = { payment_status: paymentStatus };
      if (paymentStatus === 'paid') {
        payload.payment_date = new Date().toISOString().split('T')[0];
      }
      const response = await javaApi.update('harvests', id, payload);
      if (!response.success) throw new Error(response.error || 'Failed to update payment status');

      if (paymentStatus === 'paid') {
        const matchedOrder = exportOrders.find((item: any) => item.id === id);
        await emitWorkflowTrigger({
          farmId: matchedOrder?.farm_id,
          eventKey: 'sale_completed',
          triggeredBy: 'cluster_admin',
          note: 'Export sale completed and payment marked as paid.',
        });
      }
    },
    onSuccess: () => {
      toast.success('Payment status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-export-harvests'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update payment status'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Export Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-finance p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{exportOrders.length}</p>
          <p className="text-xs text-muted-foreground">Total Export Orders</p>
        </div>
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-health p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.paidCount}</p>
          <p className="text-xs text-muted-foreground">Paid Orders</p>
        </div>
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-alert p-4 text-center">
          <p className="text-2xl font-bold text-foreground">₹{(stats.totalRevenue / 100000).toFixed(2)}L</p>
          <p className="text-xs text-muted-foreground">Export Revenue</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Payment Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl dashboard-card dashboard-card-ops">
          <Ship className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No export orders found for selected filter.</p>
          {stats.pendingCount > 0 && <p className="text-xs mt-1">Try changing payment filter to view pending shipments.</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((order: any) => {
            const farm = farmById.get(order.farm_id);
            const payment = String(order.payment_status || 'pending').toLowerCase();
            return (
              <div key={order.id} className="rounded-xl border border-border bg-card dashboard-card dashboard-card-finance p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{order.crop_name || farm?.crop || 'Export Crop'}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {farm?.name || order.farm_id} · {farm?.village || 'Unknown village'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Buyer: {order.buyer_name || 'N/A'} · Country: {order.export_country || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Harvest: {order.harvest_date ? new Date(order.harvest_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[180px]">
                    <div className="text-right md:text-left">
                      <p className="text-sm font-semibold text-foreground">
                        ₹{Number(order.revenue || order.sale_price || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <select
                      value={payment}
                      onChange={(e) => updatePayment.mutate({ id: order.id, paymentStatus: e.target.value as 'pending' | 'partial' | 'paid' })}
                      disabled={updatePayment.isPending}
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
