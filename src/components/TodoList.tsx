import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { FaFlag, FaRegCalendarAlt, FaRegClock, FaSort, FaSortAmountDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { isOverdue, parseTodoDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Tag, Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  savedTags: Tag[];
  onSelectTodo?: (todo: Todo) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  searchQuery?: string;
}

type SortKey = 'deadline' | 'created' | 'priority' | 'manual';

export function TodoList({
  todos,
  onToggle,
  onDelete,
  savedTags,
  onSelectTodo,
  onReorder,
  searchQuery = '',
}: TodoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const toggleFilterTag = (tagName: string) => {
    setFilterTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const { overdueTodos, activeTodos, completedTodos, incompleteCount, manualTodos } =
    useMemo(() => {
      let filteredTodos = todos;

      // 検索フィルター適用
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        filteredTodos = filteredTodos.filter(
          (todo) =>
            todo.title.toLowerCase().includes(query) ||
            todo.description?.toLowerCase().includes(query),
        );
      }

      // タグフィルター適用 (OR条件)
      if (filterTags.length > 0) {
        filteredTodos = filteredTodos.filter((todo) =>
          todo.tags?.some((tag) => filterTags.includes(tag)),
        );
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
          case 'manual':
            return () => 0;
          default:
            return sortDeadline;
        }
      })();

      // manual用の全件リスト (ソートなし、フィルタのみ)
      const isManualMode = sortKey === 'manual' && filterTags.length === 0;

      const incomplete = filteredTodos.filter((todo) => !todo.completed).sort(sortFn);
      const completed = filteredTodos.filter((todo) => todo.completed).sort(sortFn);

      return {
        overdueTodos: incomplete.filter((todo) => isOverdue(todo.deadlineDate)),
        activeTodos: incomplete.filter((todo) => !isOverdue(todo.deadlineDate)),
        completedTodos: completed,
        incompleteCount: incomplete.length,
        manualTodos: isManualMode ? filteredTodos : [], // manualモード用
      };
    }, [todos, sortKey, filterTags, searchQuery]);

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
      if (prev === 'priority') return 'manual';
      return 'deadline';
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    onReorder(result.source.index, result.destination.index);
  };

  const isDragEnabled = sortKey === 'manual' && filterTags.length === 0 && !searchQuery;

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

      <div className="flex justify-end items-center gap-4">
        {sortKey === 'manual' && (filterTags.length > 0 || searchQuery) && (
          <span className="text-xs text-muted-foreground">
            ※ フィルター・検索中は並び替えできません
          </span>
        )}
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
          {sortKey === 'manual' && (
            <>
              <FaSort className="w-3 h-3" />
              <span>自由</span>
            </>
          )}
        </Button>
      </div>

      {isDragEnabled ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {manualTodos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id} index={index}>
                    {(provided, snapshot) => (
                      <TodoItem
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                        todo={todo}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        savedTags={savedTags}
                        onSelect={onSelectTodo}
                        isDraggable
                        isDragging={snapshot.isDragging}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <>
          {/* 期限切れタスク */}
          {overdueTodos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-500 flex items-center gap-2">
                🚨 期限切れ
              </h3>
              <ul className="space-y-2">
                {overdueTodos.map((todo) => (
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
                  savedTags={savedTags}
                  onSelect={onSelectTodo}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
