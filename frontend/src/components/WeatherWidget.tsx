import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { CloudSun, Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';

interface WeatherWidgetProps {
  village: string;
  pincode?: string;
  compact?: boolean;
}

function weatherIcon(code: number) {
  if (code <= 1) return <CloudSun className="w-8 h-8 text-yellow-500" />;
  if (code <= 3) return <CloudSun className="w-8 h-8 text-muted-foreground" />;
  if (code >= 61) return <CloudRain className="w-8 h-8 text-blue-500" />;
  return <CloudSun className="w-8 h-8 text-muted-foreground" />;
}

function riskColor(code: number) {
  if (code >= 80) return 'text-destructive';
  if (code >= 61) return 'text-yellow-600';
  return 'text-primary';
}

export default function WeatherWidget({ village, pincode, compact }: WeatherWidgetProps) {
  const { data: weather, isLoading, isError } = useQuery({
    queryKey: ['weather', village, pincode],
    queryFn: async () => {
      try {
        const response = await javaApi.select('weather', {
          eq: { village, pincode }
        });
        if (!response.success || !response.data) return null;
        const data = (response.data as any[])[0];
        return data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!village,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-2" />
        <div className="h-8 bg-muted rounded w-16" />
      </div>
    );
  }

  if (isError || !weather) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        {weatherIcon(weather.current.weather_code)}
        <div>
          <p className="text-sm font-semibold text-foreground">{weather.current.temperature}°C</p>
          <p className="text-[10px] text-muted-foreground">{weather.current.description} · {weather.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.current.humidity}%</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{weather.current.wind_speed} km/h</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Weather — {weather.location}</p>
          <div className="flex items-center gap-3 mt-1">
            {weatherIcon(weather.current.weather_code)}
            <div>
              <p className="text-2xl font-bold text-foreground">{weather.current.temperature}°C</p>
              <p className={`text-xs font-medium ${riskColor(weather.current.weather_code)}`}>{weather.current.description}</p>
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Droplets className="w-3 h-3" /> Humidity: {weather.current.humidity}%</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Wind className="w-3 h-3" /> Wind: {weather.current.wind_speed} km/h</p>
          {weather.current.precipitation > 0 && (
            <p className="text-xs text-blue-600 flex items-center gap-1 justify-end"><CloudRain className="w-3 h-3" /> Rain: {weather.current.precipitation} mm</p>
          )}
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-5 gap-2">
        {weather.forecast?.map((day: any) => {
          const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
          return (
            <div key={day.date} className="text-center rounded-lg bg-muted/50 p-2">
              <p className="text-[10px] text-muted-foreground">{dayName}</p>
              <div className="flex justify-center my-1">{weatherIcon(day.weather_code)}</div>
              <p className="text-xs font-medium text-foreground">{day.temp_max}°</p>
              <p className="text-[10px] text-muted-foreground">{day.temp_min}°</p>
              {day.precipitation > 0 && (
                <p className="text-[10px] text-blue-500">{day.precipitation}mm</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
