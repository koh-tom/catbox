import { toast } from 'sonner';
import { create } from 'zustand';
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

interface TodoState {
  todos: Todo[];
  trashedTodos: Todo[];
  savedTags: Tag[];
  lastDeleted: Todo[] | null;
  userId: string | null;
  trashLimit: number;

  setUserId: (userId: string | null) => void;
  fetchData: () => Promise<void>;
  addToTrash: (items: Todo[]) => void;
  addTodo: (
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
    estimatedHours?: number,
    recurrenceRule?: Todo['recurrenceRule'],
  ) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  reorderTodos: (startIndex: number, endIndex: number) => void;
  deleteCompleted: () => void;
  completeTodos: (ids: string[]) => void;
  deleteTodos: (ids: string[]) => void;
  duplicateTodo: (id: string) => void;
  restoreDeleted: () => void;
  clearUndo: () => void;
  restoreFromTrash: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  emptyTrash: () => void;
  addSavedTag: (name: string, color: string) => void;
  deleteSavedTag: (id: string) => void;
  addSubTask: (todoId: string, title: string) => void;
  toggleSubTask: (todoId: string, subTaskId: string) => void;
  deleteSubTask: (todoId: string, subTaskId: string) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  trashedTodos: [],
  savedTags: [],
  lastDeleted: null,
  userId: null,
  trashLimit: TRASH_LIMIT,

  setUserId: (userId) => {
    set({ userId });
    get().fetchData();
  },

