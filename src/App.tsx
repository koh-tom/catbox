import { useEffect, useMemo } from 'react';
import { FaCat } from 'react-icons/fa';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthScreen } from '@/components/AuthScreen';
import { PasswordUpdateScreen } from '@/components/PasswordUpdateScreen';
import { TrashView } from '@/components/TrashView';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/layouts/MainLayout';
import { PortalPage } from '@/pages/PortalPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TodosPage } from '@/pages/TodosPage';
import { useTodoStore } from '@/store/useTodoStore';

function TrashPageWrapper() {
  const trashedTodos = useTodoStore((s) => s.trashedTodos);
  const restoreFromTrash = useTodoStore((s) => s.restoreFromTrash);
  const permanentlyDelete = useTodoStore((s) => s.permanentlyDelete);
  const emptyTrash = useTodoStore((s) => s.emptyTrash);
  const trashLimit = useTodoStore((s) => s.trashLimit);

  const calculateTrashSize = useMemo(
    () =>
      trashedTodos.length > 0
        ? Math.round((new Blob([JSON.stringify(trashedTodos)]).size / 1024) * 10) / 10
        : 0,
    [trashedTodos],
  );

  return (
    <TrashView
      trashedTodos={trashedTodos}
      onRestore={restoreFromTrash}
      onPermanentlyDelete={permanentlyDelete}
      onEmptyTrash={emptyTrash}
      storageSize={calculateTrashSize}
      limit={trashLimit}
    />
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const setUserId = useTodoStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(user ? user.id : null);
  }, [user, setUserId]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<TodosPage viewMode="list" />} />
        <Route path="/calendar" element={<TodosPage viewMode="calendar" />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route
          path="/trash"
          element={
            <div className="flex-1 p-3 sm:p-6 overflow-hidden">
              <TrashPageWrapper />
            </div>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  const { user, isLoading, isPasswordRecovery } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3 animate-pulse">
          <FaCat className="w-8 h-8 text-primary animate-bounce shadow-sm" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest text-sm animate-pulse">
          LOADING...
        </p>
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
    <>
      <AuthenticatedApp />
      <Toaster />
    </>
  );
}

export default App;
