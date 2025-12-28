import { useMemo } from 'react';
import { FaCat, FaPaw } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';

interface GreetingTileProps {
  activeCount: number;
}

export function GreetingTile({ activeCount }: GreetingTileProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'お疲れ様！🐾';
    if (hour < 11) return 'おはよう！🐾';
    if (hour < 17) return 'こんにちは！🐾';
    return 'こんばんは！🐾';
  }, []);

  return (
    <>
      <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full relative z-10">
        <div>
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:rotate-6 transition-transform">
            <FaCat className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">
            現在、{activeCount}件の未完了タスクがあります。
          </p>
        </div>
      </CardContent>
      <FaPaw className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 rotate-12" />
    </>
  );
}
