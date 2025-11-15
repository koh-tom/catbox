import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PRIORITY, TRASH_LIMIT } from '@/lib/constants';
import type { Tag, Todo, SubTask } from '@/types/todo';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// DBからの変換ヘルパー
const mapTodoFromDB = (row: any, subtasksMap: Record<string, SubTask[]>): Todo => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  createdAt: row.created_at,
  deadlineDate: row.deadline_date || undefined,
  priority: row.priority || DEFAULT_PRIORITY,
  tags: row.tags || [],
  description: row.description || undefined,
  completedAt: row.completed_at || undefined,
  subtasks: subtasksMap[row.id] || [],
  order: row.order_index || 0,
  estimatedHours: row.estimated_hours || undefined,
  recurrenceRule: row.recurrence_rule || undefined,
});

const mapSubtaskFromDB = (row: any): SubTask => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  order: row.order_index,
});

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [trashedTodos, setTrashedTodos] = useState<Todo[]>([]);
  const [savedTags, setSavedTags] = useState<Tag[]>([]);
  const [lastDeleted, setLastDeleted] = useState<Todo[] | null>(null);
  
  const lastDeletedRef = useRef<Todo[] | null>(null);
  useEffect(() => {
    lastDeletedRef.current = lastDeleted;
  }, [lastDeleted]);

  // 初回データ取得
  const fetchData = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setTrashedTodos([]);
      setSavedTags([]);
      return;
    }
    try {
      const [todosRes, subtasksRes, tagsRes] = await Promise.all([
        supabase.from('todos').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('subtasks').select('*').order('order_index', { ascending: true }),
        supabase.from('saved_tags').select('*'),
      ]);

      if (todosRes.error) throw todosRes.error;
      if (subtasksRes.error) throw subtasksRes.error;
      if (tagsRes.error) throw tagsRes.error;

      setSavedTags(tagsRes.data || []);

      const subtasksMap: Record<string, SubTask[]> = {};
      (subtasksRes.data || []).forEach((st) => {
        if (!subtasksMap[st.todo_id]) subtasksMap[st.todo_id] = [];
        subtasksMap[st.todo_id].push(mapSubtaskFromDB(st));
      });

      const allTodos = (todosRes.data || []).map((row) => mapTodoFromDB(row, subtasksMap));
      setTodos(allTodos.filter((t) => !t.deletedAt));
      setTrashedTodos(allTodos.filter((t) => !!t.deletedAt));
    } catch (err: any) {
      toast.error('データの取得に失敗しました: ' + err.message);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToTrash = useCallback((items: Todo[]) => {
    setTrashedTodos((prev) => [...items, ...prev].slice(0, TRASH_LIMIT));
  }, []);

  const addTodo = (title: string, deadlineDate?: string, priority?: number, tags: string[] = [], description?: string, estimatedHours?: number, recurrenceRule?: Todo['recurrenceRule']) => {
    if (!title.trim() || !user) return;
    const id = crypto.randomUUID();
    const now = Date.now();
    
    const order = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;
    const newTodo: Todo = {
      id, title: title.trim(), completed: false, createdAt: now,
      deadlineDate: deadlineDate?.trim() || undefined,
      priority: priority ?? DEFAULT_PRIORITY, tags, description, subtasks: [],
      order, estimatedHours, recurrenceRule,
    };

    setTodos((prev) => [newTodo, ...prev]);
    setLastDeleted(null);

    supabase.from('todos').insert({
      id, user_id: user.id, title: newTodo.title, completed: newTodo.completed,
      created_at: newTodo.createdAt, deadline_date: newTodo.deadlineDate,
      priority: newTodo.priority, tags: newTodo.tags, description: newTodo.description,
      order_index: newTodo.order, estimated_hours: newTodo.estimatedHours, recurrence_rule: newTodo.recurrenceRule,
    }).then(({ error }) => { if (error) toast.error('追加に失敗: ' + error.message); });
  };

  const toggleTodo = (id: string) => {
    let completed = false;
    let completedAt: number | undefined;
    setTodos((prev) => prev.map((todo) => {
      if (todo.id === id) {
        completed = !todo.completed;
        completedAt = completed ? Date.now() : undefined;
        return { ...todo, completed, completedAt };
      }
      return todo;
    }));
    supabase.from('todos').update({ completed, completed_at: completedAt }).eq('id', id)
      .then(({ error }) => { if (error) toast.error('更新に失敗: ' + error.message); });
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;
    const now = Date.now();
    setLastDeleted([todoToDelete]);
    addToTrash([{ ...todoToDelete, deletedAt: now }]);
    setTodos((prev) => prev.filter((t) => t.id !== id));

    supabase.from('todos').update({ deleted_at: now }).eq('id', id)
      .then(({ error }) => { if (error) toast.error('削除に失敗: ' + error.message); });
  };

  const addSavedTag = (name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed || savedTags.some((t) => t.name === trimmed) || !user) return;
    const id = crypto.randomUUID();
    const newTag = { id, name: trimmed, color };
    setSavedTags((prev) => [...prev, newTag]);

    supabase.from('saved_tags').insert({ id, user_id: user.id, name: trimmed, color })
      .then(({ error }) => { if (error) toast.error('タグ追加に失敗: ' + error.message); });
  };

  const deleteSavedTag = (id: string) => {
    setSavedTags((prev) => prev.filter((t) => t.id !== id));
    supabase.from('saved_tags').delete().eq('id', id)
      .then(({ error }) => { if (error) toast.error('タグ削除に失敗: ' + error.message); });
  };

  const editTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    if (updates.title !== undefined && !updates.title.trim()) return;
    setTodos((prev) => prev.map((todo) => {
      if (todo.id !== id) return todo;
      return { ...todo, ...updates, title: updates.title?.trim() ?? todo.title, deadlineDate: updates.deadlineDate?.trim() || undefined };
    }));

    const dbUpdates: any = {
      title: updates.title?.trim(),
      deadline_date: updates.deadlineDate?.trim() || null,
      priority: updates.priority,
      tags: updates.tags,
      description: updates.description,
      estimated_hours: updates.estimatedHours,
      recurrence_rule: updates.recurrenceRule,
    };
    Object.keys(dbUpdates).forEach((k) => dbUpdates[k] === undefined && delete dbUpdates[k]);

    supabase.from('todos').update(dbUpdates).eq('id', id)
      .then(({ error }) => { if (error) toast.error('更新に失敗: ' + error.message); });
  };

  const reorderTodos = (startIndex: number, endIndex: number) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    const updatedTodos = result.map((todo, index) => ({ ...todo, order: index }));
    
    setTodos(updatedTodos);
    
    Promise.all(
      updatedTodos.map((todo) => 
        supabase.from('todos').update({ order_index: todo.order }).eq('id', todo.id).then(({ error }) => { if (error) console.error(error); })
      )
    );
  };

  const deleteCompleted = () => {
    const completed = todos.filter((todo) => todo.completed);
    if (completed.length === 0) return;
    const now = Date.now();
    const ids = completed.map((t) => t.id);
    setLastDeleted(completed);
    addToTrash(completed.map((t) => ({ ...t, deletedAt: now })));
    setTodos((prev) => prev.filter((t) => !t.completed));

    supabase.from('todos').update({ deleted_at: now }).in('id', ids)
      .then(({ error }) => { if (error) toast.error('一括削除に失敗: ' + error.message); });
  };

  const completeTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    const now = Date.now();
    setTodos((prev) => prev.map((todo) => idSet.has(todo.id) ? { ...todo, completed: true, completedAt: now } : todo));

    supabase.from('todos').update({ completed: true, completed_at: now }).in('id', ids)
      .then(({ error }) => { if (error) toast.error('一括完了に失敗: ' + error.message); });
  };

  const deleteTodos = (ids: string[]) => {
    const idSet = new Set(ids);
    const todosToDelete = todos.filter((todo) => idSet.has(todo.id));
    if (todosToDelete.length === 0) return;
    const now = Date.now();
    setLastDeleted(todosToDelete);
    addToTrash(todosToDelete.map((t) => ({ ...t, deletedAt: now })));
    setTodos((prev) => prev.filter((t) => !idSet.has(t.id)));

    supabase.from('todos').update({ deleted_at: now }).in('id', ids)
      .then(({ error }) => { if (error) toast.error('一括削除に失敗: ' + error.message); });
  };

  const duplicateTodo = (id: string) => {
    const original = todos.find((t) => t.id === id);
    if (!original || !user) return;
    const match = original.title.match(/_(\d+)$/);
    const newTitle = match ? original.title.replace(/_(\d+)$/, `_${parseInt(match[1], 10) + 1}`) : `${original.title}_1`;
    const newId = crypto.randomUUID();
    const now = Date.now();
    
    const order = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;
    const newTodo: Todo = { ...original, id: newId, title: newTitle, completed: false, completedAt: undefined, createdAt: now, order };

    setTodos((prev) => [newTodo, ...prev]);
    setLastDeleted(null);

    supabase.from('todos').insert({
      id: newId, user_id: user.id, title: newTodo.title, completed: false, created_at: now,
      deadline_date: newTodo.deadlineDate, priority: newTodo.priority, tags: newTodo.tags, description: newTodo.description,
      order_index: newTodo.order, estimated_hours: newTodo.estimatedHours, recurrence_rule: newTodo.recurrenceRule,
    }).then(({ error }) => { if (error) toast.error('複製に失敗: ' + error.message); });
  };

  const restoreDeleted = useCallback(() => {
    const currentLastDeleted = lastDeletedRef.current;
    if (!currentLastDeleted) return;
    const ids = currentLastDeleted.map((t) => t.id);
    const idSet = new Set(ids);
    
    setTodos((prev) => [...currentLastDeleted, ...prev]);
    setTrashedTodos((prev) => prev.filter((t) => !idSet.has(t.id)));
    setLastDeleted(null);

    supabase.from('todos').update({ deleted_at: null }).in('id', ids).then(({ error }) => { if (error) console.error(error); });
  }, []);

  const clearUndo = () => setLastDeleted(null);

  const restoreFromTrash = (id: string) => {
    const todoToRestore = trashedTodos.find((t) => t.id === id);
    if (!todoToRestore) return;
    const { deletedAt: _, ...restoredTodo } = todoToRestore;
    setTodos((prev) => [restoredTodo, ...prev]);
    setTrashedTodos((prev) => prev.filter((t) => t.id !== id));

    supabase.from('todos').update({ deleted_at: null }).eq('id', id).then(({ error }) => { if (error) console.error(error); });
  };

  const permanentlyDelete = (id: string) => {
    setTrashedTodos((prev) => prev.filter((t) => t.id !== id));
    supabase.from('todos').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
  };

  const emptyTrash = () => {
    const ids = trashedTodos.map(t => t.id);
    setTrashedTodos([]);
    if (ids.length > 0) supabase.from('todos').delete().in('id', ids).then(({ error }) => { if (error) console.error(error); });
  };

  const addSubTask = (todoId: string, title: string) => {
    if (!title.trim() || !user) return;
    const id = crypto.randomUUID();
    let order = 0;

    setTodos((prev) => prev.map((todo) => {
      if (todo.id !== todoId) return todo;
      order = todo.subtasks?.length ?? 0;
      const newSubTask = { id, title: title.trim(), completed: false, order };
      return { ...todo, subtasks: [...(todo.subtasks || []), newSubTask] };
    }));

    supabase.from('subtasks').insert({
      id, user_id: user.id, todo_id: todoId, title: title.trim(), completed: false, order_index: order
    }).then(({ error }) => { if (error) console.error(error); });
  };

  const toggleSubTask = (todoId: string, subTaskId: string) => {
    let completed = false;
    setTodos((prev) => prev.map((todo) => {
      if (todo.id !== todoId) return todo;
      return {
        ...todo,
        subtasks: todo.subtasks?.map((st) => {
          if (st.id === subTaskId) {
            completed = !st.completed;
            return { ...st, completed };
          }
          return st;
        }),
      };
    }));
    supabase.from('subtasks').update({ completed }).eq('id', subTaskId).then(({ error }) => { if (error) console.error(error); });
  };

  const deleteSubTask = (todoId: string, subTaskId: string) => {
    setTodos((prev) => prev.map((todo) => {
      if (todo.id !== todoId) return todo;
      return { ...todo, subtasks: todo.subtasks?.filter((st) => st.id !== subTaskId) };
    }));
    supabase.from('subtasks').delete().eq('id', subTaskId).then(({ error }) => { if (error) console.error(error); });
  };

  // ゴミ箱のストレージサイズ（DB保存データのおおよそのデータ量）
  const trashStorageSizeKB = trashedTodos.length > 0
    ? Math.round((new Blob([JSON.stringify(trashedTodos)]).size / 1024) * 10) / 10
    : 0;

  return {
    todos, trashedTodos, addTodo, toggleTodo, deleteTodo, editTodo, reorderTodos,
    deleteCompleted, completeTodos, deleteTodos, duplicateTodo, restoreDeleted,
    clearUndo, isUndoable: !!lastDeleted, savedTags, addSavedTag, deleteSavedTag,
    addSubTask, toggleSubTask, deleteSubTask, restoreFromTrash, permanentlyDelete,
    emptyTrash, trashStorageSizeKB, trashLimit: TRASH_LIMIT,
  };
}
