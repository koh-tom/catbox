import { useCallback } from 'react';
import { MdHelpOutline, MdLogout } from 'react-icons/md';
import { SettingsMenu } from '@/components/SettingsMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { exportTodos } from '@/lib/export';
import { useTodoStore } from '@/store/useTodoStore';
import { useUIStore } from '@/store/useUIStore';

export function SettingsPage() {
  const { signOut } = useAuth();

  // Data State
  const todos = useTodoStore((s) => s.todos);
  const savedTags = useTodoStore((s) => s.savedTags);
  const addSavedTag = useTodoStore((s) => s.addSavedTag);
  const deleteSavedTag = useTodoStore((s) => s.deleteSavedTag);

  // UI State
  const breed = useUIStore((s) => s.breed);
  const setBreed = useUIStore((s) => s.setBreed);
  const setAboutOpen = useUIStore((s) => s.setAboutOpen);

  const handleExportTodos = useCallback(
    (format: 'json' | 'csv') => {
      exportTodos(todos, format);
    },
    [todos],
  );

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-auto">
      <div className="max-w-md mx-auto space-y-8 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">モバイル設定</h2>
          <p className="text-sm text-muted-foreground">テーマやタグの管理を行います</p>
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
            onClick={() => setAboutOpen(true)}
          >
            <MdHelpOutline className="w-5 h-5 text-muted-foreground" />
            Catboxについて
          </Button>
          <Button
            variant="ghost"
            className="w-full gap-2 rounded-xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={signOut}
          >
            <MdLogout className="w-5 h-5" />
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}
