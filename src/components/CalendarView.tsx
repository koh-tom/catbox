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
    const dateKey = format(date, 'M/d');
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
            root: 'w-full',
            months: 'flex w-full flex-col',
            month: 'space-y-2 w-full',
            month_caption: 'flex justify-center pt-1 relative items-center h-9 mb-1',
            caption_label: 'text-base font-semibold',
            nav: 'space-x-1 flex items-center',
            button_previous: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border rounded-md hover:bg-muted flex items-center justify-center transition-colors absolute left-1 top-1',
            button_next: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border rounded-md hover:bg-muted flex items-center justify-center transition-colors absolute right-1 top-1',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex w-full',
            weekday: 'text-muted-foreground rounded-md w-[14.28%] font-medium text-xs py-1.5 text-center',
            week: 'flex w-full',
            day: 'h-[88px] w-[14.28%] text-center text-sm p-0 relative focus-within:relative focus-within:z-20 border-t border-l first:border-l-0 border-border/30',
            today: 'bg-accent/30 text-accent-foreground font-bold',
            outside: 'text-muted-foreground opacity-40',
            disabled: 'text-muted-foreground opacity-50',
            hidden: 'invisible',
          }}
          components={{
            Day: (props: any) => {
              const { day, modifiers, children, ...tdProps } = props;
              const dailyDate = day.date;
              const dateKey = format(dailyDate, 'M/d');
              const dayTodos = todosByDate.get(dateKey) || [];

              // 表示するタスク（最大2件でコンパクトに）
              const displayTodos = dayTodos.slice(0, 2);
              const remainingCount = dayTodos.length - 2;

              // 優先度カラーマップ
              const priorityColors: Record<number, string> = {
                1: 'bg-blue-400',
                2: 'bg-green-400',
                3: 'bg-yellow-400',
                4: 'bg-orange-500',
                5: 'bg-red-500'
              };

              return (
                <td
                  {...tdProps}
                  className={cn(
                    tdProps.className,
                    "h-[88px] w-[14.28%] text-center text-sm p-0 relative border-t border-l first:border-l-0 border-border/30 align-top"
                  )}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // childrenにはDayButtonが含まれているが、ここではシンプルに日付選択を行う
                      // 実際のクリックはchildrenのボタンが処理する
                    }}
                    className={cn(
                      "h-full w-full p-1.5 flex flex-col items-start justify-start cursor-pointer hover:bg-accent/40 transition-colors",
                      modifiers.selected && "bg-accent text-accent-foreground",
                      modifiers.today && "bg-accent/30",
                      modifiers.outside && "opacity-40"
                    )}
                  >
                    {/* 日付表示 */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={cn(
                        "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                        modifiers.today ? "bg-primary text-primary-foreground" :
                          modifiers.selected ? "bg-primary/20 text-primary" : "text-foreground"
                      )}>
                        {dailyDate.getDate()}
                      </span>
                      {dayTodos.length > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">
                          {dayTodos.length}
                        </span>
                      )}
                    </div>

                    {/* タスク一覧 */}
                    <div className="w-full flex flex-col gap-1 overflow-hidden flex-1 px-0.5 pb-1">
                      {displayTodos.map((todo) => {
                        const isOver = !todo.completed && isOverdue(todo.deadlineDate);
                        const dotColor = priorityColors[todo.priority ?? 1] || 'bg-slate-400';

                        return (
                          <div
                            key={todo.id}
                            className={cn(
                              'flex items-center gap-1.5 text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-medium border transition-all hover:scale-[1.02] shadow-sm cursor-pointer',
                              todo.completed
                                ? 'bg-muted/50 text-muted-foreground line-through opacity-60 border-transparent'
                                : isOver
                                  ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30'
                                  : 'bg-white text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                            )}
                            title={todo.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTodo(todo);
                            }}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                            <span className="truncate">{todo.title}</span>
                          </div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <span className="text-[10px] text-muted-foreground/80 px-1 font-medium text-right">
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  </div>
                </td>
              );
            },
          }}
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
