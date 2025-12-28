import { FaWalking } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';

interface FocusTileProps {
  title?: string;
}

export function FocusTile({ title }: FocusTileProps) {
  return (
    <CardContent className="p-6 flex flex-col justify-center h-full">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Must Do
      </h3>
      <p className="text-sm font-bold truncate">{title || 'Chill time🐾'}</p>
      <div className="mt-2 text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
        <FaWalking className="w-3 h-3" />
        <span>最優先事項です</span>
      </div>
    </CardContent>
  );
}
