import { DEFAULT_PRIORITY, STORAGE_KEYS } from '@/lib/constants';
import type { Tag, Todo } from '@/types/todo';
import { useLocalStorage } from './useLocalStorage';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.TODOS, []);
  const [savedTags, setSavedTags] = useLocalStorage<Tag[]>(STORAGE_KEYS.TAGS, []);

  // 新規TODOを追加
  const addTodo = (
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags: string[] = [],
    description?: string,
  ) => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      deadlineDate: deadlineDate?.trim() || undefined,
      priority: priority ?? DEFAULT_PRIORITY,
      tags,
      description,
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

  // 保存済みタグを追加
  const addSavedTag = (name: string, color: string) => {
    const trimmed = name.trim();
    if (trimmed && !savedTags.some((t) => t.name === trimmed)) {
      setSavedTags([...savedTags, { id: crypto.randomUUID(), name: trimmed, color }]);
    }
  };

  // 保存済みタグを削除
  const deleteSavedTag = (id: string) => {
    setSavedTags(savedTags.filter((t) => t.id !== id));
  };

  // TODOを編集
  const editTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    if (updates.title !== undefined && !updates.title.trim()) return;

    setTodos(
      todos.map((todo) => {
        if (todo.id !== id) return todo;

        const newTodo = { ...todo, ...updates };

        newTodo.title = newTodo.title.trim();
        newTodo.deadlineDate = newTodo.deadlineDate?.trim() || undefined;

        return newTodo;
      }),
    );
  };

  // TODOの並び替え
  const reorderTodos = (startIndex: number, endIndex: number) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTodos(result);
  };

  // 完了済みTODOを一括削除
  const deleteCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // 選択したTODOを一括完了
  const completeTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    setTodos(todos.map((todo) => (idSet.has(todo.id) ? { ...todo, completed: true } : todo)));
  };

  // 選択したTODOを一括削除
  const deleteTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    setTodos(todos.filter((todo) => !idSet.has(todo.id)));
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    deleteCompleted,
    completeTodos,
    deleteTodos,
    savedTags,
    addSavedTag,
    deleteSavedTag,
  };
}
