import { SettingsMenu } from '@/components/SettingsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTodos } from '@/hooks/useTodos';

function App() {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    savedTags,
    addSavedTag,
    deleteSavedTag,
  } = useTodos();

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">😺📦 Catbox</CardTitle>
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
            <TodoInput onAdd={addTodo} savedTags={savedTags} />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              savedTags={savedTags}
            />

            {todos.length > 0 && (
              <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                {completedCount} / {todos.length} 完了
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
