import { useMemo } from 'react';
import { isOverdue, parseTodoDate } from '@/lib/date-utils';
import type { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  const { overdueTodos, activeTodos, completedTodos, incompleteCount } = useMemo(() => {
    // 期限日によるソート
    const sortByDeadline = (a: Todo, b: Todo) => {
      const dateA = parseTodoDate(a.deadlineDate);
      const dateB = parseTodoDate(b.deadlineDate);

      // 両方日付あり: 早い順
      if (dateA && dateB) return dateA.getTime() - dateB.getTime();
      // 片方なし: 日付ありが先
      if (!dateA && dateB) return 1;
      if (dateA && !dateB) return -1;
      // 両方なし: そのまま
      return 0;
    };

    const incomplete = todos.filter((todo) => !todo.completed).sort(sortByDeadline);
    const completed = todos.filter((todo) => todo.completed).sort(sortByDeadline);

    return {
      overdueTodos: incomplete.filter((todo) => isOverdue(todo.deadlineDate)),
      activeTodos: incomplete.filter((todo) => !isOverdue(todo.deadlineDate)),
      completedTodos: completed,
      incompleteCount: incomplete.length,
    };
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-1">タスクがありません</p>
        <span className="text-sm opacity-70">上の入力欄から追加</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 期限切れタスク */}
      {overdueTodos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-red-500 flex items-center gap-2">🚨 期限切れ</h3>
          <ul className="space-y-2">
            {overdueTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </div>
      )}

      {/* 期限切れと進行中の間のセパレーター */}
      {overdueTodos.length > 0 && activeTodos.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">進行中</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* 進行中タスク（未完了かつ期限切れでない） */}
      {activeTodos.length > 0 && (
        <ul className="space-y-2">
          {activeTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}

      {/* セパレーター */}
      {incompleteCount > 0 && completedTodos.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">完了済み</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* 完了済みタスク */}
      {completedTodos.length > 0 && (
        <ul className="space-y-2">
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
