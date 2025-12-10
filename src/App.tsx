import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { MdAdd, MdHelpOutline, MdLogout, MdSearch } from 'react-icons/md';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';
import { AboutModal } from '@/components/AboutModal';
import { AuthScreen } from '@/components/AuthScreen';
import { CalendarView } from '@/components/CalendarView';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PasswordUpdateScreen } from '@/components/PasswordUpdateScreen';
import { TodoDetailModal } from '@/components/TodoDetailModal';
import { TodoList } from '@/components/TodoList';
import { TrashView } from '@/components/TrashView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAppShortcuts } from '@/hooks/useAppShortcuts';
import { useTodos } from '@/hooks/useTodos';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { RecurrenceRule, Todo } from '@/types/todo';

function App() {
  const { user, isLoading, signOut, isPasswordRecovery } = useAuth();

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

  const navigate = useNavigate();
  const location = useLocation();

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const editingTodo = editingTodoId ? (todos.find((t) => t.id === editingTodoId) ?? null) : null;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 現在のパスに基づいてタブやモードを選択
  const currentPath = location.pathname;
  const activeTab = currentPath.startsWith('/calendar') ? 'calendar' : 'list';
  const isTrashOpen = currentPath === '/trash';

  // タイトルをルーティングに合わせて更新 (SEO/UX)
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'タスク一覧',
      '/calendar': 'カレンダー',
      '/trash': 'ゴミ箱',
    };
    const currentTitle = titles[location.pathname] || '';
    document.title = currentTitle ? `${currentTitle} | ${APP_NAME}` : APP_NAME;
  }, [location.pathname]);

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);

  const handleSaveDetail = useCallback(
    (
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
    },
    [editingTodoId, editTodo, addTodo],
  );

  const handleOpenCreateModal = useCallback(() => {
    setEditingTodoId(null);
    setIsDetailOpen(true);
  }, []);

  useAppShortcuts({
    onOpenSearch: () => searchInputRef.current?.focus(),
    onOpenCreateModal: handleOpenCreateModal,
  });

  const handleOpenEditModal = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setTimeout(() => setEditingTodoId(null), 300);
  }, []);

  const handleDeleteTodo = useCallback(
    (id: string) => {
      deleteTodo(id);
      toast('タスクを削除しました', {
        action: {
          label: '元に戻す',
          onClick: () => restoreDeleted(),
        },
      });
    },
    [deleteTodo, restoreDeleted],
  );

  const handleDeleteCompleted = useCallback(() => {
    deleteCompleted();
    toast('完了済みタスクを削除しました', {
      action: {
        label: '元に戻す',
        onClick: () => restoreDeleted(),
      },
    });
  }, [deleteCompleted, restoreDeleted]);

  const handleDeleteTodos = useCallback(
    (ids: string[]) => {
      deleteTodos(ids);
      toast(`${ids.length}件のタスクを削除しました`, {
        action: {
          label: '元に戻す',
          onClick: () => restoreDeleted(),
        },
      });
    },
    [deleteTodos, restoreDeleted],
  );

  const handleExportTodos = useCallback(
    (format: 'json' | 'csv') => {
      try {
        let dataStr = '';
        let mimeType = '';
        let ext = '';

        if (format === 'json') {
          dataStr = JSON.stringify(todos, null, 2);
          mimeType = 'application/json';
          ext = 'json';
        } else {
          // CSVのヘッダー
          const headers = [
            'ID',
            'タイトル',
            '完了',
            '作成日',
            '完了日',
            '期限日',
            '優先度',
            '見積もり時間(h)',
            '繰り返し',
            'サブタスク完了枠',
            'タグ',
            'メモ',
          ];
          const csvRows = [headers.join(',')];
          todos.forEach((todo) => {
            const values = [
              todo.id,
              `"${(todo.title || '').replace(/"/g, '""')}"`,
              todo.completed ? '完了' : '未完了',
              todo.createdAt ? new Date(todo.createdAt).toLocaleDateString('ja-JP') : '',
              todo.completedAt ? new Date(todo.completedAt).toLocaleDateString('ja-JP') : '',
              todo.deadlineDate || '',
              todo.priority || 1,
              todo.estimatedHours || '',
              todo.recurrenceRule || '',
              todo.subtasks?.length
                ? `${todo.subtasks.filter((s) => s.completed).length}/${todo.subtasks.length}`
                : '',
              `"${(todo.tags || []).join(' ')}"`,
              `"${(todo.description || '').replace(/"/g, '""')}"`,
            ];
            csvRows.push(values.join(','));
          });
          const csvContent = csvRows.join('\n');
          // Excelで文字化けしないようにUTF-8のBOMを付与
          dataStr = `\uFEFF${csvContent}`;
          mimeType = 'text/csv;charset=utf-8;';
          ext = 'csv';
        }

        const blob = new Blob([dataStr], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catbox-todos-${new Date().toISOString().split('T')[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${ext.toUpperCase()}でエクスポートしました`);
      } catch {
        toast.error('エクスポートに失敗しました');
      }
    },
    [todos],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (isPasswordRecovery) {
    return (
      <>
        <PasswordUpdateScreen />
        <Toaster />
      </>
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
                    className={cn(
                      "shrink-0 relative",
                      isTrashOpen && "bg-accent text-accent-foreground"
                    )}
                    title="ゴミ箱"
                    onClick={() => navigate('/trash')}
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

            <Tabs 
              value={activeTab} 
              onValueChange={(val) => navigate(val === 'calendar' ? '/calendar' : '/')}
              className="mt-2 flex-1 flex flex-col"
            >
              <div className="shrink-0 flex items-center justify-between">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="list">リスト</TabsTrigger>
                  <TabsTrigger value="calendar">カレンダー</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="mt-4 flex-1 outline-none">
                <Routes>
                  <Route 
                    path="/" 
                    element={
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
                    } 
                  />
                  <Route 
                    path="/trash" 
                    element={
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
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <CalendarView
                        todos={todos}
                        onToggle={toggleTodo}
                        onDelete={handleDeleteTodo}
                        savedTags={savedTags}
                        onSelectTodo={handleOpenEditModal}
                      />
                    } 
                  />
                  {/* 未定義のパスはトップにリダイレクト */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
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
          onClose={() => navigate(-1)}
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
