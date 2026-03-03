import { Ship } from 'lucide-react';

export default function AdminExports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Export Orders</h1>
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <Ship className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No export orders yet.</p>
        <p className="text-xs mt-1">Export management will be available once farms produce harvest data.</p>
      </div>
    </div>
  );
}
