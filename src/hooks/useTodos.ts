import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PRIORITY, STORAGE_KEYS } from '@/lib/constants';
import type { Tag, Todo } from '@/types/todo';
import { useLocalStorage } from './useLocalStorage';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.TODOS, []);
  const [trashedTodos, setTrashedTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.TRASH, []);
  const [savedTags, setSavedTags] = useLocalStorage<Tag[]>(STORAGE_KEYS.TAGS, []);

  // 直前に削除したTODOを保持するstate
  const [lastDeleted, setLastDeleted] = useState<Todo[] | null>(null);

  // lastDeletedの最新値を保持するref
  const lastDeletedRef = useRef<Todo[] | null>(null);
  useEffect(() => {
    lastDeletedRef.current = lastDeleted;
  }, [lastDeleted]);

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
    setLastDeleted(null); // 他の操作をしたらUndo履歴をクリア
  };

  // TODOの状態を切り替え
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const isCompleted = !todo.completed;
          return {
            ...todo,
            completed: isCompleted,
            completedAt: isCompleted ? Date.now() : undefined,
          };
        }
        return todo;
      }),
    );
  };

  // TODOをゴミ箱に移動
  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (todoToDelete) {
      const trashedTodo = { ...todoToDelete, deletedAt: Date.now() };
      setLastDeleted([todoToDelete]);
      setTrashedTodos([trashedTodo, ...trashedTodos]);
      setTodos(todos.filter((todo) => todo.id !== id));
    }
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

  // 完了済みTODOをゴミ箱に移動
  const deleteCompleted = () => {
    const completed = todos.filter((todo) => todo.completed);
    if (completed.length > 0) {
      const now = Date.now();
      const trashedCompleted = completed.map((t) => ({ ...t, deletedAt: now }));
      setLastDeleted(completed);
      setTrashedTodos([...trashedCompleted, ...trashedTodos]);
      setTodos(todos.filter((todo) => !todo.completed));
    }
  };

  // 選択したTODOを一括完了
  const completeTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    const now = Date.now();
    setTodos(
      todos.map((todo) =>
        idSet.has(todo.id) ? { ...todo, completed: true, completedAt: now } : todo,
      ),
    );
  };

  // 選択したTODOをゴミ箱に移動
  const deleteTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    const todosToDelete = todos.filter((todo) => idSet.has(todo.id));
    if (todosToDelete.length > 0) {
      const now = Date.now();
      const trashedItems = todosToDelete.map((t) => ({ ...t, deletedAt: now }));
      setLastDeleted(todosToDelete);
      setTrashedTodos([...trashedItems, ...trashedTodos]);
      setTodos(todos.filter((todo) => !idSet.has(todo.id)));
    }
  };

  // TODOを複製
  const duplicateTodo = (id: string) => {
    const original = todos.find((t) => t.id === id);
    if (!original) return;

    const match = original.title.match(/_(\d+)$/);
    const newTitle = match
      ? original.title.replace(/_(\d+)$/, `_${parseInt(match[1], 10) + 1}`)
      : `${original.title}_1`;

    const newTodo: Todo = {
      ...original,
      id: crypto.randomUUID(),
      title: newTitle,
      completed: false, // 複製時は未完了にする
      completedAt: undefined,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setLastDeleted(null); // 他の操作をしたらUndo履歴をクリア
  };

  // ゴミ箱から元に戻す（undo発火）
  const restoreDeleted = useCallback(() => {
    const currentLastDeleted = lastDeletedRef.current;
    if (currentLastDeleted) {
      // todosに復元
      setTodos((prevTodos) => [...currentLastDeleted, ...prevTodos]);
      // ゴミ箱から削除
      const deletedIds = new Set(currentLastDeleted.map((t) => t.id));
      setTrashedTodos((prevTrashed) => prevTrashed.filter((t) => !deletedIds.has(t.id)));
      setLastDeleted(null);
    }
  }, [setTodos, setTrashedTodos]);

  const clearUndo = () => setLastDeleted(null);

  // ゴミ箱からタスクを復元
  const restoreFromTrash = (id: string) => {
    const todoToRestore = trashedTodos.find((t) => t.id === id);
    if (todoToRestore) {
      const { deletedAt: _, ...restoredTodo } = todoToRestore;
      setTodos([restoredTodo, ...todos]);
      setTrashedTodos(trashedTodos.filter((t) => t.id !== id));
    }
  };

  // ゴミ箱からタスクを完全削除
  const permanentlyDelete = (id: string) => {
    setTrashedTodos(trashedTodos.filter((t) => t.id !== id));
  };

  // ゴミ箱を空にする
  const emptyTrash = () => {
    setTrashedTodos([]);
  };

  // サブタスクを追加
  const addSubTask = (todoId: string, title: string) => {
    if (!title.trim()) return;

    setTodos(
      todos.map((todo) => {
        if (todo.id !== todoId) return todo;

        const newSubTask = {
          id: crypto.randomUUID(),
          title: title.trim(),
          completed: false,
          order: todo.subtasks?.length ?? 0,
        };

        return {
          ...todo,
          subtasks: [...(todo.subtasks || []), newSubTask],
        };
      }),
    );
  };

  // サブタスクの状態を切り替え
  const toggleSubTask = (todoId: string, subTaskId: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id !== todoId) return todo;

        return {
          ...todo,
          subtasks: todo.subtasks?.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st,
          ),
        };
      }),
    );
  };

  // サブタスクを削除
  const deleteSubTask = (todoId: string, subTaskId: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id !== todoId) return todo;

        return {
          ...todo,
          subtasks: todo.subtasks?.filter((st) => st.id !== subTaskId),
        };
      }),
    );
  };

  return {
    todos,
    trashedTodos,
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
    clearUndo,
    isUndoable: !!lastDeleted,
    savedTags,
    addSavedTag,
    deleteSavedTag,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
  };
}
