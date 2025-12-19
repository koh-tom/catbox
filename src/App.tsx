import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCat, FaTrashAlt } from 'react-icons/fa';
import { MdAdd, MdHelpOutline, MdLogout, MdSearch } from 'react-icons/md';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AboutModal } from '@/components/AboutModal';
import { AuthScreen } from '@/components/AuthScreen';
import { BottomNav } from '@/components/BottomNav';
import { CalendarView } from '@/components/CalendarView';
import { PasswordUpdateScreen } from '@/components/PasswordUpdateScreen';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
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
import { APP_NAME, CAT_BREED_STORAGE_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { AppTab, CatBreed, RecurrenceRule, Todo } from '@/types/todo';

function App() {
  const { user, isLoading, signOut, isPasswordRecovery } = useAuth();
  const [breed, setBreed] = useState<CatBreed>(() => {
    const saved = localStorage.getItem(CAT_BREED_STORAGE_KEY);
    return (saved as CatBreed) || 'classic';
  });

  // 保存用
  useEffect(() => {
    localStorage.setItem(CAT_BREED_STORAGE_KEY, breed);
    // documentElementに属性を付加（ポータル内のコンポーネントにも適用されるようにする）
    document.documentElement.setAttribute('data-breed', breed);
  }, [breed]);

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

  // 現在のパスに基づいてタブを決定
  const currentPath = location.pathname;
  const currentTab = useMemo((): AppTab => {
    if (currentPath.startsWith('/trash')) return 'trash';
    if (currentPath.startsWith('/portal')) return 'portal';
    if (currentPath.startsWith('/settings')) return 'settings';
    return 'todo';
  }, [currentPath]);

  const activeTab = currentPath.startsWith('/calendar') ? 'calendar' : 'list';
  const isTrashOpen = currentTab === 'trash';

  // タイトルをルーティングに合わせて更新 (SEO/UX)
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'タスク一覧',
      '/calendar': 'カレンダー',
      '/portal': 'ポータル',
      '/trash': 'ゴミ箱',
      '/settings': '設定',
    };
    const currentTitle = titles[location.pathname] || '';
    document.title = currentTitle ? `${currentTitle} | ${APP_NAME}` : APP_NAME;
  }, [location.pathname]);

  const handleTabChange = useCallback(
    (tab: AppTab) => {
      const paths: Record<AppTab, string> = {
        todo: '/',
        portal: '/portal',
        trash: '/trash',
        settings: '/settings',
      };
      navigate(paths[tab]);
    },
    [navigate],
  );

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
    <div className="min-h-screen bg-background p-0 sm:p-4 pb-16 sm:pb-4" data-breed={breed}>
      <div className="w-full mx-auto flex flex-col min-h-screen sm:min-h-[calc(100vh-2rem)]">
        <Card className="flex-1 border-0 sm:border rounded-none sm:rounded-lg shadow-warm flex flex-col bg-card/50 backdrop-blur-sm overflow-hidden mb-safe">
          <CardHeader className="py-2.5 px-4 border-b border-border/10 bg-background/30 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl font-black flex items-center gap-2 shrink-0">
                <img src="/icon.png" alt="Catbox Icon" className="w-6 h-6 rounded-md shadow-sm" />
                <span className="hidden sm:inline tracking-tight">{APP_NAME}</span>
              </CardTitle>

              <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
                <div className="relative max-w-[140px] sm:max-w-xs w-full group">
                  <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background transition-all rounded-full"
                  />
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="hidden sm:flex items-center gap-1">
                    <SettingsMenu
                      savedTags={savedTags}
                      addSavedTag={addSavedTag}
                      deleteSavedTag={deleteSavedTag}
                      onExportTodos={handleExportTodos}
                      currentBreed={breed}
                      onBreedChange={setBreed}
                    />
                    <ThemeToggle />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 relative sm:flex hidden',
                      isTrashOpen && 'bg-accent text-accent-foreground',
                    )}
                    title="ゴミ箱"
                    onClick={() => navigate('/trash')}
                  >
                    <FaTrashAlt className="h-3.5 w-3.5" />
                    {trashedTodos.length > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                        {trashedTodos.length}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:flex hidden"
                    title="ヘルプ"
                    onClick={() => setIsAboutOpen(true)}
                  >
                    <MdHelpOutline className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive transition-colors"
                    title="ログアウト"
                    onClick={() => signOut()}
                  >
                    <MdLogout className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-0 pt-2 sm:pt-4">
            <div className="px-4 mb-4 mt-2 shrink-0">
              <Button
                onClick={handleOpenCreateModal}
                variant="outline"
                className="w-full h-14 border-2 border-dashed bg-background/50 text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl flex items-center justify-center gap-2 transition-all hover:border-solid hover:border-primary/50 btn-bounce shadow-[0_2px_8px_oklch(0_0_0/0.05)]"
              >
                <MdAdd className="w-6 h-6" />
                <span className="font-bold">新しいタスクを追加</span>
              </Button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 relative">
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="flex-1 flex flex-col min-h-0 p-3 sm:px-6 sm:pb-6 overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <Tabs
                          value={activeTab}
                          onValueChange={(v) => navigate(v === 'calendar' ? '/calendar' : '/')}
                          className="w-full sm:w-auto"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">リスト</TabsTrigger>
                            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        {/* 小さいボタンはここから削除（またはスマホ時のみ表示） */}
                      </div>

                      <div className="flex-1 overflow-auto min-h-0 pr-1 -mr-1 scrollbar-thin">
                        <TodoList
                          todos={todos}
                          onToggle={toggleTodo}
                          onDelete={handleDeleteTodo}
                          savedTags={savedTags}
                          onSelectTodo={handleOpenEditModal}
                          onReorder={reorderTodos}
                          onDeleteCompleted={handleDeleteCompleted}
                          onCompleteTodos={completeTodos}
                          onDeleteTodos={handleDeleteTodos}
                          onDuplicate={duplicateTodo}
                          searchQuery={searchQuery}
                          completedCount={completedCount}
                        />
                      </div>
                    </div>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <div className="flex-1 min-h-0 p-3 sm:p-6 overflow-auto scrollbar-thin">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <Tabs
                          value={activeTab}
                          onValueChange={(v) => navigate(v === 'calendar' ? '/calendar' : '/')}
                          className="w-full sm:w-auto"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">リスト</TabsTrigger>
                            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <CalendarView todos={todos} onSelectTodo={handleOpenEditModal} />
                    </div>
                  }
                />
                <Route
                  path="/portal"
                  element={
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-accent/5">
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
                        <FaCat className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3">ポータル（ダッシュボード）</h2>
                      <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                        ここには、1日の概要、天気、習慣トラッカーなどが集約される予定です。
                        <br />
                        現在丹精込めて開発中... 🐾
                      </p>
                    </div>
                  }
                />
                <Route
                  path="/trash"
                  element={
                    <div className="flex-1 p-3 sm:p-6 overflow-hidden">
                      <TrashView
                        trashedTodos={trashedTodos}
                        onRestore={restoreFromTrash}
                        onDeletePermanent={permanentlyDelete}
                        onEmptyTrash={emptyTrash}
                        storageSize={trashStorageSizeKB}
                        limit={trashLimit}
                      />
                    </div>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <div className="flex-1 p-4 sm:p-6 overflow-auto">
                      <div className="max-w-md mx-auto space-y-8 py-4">
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-bold">モバイル設定</h2>
                          <p className="text-sm text-muted-foreground">
                            テーマやタグの管理を行います
                          </p>
                        </div>
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                          <SettingsMenu
                            savedTags={savedTags}
                            addSavedTag={addSavedTag}
                            deleteSavedTag={deleteSavedTag}
                            onExportTodos={handleExportTodos}
                            currentBreed={breed}
                            onBreedChange={setBreed}
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <Button
                            variant="outline"
                            className="w-full gap-2 rounded-xl h-12"
                            onClick={() => setIsAboutOpen(true)}
                          >
                            <MdHelpOutline className="w-5 h-5 text-muted-foreground" />
                            Catboxについて
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full gap-2 rounded-xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => signOut()}
                          >
                            <MdLogout className="w-5 h-5" />
                            ログアウト
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </CardContent>
        </Card>

        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />

        {/* モバイル用フローティングアクションボタン (FAB) */}
        {!isTrashOpen && currentTab === 'todo' && (
          <Button
            onClick={handleOpenCreateModal}
            size="icon"
            className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl shadow-lg bg-primary text-primary-foreground sm:hidden z-40 btn-bounce active:scale-90 transition-transform flex items-center justify-center border-2 border-background"
            aria-label="新しく追加"
          >
            <MdAdd className="w-8 h-8" />
          </Button>
        )}

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
