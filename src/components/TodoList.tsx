import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaCat, FaFlag, FaRegCalendarAlt, FaRegClock, FaSort, FaSortAmountDown } from 'react-icons/fa';
import { MdCheckCircle, MdDeleteSweep, MdPendingActions, MdStar, MdTaskAlt, MdWarning } from 'react-icons/md';
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
import { Button } from '@/components/ui/button';
import { isOverdue, isTodayTask, parseTodoDate } from '@/lib/date-utils';
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

export const TodoList = memo(function TodoList({
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

  const toggleFilterTag = useCallback((tagName: string) => {
    setFilterTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBatchComplete = useCallback(() => {
    if (onCompleteTodos && selectedIds.size > 0) {
      onCompleteTodos(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [onCompleteTodos, selectedIds]);

  const handleBatchDelete = useCallback(() => {
    if (onDeleteTodos && selectedIds.size > 0) {
      onDeleteTodos(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [onDeleteTodos, selectedIds]);

  const { overdueTodos, todayTodos, activeTodos, completedTodos, manualTodos, visibleTodos } =
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

      const notOverdue = incomplete.filter((todo) => !isOverdue(todo.deadlineDate));

      return {
        overdueTodos: incomplete.filter((todo) => isOverdue(todo.deadlineDate)),
        todayTodos: notOverdue.filter((todo) => isTodayTask(todo.deadlineDate)),
        activeTodos: notOverdue.filter((todo) => !isTodayTask(todo.deadlineDate)),
        completedTodos: completed,
        manualTodos: isManualMode ? filteredTodos : [], // manualモード用
        visibleTodos: filteredTodos,
      };
    }, [todos, sortKey, filterTags, searchQuery]);

  const toggleSelectAll = useCallback(() => {
    if (visibleTodos.length === 0) return;

    // 現在画面に見えているもの全てが選択済みかどうか
    const allVisibleSelected = visibleTodos.every((t) => selectedIds.has(t.id));

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (allVisibleSelected) {
        // 全て選択済みの場合は、画面に見えているものだけを選択解除
        visibleTodos.forEach((t) => {
          newSet.delete(t.id);
        });
      } else {
        // それ以外の場合は、画面に見えているものを全て選択状態にする
        visibleTodos.forEach((t) => {
          newSet.add(t.id);
        });
      }
      return newSet;
    });
  }, [visibleTodos, selectedIds]);


  const toggleSort = useCallback(() => {
    setSortKey((prev) => {
      if (prev === 'deadline') return 'created';
      if (prev === 'created') return 'priority';
      if (prev === 'priority') return 'manual';
      return 'deadline';
    });
  }, []);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !onReorder) return;
      onReorder(result.source.index, result.destination.index);
    },
    [onReorder],
  );

  const isDragEnabled = sortKey === 'manual' && filterTags.length === 0 && !searchQuery;

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="text-6xl mb-4 opacity-20 transition-all duration-500 cursor-default flex items-center justify-center">
          <FaCat className="w-16 h-16" />
        </div>
        <p className="text-lg font-bold mb-1">タスクがありません</p>
        <span className="text-sm opacity-70">
          上部の「新しいタスクを追加」から作成しましょう
        </span>
      </div>
    );
  }

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

        {/* 選択アクションバー（画面下部にフローティング表示） */}
        {selectedIds.size > 0 &&
          (() => {
            const allSelectedCompleted = Array.from(selectedIds).every(
              (id) =>
                visibleTodos.find((t) => t.id === id)?.completed ??
                todos.find((t) => t.id === id)?.completed,
            );

            return (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-3 rounded-full bg-foreground shadow-2xl text-background animate-in slide-in-from-bottom-5 fade-in min-w-[320px] justify-between border border-border/20">
                <span className="text-sm font-bold pl-3">{selectedIds.size} 件選択中</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 hover:bg-background/20 hover:text-background rounded-full px-4"
                    onClick={toggleSelectAll}
                  >
                    {visibleTodos.length > 0 && selectedIds.size === visibleTodos.length
                      ? '全解除'
                      : 'すべて選択'}
                  </Button>
                  <div className="w-px h-5 bg-background/30 mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 hover:bg-background/20 hover:text-background rounded-full px-4"
                    onClick={handleBatchComplete}
                  >
                    {allSelectedCompleted ? '未完了に戻す' : '一括完了'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded-full px-4 font-semibold"
                      >
                        削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{selectedIds.size}件のタスクを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          選択したタスクをゴミ箱に移動します。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBatchDelete}
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })()}

        <div className="flex items-center justify-end min-h-[40px] mb-4">
          {selectedIds.size === 0 && (
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
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3"
              >
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
        <div className="flex flex-col gap-4 lg:gap-6 h-full pb-4">
          {/* 今日のタスク (上部カンバン) */}
          {todayTodos.length > 0 && (
            <div className="flex flex-col gap-3 bg-yellow-500/10 dark:bg-yellow-500/15 p-3 sm:p-4 rounded-xl border border-yellow-500/30 w-full shrink-0">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <MdStar className="w-4 h-4" /> 今日のタスク
                </h3>
                <span className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {todayTodos.length}
                </span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-yellow-500/30">
                {todayTodos.map((todo) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start flex-1 min-h-0">
            {/* 期限切れカラム */}
            <div className="flex flex-col gap-3 bg-red-500/5 dark:bg-red-500/10 p-3 sm:p-4 rounded-xl border border-red-500/20 max-h-[calc(100vh-14rem)] overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <MdWarning className="w-4 h-4" /> 期限切れ
                </h3>
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {overdueTodos.length}
                </span>
              </div>
              <ul className="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 scrollbar-thin scrollbar-thumb-muted">
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
                {overdueTodos.length === 0 && (
                  <div className="text-sm text-muted-foreground/60 text-center py-10">
                    タスクなし
                  </div>
                )}
              </ul>
            </div>

            {/* 進行中カラム */}
            <div className="flex flex-col gap-3 bg-card p-3 sm:p-4 rounded-xl border shadow-sm max-h-[calc(100vh-14rem)] overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <MdPendingActions className="w-4 h-4" /> 進行中
                </h3>
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {activeTodos.length}
                </span>
              </div>
              <ul className="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 scrollbar-thin scrollbar-thumb-muted">
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
                {activeTodos.length === 0 && (
                  <div className="text-sm text-muted-foreground/60 text-center py-10">
                    タスクなし
                  </div>
                )}
              </ul>
            </div>

            {/* 完了済みカラム */}
            <div className="flex flex-col gap-3 bg-muted/30 p-3 sm:p-4 rounded-xl border border-transparent max-h-[calc(100vh-14rem)] overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                  <MdCheckCircle className="w-4 h-4" /> 完了済み
                </h3>
                <span className="bg-muted-foreground/15 text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {completedTodos.length}
                </span>
              </div>
              <ul className="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 scrollbar-thin scrollbar-thumb-muted">
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
                {completedTodos.length === 0 && (
                  <div className="text-sm text-muted-foreground/60 text-center py-10">
                    タスクなし
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive gap-2"
                >
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
                  <AlertDialogAction
                    onClick={onDeleteCompleted}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
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
});