  fetchData: async () => {
    const { userId } = get();
    if (!userId) {
      set({ todos: [], trashedTodos: [], savedTags: [] });
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

      set({ savedTags: tagsRes.data || [] });

      const subtasksMap: Record<string, SubTask[]> = {};
      (subtasksRes.data || []).forEach((st) => {
        if (!subtasksMap[st.todo_id]) subtasksMap[st.todo_id] = [];
        subtasksMap[st.todo_id].push(mapSubtaskFromDB(st));
      });

      const allTodos = (todosRes.data || []).map((row) => mapTodoFromDB(row, subtasksMap));
      set({
        todos: allTodos.filter((t) => !t.deletedAt),
        trashedTodos: allTodos.filter((t) => !!t.deletedAt),
      });
    } catch (err) {
      toast.error(
        `データの取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },

  addToTrash: (items) => {
    set((state) => ({
      trashedTodos: [...items, ...state.trashedTodos].slice(0, TRASH_LIMIT),
    }));
  },

  addTodo: (
    title,
    deadlineDate,
    priority,
    tags = [],
    description,
    estimatedHours,
    recurrenceRule,
  ) => {
    const { userId, todos } = get();
    if (!title.trim() || !userId) return;

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
    set((state) => ({ todos: [newTodo, ...state.todos], lastDeleted: null }));

    supabase
      .from('todos')
      .insert({
        id,
        user_id: userId,
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
          set({ todos: previousTodos });
          toast.error(`追加に失敗: ${error.message}`);
        }
      });
  },

  toggleTodo: (id) => {
    const { userId, todos } = get();
    const todoToToggle = todos.find((t) => t.id === id);
    if (!todoToToggle) return;

    const isCompleting = !todoToToggle.completed;
    const now = Date.now();
    let newRecurringTodo: Todo | null = null;

    if (isCompleting && todoToToggle.recurrenceRule && userId) {
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
    set((state) => {
      const updatedTodos = state.todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            completed: isCompleting,
            completedAt: isCompleting ? now : undefined,
          };
        }
        return todo;
      });
      return {
        todos: newRecurringTodo ? [newRecurringTodo, ...updatedTodos] : updatedTodos,
      };
    });

    supabase
      .from('todos')
      .update({ completed: isCompleting, completed_at: isCompleting ? now : null })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos });
          toast.error(`更新に失敗: ${error.message}`);
        }
      });

    if (newRecurringTodo && userId) {
      supabase
        .from('todos')
        .insert({
          id: newRecurringTodo.id,
          user_id: userId,
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

  deleteTodo: (id) => {
    const { todos, trashedTodos, addToTrash } = get();
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;
    const now = Date.now();
    const previousTodos = todos;
    const previousTrashed = trashedTodos;

    set({ lastDeleted: [todoToDelete] });
    addToTrash([{ ...todoToDelete, deletedAt: now }]);
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));

    supabase
      .from('todos')
      .update({ deleted_at: now })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos, trashedTodos: previousTrashed });
          toast.error(`削除に失敗: ${error.message}`);
        }
      });
  },

  addSavedTag: (name, color) => {
    const { userId, savedTags } = get();
    const trimmed = name.trim();
    if (!trimmed || savedTags.some((t) => t.name === trimmed) || !userId) return;

    const id = crypto.randomUUID();
    const previousTags = savedTags;
    const newTag = { id, name: trimmed, color };

    set((state) => ({ savedTags: [...state.savedTags, newTag] }));

    supabase
      .from('saved_tags')
      .insert({ id, user_id: userId, name: trimmed, color })
      .then(({ error }) => {
        if (error) {
          set({ savedTags: previousTags });
          toast.error(`タグ追加に失敗: ${error.message}`);
        }
      });
  },

  deleteSavedTag: (id) => {
    const previousTags = get().savedTags;
    set((state) => ({ savedTags: state.savedTags.filter((t) => t.id !== id) }));
    supabase
      .from('saved_tags')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          set({ savedTags: previousTags });
          toast.error(`タグ削除に失敗: ${error.message}`);
        }
      });
  },

  editTodo: (id, updates) => {
    if (updates.title !== undefined && !updates.title.trim()) return;
    const previousTodos = get().todos;

    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id !== id) return todo;
        return {
          ...todo,
          ...updates,
          title: updates.title?.trim() ?? todo.title,
          deadlineDate: updates.deadlineDate?.trim() || undefined,
        };
      }),
    }));

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
          set({ todos: previousTodos });
          toast.error(`更新に失敗: ${error.message}`);
        }
      });
  },

  reorderTodos: (startIndex, endIndex) => {
    const previousTodos = get().todos;
    const result = Array.from(previousTodos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const updatedTodos = result.map((todo, index) => ({ ...todo, order: index }));
    set({ todos: updatedTodos });

    Promise.all(
      updatedTodos.map((todo) =>
        supabase.from('todos').update({ order_index: todo.order }).eq('id', todo.id),
      ),
    ).then((results) => {
      const firstError = results.find((r) => r.error);
      if (firstError) {
        set({ todos: previousTodos });
        toast.error(`並べ替えの保存に失敗しました`);
      }
    });
  },

  deleteCompleted: () => {
    const { todos, trashedTodos, addToTrash } = get();
    const completed = todos.filter((todo) => todo.completed);
    if (completed.length === 0) return;

    const now = Date.now();
    const previousTodos = todos;
    const previousTrashed = trashedTodos;
    const ids = completed.map((t) => t.id);

    set({ lastDeleted: completed });
    addToTrash(completed.map((t) => ({ ...t, deletedAt: now })));
    set((state) => ({ todos: state.todos.filter((t) => !t.completed) }));

    supabase
      .from('todos')
      .update({ deleted_at: now })
      .in('id', ids)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos, trashedTodos: previousTrashed });
          toast.error(`一括削除に失敗: ${error.message}`);
        }
      });
  },

  completeTodos: (ids) => {
    const { userId, todos } = get();
    const idSet = new Set(ids);
    const selectedTodos = todos.filter((t) => idSet.has(t.id));
    if (selectedTodos.length === 0) return;

    const allCompleted = selectedTodos.every((t) => t.completed);
    const targetCompletedState = !allCompleted;
    const now = Date.now();

    const newRecurringTodos: Todo[] = [];
    let currentOrder = todos.length > 0 ? Math.min(...todos.map((t) => t.order)) - 1 : 0;

    if (targetCompletedState) {
      selectedTodos.forEach((todo) => {
        if (!todo.completed && todo.recurrenceRule && userId) {
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
    set((state) => {
      const updated = state.todos.map((todo) =>
        idSet.has(todo.id)
          ? {
              ...todo,
              completed: targetCompletedState,
              completedAt: targetCompletedState ? now : undefined,
            }
          : todo,
      );
      return { todos: [...newRecurringTodos, ...updated] };
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
          set({ todos: previousTodos });
          toast.error(
            `${targetCompletedState ? '一括完了' : '一括未完了'}に失敗: ${error.message}`,
          );
        }
      });

    if (newRecurringTodos.length > 0 && userId) {
      const inserts = newRecurringTodos.map((t) => ({
        id: t.id,
        user_id: userId,
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

  deleteTodos: (ids) => {
    const { todos, trashedTodos, addToTrash } = get();
    const idSet = new Set(ids);
    const todosToDelete = todos.filter((todo) => idSet.has(todo.id));
    if (todosToDelete.length === 0) return;

    const now = Date.now();
    const previousTodos = todos;
    const previousTrashed = trashedTodos;

    set({ lastDeleted: todosToDelete });
    addToTrash(todosToDelete.map((t) => ({ ...t, deletedAt: now })));
    set((state) => ({ todos: state.todos.filter((t) => !idSet.has(t.id)) }));

    supabase
      .from('todos')
      .update({ deleted_at: now })
      .in('id', ids)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos, trashedTodos: previousTrashed });
          toast.error(`一括削除に失敗: ${error.message}`);
        }
      });
  },

  duplicateTodo: (id) => {
    const { userId, todos } = get();
    const original = todos.find((t) => t.id === id);
    if (!original || !userId) return;

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
    set((state) => ({ todos: [newTodo, ...state.todos], lastDeleted: null }));

    supabase
      .from('todos')
      .insert({
        id: newId,
        user_id: userId,
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
          set({ todos: previousTodos });
          toast.error(`複製に失敗: ${error.message}`);
        }
      });
  },

  restoreDeleted: () => {
    const lastDeleted = get().lastDeleted;
    if (!lastDeleted) return;
    const ids = lastDeleted.map((t) => t.id);
    const idSet = new Set(ids);

    set((state) => ({
      todos: [...lastDeleted, ...state.todos],
      trashedTodos: state.trashedTodos.filter((t) => !idSet.has(t.id)),
      lastDeleted: null,
    }));

    supabase
      .from('todos')
      .update({ deleted_at: null })
      .in('id', ids)
      .then(({ error }) => {
        if (error) console.error(error);
      });
  },

  clearUndo: () => set({ lastDeleted: null }),

  restoreFromTrash: (id) => {
    const { todos, trashedTodos } = get();
    const todoToRestore = trashedTodos.find((t) => t.id === id);
    if (!todoToRestore) return;

    const previousTodos = todos;
    const previousTrashed = trashedTodos;
    const { deletedAt: _, ...restoredTodo } = todoToRestore;

    set((state) => ({
      todos: [restoredTodo, ...state.todos],
      trashedTodos: state.trashedTodos.filter((t) => t.id !== id),
    }));

    supabase
      .from('todos')
      .update({ deleted_at: null })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos, trashedTodos: previousTrashed });
          console.error(error);
        }
      });
  },

  permanentlyDelete: (id) => {
    const previousTrashed = get().trashedTodos;
    set((state) => ({ trashedTodos: state.trashedTodos.filter((t) => t.id !== id) }));
    supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          set({ trashedTodos: previousTrashed });
          console.error(error);
        }
      });
  },

  emptyTrash: () => {
    const trashedTodos = get().trashedTodos;
    const previousTrashed = trashedTodos;
    const ids = trashedTodos.map((t) => t.id);

    set({ trashedTodos: [] });
    if (ids.length > 0) {
      supabase
        .from('todos')
        .delete()
        .in('id', ids)
        .then(({ error }) => {
          if (error) {
            set({ trashedTodos: previousTrashed });
            console.error(error);
          }
        });
    }
  },

  addSubTask: (todoId, title) => {
    const { userId, todos } = get();
    if (!title.trim() || !userId) return;
    const previousTodos = todos;
    const id = crypto.randomUUID();
    let order = 0;

    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id !== todoId) return todo;
        order = todo.subtasks?.length ?? 0;
        const newSubTask = { id, title: title.trim(), completed: false, order };
        return { ...todo, subtasks: [...(todo.subtasks || []), newSubTask] };
      }),
    }));

    supabase
      .from('subtasks')
      .insert({
        id,
        user_id: userId,
        todo_id: todoId,
        title: title.trim(),
        completed: false,
        order_index: order,
      })
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos });
          console.error(error);
        }
      });
  },

  toggleSubTask: (todoId, subTaskId) => {
    const previousTodos = get().todos;
    let completed = false;

    set((state) => ({
      todos: state.todos.map((todo) => {
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
    }));

    supabase
      .from('subtasks')
      .update({ completed })
      .eq('id', subTaskId)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos });
          console.error(error);
        }
      });
  },

  deleteSubTask: (todoId, subTaskId) => {
    const previousTodos = get().todos;
    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id !== todoId) return todo;
        return { ...todo, subtasks: todo.subtasks?.filter((st) => st.id !== subTaskId) };
      }),
    }));

    supabase
      .from('subtasks')
      .delete()
      .eq('id', subTaskId)
      .then(({ error }) => {
        if (error) {
          set({ todos: previousTodos });
          console.error(error);
        }
      });
  },
}));
