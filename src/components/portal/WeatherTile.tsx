import { useEffect, useMemo, useState } from 'react';
import { FaCloudRain, FaCloudSun, FaSnowflake, FaSun, FaCloud, FaBolt, FaMapMarkerAlt } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';
import { fetchWeather, getBriefWeatherInfo, type WeatherData, PRESET_CITIES } from '@/lib/weather';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function WeatherTile() {
  const weatherCity = useUIStore((s) => s.weatherCity);
  const setWeatherCity = useUIStore((s) => s.setWeatherCity);
  
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    let mounted = true;

    const getWeather = async () => {
      setLoading(true);
      try {
        const weather = await fetchWeather(weatherCity.lat, weatherCity.lon);
        if (mounted) {
          setData(weather);
          setError(false);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    getWeather();

    return () => {
      mounted = false;
    };
  }, [weatherCity]);

  const weatherInfo = data ? getBriefWeatherInfo(data.weatherCode) : { label: '---', icon: 'unknown' };

  const renderIcon = (iconName: string, size: string = "w-5 h-5") => {
    switch (iconName) {
      case 'sunny': return <FaSun className={cn(size, "text-yellow-500")} />;
      case 'partly-cloudy': return <FaCloudSun className={cn(size, "text-yellow-500")} />;
      case 'cloudy': return <FaCloud className={cn(size, "text-muted-foreground")} />;
      case 'rainy': return <FaCloudRain className={cn(size, "text-blue-400")} />;
      case 'snowy': return <FaSnowflake className={cn(size, "text-blue-200")} />;
      case 'thunderstorm': return <FaBolt className={cn(size, "text-yellow-600")} />;
      default: return <FaCloudSun className={cn(size, "text-muted-foreground opacity-50")} />;
    }
  };

  // Get forecast every 3 hours (4 points)
  const forecastItems = useMemo(() => {
    if (!data?.hourly) return [];
    const nowIdx = data.hourly.time.findIndex(t => new Date(t) > new Date()) || 0;
    
    return [3, 6, 9, 12].map(hoursAhead => {
      const idx = nowIdx + hoursAhead;
      if (!data.hourly!.time[idx]) return null;
      return {
        time: `${hoursAhead}h`,
        temp: Math.round(data.hourly!.temperature[idx]),
        icon: getBriefWeatherInfo(data.hourly!.weatherCode[idx]).icon,
      };
    }).filter(Boolean);
  }, [data]);

  return (
    <div className="h-full relative overflow-hidden group">
      {/* Top Forecast Row - Icons + Temps below them */}
      {!loading && !error && !showPicker && forecastItems.length > 0 && (
        <div className="absolute top-2 left-0 right-0 flex justify-center gap-2 px-1">
          {forecastItems.map((f, i) => (
            <div key={i} className="flex flex-col items-center min-w-[32px]">
              <span className="text-[7px] font-black text-muted-foreground uppercase leading-none mb-0.5">{f!.time}</span>
              {renderIcon(f!.icon, "w-3 h-3")}
              <span className="text-[9px] font-black mt-0.5 leading-none">{f!.temp}°</span>
            </div>
          ))}
        </div>
      )}

      <CardContent 
        className="pt-12 pb-2 px-4 flex flex-col items-center justify-center h-full text-center cursor-pointer active:scale-95 transition-transform"
        onClick={() => setShowPicker(!showPicker)}
      >
        {loading ? (
          <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-2" />
        ) : error ? (
          <FaMapMarkerAlt className="w-6 h-6 text-destructive/50 mb-2" />
        ) : (
          <div className="transition-transform group-hover:scale-110 duration-500">
            {renderIcon(weatherInfo.icon, "w-10 h-10")}
          </div>
        )}
        
        <div className="text-3xl font-black mt-1 leading-none tracking-tighter">
          {loading ? '--' : error ? 'Err' : `${Math.round(data?.temperature ?? 0)}°C`}
        </div>
        <div className="text-[11px] font-black text-muted-foreground uppercase opacity-80 mt-1.5">
          {weatherCity.name}
        </div>
      </CardContent>

      <AnimatePresence>
        {showPicker && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex flex-col p-3 overflow-y-auto"
          >
            <div className="text-[10px] font-black text-muted-foreground uppercase mb-2 px-1">Select City</div>
            <div className="grid grid-cols-1 gap-1.5 flex-1">
              {PRESET_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setWeatherCity(city);
                    setShowPicker(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all text-left",
                    weatherCity.name === city.name 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
