import { FaCrown, FaTrophy } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';

interface HighscoreTileProps {
  yesterday: number;
  weeklyHigh: number;
  monthlyHigh: number;
}

export function HighscoreTile({ yesterday, weeklyHigh, monthlyHigh }: HighscoreTileProps) {
  return (
    <CardContent className="p-5 flex flex-col justify-around h-full">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <FaCrown className="text-yellow-500" />
        Record Highs
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">
            Yesterday
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black">{yesterday}</span>
            <span className="text-[8px] font-bold opacity-40">DONE</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">
            Weekly High
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black">{weeklyHigh}</span>
            <FaTrophy className="text-amber-500 w-2.5 h-2.5" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">
            Monthly High
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black">{monthlyHigh}</span>
            <FaTrophy className="text-blue-400 w-2.5 h-2.5" />
          </div>
        </div>
      </div>
    </CardContent>
  );
}
