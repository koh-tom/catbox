import { useNavigate } from 'react-router-dom';
import { CalendarView } from '@/components/CalendarView';
import { TodoList } from '@/components/TodoList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTodoStore } from '@/store/useTodoStore';
import { useUIStore } from '@/store/useUIStore';

interface TodosPageProps {
  viewMode: 'list' | 'calendar';
}

export function TodosPage({ viewMode }: TodosPageProps) {
  const navigate = useNavigate();

  // Load from Todo Store
  const todos = useTodoStore((s) => s.todos);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const handleDeleteTodo = useTodoStore((s) => s.deleteTodo);
  const savedTags = useTodoStore((s) => s.savedTags);
  const reorderTodos = useTodoStore((s) => s.reorderTodos);
  const handleDeleteCompleted = useTodoStore((s) => s.deleteCompleted);
  const completeTodos = useTodoStore((s) => s.completeTodos);
  const handleDeleteTodos = useTodoStore((s) => s.deleteTodos);
  const duplicateTodo = useTodoStore((s) => s.duplicateTodo);

  // Load from UI Store
  const handleOpenEditModal = useUIStore((s) => s.openEditModal);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div
      className={
        viewMode === 'list'
          ? 'flex-1 flex flex-col min-h-0 p-3 sm:px-6 sm:pb-6 overflow-hidden'
          : 'flex-1 min-h-0 p-3 sm:p-6 overflow-auto scrollbar-thin'
      }
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
        <Tabs
          value={viewMode}
          onValueChange={(v) => navigate(v === 'calendar' ? '/calendar' : '/')}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">リスト</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'list' ? (
        <div className="flex-1 overflow-auto min-h-0 pr-1 -mr-1 scrollbar-thin">
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={handleDeleteTodo}
            savedTags={savedTags}
            onSelectTodo={(todo) => handleOpenEditModal(todo.id)}
            onReorder={reorderTodos}
            onDeleteCompleted={handleDeleteCompleted}
            onCompleteTodos={completeTodos}
            onDeleteTodos={handleDeleteTodos}
            onDuplicate={duplicateTodo}
            searchQuery={searchQuery}
            completedCount={completedCount}
          />
        </div>
      ) : (
        <CalendarView
          todos={todos}
          onToggle={toggleTodo}
          onDelete={handleDeleteTodo}
          savedTags={savedTags}
          onSelectTodo={(todo) => handleOpenEditModal(todo.id)}
        />
      )}
    </div>
  );
}
