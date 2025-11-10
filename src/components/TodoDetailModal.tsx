import { useEffect, useState } from 'react';
import { FaRegClock, FaRegStickyNote } from 'react-icons/fa';
import { MdAdd, MdCheck, MdDelete, MdTitle } from 'react-icons/md';
import { VscListSelection } from 'react-icons/vsc';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tag, Todo } from '@/types/todo';

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
  ) => void;
  savedTags: Tag[];
  onAddSubTask: (todoId: string, title: string) => void;
  onToggleSubTask: (todoId: string, subTaskId: string) => void;
  onDeleteSubTask: (todoId: string, subTaskId: string) => void;
}

export function TodoDetailModal({
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

  useEffect(() => {
    if (isOpen) {
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setDeadlineDate(todo.deadlineDate);
        setPriority(todo.priority ?? 1);
        setTags(todo.tags || []);
        setEstimatedHours(todo.estimatedHours ? String(todo.estimatedHours) : '');
      } else {
        setTitle('');
        setDescription('');
        setDeadlineDate(undefined);
        setPriority(1);
        setTags([]);
        setEstimatedHours('');
      }
    }
  }, [todo, isOpen]);

  const handleSave = () => {
    if (title.trim()) {
      const parsedHours = estimatedHours ? parseFloat(estimatedHours) : undefined;
      onSave(todo ? todo.id : '', title, deadlineDate, priority, tags, description, isNaN(parsedHours!) ? undefined : parsedHours);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {todo ? '詳細編集' : '新規タスク作成'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MdTitle className="w-4 h-4" /> タイトル
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <DatePicker date={deadlineDate} setDate={setDeadlineDate} />
            </div>
            <div className="flex items-center gap-2 border rounded-md px-3 h-10">
              <span className="text-sm text-muted-foreground mr-1">優先度</span>
              <StarRating value={priority} onChange={setPriority} />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FaRegClock className="w-4 h-4" /> 見積もり時間 (h)
            </div>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="例: 0.5 (30分), 2.5 (2時間半)"
              className="w-full sm:w-1/2"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FaRegStickyNote className="w-4 h-4" /> メモ
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細やメモを入力..."
              className="min-h-[100px]"
            />
          </div>

          {todo && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <VscListSelection className="w-4 h-4" /> サブタスク
              </div>
              <div className="flex gap-2">
                <Input
                  value={subTaskTitle}
                  onChange={(e) => setSubTaskTitle(e.target.value)}
                  onKeyDown={handleSubTaskKeyDown}
                  placeholder="サブタスクを追加..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleAddSubTask}
                  disabled={!subTaskTitle.trim()}
                  type="button"
                >
                  <MdAdd className="w-4 h-4" />
                </Button>
              </div>

              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="space-y-2 mt-1">
                  {todo.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2 p-2 rounded-md border bg-muted/40 group"
                    >
                      <Checkbox
                        checked={st.completed}
                        onCheckedChange={() => onToggleSubTask(todo.id, st.id)}
                        id={`subtask-${st.id}`}
                      />
                      <label
                        htmlFor={`subtask-${st.id}`}
                        className={`text-sm flex-1 cursor-pointer ${st.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                      >
                        {st.title}
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteSubTask(todo.id, st.id)}
                      >
                        <MdDelete className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">期限</span>
              <DatePicker
                date={deadlineDate}
                setDate={setDeadlineDate}
                placeholder="期限なし"
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">優先度</span>
              <div className="pt-2">
                <StarRating value={priority} onChange={setPriority} />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">タグ</span>
            <TagSelector
              savedTags={savedTags}
              selectedTags={tags}
              onChange={setTags}
              className="w-full justify-between"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled} type="button">
            <MdCheck className="w-4 h-4 mr-2" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
