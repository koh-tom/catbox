import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { FaFlag, FaRegCalendarAlt, FaRegClock, FaSort, FaSortAmountDown } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  onDeleteCompleted?: () => void;
  onCompleteTodos?: (ids: string[]) => void;
  onDeleteTodos?: (ids: string[]) => void;
  onDuplicate?: (id: string) => void;
  searchQuery?: string;
  completedCount?: number;
}

type SortKey = 'deadline' | 'created' | 'priority' | 'manual';

export function TodoList({
  todos,
  onToggle,
  onDelete,
  savedTags,
  onSelectTodo,
  onReorder,
  onDeleteCompleted,
  onCompleteTodos,
  onDeleteTodos,
  onDuplicate,
  searchQuery = '',
  completedCount = 0,
}: TodoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleFilterTag = (tagName: string) => {
    setFilterTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map((t) => t.id)));
    }
  };

  const handleBatchComplete = () => {
    if (onCompleteTodos && selectedIds.size > 0) {
      onCompleteTodos(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBatchDelete = () => {
    if (onDeleteTodos && selectedIds.size > 0) {
      if (confirm(`${selectedIds.size}件のタスクを削除してもよいですか？`)) {
        onDeleteTodos(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    }
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
      <div className="flex flex-col gap-4">
        {/* 上部コントロールバー */}
        <div className="flex justify-between items-center pb-2 border-b border-border/40 min-h-[40px]">
          {/* 左側: フィルター */}
          <div className="flex gap-2 items-center flex-wrap flex-1">
            {savedTags.length > 0 && (
              <>
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
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isSelected ? 'bg-white/40' : tag.color,
                        )}
                      />
                      #{tag.name}
                    </button>
                  );
                })}
                {filterTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterTags([])}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                  >
                    クリア
                  </button>
                )}
              </>
            )}
          </div>

          {/* 右側: ソート切替 */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {sortKey === 'manual' && (filterTags.length > 0 || searchQuery) && (
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                ※ フィルター中は固定
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSort}
              className="text-muted-foreground hover:text-foreground gap-2 h-8 px-2"
            >
              <FaSortAmountDown className="w-3 h-3" />
              {sortKey === 'deadline' && (
                <>
                  <FaRegCalendarAlt className="w-3 h-3" />
                  <span className="hidden sm:inline">期限順</span>
                </>
              )}
              {sortKey === 'created' && (
                <>
                  <FaRegClock className="w-3 h-3" />
                  <span className="hidden sm:inline">作成順</span>
                </>
              )}
              {sortKey === 'priority' && (
                <>
                  <FaFlag className="w-3 h-3" />
                  <span className="hidden sm:inline">優先度順</span>
                </>
              )}
              {sortKey === 'manual' && (
                <>
                  <FaSort className="w-3 h-3" />
                  <span className="hidden sm:inline">自由</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 選択アクションバー（選択中のみ表示） */}
        <div className="flex items-center justify-between min-h-[40px]">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-4 w-full p-2 rounded-md bg-accent text-accent-foreground animate-in fade-in slide-in-from-top-1">
              <span className="text-sm font-medium pl-2">{selectedIds.size} 件選択中</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="ghost" className="h-8" onClick={toggleSelectAll}>
                  {selectedIds.size === todos.length ? '全解除' : 'すべて選択'}
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button size="sm" variant="ghost" className="h-8" onClick={handleBatchComplete}>
                  完了にする
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={handleBatchDelete}
                >
                  削除
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              すべて選択
            </Button>
          )}
        </div>
      </div>

      {isDragEnabled ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
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
                        onDuplicate={onDuplicate}
                        savedTags={savedTags}
                        onSelect={onSelectTodo}
                        isDraggable
                        isDragging={snapshot.isDragging}
                        isSelected={selectedIds.has(todo.id)}
                        onToggleSelect={toggleSelection}
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
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {overdueTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    savedTags={savedTags}
                    onSelect={onSelectTodo}
                    isSelected={selectedIds.has(todo.id)}
                    onToggleSelect={toggleSelection}
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
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  savedTags={savedTags}
                  onSelect={onSelectTodo}
                  isSelected={selectedIds.has(todo.id)}
                  onToggleSelect={toggleSelection}
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
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  savedTags={savedTags}
                  onSelect={onSelectTodo}
                  isSelected={selectedIds.has(todo.id)}
                  onToggleSelect={toggleSelection}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* フッター: 完了数 + 一括削除ボタン (選択中は非表示) */}
      {todos.length > 0 && selectedIds.size === 0 && (
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {completedCount} / {todos.length} 完了
          </span>
          {completedCount > 0 && onDeleteCompleted && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2">
                  <MdDeleteSweep className="w-4 h-4" />
                  完了済みを削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>完了済みのタスクを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    {completedCount}件の完了済みタスクをゴミ箱に移動します。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteCompleted} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}
