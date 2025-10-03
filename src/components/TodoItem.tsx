import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { StarRating } from '@/components/StarRating';
import { MdCheck, MdClose, MdEdit } from 'react-icons/md';
import { FaTag, FaTimes } from 'react-icons/fa';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getDeadlineBadgeVariant, getRelativeDateLabel } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    newTitle: string,
    deadlineDate?: string,
    priority?: number,
    tags?: string[],
  ) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [editDeadlineDate, setEditDeadlineDate] = useState(todo.deadlineDate || '');
  const [editPriority, setEditPriority] = useState(todo.priority ?? 1);
  const [editTags, setEditTags] = useState<string[]>(todo.tags || []);
  const [editTagInput, setEditTagInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(todo.title);
    setEditDeadlineDate(todo.deadlineDate || '');
    setEditPriority(todo.priority ?? 1);
    setEditTags(todo.tags || []);
    setEditTagInput('');
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSave = () => {
    const isValidDeadline = !editDeadlineDate.trim() || /^\d+\/\d+$/.test(editDeadlineDate.trim());

    if (editValue.trim() && isValidDeadline) {
      onEdit(todo.id, editValue, editDeadlineDate, editPriority, editTags);
      setIsEditing(false);
    } else if (!editValue.trim()) {
      setEditValue(todo.title);
      setEditDeadlineDate(todo.deadlineDate || '');
      setEditPriority(todo.priority ?? 1);
      setEditTags(todo.tags || []);
      setEditTagInput('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    setEditDeadlineDate(todo.deadlineDate || '');
    setEditPriority(todo.priority ?? 1);
    setEditTags(todo.tags || []);
    setEditTagInput('');
    setIsEditing(false);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const newTag = editTagInput.trim();
      if (newTag && !editTags.includes(newTag)) {
        setEditTags([...editTags, newTag]);
        setEditTagInput('');
      }
    }
  };

  const removeEditTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li
      className={`group flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors hover:bg-accent/50 ${todo.completed ? 'opacity-60' : ''
        }`}
    >
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        disabled={isEditing}
      />

      {isEditing ? (
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={handleSave}
              aria-label="保存"
            >
              <MdCheck className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
              onClick={handleCancel}
              aria-label="キャンセル"
            >
              <MdClose className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <DatePicker
              date={editDeadlineDate}
              setDate={setEditDeadlineDate}
              placeholder="期限"
              className="w-32 h-8"
            />
            <div className="px-1">
              <StarRating value={editPriority} onChange={setEditPriority} />
            </div>

            <div className="flex-1 min-w-[120px] flex items-center gap-1 border rounded px-2 h-8 bg-background focus-within:ring-1 focus-within:ring-ring">
              <FaTag className="text-muted-foreground w-3 h-3 shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-xs placeholder:text-muted-foreground"
                placeholder="タグ追加 (Enter)"
                value={editTagInput}
                onChange={(e) => setEditTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          {editTags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeEditTag(tag)}
                    className="text-primary/60 hover:text-primary focus:outline-none"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onDoubleClick={handleEdit}
            className={`flex-1 text-sm text-left cursor-pointer select-none bg-transparent border-none p-0 ${todo.completed ? 'line-through text-muted-foreground' : ''
              }`}
          >
            {todo.title}
          </button>

          {todo.tags && todo.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap items-center">
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-1 items-center">
            {todo.deadlineDate && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded shrink-0 flex items-center gap-1 border',
                  getDeadlineBadgeVariant(todo.deadlineDate),
                )}
              >
                期限: {todo.deadlineDate}
                <span className="font-semibold">({getRelativeDateLabel(todo.deadlineDate)})</span>
              </span>
            )}
            <div className="px-1 scale-90 origin-left">
              <StarRating value={todo.priority ?? 1} readOnly />
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
              {new Date(todo.createdAt).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {!isEditing && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            onClick={handleEdit}
            aria-label="編集"
          >
            <MdEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            aria-label="削除"
          >
            <MdClose className="h-4 w-4" />
          </Button>
        </>
      )}
    </li>
  );
}
