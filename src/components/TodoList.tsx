import { useMemo, useState } from 'react';
import { FaFlag, FaRegCalendarAlt, FaRegClock, FaSortAmountDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { isOverdue, parseTodoDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Tag, Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    newTitle: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
  ) => void;
  savedTags: Tag[];
  onSelectTodo?: (todo: Todo) => void;
}

type SortKey = 'deadline' | 'created' | 'priority';

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  savedTags,
  onSelectTodo,
}: TodoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const toggleFilterTag = (tagName: string) => {
    setFilterTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const { overdueTodos, activeTodos, completedTodos, incompleteCount } = useMemo(() => {
    let filteredTodos = todos;

    // タグフィルター適用 (OR条件)
    if (filterTags.length > 0) {
      filteredTodos = todos.filter((todo) => todo.tags?.some((tag) => filterTags.includes(tag)));
    }

    // 優先度による比較
    const comparePriority = (a: Todo, b: Todo) => {
      return (b.priority ?? 1) - (a.priority ?? 1);
    };

    const compareDeadline = (a: Todo, b: Todo) => {
      const dateA = parseTodoDate(a.deadlineDate);
      const dateB = parseTodoDate(b.deadlineDate);
      if (dateA && dateB) return dateA.getTime() - dateB.getTime();
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
    };

    const compareCreated = (a: Todo, b: Todo) => a.createdAt - b.createdAt;

    // ソート: 第一キーが同じ(0)なら第二キーで比較
    const sortCreated = (a: Todo, b: Todo) => compareCreated(a, b) || comparePriority(a, b);
    const sortPriority = (a: Todo, b: Todo) => comparePriority(a, b) || compareDeadline(a, b);
    const sortDeadline = (a: Todo, b: Todo) => compareDeadline(a, b) || comparePriority(a, b);

    const sortFn = (() => {
      switch (sortKey) {
        case 'created':
          return sortCreated;
        case 'priority':
          return sortPriority;
        default:
          return sortDeadline;
      }
    })();

    const incomplete = filteredTodos.filter((todo) => !todo.completed).sort(sortFn);
    const completed = filteredTodos.filter((todo) => todo.completed).sort(sortFn);

    return {
      overdueTodos: incomplete.filter((todo) => isOverdue(todo.deadlineDate)),
      activeTodos: incomplete.filter((todo) => !isOverdue(todo.deadlineDate)),
      completedTodos: completed,
      incompleteCount: incomplete.length,
    };
  }, [todos, sortKey, filterTags]);

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
      {savedTags.length > 0 && (
        <div className="flex gap-2 items-center flex-wrap pb-2 border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground mr-1">フィルター:</span>
          {savedTags.map((tag) => {
            const isSelected = filterTags.includes(tag.name);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleFilterTag(tag.name)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                  isSelected
                    ? cn(tag.color, 'border-transparent shadow-sm')
                    : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span
                  className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-white/40' : tag.color)}
                />
                #{tag.name}
              </button>
            );
          })}
          {filterTags.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterTags([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 ml-auto sm:ml-0"
            >
              クリア
            </button>
          )}
        </div>
      )}

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
                savedTags={savedTags}
                onSelect={onSelectTodo}
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
              savedTags={savedTags}
              onSelect={onSelectTodo}
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
              savedTags={savedTags}
              onSelect={onSelectTodo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
