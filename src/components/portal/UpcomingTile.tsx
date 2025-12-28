import { FaCat } from 'react-icons/fa';
import { CardContent } from '@/components/ui/card';
import type { Todo } from '@/types/todo';

interface UpcomingTileProps {
  todos: Todo[];
}

export function UpcomingTile({ todos }: UpcomingTileProps) {
  return (
    <CardContent className="p-5 flex flex-col h-full">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
        Flow
      </h3>
      <div className="flex-1 space-y-4 overflow-hidden">
        {todos.slice(0, 4).map((t) => (
          <div
            key={t.id}
            className="text-[10px] font-bold py-2 border-b border-border/30 last:border-0 truncate"
          >
            {t.title}
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-center py-10">
            <FaCat className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No more tasks</p>
          </div>
        )}
      </div>
    </CardContent>
  );
}
