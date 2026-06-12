import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Flame,
  RefreshCw,
  Sprout,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';

interface AdminFarmWeatherProps {
  role?: 'landowner' | 'fieldmanager' | 'expert' | 'worker' | 'admin';
  backPath?: string;
}

// ── Weather icon helper ──────────────────────────────────────────────────────
function WeatherIcon({ code, size = 32 }: { code: number; size?: number }) {
  const cls = `w-${size === 32 ? 8 : size === 24 ? 6 : 5} h-${size === 32 ? 8 : size === 24 ? 6 : 5}`;
  if (code <= 1) return <Sun className={`${cls} text-yellow-500`} />;
  if (code <= 3) return <CloudSun className={`${cls} text-yellow-400`} />;
  if (code >= 95) return <Zap className={`${cls} text-purple-500`} />;
  if (code >= 71) return <CloudSnow className={`${cls} text-blue-300`} />;
  if (code >= 61) return <CloudRain className={`${cls} text-blue-500`} />;
  if (code >= 51) return <CloudRain className={`${cls} text-blue-400`} />;
  return <CloudSun className={`${cls} text-muted-foreground`} />;
}

// ── Agricultural risk calculator ─────────────────────────────────────────────
function calcRisks(temp: number, humidity: number, precipitation: number) {
  return {
    pest: humidity > 70 && temp >= 20 && temp <= 30,
    disease: humidity > 80 && temp >= 15 && temp <= 25,
    frost: temp < 0,
    heatStress: temp > 35,
    irrigationNeeded: precipitation < 2,
  };
}

