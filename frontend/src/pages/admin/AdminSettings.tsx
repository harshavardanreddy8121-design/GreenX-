import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { javaApi } from '@/integrations/java-api/client';
import { toast } from 'sonner';

const SETTINGS_KEY = 'greenx.cluster.settings.v1';

type ClusterSettings = {
  companyName: string;
  region: string;
  supportPhone: string;
  defaultLanguage: string;
  weatherAlertThreshold: string;
};

const defaultSettings: ClusterSettings = {
  companyName: 'GreenX Agri Solutions',
  region: 'East Godavari, Andhra Pradesh',
  supportPhone: '+91 98765 43210',
  defaultLanguage: 'en',
  weatherAlertThreshold: '35',
};

function readSavedSettings(): ClusterSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      companyName: parsed.companyName || defaultSettings.companyName,
      region: parsed.region || defaultSettings.region,
      supportPhone: parsed.supportPhone || defaultSettings.supportPhone,
      defaultLanguage: parsed.defaultLanguage || defaultSettings.defaultLanguage,
      weatherAlertThreshold: String(parsed.weatherAlertThreshold || defaultSettings.weatherAlertThreshold),
    };
  } catch {
    return defaultSettings;
  }
}

export default function AdminSettings() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<ClusterSettings>(() => readSavedSettings());
  const [adminName, setAdminName] = useState(profile?.full_name || '');
  const [adminPhone, setAdminPhone] = useState(profile?.phone || '');

  const { data: profileRow } = useQuery({
    queryKey: ['admin-settings-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await javaApi.select('profiles', { eq: { id: user?.id } });
      if (!response.success || !response.data || (response.data as any[]).length === 0) return null;
      return (response.data as any[])[0];
    },
  });

  useEffect(() => {
    const nextName = profileRow?.full_name || profile?.full_name || '';
    const nextPhone = profileRow?.phone || profile?.phone || '';
    setAdminName(nextName);
    setAdminPhone(nextPhone);
  }, [profileRow, profile?.full_name, profile?.phone]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      if (!user?.id) return;

      const payload = {
        full_name: adminName.trim() || 'Admin',
        phone: adminPhone.trim() || null,
      };

      const updateResponse = await javaApi.update('profiles', user.id, payload);
      if (updateResponse.success) return;

      // Create profile row if update failed because the row does not exist.
      const createResponse = await javaApi.insert('profiles', { id: user.id, ...payload });
      if (!createResponse.success) {
        throw new Error(updateResponse.error || createResponse.error || 'Failed to save admin profile');
      }
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save settings');
    },
  });

  const hasChanges = useMemo(() => {
    const stored = readSavedSettings();
    return (
      stored.companyName !== settings.companyName ||
      stored.region !== settings.region ||
      stored.supportPhone !== settings.supportPhone ||
      stored.defaultLanguage !== settings.defaultLanguage ||
      String(stored.weatherAlertThreshold) !== String(settings.weatherAlertThreshold)
    );
  }, [settings]);

  const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Cluster Settings</h2>

        <div>
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))}
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Region</label>
          <input
            type="text"
            value={settings.region}
            onChange={(e) => setSettings((prev) => ({ ...prev, region: e.target.value }))}
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground">Support Phone</label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings((prev) => ({ ...prev, defaultLanguage: e.target.value }))}
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Weather Alert Threshold (deg C)</label>
          <input
            type="number"
            value={settings.weatherAlertThreshold}
            onChange={(e) => setSettings((prev) => ({ ...prev, weatherAlertThreshold: e.target.value }))}
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dashboard-card dashboard-card-ops p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Admin Profile</h2>

        <div>
          <label className="text-sm font-medium text-foreground">Admin User</label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground">Admin Phone</label>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Admin Email</label>
            <input
              type="text"
              value={user?.email || ''}
              readOnly
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-muted/60 border border-border text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => saveSettings.mutate()}
          disabled={saveSettings.isPending}
          className="dashboard-btn-primary px-4 py-2 rounded-lg text-sm"
        >
          {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={resetSettings}
          className="px-4 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground"
        >
          Reset Defaults
        </button>
        {hasChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
      </div>
    </div>
  );
}
