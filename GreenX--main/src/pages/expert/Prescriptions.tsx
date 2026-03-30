import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import DashboardShell from '@/components/DashboardShell';
import { expertMenuItems } from '@/config/dashboardMenus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

export default function Prescriptions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [diagnosticId, setDiagnosticId] = useState('');
    const [prescription, setPrescription] = useState('');

    const { data: diagnostics = [] } = useQuery({
        queryKey: ['expert-prescription-diagnostics', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await javaApi.select('diagnostics', { order: { field: 'created_at', ascending: false } });
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });

    const savePrescription = useMutation({
        mutationFn: async () => {
            const selected = diagnosticId || diagnostics[0]?.id;
            if (!selected || !prescription.trim()) throw new Error('Select diagnostic and enter prescription');

            const selectedDiagnostic = diagnostics.find((d: any) => d.id === selected);
            const farmId = selectedDiagnostic?.farm_id;

            const res = await javaApi.update('diagnostics', selected, {
                prescription: prescription.trim(),
                updated_by: user?.id,
                updated_at: new Date().toISOString(),
            });
            if (!res.success) throw new Error(res.error || 'Failed to save prescription');

            await emitWorkflowTrigger({
                farmId,
                eventKey: 'prescription_issued',
                triggeredBy: 'expert',
                note: 'Expert issued pest/disease prescription for field manager execution.',
            });
        },
        onSuccess: () => {
            toast.success('Prescription issued');
            setPrescription('');
            queryClient.invalidateQueries({ queryKey: ['expert-prescription-diagnostics'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to issue prescription'),
    });

    return (
        <DashboardShell menuItems={expertMenuItems} role="Expert">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
                    <p className="text-sm text-muted-foreground mt-1">Issue and update treatment instructions for active alerts</p>
                </div>

                <Card className="p-4 space-y-3">
                    <select value={diagnosticId || diagnostics[0]?.id || ''} onChange={(e) => setDiagnosticId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                        {diagnostics.map((d: any) => (
                            <option key={d.id} value={d.id}>Diagnostic {d.id} - Farm {d.farm_id}</option>
                        ))}
                    </select>
                    <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        placeholder="Enter dosage, method, and safety instructions"
                    />
                    <Button onClick={() => savePrescription.mutate()} disabled={savePrescription.isPending}>Issue Prescription</Button>
                </Card>

                <div className="space-y-3">
                    {diagnostics.map((d: any) => (
                        <Card key={d.id} className="p-4">
                            <p className="font-medium">Farm {d.farm_id} - Risk: {d.pest_risk || 'N/A'} / {d.disease_risk || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground mt-1">{d.prescription || 'No prescription yet'}</p>
                            <p className="text-xs text-muted-foreground mt-1">{d.created_at ? new Date(d.created_at).toLocaleString() : 'N/A'}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
