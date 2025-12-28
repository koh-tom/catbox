/**
 * Weather utilities using Open-Meteo API (Free, no API key required)
 */

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  time: string;
  hourly?: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
  };
}

// Mapping WMO Weather interpretation codes (WW) to descriptions and icons
export const getBriefWeatherInfo = (code: number) => {
  if (code <= 1) return { label: '快晴', icon: 'sunny' };
  if (code <= 3) return { label: '晴れ', icon: 'partly-cloudy' };
  if (code <= 48) return { label: '曇り', icon: 'cloudy' };
  if (code <= 67) return { label: '雨', icon: 'rainy' };
  if (code <= 77) return { label: '雪', icon: 'snowy' };
  if (code <= 82) return { label: '雨', icon: 'rainy' };
  if (code <= 99) return { label: '雷雨', icon: 'thunderstorm' };
  return { label: '不明', icon: 'unknown' };
};

export const PRESET_CITIES = [
  { name: '東京', lat: 35.6895, lon: 139.6917 },
  { name: '大阪', lat: 34.6937, lon: 135.5023 },
  { name: '札幌', lat: 43.0642, lon: 141.3468 },
  { name: '福岡', lat: 33.5902, lon: 130.4017 },
  { name: '那覇', lat: 26.2124, lon: 127.6809 },
] as const;

export type WeatherCity = {
  name: string;
  lat: number;
  lon: number;
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather fetch failed');
  const data = await response.json();

  return {
    temperature: data.current_weather.temperature,
    weatherCode: data.current_weather.weathercode,
    time: data.current_weather.time,
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      weatherCode: data.hourly.weathercode,
    },
  };
}
