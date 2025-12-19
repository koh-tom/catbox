import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_PRIORITY, TRASH_LIMIT } from '@/lib/constants';
import { calcNextRecurrenceDate } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase';
import type { SubTask, Tag, Todo } from '@/types/todo';

// DBからの変換ヘルパー
// biome-ignore lint/suspicious/noExplicitAny: DB row data
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

// biome-ignore lint/suspicious/noExplicitAny: DB row data
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
        supabase
          .from('todos')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false }),
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
    } catch (err) {
      toast.error(
        `データの取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToTrash = useCallback((items: Todo[]) => {
    setTrashedTodos((prev) => [...items, ...prev].slice(0, TRASH_LIMIT));
  }, []);

  const addTodo = useCallback(
    (
      title: string,
      deadlineDate?: string,
      priority?: number,
      tags: string[] = [],
      description?: string,
      estimatedHours?: number,
      recurrenceRule?: Todo['recurrenceRule'],
    ) => {
      if (!title.trim() || !user) return;
      const id = crypto.randomUUID();
      const now = Date.now();

      const order = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;
      const newTodo: Todo = {
        id,
        title: title.trim(),
        completed: false,
        createdAt: now,
        deadlineDate: deadlineDate?.trim() || undefined,
        priority: priority ?? DEFAULT_PRIORITY,
        tags,
        description,
        subtasks: [],
        order,
        estimatedHours,
        recurrenceRule,
      };

      const previousTodos = todos;
      setTodos((prev) => [newTodo, ...prev]);
      setLastDeleted(null);

      supabase
        .from('todos')
        .insert({
          id,
          user_id: user.id,
          title: newTodo.title,
          completed: newTodo.completed,
          created_at: newTodo.createdAt,
          deadline_date: newTodo.deadlineDate,
          priority: newTodo.priority,
          tags: newTodo.tags,
          description: newTodo.description,
          order_index: newTodo.order,
          estimated_hours: newTodo.estimatedHours,
          recurrence_rule: newTodo.recurrenceRule,
        })
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            toast.error(`追加に失敗: ${error.message}`);
          }
        });
    },
    [todos, user],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      const todoToToggle = todos.find((t) => t.id === id);
      if (!todoToToggle) return;

      const isCompleting = !todoToToggle.completed;
      const now = Date.now();
      let newRecurringTodo: Todo | null = null;

      if (isCompleting && todoToToggle.recurrenceRule && user) {
        const nextDeadline = calcNextRecurrenceDate(
          todoToToggle.deadlineDate,
          todoToToggle.recurrenceRule,
        );
        if (nextDeadline) {
          newRecurringTodo = {
            ...todoToToggle,
            id: crypto.randomUUID(),
            completed: false,
            completedAt: undefined,
            createdAt: now,
            deadlineDate: nextDeadline,
            order: todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0,
          };
        }
      }

      const previousTodos = todos;
      setTodos((prev) => {
        const updatedTodos = prev.map((todo) => {
          if (todo.id === id) {
            return {
              ...todo,
              completed: isCompleting,
              completedAt: isCompleting ? now : undefined,
            };
          }
          return todo;
        });
        return newRecurringTodo ? [newRecurringTodo, ...updatedTodos] : updatedTodos;
      });

      supabase
        .from('todos')
        .update({ completed: isCompleting, completed_at: isCompleting ? now : null })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            toast.error(`更新に失敗: ${error.message}`);
          }
        });

      if (newRecurringTodo && user) {
        supabase
          .from('todos')
          .insert({
            id: newRecurringTodo.id,
            user_id: user.id,
            title: newRecurringTodo.title,
            completed: newRecurringTodo.completed,
            created_at: newRecurringTodo.createdAt,
            deadline_date: newRecurringTodo.deadlineDate,
            priority: newRecurringTodo.priority,
            tags: newRecurringTodo.tags,
            description: newRecurringTodo.description,
            order_index: newRecurringTodo.order,
            estimated_hours: newRecurringTodo.estimatedHours,
            recurrence_rule: newRecurringTodo.recurrenceRule,
          })
          .then(({ error }) => {
            if (error) toast.error(`繰り返しタスクの作成に失敗: ${error.message}`);
          });
      }
    },
    [todos, user],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      const todoToDelete = todos.find((t) => t.id === id);
      if (!todoToDelete) return;
      const now = Date.now();
      const previousTodos = todos;
      const previousTrashed = trashedTodos;
      setLastDeleted([todoToDelete]);
      addToTrash([{ ...todoToDelete, deletedAt: now }]);
      setTodos((prev) => prev.filter((t) => t.id !== id));

      supabase
        .from('todos')
        .update({ deleted_at: now })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            setTrashedTodos(previousTrashed);
            toast.error(`削除に失敗: ${error.message}`);
          }
        });
    },
    [todos, trashedTodos, addToTrash],
  );

  const addSavedTag = useCallback(
    (name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed || savedTags.some((t) => t.name === trimmed) || !user) return;
      const id = crypto.randomUUID();
      const previousTags = savedTags;
      const newTag = { id, name: trimmed, color };
      setSavedTags((prev) => [...prev, newTag]);

      supabase
        .from('saved_tags')
        .insert({ id, user_id: user.id, name: trimmed, color })
        .then(({ error }) => {
          if (error) {
            setSavedTags(previousTags);
            toast.error(`タグ追加に失敗: ${error.message}`);
          }
        });
    },
    [savedTags, user],
  );

  const deleteSavedTag = useCallback(
    (id: string) => {
      const previousTags = savedTags;
      setSavedTags((prev) => prev.filter((t) => t.id !== id));
      supabase
        .from('saved_tags')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setSavedTags(previousTags);
            toast.error(`タグ削除に失敗: ${error.message}`);
          }
        });
    },
    [savedTags],
  );

  const editTodo = useCallback(
    (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      if (updates.title !== undefined && !updates.title.trim()) return;
      const previousTodos = todos;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== id) return todo;
          return {
            ...todo,
            ...updates,
            title: updates.title?.trim() ?? todo.title,
            deadlineDate: updates.deadlineDate?.trim() || undefined,
          };
        }),
      );

      const dbUpdates: Record<string, unknown> = {
        title: updates.title?.trim(),
        deadline_date: updates.deadlineDate?.trim() || null,
        priority: updates.priority,
        tags: updates.tags,
        description: updates.description,
        recurrence_rule: updates.recurrenceRule,
      };
      Object.keys(dbUpdates).forEach((k) => {
        if (dbUpdates[k] === undefined) delete dbUpdates[k];
      });

      supabase
        .from('todos')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            toast.error(`更新に失敗: ${error.message}`);
          }
        });
    },
    [todos],
  );

  const reorderTodos = useCallback(
    (startIndex: number, endIndex: number) => {
      const previousTodos = todos;
      const result = Array.from(todos);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      const updatedTodos = result.map((todo, index) => ({ ...todo, order: index }));

      setTodos(updatedTodos);

      Promise.all(
        updatedTodos.map((todo) =>
          supabase.from('todos').update({ order_index: todo.order }).eq('id', todo.id),
        ),
      ).then((results) => {
        const firstError = results.find((r) => r.error);
        if (firstError) {
          setTodos(previousTodos);
          toast.error(`並べ替えの保存に失敗しました`);
        }
      });
    },
    [todos],
  );

  const deleteCompleted = useCallback(() => {
    const completed = todos.filter((todo) => todo.completed);
    if (completed.length === 0) return;
    const now = Date.now();
    const previousTodos = todos;
    const previousTrashed = trashedTodos;
    const ids = completed.map((t) => t.id);
    setLastDeleted(completed);
    addToTrash(completed.map((t) => ({ ...t, deletedAt: now })));
    setTodos((prev) => prev.filter((t) => !t.completed));

    supabase
      .from('todos')
      .update({ deleted_at: now })
      .in('id', ids)
      .then(({ error }) => {
        if (error) {
          setTodos(previousTodos);
          setTrashedTodos(previousTrashed);
          toast.error(`一括削除に失敗: ${error.message}`);
        }
      });
  }, [todos, trashedTodos, addToTrash]);

  const completeTodos = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const selectedTodos = todos.filter((t) => idSet.has(t.id));
      if (selectedTodos.length === 0) return;

      // もしすべてが完了済みなら「未完了に戻す」、それ以外は「完了にする」
      const allCompleted = selectedTodos.every((t) => t.completed);
      const targetCompletedState = !allCompleted;
      const now = Date.now();

      const newRecurringTodos: Todo[] = [];
      let currentOrder = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;

      // 未完了→完了 に変化するときのみ、繰り返しタスクを作成
      if (targetCompletedState) {
        selectedTodos.forEach((todo) => {
          if (!todo.completed && todo.recurrenceRule && user) {
            const nextDeadline = calcNextRecurrenceDate(todo.deadlineDate, todo.recurrenceRule);
            if (nextDeadline) {
              newRecurringTodos.push({
                ...todo,
                id: crypto.randomUUID(),
                completed: false,
                completedAt: undefined,
                createdAt: now,
                deadlineDate: nextDeadline,
                order: currentOrder--,
              });
            }
          }
        });
      }

      const previousTodos = todos;
      setTodos((prev) => {
        const updated = prev.map((todo) =>
          idSet.has(todo.id)
            ? {
                ...todo,
                completed: targetCompletedState,
                completedAt: targetCompletedState ? now : undefined,
              }
            : todo,
        );
        return [...newRecurringTodos, ...updated];
      });

      supabase
        .from('todos')
        .update({
          completed: targetCompletedState,
          completed_at: targetCompletedState ? now : null,
        })
        .in('id', ids)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            toast.error(
              `${targetCompletedState ? '一括完了' : '一括未完了'}に失敗: ${error.message}`,
            );
          }
        });

      if (newRecurringTodos.length > 0 && user) {
        const inserts = newRecurringTodos.map((t) => ({
          id: t.id,
          user_id: user.id,
          title: t.title,
          completed: t.completed,
          created_at: t.createdAt,
          deadline_date: t.deadlineDate,
          priority: t.priority,
          tags: t.tags,
          description: t.description,
          order_index: t.order,
          estimated_hours: t.estimatedHours,
          recurrence_rule: t.recurrenceRule,
        }));
        supabase
          .from('todos')
          .insert(inserts)
          .then(({ error }) => {
            if (error) toast.error(`繰り返しタスクの一括作成に失敗: ${error.message}`);
          });
      }
    },
    [todos, user],
  );

  const deleteTodos = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const todosToDelete = todos.filter((todo) => idSet.has(todo.id));
      if (todosToDelete.length === 0) return;
      const now = Date.now();
      const previousTodos = todos;
      const previousTrashed = trashedTodos;
      setLastDeleted(todosToDelete);
      addToTrash(todosToDelete.map((t) => ({ ...t, deletedAt: now })));
      setTodos((prev) => prev.filter((t) => !idSet.has(t.id)));

      supabase
        .from('todos')
        .update({ deleted_at: now })
        .in('id', ids)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            setTrashedTodos(previousTrashed);
            toast.error(`一括削除に失敗: ${error.message}`);
          }
        });
    },
    [todos, trashedTodos, addToTrash],
  );

  const duplicateTodo = useCallback(
    (id: string) => {
      const original = todos.find((t) => t.id === id);
      if (!original || !user) return;
      const match = original.title.match(/_(\d+)$/);
      const newTitle = match
        ? original.title.replace(/_(\d+)$/, `_${parseInt(match[1], 10) + 1}`)
        : `${original.title}_1`;
      const newId = crypto.randomUUID();
      const now = Date.now();

      const order = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;
      const newTodo: Todo = {
        ...original,
        id: newId,
        title: newTitle,
        completed: false,
        completedAt: undefined,
        createdAt: now,
        order,
      };

      const previousTodos = todos;
      setTodos((prev) => [newTodo, ...prev]);
      setLastDeleted(null);

      supabase
        .from('todos')
        .insert({
          id: newId,
          user_id: user.id,
          title: newTodo.title,
          completed: false,
          created_at: now,
          deadline_date: newTodo.deadlineDate,
          priority: newTodo.priority,
          tags: newTodo.tags,
          description: newTodo.description,
          order_index: newTodo.order,
          estimated_hours: newTodo.estimatedHours,
          recurrence_rule: newTodo.recurrenceRule,
        })
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            toast.error(`複製に失敗: ${error.message}`);
          }
        });
    },
    [todos, user],
  );

  const restoreDeleted = useCallback(() => {
    const currentLastDeleted = lastDeletedRef.current;
    if (!currentLastDeleted) return;
    const ids = currentLastDeleted.map((t) => t.id);
    const idSet = new Set(ids);

    setTodos((prev) => [...currentLastDeleted, ...prev]);
    setTrashedTodos((prev) => prev.filter((t) => !idSet.has(t.id)));
    setLastDeleted(null);

    supabase
      .from('todos')
      .update({ deleted_at: null })
      .in('id', ids)
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }, []);

  const clearUndo = useCallback(() => setLastDeleted(null), []);

  const restoreFromTrash = useCallback(
    (id: string) => {
      const todoToRestore = trashedTodos.find((t) => t.id === id);
      if (!todoToRestore) return;
      const previousTodos = todos;
      const previousTrashed = trashedTodos;
      const { deletedAt: _, ...restoredTodo } = todoToRestore;
      setTodos((prev) => [restoredTodo, ...prev]);
      setTrashedTodos((prev) => prev.filter((t) => t.id !== id));

      supabase
        .from('todos')
        .update({ deleted_at: null })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            setTrashedTodos(previousTrashed);
            console.error(error);
          }
        });
    },
    [todos, trashedTodos],
  );

  const permanentlyDelete = useCallback(
    (id: string) => {
      const previousTrashed = trashedTodos;
      setTrashedTodos((prev) => prev.filter((t) => t.id !== id));
      supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            setTrashedTodos(previousTrashed);
            console.error(error);
          }
        });
    },
    [trashedTodos],
  );

  const emptyTrash = useCallback(() => {
    const previousTrashed = trashedTodos;
    const ids = trashedTodos.map((t) => t.id);
    setTrashedTodos([]);
    if (ids.length > 0)
      supabase
        .from('todos')
        .delete()
        .in('id', ids)
        .then(({ error }) => {
          if (error) {
            setTrashedTodos(previousTrashed);
            console.error(error);
          }
        });
  }, [trashedTodos]);

  const addSubTask = useCallback(
    (todoId: string, title: string) => {
      if (!title.trim() || !user) return;
      const previousTodos = todos;
      const id = crypto.randomUUID();
      let order = 0;

      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== todoId) return todo;
          order = todo.subtasks?.length ?? 0;
          const newSubTask = { id, title: title.trim(), completed: false, order };
          return { ...todo, subtasks: [...(todo.subtasks || []), newSubTask] };
        }),
      );

      supabase
        .from('subtasks')
        .insert({
          id,
          user_id: user.id,
          todo_id: todoId,
          title: title.trim(),
          completed: false,
          order_index: order,
        })
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            console.error(error);
          }
        });
    },
    [todos, user],
  );

  const toggleSubTask = useCallback(
    (todoId: string, subTaskId: string) => {
      const previousTodos = todos;
      let completed = false;
      setTodos((prev) =>
        prev.map((todo) => {
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
        }),
      );
      supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subTaskId)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            console.error(error);
          }
        });
    },
    [todos],
  );

  const deleteSubTask = useCallback(
    (todoId: string, subTaskId: string) => {
      const previousTodos = todos;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== todoId) return todo;
          return { ...todo, subtasks: todo.subtasks?.filter((st) => st.id !== subTaskId) };
        }),
      );
      supabase
        .from('subtasks')
        .delete()
        .eq('id', subTaskId)
        .then(({ error }) => {
          if (error) {
            setTodos(previousTodos);
            console.error(error);
          }
        });
    },
    [todos],
  );

  // ゴミ箱のストレージサイズ（DB保存データのおおよそのデータ量）
  const trashStorageSizeKB =
    trashedTodos.length > 0
      ? Math.round((new Blob([JSON.stringify(trashedTodos)]).size / 1024) * 10) / 10
      : 0;

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
    trashStorageSizeKB,
    trashLimit: TRASH_LIMIT,
  };
}
