import { useRef, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { MdAdd, MdHelpOutline, MdLogout, MdSearch } from 'react-icons/md';
import { toast } from 'sonner';
import { AboutModal } from '@/components/AboutModal';
import { AuthScreen } from '@/components/AuthScreen';
import { CalendarView } from '@/components/CalendarView';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TodoDetailModal } from '@/components/TodoDetailModal';
import { TodoList } from '@/components/TodoList';
import { TrashView } from '@/components/TrashView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAppShortcuts } from '@/hooks/useAppShortcuts';
import { useTodos } from '@/hooks/useTodos';
import { APP_NAME } from '@/lib/constants';
import type { RecurrenceRule, Todo } from '@/types/todo';

function App() {
  const { user, isLoading, signOut } = useAuth();

  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    deleteCompleted,
    completeTodos,
    deleteTodos,
    duplicateTodo,
    restoreDeleted,
    savedTags,
    addSavedTag,
    deleteSavedTag,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    trashedTodos,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
    trashStorageSizeKB,
    trashLimit,
  } = useTodos();

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const editingTodo = editingTodoId ? (todos.find((t) => t.id === editingTodoId) ?? null) : null;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const completedCount = todos.filter((t) => t.completed).length;

  const handleSaveDetail = (
    _id: string,
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
    estimatedHours?: number,
    recurrenceRule?: RecurrenceRule,
  ) => {
    if (editingTodoId) {
      editTodo(editingTodoId, {
        title,
        deadlineDate,
        priority,
        tags,
        description,
        estimatedHours,
        recurrenceRule,
      });
    } else {
      addTodo(title, deadlineDate, priority, tags, description, estimatedHours, recurrenceRule);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTodoId(null);
    setIsDetailOpen(true);
  };

  useAppShortcuts({
    onOpenSearch: () => searchInputRef.current?.focus(),
    onOpenCreateModal: handleOpenCreateModal,
  });

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setEditingTodoId(null), 300);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
    toast('タスクを削除しました', {
      action: {
        label: '元に戻す',
        onClick: () => restoreDeleted(),
      },
    });
  };

  const handleDeleteCompleted = () => {
    deleteCompleted();
    toast('完了済みタスクを削除しました', {
      action: {
        label: '元に戻す',
        onClick: () => restoreDeleted(),
      },
    });
  };

  const handleDeleteTodos = (ids: string[]) => {
    deleteTodos(ids);
    toast(`${ids.length}件のタスクを削除しました`, {
      action: {
        label: '元に戻す',
        onClick: () => restoreDeleted(),
      },
    });
  };

  const handleExportTodos = () => {
    try {
      const dataStr = JSON.stringify(todos, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catbox-todos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('データをエクスポートしました');
    } catch {
      toast.error('エクスポートに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-0 sm:p-4">
      <div className="w-full mx-auto flex flex-col min-h-screen sm:min-h-[calc(100vh-2rem)]">
        <Card className="flex-1 border-0 sm:border rounded-none sm:rounded-xl shadow-none sm:shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle className="text-2xl font-semibold">{APP_NAME}</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <MdSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="タスクを検索... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <SettingsMenu
                    savedTags={savedTags}
                    addSavedTag={addSavedTag}
                    deleteSavedTag={deleteSavedTag}
                    onExportTodos={handleExportTodos}
                  />
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 relative"
                    title="ゴミ箱"
                    onClick={() => setIsTrashOpen(true)}
                  >
                    <FaTrashAlt className="h-4 w-4" />
                    {trashedTodos.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                        {trashedTodos.length}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    title="ヘルプ"
                    onClick={() => setIsAboutOpen(true)}
                  >
                    <MdHelpOutline className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    title="ログアウト"
                    onClick={() => signOut()}
                  >
                    <MdLogout className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="mb-6 shrink-0">
              <Button
                onClick={handleOpenCreateModal}
                variant="outline"
                className="w-full h-14 border-2 border-dashed bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl flex items-center justify-center gap-2 transition-all hover:border-solid hover:border-primary/50"
              >
                <MdAdd className="w-6 h-6" />
                <span className="font-medium text-base">新しいタスクを追加</span>
              </Button>
            </div>

            <Tabs defaultValue="list" className="mt-2 flex-1 flex flex-col">
              <div className="shrink-0 flex items-center justify-between">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="list">リスト</TabsTrigger>
                  <TabsTrigger value="calendar">カレンダー</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="list" className="mt-4 flex-1 outline-none">
                <TodoList
                  todos={todos}
                  onToggle={toggleTodo}
                  onDelete={handleDeleteTodo}
                  onReorder={reorderTodos}
                  onDeleteCompleted={handleDeleteCompleted}
                  onCompleteTodos={completeTodos}
                  onDeleteTodos={handleDeleteTodos}
                  onDuplicate={duplicateTodo}
                  savedTags={savedTags}
                  onSelectTodo={handleOpenEditModal}
                  searchQuery={searchQuery}
                  completedCount={completedCount}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-4 flex-1 outline-none">
                <CalendarView
                  todos={todos}
                  onToggle={toggleTodo}
                  onDelete={handleDeleteTodo}
                  savedTags={savedTags}
                  onSelectTodo={handleOpenEditModal}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <TodoDetailModal
          todo={editingTodo}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onSave={handleSaveDetail}
          savedTags={savedTags}
          onAddSubTask={addSubTask}
          onToggleSubTask={toggleSubTask}
          onDeleteSubTask={deleteSubTask}
        />

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

        <TrashView
          isOpen={isTrashOpen}
          onClose={() => setIsTrashOpen(false)}
          trashedTodos={trashedTodos}
          onRestore={restoreFromTrash}
          onPermanentlyDelete={permanentlyDelete}
          onEmptyTrash={emptyTrash}
          trashLimit={trashLimit}
          trashStorageSizeKB={trashStorageSizeKB}
        />
      </div>

      <Toaster />
    </div>
  );
}

export default App;
