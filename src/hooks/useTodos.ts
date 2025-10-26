import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PRIORITY, STORAGE_KEYS } from '@/lib/constants';
import type { Tag, Todo } from '@/types/todo';
import { useLocalStorage } from './useLocalStorage';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.TODOS, []);
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

  // TODOを削除
  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (todoToDelete) {
      setLastDeleted([todoToDelete]);
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

  // 完了済みTODOを一括削除
  const deleteCompleted = () => {
    const completed = todos.filter((todo) => todo.completed);
    if (completed.length > 0) {
      setLastDeleted(completed);
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

  // 選択したTODOを一括削除
  const deleteTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    const todosToDelete = todos.filter((todo) => idSet.has(todo.id));
    if (todosToDelete.length > 0) {
      setLastDeleted(todosToDelete);
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

  // 削除の取り消し
  // Toastのコールバックなど、非同期に呼ばれた場合でも最新のstateを参照できるようにrefを使用
  const restoreDeleted = useCallback(() => {
    const currentLastDeleted = lastDeletedRef.current;
    if (currentLastDeleted) {
      setTodos((prevTodos) => [...currentLastDeleted, ...prevTodos]);
      setLastDeleted(null);
    }
  }, [setTodos]);

  const clearUndo = () => setLastDeleted(null);

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
    duplicateTodo,
    restoreDeleted,
    clearUndo,
    isUndoable: !!lastDeleted,
    savedTags,
    addSavedTag,
    deleteSavedTag,
  };
}
