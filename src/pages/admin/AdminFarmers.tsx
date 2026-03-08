import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const defaultForm = {
  name: '', village: '', pincode: '', total_land: '', crop: '', growth_stage: '',
  expected_revenue: '', profit_share: '', contract_summary: '',
  soil_ph: '', soil_nitrogen: '', soil_phosphorus: '', soil_potassium: '',
  soil_organic_carbon: '', soil_moisture: '',
};

const defaultUserForm = {
  create_user: false,
  user_email: '',
  user_password: '',
  user_name: '',
  user_role: 'landowner',
};

export default function AdminFarmers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [farmSearch, setFarmSearch] = useState('');
  const [selectedFieldManagerId, setSelectedFieldManagerId] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [userForm, setUserForm] = useState(defaultUserForm);

  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['admin-farms'],
    queryFn: () => admin.getFarms().catch(() => []),
  });

  const { data: fieldManagers = [] } = useQuery({
    queryKey: ['admin-field-managers'],
    queryFn: () => admin.getAvailableManagers().catch(() => []),
  });

  const farmToForm = (farm: any) => ({
    name: farm.name || '', village: farm.village || '', pincode: farm.pincode || '',
    total_land: String(farm.total_land || ''), crop: farm.crop || '', growth_stage: farm.growth_stage || '',
    expected_revenue: String(farm.expected_revenue || ''), profit_share: String(farm.profit_share || ''),
    contract_summary: farm.contract_summary || '',
    soil_ph: String(farm.soil_ph || ''), soil_nitrogen: String(farm.soil_nitrogen || ''),
    soil_phosphorus: String(farm.soil_phosphorus || ''), soil_potassium: String(farm.soil_potassium || ''),
    soil_organic_carbon: String(farm.soil_organic_carbon || ''), soil_moisture: String(farm.soil_moisture || ''),
  });

  const buildFarmPayload = () => ({
    name: form.name,
    village: form.village,
    pincode: form.pincode,
    total_land: parseFloat(form.total_land) || 0,
    crop: form.crop,
    growth_stage: form.growth_stage,
    expected_revenue: parseFloat(form.expected_revenue) || 0,
    profit_share: parseFloat(form.profit_share) || 0,
    contract_summary: form.contract_summary,
  });

  const buildSoilPayload = (farmId: string) => ({
    id: crypto.randomUUID(),
    farm_id: farmId,
    soil_ph: parseFloat(form.soil_ph) || 0,
    soil_nitrogen: parseFloat(form.soil_nitrogen) || 0,
    soil_phosphorus: parseFloat(form.soil_phosphorus) || 0,
    soil_potassium: parseFloat(form.soil_potassium) || 0,
    soil_organic_carbon: parseFloat(form.soil_organic_carbon) || 0,
    soil_moisture: parseFloat(form.soil_moisture) || 0,
  });

  const hasSoilData = () => {
    return [
      form.soil_ph,
      form.soil_nitrogen,
      form.soil_phosphorus,
      form.soil_potassium,
      form.soil_organic_carbon,
      form.soil_moisture,
    ].some((v) => String(v).trim() !== '');
  };

  const saveFarm = useMutation({
    mutationFn: async () => {
      if (editingId) {
        // For editing, just assign manager if specified
        if (selectedFieldManagerId) {
          await admin.assignManager(editingId, selectedFieldManagerId);
        }
      } else {
        if (!selectedFieldManagerId) throw new Error('Select a field manager to assign');
        // Use assign-manager flow for a new farm (farm must exist in DB already)
        toast.info('To create a new farm, an owner must register and submit land first.');
        return;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Farm updated' : 'Farm added');
      queryClient.invalidateQueries({ queryKey: ['admin-farms'] });
      closeModal();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteFarm = useMutation({
    mutationFn: (id: string) => admin.deleteFarm(id),
    onSuccess: () => {
      toast.success('Farm deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-farms'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const closeModal = () => {
    setShowCreate(false);
    setEditingId(null);
    setSelectedFieldManagerId('');
    setForm(defaultForm);
    setUserForm(defaultUserForm);
  };

  const openEdit = (farm: any) => {
    setForm(farmToForm(farm));
    setEditingId(farm.id);
    setShowCreate(true);
  };

  const filteredFarms = useMemo(() => {
    const search = farmSearch.trim().toLowerCase();
    if (!search) return farms;
    return farms.filter((farm: any) =>
      String(farm.farm_code || '').toLowerCase().includes(search) ||
      String(farm.id || '').toLowerCase().includes(search)
    );
  }, [farms, farmSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Farms</h1>
        <button onClick={() => { setForm(defaultForm); setEditingId(null); setShowCreate(true); }}
          className="dashboard-btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Farm
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No farms added yet. Click "Add Farm" to register your first farm.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={farmSearch}
            onChange={(e) => setFarmSearch(e.target.value)}
            placeholder="Search by Farm ID (e.g. 7281183326)"
            className="w-full max-w-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          />

          {filteredFarms.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              <p className="text-sm">No farm found for ID: <strong>{farmSearch}</strong></p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFarms.map((farm: any) => (
                <div key={farm.id} className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{farm.name}</h3>
                        {farm.farm_code && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold">
                            #{farm.farm_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {farm.village}{farm.pincode ? ` - ${farm.pincode}` : ''} · {farm.total_land} acres · {farm.crop || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(farm)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this farm?')) deleteFarm.mutate(farm.id); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Stage:</span> <span className="font-medium">{farm.growth_stage || '—'}</span></div>
                    <div><span className="text-muted-foreground">Revenue:</span> <span className="font-medium">{farm.expected_revenue > 0 ? `₹${(farm.expected_revenue / 1000).toFixed(0)}K` : '—'}</span></div>
                    <div><span className="text-muted-foreground">Profit Share:</span> <span className="font-medium">{farm.profit_share > 0 ? `${farm.profit_share}%` : '—'}</span></div>
                    <div><span className="text-muted-foreground">Sowing:</span> <span className="font-medium">{farm.sowing_date || '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border dashboard-card dashboard-card-ops p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editingId ? 'Edit Farm' : 'Add New Farm'}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Farm / Farmer Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Ramu Naidu" />

              {!editingId && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Assign Field Manager (optional)</label>
                  <select
                    value={selectedFieldManagerId}
                    onChange={e => setSelectedFieldManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    <option value="">No Field Manager</option>
                    {fieldManagers.map((fm: any) => (
                      <option key={fm.id} value={fm.id}>{fm.name || fm.email}</option>
                    ))}
                  </select>
                </div>
              )}

              {!editingId && (
                <div className="col-span-2 border border-border rounded-lg dashboard-card dashboard-card-health p-3 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={userForm.create_user}
                      onChange={e => setUserForm(f => ({ ...f, create_user: e.target.checked }))}
                      className="rounded border-border" />
                    <span className="text-sm font-medium text-foreground">Create User Account (for farmer/landowner)</span>
                  </label>

                  {userForm.create_user && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <FormField label="Email" value={userForm.user_email} onChange={v => setUserForm(f => ({ ...f, user_email: v }))} placeholder="farmer@example.com" type="email" />
                      <FormField label="Password" value={userForm.user_password} onChange={v => setUserForm(f => ({ ...f, user_password: v }))} placeholder="******" type="password" />
                      <FormField label="Full Name" value={userForm.user_name} onChange={v => setUserForm(f => ({ ...f, user_name: v }))} placeholder="Full name" />
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                        <select value={userForm.user_role} onChange={e => setUserForm(f => ({ ...f, user_role: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                          <option value="landowner">Landowner</option>
                          <option value="fieldmanager">Field Manager</option>
                          <option value="worker">Worker</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <FormField label="Village" value={form.village} onChange={v => setForm(f => ({ ...f, village: v }))} placeholder="e.g. Kakinada" />
              <FormField label="Pin Code" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="e.g. 533001" />
              <FormField label="Total Land (Acres)" value={form.total_land} onChange={v => setForm(f => ({ ...f, total_land: v }))} placeholder="10" type="number" />
              <FormField label="Crop" value={form.crop} onChange={v => setForm(f => ({ ...f, crop: v }))} placeholder="e.g. Paddy" />
              <FormField label="Growth Stage" value={form.growth_stage} onChange={v => setForm(f => ({ ...f, growth_stage: v }))} placeholder="e.g. Seedling" />
              <FormField label="Expected Revenue (₹)" value={form.expected_revenue} onChange={v => setForm(f => ({ ...f, expected_revenue: v }))} placeholder="180000" type="number" />
              <FormField label="Profit Share (%)" value={form.profit_share} onChange={v => setForm(f => ({ ...f, profit_share: v }))} placeholder="60" type="number" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Contract Summary</label>
              <textarea value={form.contract_summary} onChange={e => setForm(f => ({ ...f, contract_summary: e.target.value }))}
                placeholder="Brief contract details..." rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
            </div>

            <p className="text-xs font-medium text-foreground">Soil Data (optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="pH" value={form.soil_ph} onChange={v => setForm(f => ({ ...f, soil_ph: v }))} placeholder="6.5" type="number" />
              <FormField label="Nitrogen (kg/ha)" value={form.soil_nitrogen} onChange={v => setForm(f => ({ ...f, soil_nitrogen: v }))} placeholder="280" type="number" />
              <FormField label="Phosphorus (kg/ha)" value={form.soil_phosphorus} onChange={v => setForm(f => ({ ...f, soil_phosphorus: v }))} placeholder="18" type="number" />
              <FormField label="Potassium (kg/ha)" value={form.soil_potassium} onChange={v => setForm(f => ({ ...f, soil_potassium: v }))} placeholder="180" type="number" />
              <FormField label="Organic Carbon (%)" value={form.soil_organic_carbon} onChange={v => setForm(f => ({ ...f, soil_organic_carbon: v }))} placeholder="0.65" type="number" />
              <FormField label="Moisture (%)" value={form.soil_moisture} onChange={v => setForm(f => ({ ...f, soil_moisture: v }))} placeholder="35" type="number" />
            </div>

            <button onClick={() => saveFarm.mutate()} disabled={saveFarm.isPending || !form.name}
              className="dashboard-btn-primary w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
              {saveFarm.isPending ? 'Saving...' : editingId ? 'Update Farm' : 'Add Farm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
    </div>
  );
}
