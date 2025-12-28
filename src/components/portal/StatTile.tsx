import type { IconType } from 'react-icons';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatTileProps {
  icon: IconType;
  value: string | number;
  label: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function StatTile({
  icon: Icon,
  value,
  label,
  iconColorClass = 'text-blue-500',
  iconBgClass = 'bg-blue-500/10',
}: StatTileProps) {
  return (
    <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform',
          iconBgClass,
        )}
      >
        <Icon className={cn('w-5 h-5', iconColorClass)} />
      </div>
      <div className="text-xl font-black">{value}</div>
      <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">{label}</div>
    </CardContent>
  );
}
