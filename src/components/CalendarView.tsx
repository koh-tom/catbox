import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { TodoItem } from '@/components/TodoItem';
import { Calendar } from '@/components/ui/calendar';
import { isOverdue } from '@/lib/date-utils';
import type { Tag, Todo } from '@/types/todo';

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
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      <div className="flex-none">
        <div className="border rounded-md p-4 flex justify-center bg-card shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ja}
            className="rounded-md"
            components={
              {
                DayContent: (props: any) => {
                  const { date: dayDate } = props;
                  const dateKey = format(dayDate, 'yyyy-MM-dd');
                  const dayTodos = todosByDate.get(dateKey);
                  const hasTodos = dayTodos && dayTodos.length > 0;

                  // 未完了かつ期限切れがあるか
                  const hasOverdue = dayTodos?.some(
                    (t) => !t.completed && isOverdue(t.deadlineDate),
                  );
                  // 全て完了しているか
                  const isAllCompleted = dayTodos?.length
                    ? dayTodos.every((t) => t.completed)
                    : false;

                  // ドットの色決定
                  let dotColor = 'bg-primary';
                  if (hasOverdue) dotColor = 'bg-red-500';
                  else if (isAllCompleted) dotColor = 'bg-muted-foreground/50';

                  return (
                    <div className="relative w-full h-full flex items-center justify-center p-2">
                      <span>{dayDate.getDate()}</span>
                      {hasTodos && (
                        <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      )}
                    </div>
                  );
                },
              } as any
            }
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b pb-2">
          {date ? format(date, 'yyyy年M月d日 (EEE)', { locale: ja }) : '日付を選択'}
          <span className="text-sm font-normal text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
            {selectedDateTodos.length}件
          </span>
        </h3>

        {selectedDateTodos.length > 0 ? (
          <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
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
        ) : (
          <div className="text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <p>タスクはありません</p>
            <p className="text-xs opacity-70 mt-1">
              {date
                ? '新しいタスクを追加するか、別の日を選択してください'
                : '日付を選択してください'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
