import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';

const defaultItemForm = {
  item_type: 'fertilizer',
  item_name: '',
  item_code: '',
  unit: 'kg',
  quantity_in_stock: '0',
  reorder_level: '0',
  unit_cost: '0',
  storage_location: '',
};

const defaultTxnForm = {
  inventory_id: '',
  transaction_type: 'in',
  quantity: '0',
  farm_id: '',
  purpose: '',
  notes: '',
};

export default function AdminInventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [itemForm, setItemForm] = useState(defaultItemForm);
  const [txnForm, setTxnForm] = useState(defaultTxnForm);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const response = await javaApi.select('inventory', {
        order: { field: 'created_at', ascending: false },
      });
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['admin-inventory-transactions'],
    queryFn: async () => {
      const response = await javaApi.select('inventory_transactions', {
        order: { field: 'transaction_date', ascending: false },
      });
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['admin-inventory-farms'],
    queryFn: async () => {
      const response = await javaApi.select('farms', {});
      return response.success && response.data ? (response.data as any[]) : [];
    },
  });

  const lowStockItems = useMemo(() => {
    return inventory.filter((item: any) => Number(item.quantity_in_stock || 0) <= Number(item.reorder_level || 0));
  }, [inventory]);

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce(
      (sum: number, item: any) => sum + Number(item.quantity_in_stock || 0) * Number(item.unit_cost || 0),
      0
    );
  }, [inventory]);

  const addItem = useMutation({
    mutationFn: async () => {
      if (!itemForm.item_name.trim()) throw new Error('Item name is required');
      const response = await javaApi.insert('inventory', {
        id: crypto.randomUUID(),
        item_type: itemForm.item_type,
        item_name: itemForm.item_name.trim(),
        item_code: itemForm.item_code.trim() || null,
        unit: itemForm.unit.trim() || 'kg',
        quantity_in_stock: Number(itemForm.quantity_in_stock || 0),
        reorder_level: Number(itemForm.reorder_level || 0),
        unit_cost: Number(itemForm.unit_cost || 0),
        storage_location: itemForm.storage_location.trim() || null,
      });
      if (!response.success) throw new Error(response.error || 'Failed to add inventory item');
    },
    onSuccess: () => {
      toast.success('Inventory item added');
      setItemForm(defaultItemForm);
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add inventory item'),
  });

  const addTransaction = useMutation({
    mutationFn: async () => {
      if (!txnForm.inventory_id) throw new Error('Select an inventory item');

      const selectedItem = inventory.find((item: any) => item.id === txnForm.inventory_id);
      if (!selectedItem) throw new Error('Selected inventory item not found');

      const quantity = Number(txnForm.quantity || 0);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than 0');

      const currentStock = Number(selectedItem.quantity_in_stock || 0);
      const nextStock = txnForm.transaction_type === 'out' ? currentStock - quantity : currentStock + quantity;
      if (txnForm.transaction_type === 'out' && nextStock < 0) {
        throw new Error('Insufficient stock for outbound transaction');
      }

      const transactionResponse = await javaApi.insert('inventory_transactions', {
        id: crypto.randomUUID(),
        inventory_id: txnForm.inventory_id,
        farm_id: txnForm.transaction_type === 'out' ? txnForm.farm_id || null : null,
        transaction_type: txnForm.transaction_type,
        quantity,
        unit: selectedItem.unit || 'kg',
        cost_total: quantity * Number(selectedItem.unit_cost || 0),
        performed_by: user?.id,
        purpose: txnForm.purpose.trim() || null,
        notes: txnForm.notes.trim() || null,
        transaction_date: new Date().toISOString(),
      });

      if (!transactionResponse.success) {
        throw new Error(transactionResponse.error || 'Failed to log inventory transaction');
      }

      const stockResponse = await javaApi.update('inventory', txnForm.inventory_id, {
        quantity_in_stock: nextStock,
      });
      if (!stockResponse.success) {
        throw new Error(stockResponse.error || 'Transaction logged but stock update failed');
      }
    },
    onSuccess: () => {
      toast.success('Transaction logged and stock updated');
      setTxnForm(defaultTxnForm);
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-transactions'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to log transaction'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Input Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
          <p className="text-xs text-muted-foreground">Items in Inventory</p>
        </div>
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-alert p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
          <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
        </div>
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-finance p-4 text-center">
          <p className="text-2xl font-bold text-foreground">₹{(totalInventoryValue / 100000).toFixed(2)}L</p>
          <p className="text-xs text-muted-foreground">Inventory Value</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Add Inventory Item</h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={itemForm.item_type}
              onChange={(e) => setItemForm((prev) => ({ ...prev, item_type: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="seed">Seed</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="pesticide">Pesticide</option>
              <option value="equipment">Equipment</option>
            </select>
            <input
              value={itemForm.item_name}
              onChange={(e) => setItemForm((prev) => ({ ...prev, item_name: e.target.value }))}
              placeholder="Item name"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={itemForm.item_code}
              onChange={(e) => setItemForm((prev) => ({ ...prev, item_code: e.target.value }))}
              placeholder="Item code"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={itemForm.unit}
              onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
              placeholder="Unit (kg/ltr/units)"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              type="number"
              value={itemForm.quantity_in_stock}
              onChange={(e) => setItemForm((prev) => ({ ...prev, quantity_in_stock: e.target.value }))}
              placeholder="Stock qty"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              type="number"
              value={itemForm.reorder_level}
              onChange={(e) => setItemForm((prev) => ({ ...prev, reorder_level: e.target.value }))}
              placeholder="Reorder level"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              type="number"
              value={itemForm.unit_cost}
              onChange={(e) => setItemForm((prev) => ({ ...prev, unit_cost: e.target.value }))}
              placeholder="Unit cost"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={itemForm.storage_location}
              onChange={(e) => setItemForm((prev) => ({ ...prev, storage_location: e.target.value }))}
              placeholder="Storage location"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <button
            onClick={() => addItem.mutate()}
            disabled={addItem.isPending}
            className="dashboard-btn-primary px-4 py-2 rounded-lg text-sm"
          >
            {addItem.isPending ? 'Adding...' : 'Add Item'}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Log Stock Transaction</h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={txnForm.inventory_id}
              onChange={(e) => setTxnForm((prev) => ({ ...prev, inventory_id: e.target.value }))}
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Select inventory item</option>
              {inventory.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} ({item.quantity_in_stock} {item.unit || 'kg'})
                </option>
              ))}
            </select>
            <select
              value={txnForm.transaction_type}
              onChange={(e) => setTxnForm((prev) => ({ ...prev, transaction_type: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="in">Restock (IN)</option>
              <option value="out">Usage (OUT)</option>
            </select>
            <input
              type="number"
              value={txnForm.quantity}
              onChange={(e) => setTxnForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="Quantity"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />

            {txnForm.transaction_type === 'out' && (
              <select
                value={txnForm.farm_id}
                onChange={(e) => setTxnForm((prev) => ({ ...prev, farm_id: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Assign farm (optional)</option>
                {farms.map((farm: any) => (
                  <option key={farm.id} value={farm.id}>{farm.name || farm.farm_code}</option>
                ))}
              </select>
            )}

            <input
              value={txnForm.purpose}
              onChange={(e) => setTxnForm((prev) => ({ ...prev, purpose: e.target.value }))}
              placeholder="Purpose"
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <textarea
              value={txnForm.notes}
              onChange={(e) => setTxnForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes"
              rows={2}
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <button
            onClick={() => addTransaction.mutate()}
            disabled={addTransaction.isPending}
            className="dashboard-btn-primary px-4 py-2 rounded-lg text-sm"
          >
            {addTransaction.isPending ? 'Logging...' : 'Log Transaction'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl dashboard-card dashboard-card-ops">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No inventory items yet.</p>
          <p className="text-xs mt-1">Use the form above to add your first inventory item.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockItems.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Low stock alert for {lowStockItems.length} item(s)
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {inventory.map((item: any) => {
              const isLow = Number(item.quantity_in_stock || 0) <= Number(item.reorder_level || 0);
              return (
                <div key={item.id} className={`rounded-xl border bg-card p-4 ${isLow ? 'border-destructive/40' : 'border-border'} dashboard-card dashboard-card-ops`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.item_type} · Code: {item.item_code || 'N/A'} · Unit: {item.unit || 'kg'}
                      </p>
                    </div>
                    {isLow && <span className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Low Stock</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <p><span className="text-muted-foreground">Stock:</span> {item.quantity_in_stock}</p>
                    <p><span className="text-muted-foreground">Reorder:</span> {item.reorder_level || 0}</p>
                    <p><span className="text-muted-foreground">Unit Cost:</span> ₹{Number(item.unit_cost || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Transactions</h3>
            <div className="space-y-2">
              {transactions.slice(0, 12).map((txn: any) => {
                const item = inventory.find((inv: any) => inv.id === txn.inventory_id);
                return (
                  <div key={txn.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border text-xs">
                    <div>
                      <p className="font-medium text-foreground">{item?.item_name || txn.inventory_id}</p>
                      <p className="text-muted-foreground">{txn.purpose || txn.notes || 'No note'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${txn.transaction_type === 'out' ? 'text-destructive' : 'text-primary'}`}>
                        {txn.transaction_type === 'out' ? '-' : '+'}{txn.quantity} {txn.unit || ''}
                      </p>
                      <p className="text-muted-foreground">{txn.transaction_date ? new Date(txn.transaction_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && <p className="text-xs text-muted-foreground">No transactions logged yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
