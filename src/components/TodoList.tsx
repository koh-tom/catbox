import { useMemo, useState } from 'react';
import { FaFlag, FaRegCalendarAlt, FaRegClock, FaSortAmountDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { isOverdue, parseTodoDate } from '@/lib/date-utils';
import type { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

type SortKey = 'deadline' | 'created' | 'priority';

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');

  const { overdueTodos, activeTodos, completedTodos, incompleteCount } = useMemo(() => {
    // 優先度による比較
    const comparePriority = (a: Todo, b: Todo) => {
      const pA = a.priority ?? 1;
      const pB = b.priority ?? 1;
      return pB - pA;
    };

    // 期限日によるソート
    const sortByDeadline = (a: Todo, b: Todo) => {
      const dateA = parseTodoDate(a.deadlineDate);
      const dateB = parseTodoDate(b.deadlineDate);

      // 両方日付あり: 早い順 -> 同じなら優先度順
      if (dateA && dateB) {
        const diff = dateA.getTime() - dateB.getTime();
        return diff !== 0 ? diff : comparePriority(a, b);
      }
      // 片方なし: 日付ありが先
      if (!dateA && dateB) return 1;
      if (dateA && !dateB) return -1;
      // 両方なし: 優先度順
      return comparePriority(a, b);
    };

    // 作成日によるソート (古い順 -> 同じなら優先度順)
    const sortByCreated = (a: Todo, b: Todo) => {
      const diff = a.createdAt - b.createdAt;
      return diff !== 0 ? diff : comparePriority(a, b);
    };

    // 優先度によるソート (優先度降順 -> 同じなら期限日早い順)
    const sortByPriority = (a: Todo, b: Todo) => {
      const diff = comparePriority(a, b);
      if (diff !== 0) return diff;

      // 優先度が同じなら期限日比較 (sortByDeadlineのロジックの一部再利用できないので書く)
      const dateA = parseTodoDate(a.deadlineDate);
      const dateB = parseTodoDate(b.deadlineDate);
      if (dateA && dateB) return dateA.getTime() - dateB.getTime();
      if (!dateA && dateB) return 1;
      if (dateA && !dateB) return -1;
      return 0;
    };

    let sortFn;
    switch (sortKey) {
      case 'created':
        sortFn = sortByCreated;
        break;
      case 'priority':
        sortFn = sortByPriority;
        break;
      case 'deadline':
      default:
        sortFn = sortByDeadline;
        break;
    }

    const incomplete = todos.filter((todo) => !todo.completed).sort(sortFn);
    const completed = todos.filter((todo) => todo.completed).sort(sortFn);

    return {
      overdueTodos: incomplete.filter((todo) => isOverdue(todo.deadlineDate)),
      activeTodos: incomplete.filter((todo) => !isOverdue(todo.deadlineDate)),
      completedTodos: completed,
      incompleteCount: incomplete.length,
    };
  }, [todos, sortKey]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-1">タスクがありません</p>
        <span className="text-sm opacity-70">上の入力欄から追加</span>
      </div>
    );
  }

  const toggleSort = () => {
    setSortKey((prev) => {
      if (prev === 'deadline') return 'created';
      if (prev === 'created') return 'priority';
      return 'deadline';
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <FaSortAmountDown className="w-3 h-3" />
          {sortKey === 'deadline' && (
            <>
              <FaRegCalendarAlt className="w-3 h-3" />
              <span>期限順</span>
            </>
          )}
          {sortKey === 'created' && (
            <>
              <FaRegClock className="w-3 h-3" />
              <span>作成順</span>
            </>
          )}
          {sortKey === 'priority' && (
            <>
              <FaFlag className="w-3 h-3" />
              <span>優先度順</span>
            </>
          )}
        </Button>
      </div>

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
