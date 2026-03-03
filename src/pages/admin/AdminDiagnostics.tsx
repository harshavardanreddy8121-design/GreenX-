import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { Stethoscope } from 'lucide-react';

export default function AdminDiagnostics() {
  const { data: diagnostics = [], isLoading } = useQuery({
    queryKey: ['admin-diagnostics'],
    queryFn: async () => {
      const response = await javaApi.select('diagnostics', {});
      return response.success && response.data ? response.data as any[] : [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Diagnostics</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : diagnostics.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No diagnostic reports yet. Experts can submit reports from their dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {diagnostics.map((d: any) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{d.farms?.name} — {d.farms?.crop}</h3>
                <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Expert: {d.profiles?.full_name || 'Unknown'} · {d.farms?.village}</p>
              <div className="flex gap-3 text-xs mb-2">
                <span className={`px-2 py-1 rounded ${d.pest_risk === 'high' ? 'bg-destructive/10 text-destructive' : d.pest_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>
                  Pest: {d.pest_risk}
                </span>
                <span className={`px-2 py-1 rounded ${d.disease_risk === 'high' ? 'bg-destructive/10 text-destructive' : d.disease_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>
                  Disease: {d.disease_risk}
                </span>
              </div>
              {d.prescription && <p className="text-xs text-foreground">{d.prescription}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
