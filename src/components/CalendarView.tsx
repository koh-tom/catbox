import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { TodoItem } from '@/components/TodoItem';
import type { Todo, Tag } from '@/types/todo';
import { isOverdue } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  savedTags: Tag[];
  onSelectTodo: (todo: Todo) => void;
}

export function CalendarView({
  todos,
  onToggle,
  onDelete,
  savedTags,
  onSelectTodo,
}: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // 日付文字列 (YYYY-MM-DD) をキーにしたTodoのマップを作成
  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    todos.forEach((todo) => {
      if (!todo.deadlineDate) return;
      const dateKey = todo.deadlineDate;
      const current = map.get(dateKey) || [];
      map.set(dateKey, [...current, todo]);
    });
    return map;
  }, [todos]);

  // 選択された日のタスクを取得
  const selectedDateTodos = useMemo(() => {
    if (!date) return [];
    const dateKey = format(date, 'yyyy-MM-dd');
    return todosByDate.get(dateKey) || [];
  }, [date, todosByDate]);

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="border rounded-lg p-3 bg-card shadow-sm overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ja}
          className="w-full p-0"
          classNames={{
            months: 'flex w-full flex-col',
            month: 'space-y-2 w-full',
            caption: 'flex justify-center pt-1 relative items-center h-9 mb-1',
            caption_label: 'text-base font-semibold',
            nav: 'space-x-1 flex items-center',
            nav_button:
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border rounded-md hover:bg-muted flex items-center justify-center transition-colors',
            nav_button_previous: 'absolute left-1 top-1',
            nav_button_next: 'absolute right-1 top-1',
            table: 'w-full border-collapse',
            head_row: 'flex w-full',
            head_cell: 'text-muted-foreground rounded-md w-[14.28%] font-medium text-xs py-1.5',
            row: 'flex w-full',
            cell: 'h-[88px] w-[14.28%] text-center text-sm p-0 relative focus-within:relative focus-within:z-20 border-t border-l first:border-l-0 border-border/30',
            day: 'h-[88px] w-full p-1.5 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-accent/40 hover:text-accent-foreground transition-colors',
            day_selected:
              'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            day_today: 'bg-accent/30 text-accent-foreground font-bold',
            day_outside:
              'day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
            day_hidden: 'invisible',
          }}
          components={
            {
              DayContent: (props: any) => {
                const { date: dayDate } = props;
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const dayTodos = todosByDate.get(dateKey) || [];

                // 表示するタスク（最大2件でコンパクトに）
                const displayTodos = dayTodos.slice(0, 2);
                const remainingCount = dayTodos.length - 2;

                return (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs font-medium w-5 h-5 flex items-center justify-center">
                        {dayDate.getDate()}
                      </span>
                      {dayTodos.length > 0 && (
                        <span className="text-[9px] text-muted-foreground bg-muted/50 px-1 rounded">
                          {dayTodos.length}
                        </span>
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-0.5 overflow-hidden flex-1">
                      {displayTodos.map((todo) => {
                        const isOver = !todo.completed && isOverdue(todo.deadlineDate);

                        return (
                          <div
                            key={todo.id}
                            className={cn(
                              'text-[9px] leading-tight px-1 py-0.5 rounded truncate font-medium',
                              todo.completed
                                ? 'bg-muted/60 text-muted-foreground line-through opacity-50'
                                : isOver
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-primary/10 text-primary',
                            )}
                            title={todo.title}
                          >
                            {todo.title}
                          </div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <span className="text-[9px] text-muted-foreground/70 px-1">
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              },
            } as any
          }
        />
      </div>

      <div className="w-full">
        {/* 選択された日のタスクリスト（カレンダーの下に配置） */}
        {date && selectedDateTodos.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              {format(date, 'M月d日 (EEE)', { locale: ja })}
              <Badge variant="outline" className="text-xs">
                {selectedDateTodos.length}件
              </Badge>
            </h3>
            <ul className="space-y-1.5">
              {selectedDateTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  savedTags={savedTags}
                  onSelect={onSelectTodo}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
