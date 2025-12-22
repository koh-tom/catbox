import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { MdAdd, MdHelpOutline, MdLogout, MdSearch } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { AboutModal } from '@/components/AboutModal';
import { BottomNav } from '@/components/BottomNav';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TodoDetailModal } from '@/components/TodoDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAppShortcuts } from '@/hooks/useAppShortcuts';
import { APP_NAME } from '@/lib/constants';
import { exportTodos } from '@/lib/export';
import { cn } from '@/lib/utils';
import { useTodoStore } from '@/store/useTodoStore';
import { useUIStore } from '@/store/useUIStore';
import type { AppTab, RecurrenceRule } from '@/types/todo';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Todo State
  const todos = useTodoStore((s) => s.todos);
  const trashedTodos = useTodoStore((s) => s.trashedTodos);
  const savedTags = useTodoStore((s) => s.savedTags);
  const addTodo = useTodoStore((s) => s.addTodo);
  const editTodo = useTodoStore((s) => s.editTodo);
  const addSavedTag = useTodoStore((s) => s.addSavedTag);
  const deleteSavedTag = useTodoStore((s) => s.deleteSavedTag);
  const addSubTask = useTodoStore((s) => s.addSubTask);
  const toggleSubTask = useTodoStore((s) => s.toggleSubTask);
  const deleteSubTask = useTodoStore((s) => s.deleteSubTask);

  // UI State
  const breed = useUIStore((s) => s.breed);
  const setBreed = useUIStore((s) => s.setBreed);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const isDetailOpen = useUIStore((s) => s.isDetailOpen);
  const isAboutOpen = useUIStore((s) => s.isAboutOpen);
  const editingTodoId = useUIStore((s) => s.editingTodoId);
  const openCreateModal = useUIStore((s) => s.openCreateModal);
  const closeDetailModal = useUIStore((s) => s.closeDetailModal);
  const setAboutOpen = useUIStore((s) => s.setAboutOpen);

  const editingTodo = useMemo(
    () => (editingTodoId ? (todos.find((t) => t.id === editingTodoId) ?? null) : null),
    [todos, editingTodoId],
  );

  const currentPath = location.pathname;
  const currentTab = useMemo((): AppTab => {
    if (currentPath.startsWith('/trash')) return 'trash';
    if (currentPath.startsWith('/portal')) return 'portal';
    if (currentPath.startsWith('/settings')) return 'settings';
    return 'todo';
  }, [currentPath]);

  const isTrashOpen = currentTab === 'trash';

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'タスク一覧',
      '/calendar': 'カレンダー',
      '/portal': 'ポータル',
      '/trash': 'ゴミ箱',
      '/settings': '設定',
    };
    const currentTitle = titles[currentPath] || '';
    document.title = currentTitle ? `${currentTitle} | ${APP_NAME}` : APP_NAME;
  }, [currentPath]);

  useEffect(() => {
    document.documentElement.setAttribute('data-breed', breed);
  }, [breed]);

  useAppShortcuts({
    onOpenSearch: () => searchInputRef.current?.focus(),
    onOpenCreateModal: openCreateModal,
  });

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

  const handleExportTodos = useCallback(
    (format: 'json' | 'csv') => {
      exportTodos(todos, format);
    },
    [todos],
  );

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
                    onClick={() => setAboutOpen(true)}
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
                onClick={openCreateModal}
                variant="outline"
                className="w-full h-14 border-2 border-dashed bg-background/50 text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl flex items-center justify-center gap-2 transition-all hover:border-solid hover:border-primary/50 btn-bounce shadow-[0_2px_8px_oklch(0_0_0/0.05)]"
              >
                <MdAdd className="w-6 h-6" />
                <span className="font-bold">新しいタスクを追加</span>
              </Button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 relative px-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />

        {currentTab === 'todo' && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-20 right-4 z-40 sm:hidden"
          >
            <Button
              onClick={openCreateModal}
              size="icon"
              className="w-14 h-14 rounded-2xl shadow-lg bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
              aria-label="新しく追加"
            >
              <MdAdd className="w-8 h-8" />
            </Button>
          </motion.div>
        )}

        <TodoDetailModal
          todo={editingTodo}
          isOpen={isDetailOpen}
          onClose={closeDetailModal}
          onSave={handleSaveDetail}
          savedTags={savedTags}
          onAddSubTask={addSubTask}
          onToggleSubTask={toggleSubTask}
          onDeleteSubTask={deleteSubTask}
        />

        <AboutModal isOpen={isAboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    </div>
  );
}
