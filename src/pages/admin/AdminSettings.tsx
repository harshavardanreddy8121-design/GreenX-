import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettings() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <input type="text" defaultValue="GreenX Agri Solutions" className="w-full mt-1 px-4 py-2.5 rounded-lg bg-muted/60 border border-border text-foreground" readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Admin User</label>
          <input type="text" value={profile?.full_name || 'Admin'} className="w-full mt-1 px-4 py-2.5 rounded-lg bg-muted/60 border border-border text-foreground" readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Region</label>
          <input type="text" defaultValue="East Godavari, Andhra Pradesh" className="w-full mt-1 px-4 py-2.5 rounded-lg bg-muted/60 border border-border text-foreground" readOnly />
        </div>
      </div>
    </div>
  );
}
