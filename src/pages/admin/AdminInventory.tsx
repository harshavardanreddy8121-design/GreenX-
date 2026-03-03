import { Package } from 'lucide-react';

export default function AdminInventory() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Input Inventory</h1>
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No inventory items yet.</p>
        <p className="text-xs mt-1">Inventory tracking will be populated from equipment requests and purchases.</p>
      </div>
    </div>
  );
}
