import { memo, useEffect, useState } from 'react';
import { FaRegClock, FaRegStickyNote } from 'react-icons/fa';
import { MdAdd, MdCheck, MdDelete, MdRepeat, MdTitle } from 'react-icons/md';
import { VscListSelection } from 'react-icons/vsc';
import { Drawer } from 'vaul';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RecurrenceRule, Tag, Todo } from '@/types/todo';

// フォームの内容を共通化
interface TodoDetailContentProps {
  todo: Todo | null;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  deadlineDate?: string;
  setDeadlineDate: (v: string | undefined) => void;
  priority: number;
  setPriority: (v: number) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  estimatedHours: string;
  setEstimatedHours: (v: string) => void;
  subTaskTitle: string;
  setSubTaskTitle: (v: string) => void;
  recurrenceRule?: RecurrenceRule;
  setRecurrenceRule: (v: RecurrenceRule | undefined) => void;
  handleSave: () => void;
  onClose: () => void;
  isSaveDisabled: boolean;
  savedTags: Tag[];
  handleSubTaskKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleAddSubTask: () => void;
  onToggleSubTask: (todoId: string, subTaskId: string) => void;
  onDeleteSubTask: (todoId: string, subTaskId: string) => void;
}

const TodoDetailContent = ({
  todo,
  title,
  setTitle,
  description,
  setDescription,
  deadlineDate,
  setDeadlineDate,
  priority,
  setPriority,
  tags,
  setTags,
  estimatedHours,
  setEstimatedHours,
  subTaskTitle,
  setSubTaskTitle,
  recurrenceRule,
  setRecurrenceRule,
  handleSave,
  onClose,
  isSaveDisabled,
  savedTags,
  handleSubTaskKeyDown,
  handleAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: TodoDetailContentProps) => (
  <>
    <div className="grid gap-5 py-4 px-1">
      <div className="grid gap-2">
        <label
          htmlFor="todo-title"
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
        >
          <MdTitle className="w-4 h-4 text-primary" /> タイトル
        </label>
        <Input
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスクのタイトル"
          className="text-lg font-medium border-x-0 border-t-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent px-0 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            期限
          </span>
          <DatePicker
            date={deadlineDate}
            setDate={setDeadlineDate}
            placeholder="期限なし"
            className="w-full bg-muted/30"
          />
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            優先度
          </span>
          <div className="flex items-center border rounded-xl px-3 h-10 w-full bg-muted/30">
            <StarRating value={priority} onChange={setPriority} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label
            htmlFor="todo-estimate"
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            <FaRegClock className="w-4 h-4 text-primary" /> 見積もり (h)
          </label>
          <Input
            id="todo-estimate"
            type="number"
            min="0"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="0.0"
            className="w-full bg-muted/30 rounded-xl"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="todo-recurrence"
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            <MdRepeat className="w-4 h-4 text-primary" /> 繰り返し
          </label>
          <Select
            value={recurrenceRule || 'none'}
            onValueChange={(val: string) =>
              setRecurrenceRule(val === 'none' ? undefined : (val as NonNullable<RecurrenceRule>))
            }
          >
            <SelectTrigger
              id="todo-recurrence"
              className="w-full bg-muted/30 rounded-xl border-none"
            >
              <SelectValue placeholder="なし" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="none">なし</SelectItem>
              <SelectItem value="daily">毎日</SelectItem>
              <SelectItem value="weekly">毎週</SelectItem>
              <SelectItem value="biweekly">2週</SelectItem>
              <SelectItem value="monthly">毎月</SelectItem>
              <SelectItem value="yearly">毎年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="todo-memo"
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
        >
          <FaRegStickyNote className="w-4 h-4 text-primary" /> メモ
        </label>
        <Textarea
          id="todo-memo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細やメモを入力..."
          className="min-h-[80px] bg-muted/30 rounded-xl resize-none"
        />
      </div>

      {todo && (
        <div className="grid gap-3">
          <label
            htmlFor="todo-subtask"
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            <VscListSelection className="w-4 h-4 text-primary" /> サブタスク
          </label>
          <div className="flex gap-2">
            <Input
              id="todo-subtask"
              value={subTaskTitle}
              onChange={(e) => setSubTaskTitle(e.target.value)}
              onKeyDown={handleSubTaskKeyDown}
              placeholder="サブタスクを追加..."
              className="flex-1 bg-muted/30 rounded-xl border-none"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleAddSubTask}
              disabled={!subTaskTitle.trim()}
              type="button"
              className="rounded-xl shrink-0"
            >
              <MdAdd className="w-5 h-5" />
            </Button>
          </div>

          {todo.subtasks && todo.subtasks.length > 0 && (
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
              {todo.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card/40 group hover:border-primary/30 transition-all"
                >
                  <Checkbox
                    checked={st.completed}
                    onCheckedChange={() => onToggleSubTask(todo.id, st.id)}
                    id={`subtask-${st.id}`}
                  />
                  <label
                    htmlFor={`subtask-${st.id}`}
                    className={`text-sm flex-1 cursor-pointer font-medium ${
                      st.completed ? 'line-through text-muted-foreground/50' : ''
                    }`}
                  >
                    {st.title}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteSubTask(todo.id, st.id)}
                  >
                    <MdDelete className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          タグ
        </span>
        <TagSelector
          savedTags={savedTags}
          selectedTags={tags}
          onChange={setTags}
          className="w-full justify-between bg-muted/30 rounded-xl border-none h-10 px-4"
        />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:border-t mt-4">
      <Button
        onClick={handleSave}
        disabled={isSaveDisabled}
        type="button"
        className="w-full sm:flex-1 h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20 btn-bounce order-1 sm:order-2"
      >
        <MdCheck className="w-6 h-6 mr-2" />
        {todo ? '保存する' : '作成する'}
      </Button>
      <Button
        variant="ghost"
        onClick={onClose}
        type="button"
        className="w-full sm:w-auto h-12 rounded-xl font-bold text-muted-foreground order-2 sm:order-1 sm:px-8"
      >
        キャンセル
      </Button>
    </div>
  </>
);

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    title: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
    description?: string,
    estimatedHours?: number,
    recurrenceRule?: RecurrenceRule,
  ) => void;
  savedTags: Tag[];
  onAddSubTask: (todoId: string, title: string) => void;
  onToggleSubTask: (todoId: string, subTaskId: string) => void;
  onDeleteSubTask: (todoId: string, subTaskId: string) => void;
}

export const TodoDetailModal = memo(function TodoDetailModal({
  todo,
  isOpen,
  onClose,
  onSave,
  savedTags,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: TodoDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setDeadlineDate(todo.deadlineDate);
        setPriority(todo.priority ?? 1);
        setTags(todo.tags || []);
        setEstimatedHours(todo.estimatedHours ? String(todo.estimatedHours) : '');
        setRecurrenceRule(todo.recurrenceRule);
      } else {
        setTitle('');
        setDescription('');
        setDeadlineDate(undefined);
        setPriority(1);
        setTags([]);
        setEstimatedHours('');
        setRecurrenceRule(undefined);
      }
    }
  }, [todo, isOpen]);

  const handleSave = () => {
    if (title.trim()) {
      const parsedHours = estimatedHours ? parseFloat(estimatedHours) : undefined;
      onSave(
        todo ? todo.id : '',
        title,
        deadlineDate,
        priority,
        tags,
        description,
        parsedHours === undefined || Number.isNaN(parsedHours) ? undefined : parsedHours,
        recurrenceRule,
      );
      onClose();
    }
  };

  const handleAddSubTask = () => {
    if (todo && subTaskTitle.trim()) {
      onAddSubTask(todo.id, subTaskTitle);
      setSubTaskTitle('');
    }
  };

  const handleSubTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddSubTask();
    }
  };

  const isSaveDisabled = !title.trim();

  const contentProps = {
    todo,
    title,
    setTitle,
    description,
    setDescription,
    deadlineDate,
    setDeadlineDate,
    priority,
    setPriority,
    tags,
    setTags,
    estimatedHours,
    setEstimatedHours,
    subTaskTitle,
    setSubTaskTitle,
    recurrenceRule,
    setRecurrenceRule,
    handleSave,
    onClose,
    isSaveDisabled,
    savedTags,
    onAddSubTask,
    onToggleSubTask,
    onDeleteSubTask,
    handleSubTaskKeyDown,
    handleAddSubTask,
  };

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] bg-card flex flex-col rounded-t-[32px] outline-none max-h-[94vh]">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 mb-6" />
              <Drawer.Title className="flex items-center gap-3 text-2xl font-black text-primary mb-2">
                <img
                  src="/icon.png"
                  alt="Catbox"
                  className="w-10 h-10 rounded-xl shadow-md rotate-3"
                />
                <span>{todo ? '編集する 🐾' : '新規作成 🐈'}</span>
              </Drawer.Title>
              <TodoDetailContent {...contentProps} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] border-none rounded-[24px] shadow-2xl bg-card p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4 text-2xl font-black text-primary mb-2">
            <img src="/icon.png" alt="Catbox" className="w-10 h-10 rounded-xl shadow-md" />
            <span>{todo ? 'タスクの詳細 🐾' : '新しいタスク 🐈'}</span>
          </DialogTitle>
        </DialogHeader>
        <TodoDetailContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
});
