import { FaFire } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HabitTileProps {
  streak: number;
}

export function HabitTile({ streak }: HabitTileProps) {
  return (
    <CardContent className="p-6 flex items-center justify-between h-full bg-gradient-to-r from-primary/5 to-transparent">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
          Weekly Streak
        </h3>
        <div className="flex items-center gap-1 mt-2">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, i) => (
            <div
              key={day}
              className={cn('w-6 h-1 rounded-full', i < streak ? 'bg-primary' : 'bg-primary/20')}
            />
          ))}
        </div>
      </div>
      <div className="text-right">
        <FaFire className="w-6 h-6 text-orange-500 ml-auto" />
        <div className="text-lg font-black mt-1 line-none">{streak} days</div>
      </div>
    </CardContent>
  );
}
