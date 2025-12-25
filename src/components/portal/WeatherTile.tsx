import { CardContent } from '@/components/ui/card';
import { FaCloudSun } from 'react-icons/fa';

export function WeatherTile() {
  return (
    <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
      <FaCloudSun className="w-5 h-5 text-yellow-500 mb-2 group-hover:animate-pulse" />
      <div className="text-xl font-black">22°C</div>
      <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Sunny</div>
    </CardContent>
  );
}
