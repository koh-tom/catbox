import { useEffect, useState } from 'react';
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

  const renderIcon = () => {
    switch (weatherInfo.icon) {
      case 'sunny': return <FaSun className="w-5 h-5 text-yellow-500" />;
      case 'partly-cloudy': return <FaCloudSun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <FaCloud className="w-5 h-5 text-muted-foreground" />;
      case 'rainy': return <FaCloudRain className="w-5 h-5 text-blue-400" />;
      case 'snowy': return <FaSnowflake className="w-5 h-5 text-blue-200" />;
      case 'thunderstorm': return <FaBolt className="w-5 h-5 text-yellow-600" />;
      default: return <FaCloudSun className="w-5 h-5 text-muted-foreground opacity-50" />;
    }
  };

  return (
    <div className="h-full relative overflow-hidden">
      <CardContent 
        className="p-4 flex flex-col items-center justify-center h-full text-center cursor-pointer group active:scale-95 transition-transform"
        onClick={() => setShowPicker(!showPicker)}
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-2" />
        ) : error ? (
          <FaMapMarkerAlt className="w-5 h-5 text-destructive/50 mb-2" />
        ) : (
          <div className="transition-transform group-hover:scale-110 duration-500">
            {renderIcon()}
          </div>
        )}
        
        <div className="text-xl font-black mt-1">
          {loading ? '--' : error ? 'Error' : `${Math.round(data?.temperature ?? 0)}°C`}
        </div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 flex items-center gap-1">
          {weatherCity.name}
        </div>
      </CardContent>

      <AnimatePresence>
        {showPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex flex-col p-2 overflow-y-auto scrollbar-none"
          >
            <div className="text-[8px] font-black text-muted-foreground uppercase mb-2 px-2">Select City</div>
            <div className="flex-1 space-y-1">
              {PRESET_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setWeatherCity(city);
                    setShowPicker(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors",
                    weatherCity.name === city.name ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  {city.name}
                </button>
              ))}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker(false);
              }}
              className="mt-2 w-full py-1 text-[8px] font-bold text-muted-foreground uppercase hover:text-foreground"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
