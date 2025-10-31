import { useRef, useState } from 'react';
import { MdHelpOutline, MdSearch } from 'react-icons/md';
import { toast } from 'sonner';
import { AboutModal } from '@/components/AboutModal';
import { CalendarView } from '@/components/CalendarView';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TodoDetailModal } from '@/components/TodoDetailModal';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppShortcuts } from '@/hooks/useAppShortcuts';
import { useTodos } from '@/hooks/useTodos';
import { APP_NAME } from '@/lib/constants';
import type { Todo } from '@/types/todo';

function App() {
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
  } = useTodos();

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const editingTodo = editingTodoId ? todos.find((t) => t.id === editingTodoId) ?? null : null;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const completedCount = todos.filter((t) => t.completed).length;

  const handleSaveDetail = (
    _id: string,
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
  ) => {
    if (editingTodoId) {
      editTodo(editingTodoId, { title, deadlineDate, priority, tags, description });
    } else {
      addTodo(title, deadlineDate, priority, tags, description);
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <Card>
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
                  />
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    title="ヘルプ"
                    onClick={() => setIsAboutOpen(true)}
                  >
                    <MdHelpOutline className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TodoInput
              onAdd={addTodo}
              savedTags={savedTags}
              onOpenDetailAdd={handleOpenCreateModal}
            />

            <Tabs defaultValue="list" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="list">リスト</TabsTrigger>
                <TabsTrigger value="calendar">カレンダー</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-4">
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
              <TabsContent value="calendar" className="mt-4">
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
      </div>

      <Toaster />
    </div>
  );
}

export default App;
