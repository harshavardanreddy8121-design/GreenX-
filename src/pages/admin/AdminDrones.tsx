import { Plane } from 'lucide-react';

export default function AdminDrones() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Drone Inventory</h1>
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No drones registered yet.</p>
        <p className="text-xs mt-1">Drone management will be available when drone assets are added.</p>
      </div>
    </div>
  );
}
