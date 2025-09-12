import type { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-1">タスクがありません</p>
        <span className="text-sm opacity-70">上の入力欄から追加</span>
      </div>
    );
  }

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="space-y-4">
      {/* 未完了タスク */}
      {incompleteTodos.length > 0 && (
        <ul className="space-y-2">
          {incompleteTodos.map((todo) => (
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
      {incompleteTodos.length > 0 && completedTodos.length > 0 && (
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