function RiskBadge({
  label,
  active,
  icon,
  tooltip,
  color,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  tooltip: string;
  color: string;
}) {
  return (
    <div
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 10,
        background: active ? color : 'var(--gx-surface2)',
        border: `1px solid ${active ? color : 'var(--gx-border)'}`,
        opacity: active ? 1 : 0.55,
        transition: 'all 0.2s',
      }}
    >
      <span style={{ color: active ? '#fff' : 'var(--gx-text2)' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : 'var(--gx-text)' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.8)' : 'var(--gx-text2)' }}>
          {active ? 'HIGH RISK' : 'LOW RISK'}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminFarmWeather({ role = 'admin', backPath }: AdminFarmWeatherProps) {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine back path based on role
  const resolvedBackPath =
    backPath ||
    (role === 'landowner'
      ? '/landowner'
      : role === 'fieldmanager'
      ? '/fieldmanager'
      : role === 'expert'
      ? '/expert'
      : role === 'worker'
      ? '/worker'
      : '/admin/weather');

  // Fetch farms
  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['weather-page-farms', role],
    queryFn: async () => {
      const r = await javaApi.select('farms', {});
      return r.success && r.data ? (r.data as any[]) : [];
    },
  });

  const farm: any = farms[0];

  // Fetch weather for the first farm
  const {
    data: weather,
    isLoading: weatherLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['weather-detail', farm?.village, farm?.pincode, refreshKey],
    queryFn: async () => {
      if (!farm?.village) return null;
      try {
        const r = await javaApi.select('weather', {
          eq: { village: farm.village, pincode: farm.pincode },
        });
        if (!r.success || !r.data) return null;
        return (r.data as any[])[0] ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!farm?.village,
    staleTime: 30 * 60 * 1000,
  });

  const isLoading = farmsLoading || weatherLoading;
  const current = weather?.current;
  const forecast: any[] = weather?.forecast ?? [];
  const risks = current ? calcRisks(current.temperature, current.humidity, current.precipitation ?? 0) : null;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="gx-btn gx-btn-ghost gx-btn-sm"
          onClick={() => navigate(resolvedBackPath)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--gx-text)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CloudSun size={22} style={{ color: 'var(--gx-gold)' }} />
            Farm Weather — Detailed View
          </h1>
          {farm && (
            <p style={{ fontSize: 13, color: 'var(--gx-text2)', margin: '2px 0 0' }}>
              {farm.village || '—'}
              {farm.district ? `, ${farm.district}` : ''}
              {farm.pincode ? ` · PIN ${farm.pincode}` : ''}
            </p>
          )}
        </div>
        <button
          className="gx-btn gx-btn-ghost gx-btn-sm"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: i === 1 ? 160 : 100,
                borderRadius: 12,
                background: 'var(--gx-surface2)',
              }}
            />
          ))}
        </div>
      )}

      {/* No farm */}
      {!isLoading && !farm && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gx-text2)',
            border: '1px dashed var(--gx-border)',
            borderRadius: 12,
          }}
        >
          <CloudSun size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No farm data available. Please register a farm first.</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && farm && (isError || !weather) && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ef4444' }}>Weather data unavailable</strong>
            <p style={{ fontSize: 12, color: 'var(--gx-text2)', margin: '2px 0 0' }}>
              Could not fetch weather for {farm.village}. Check your connection or try refreshing.
            </p>
          </div>
        </div>
      )}

      {/* ── Current Weather Card ── */}
      {!isLoading && current && (
        <div
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--gx-green-dim) 0%, var(--gx-surface2) 100%)',
            border: '1px solid var(--gx-border)',
            padding: '24px 28px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {/* Temperature + condition */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <WeatherIcon code={current.weather_code ?? 0} size={32} />
              <div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: 'var(--gx-text)',
                    lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {current.temperature}°
                  <span style={{ fontSize: 24, fontWeight: 400, color: 'var(--gx-text2)' }}>C</span>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--gx-green)',
                    marginTop: 4,
                    textTransform: 'capitalize',
                  }}
                >
                  {current.description || 'Clear'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                  {weather.location || farm.village}
                </div>
              </div>
            </div>

            {/* Metrics grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px 24px',
                minWidth: 200,
              }}
            >
              <MetricItem
                icon={<Droplets size={14} />}
                label="Humidity"
                value={`${current.humidity}%`}
                color={current.humidity > 80 ? '#ef4444' : current.humidity > 60 ? '#f59e0b' : 'var(--gx-green)'}
              />
              <MetricItem
                icon={<Wind size={14} />}
                label="Wind"
                value={`${current.wind_speed} km/h`}
              />
              <MetricItem
                icon={<CloudRain size={14} />}
                label="Precipitation"
                value={`${current.precipitation ?? 0} mm`}
                color={current.precipitation > 0 ? '#3b82f6' : undefined}
              />
              <MetricItem
                icon={<Thermometer size={14} />}
                label="Feels Like"
                value={`${current.feels_like ?? current.temperature}°C`}
              />
              {current.pressure != null && (
                <MetricItem
                  icon={<Zap size={14} />}
                  label="Pressure"
                  value={`${current.pressure} hPa`}
                />
              )}
              {current.uv_index != null && (
                <MetricItem
                  icon={<Sun size={14} />}
                  label="UV Index"
                  value={String(current.uv_index)}
                  color={current.uv_index >= 8 ? '#ef4444' : current.uv_index >= 5 ? '#f59e0b' : undefined}
                />
              )}
            </div>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div style={{ marginTop: 16, fontSize: 11, color: 'var(--gx-text2)', textAlign: 'right' }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {/* ── 5-Day Forecast ── */}
      {!isLoading && forecast.length > 0 && (
        <div className="gx-card" style={{ marginBottom: 20 }}>
          <div className="gx-card-header">
            <div className="gx-card-title">
              <CloudSun className="inline-block w-4 h-4 mr-1 align-middle" /> 5-Day Forecast
            </div>
          </div>
          <div className="gx-card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(forecast.length, 5)}, 1fr)`,
                gap: 10,
              }}
            >
              {forecast.slice(0, 5).map((day: any) => {
                const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                const dateStr = new Date(day.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <div
                    key={day.date}
                    style={{
                      textAlign: 'center',
                      padding: '14px 8px',
                      borderRadius: 12,
                      background: 'var(--gx-surface2)',
                      border: '1px solid var(--gx-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gx-text)' }}>
                      {dayName}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--gx-text2)' }}>{dateStr}</div>
                    <WeatherIcon code={day.weather_code ?? 0} size={24} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gx-text)' }}>
                      {day.temp_max}°
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gx-text2)' }}>{day.temp_min}°</div>
                    {day.precipitation > 0 && (
                      <div
                        style={{
                          fontSize: 10,
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <CloudRain size={10} /> {day.precipitation}mm
                      </div>
                    )}
                    {day.wind_speed != null && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--gx-text2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Wind size={10} /> {day.wind_speed} km/h
                      </div>
                    )}
                    {day.precipitation_probability != null && (
                      <div
                        style={{
                          fontSize: 10,
                          color: '#3b82f6',
                          fontWeight: 600,
                        }}
                      >
                        {day.precipitation_probability}% rain
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Agricultural Risk Indicators ── */}
      {!isLoading && risks && (
        <div className="gx-card" style={{ marginBottom: 20 }}>
          <div className="gx-card-header">
            <div className="gx-card-title">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /> Agricultural Risk
              Indicators
            </div>
            <span className="gx-status gx-s-pending">
              {Object.values(risks).filter(Boolean).length} Active
            </span>
          </div>
          <div className="gx-card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              <RiskBadge
                label="Pest Risk"
                active={risks.pest}
                icon={<Bug size={16} />}
                tooltip="HIGH if humidity > 70% AND temperature 20–30°C"
                color="rgba(239,68,68,0.85)"
              />
              <RiskBadge
                label="Disease Risk"
                active={risks.disease}
                icon={<Sprout size={16} />}
                tooltip="HIGH if humidity > 80% AND temperature 15–25°C"
                color="rgba(168,85,247,0.85)"
              />
              <RiskBadge
                label="Frost Risk"
                active={risks.frost}
                icon={<CloudSnow size={16} />}
                tooltip="HIGH if temperature < 0°C"
                color="rgba(59,130,246,0.85)"
              />
              <RiskBadge
                label="Heat Stress"
                active={risks.heatStress}
                icon={<Flame size={16} />}
                tooltip="HIGH if temperature > 35°C"
                color="rgba(249,115,22,0.85)"
              />
              <RiskBadge
                label="Irrigation Need"
                active={risks.irrigationNeeded}
                icon={<Droplets size={16} />}
                tooltip="Suggested when precipitation forecast < 2mm"
                color="rgba(20,184,166,0.85)"
              />
            </div>

            {/* Risk explanation */}
            {Object.values(risks).some(Boolean) && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: 12,
                  color: 'var(--gx-text2)',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: '#ef4444' }}>⚠ Active Risks Detected:</strong>{' '}
                {risks.pest && 'High humidity and warm temperatures create favourable conditions for pest outbreaks. Scout fields regularly. '}
                {risks.disease && 'Moist and warm conditions increase fungal and bacterial disease risk. Consider preventive fungicide application. '}
                {risks.frost && 'Sub-zero temperatures detected. Protect sensitive crops with covers or irrigation frost protection. '}
                {risks.heatStress && 'Extreme heat may cause crop wilting and yield loss. Increase irrigation frequency and avoid midday operations. '}
                {risks.irrigationNeeded && 'Low precipitation forecast. Plan irrigation to maintain optimal soil moisture.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Weather Alerts ── */}
      {!isLoading && weather?.alerts && weather.alerts.length > 0 && (
        <div className="gx-card" style={{ marginBottom: 20 }}>
          <div className="gx-card-header">
            <div className="gx-card-title">
              <Zap className="inline-block w-4 h-4 mr-1 align-middle text-yellow-500" /> Weather
              Alerts
            </div>
            <span className="gx-status gx-s-alert">{weather.alerts.length}</span>
          </div>
          <div className="gx-card-body">
            {weather.alerts.map((alert: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>
                  {alert.event || alert.title || 'Weather Alert'}
                </div>
                {alert.description && (
                  <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 4 }}>
                    {alert.description}
                  </div>
                )}
                {(alert.start || alert.end) && (
                  <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 4 }}>
                    {alert.start && `From: ${new Date(alert.start).toLocaleString('en-IN')}`}
                    {alert.end && ` · Until: ${new Date(alert.end).toLocaleString('en-IN')}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hourly Forecast ── */}
      {!isLoading && weather?.hourly && weather.hourly.length > 0 && (
        <div className="gx-card" style={{ marginBottom: 20 }}>
          <div className="gx-card-header">
            <div className="gx-card-title">
              <Thermometer className="inline-block w-4 h-4 mr-1 align-middle" /> Hourly Forecast
            </div>
          </div>
          <div className="gx-card-body">
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {weather.hourly.slice(0, 12).map((h: any, i: number) => {
                const timeStr = h.time
                  ? new Date(h.time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : `+${i}h`;
                return (
                  <div
                    key={i}
                    style={{
                      minWidth: 64,
                      textAlign: 'center',
                      padding: '10px 6px',
                      borderRadius: 10,
                      background: 'var(--gx-surface2)',
                      border: '1px solid var(--gx-border)',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--gx-text2)' }}>{timeStr}</div>
                    <div style={{ margin: '6px 0', display: 'flex', justifyContent: 'center' }}>
                      <WeatherIcon code={h.weather_code ?? 0} size={20} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gx-text)' }}>
                      {h.temperature}°
                    </div>
                    {h.precipitation > 0 && (
                      <div style={{ fontSize: 9, color: '#3b82f6', marginTop: 2 }}>
                        {h.precipitation}mm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Farm Info Summary ── */}
      {!isLoading && farm && (
        <div className="gx-card">
          <div className="gx-card-header">
            <div className="gx-card-title">
              <Sprout className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Location Details
            </div>
          </div>
          <div className="gx-card-body">
            <div className="gx-form-grid">
              <div className="gx-metric-row">
                <span className="gx-metric-label">Farm Name</span>
                <span className="gx-metric-value">{farm.name || farm.farmCode || '—'}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">Village</span>
                <span className="gx-metric-value">{farm.village || '—'}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">District</span>
                <span className="gx-metric-value">{farm.district || '—'}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">State</span>
                <span className="gx-metric-value">{farm.state || 'Andhra Pradesh'}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">Pincode</span>
                <span className="gx-metric-value">{farm.pincode || '—'}</span>
              </div>
              <div className="gx-metric-row">
                <span className="gx-metric-label">Current Crop</span>
                <span className="gx-metric-value">{farm.currentCrop || farm.crop || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Metric item helper ────────────────────────────────────────────────────────
function MetricItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          fontSize: 10,
          color: 'var(--gx-text2)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: color || 'var(--gx-text)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
