import type { Todo } from '@/types/todo';
import { useLocalStorage } from './useLocalStorage';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('catbox-todos', []);

  // 新規TODOを追加
  const addTodo = (
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags: string[] = [],
  ) => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      deadlineDate: deadlineDate?.trim() || undefined,
      priority: priority ?? 1,
      tags,
    };

    setTodos([newTodo, ...todos]);
  };

  // TODOの状態を切り替え
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  };

  // TODOを削除
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // TODOを編集
  const editTodo = (
    id: string,
    newTitle: string,
    newDeadlineDate?: string,
    newPriority?: number,
    newTags?: string[],
  ) => {
    if (!newTitle.trim()) return;
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: newTitle.trim(),
              deadlineDate: newDeadlineDate?.trim() || undefined,
              priority: newPriority ?? todo.priority ?? 1,
              tags: newTags ?? todo.tags ?? [],
            }
          : todo,
      ),
    );
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
}
