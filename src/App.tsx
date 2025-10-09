import { useState } from 'react';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TodoDetailModal } from '@/components/TodoDetailModal';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    savedTags,
    addSavedTag,
    deleteSavedTag,
  } = useTodos();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const completedCount = todos.filter((t) => t.completed).length;

  const handleSaveDetail = (
    _id: string,
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
  ) => {
    if (editingTodo) {
      editTodo(editingTodo.id, { title, deadlineDate, priority, tags, description });
    } else {
      addTodo(title, deadlineDate, priority, tags, description);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setIsDetailOpen(true);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setEditingTodo(null), 300);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">{APP_NAME}</CardTitle>
              <div className="flex items-center gap-1">
                <SettingsMenu
                  savedTags={savedTags}
                  addSavedTag={addSavedTag}
                  deleteSavedTag={deleteSavedTag}
                />
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TodoInput
              onAdd={addTodo}
              savedTags={savedTags}
              onOpenDetailAdd={handleOpenCreateModal}
            />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onReorder={reorderTodos}
              savedTags={savedTags}
              onSelectTodo={handleOpenEditModal}
            />

            {todos.length > 0 && (
              <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                {completedCount} / {todos.length} 完了
              </div>
            )}
          </CardContent>
        </Card>

        <TodoDetailModal
          todo={editingTodo}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onSave={handleSaveDetail}
          savedTags={savedTags}
        />
      </div>
    </div>
  );
}

export default App;
