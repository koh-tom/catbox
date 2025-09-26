import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { MdCheck, MdClose, MdEdit } from 'react-icons/md';
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
  onEdit: (id: string, newTitle: string, deadlineDate?: string, priority?: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [editDeadlineDate, setEditDeadlineDate] = useState(todo.deadlineDate || '');
  const [editPriority, setEditPriority] = useState(todo.priority ?? 1);
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
    setIsEditing(true);
  };

  const handleSave = () => {
    const isValidDeadline = !editDeadlineDate.trim() || /^\d+\/\d+$/.test(editDeadlineDate.trim());

    if (editValue.trim() && isValidDeadline) {
      onEdit(todo.id, editValue, editDeadlineDate, editPriority);
      setIsEditing(false);
    } else if (!editValue.trim()) {
      setEditValue(todo.title);
      setEditDeadlineDate(todo.deadlineDate || '');
      setEditPriority(todo.priority ?? 1);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    setEditDeadlineDate(todo.deadlineDate || '');
    setEditPriority(todo.priority ?? 1);
    setIsEditing(false);
  };

  const getPriorityBadge = (priority: number) => {
    const getColorClass = (p: number) => {
      switch (p) {
        case 5:
          return 'text-red-500 drop-shadow-sm';
        case 4:
          return 'text-orange-500';
        case 3:
          return 'text-yellow-500';
        case 2:
          return 'text-blue-400';
        default:
          return 'text-sky-300';
      }
    };

    return (
      <div className="flex gap-0.5 items-center pl-1" title={`優先度: ${priority}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className={cn(
              'w-3 h-3 transition-all',
              i < priority ? getColorClass(priority) : 'text-muted-foreground/20',
            )}
          />
        ))}
      </div>
    );
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
        <div className="flex flex-1 gap-2">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-8"
            autoFocus
          />
          <DatePicker
            date={editDeadlineDate}
            setDate={setEditDeadlineDate}
            placeholder="期限"
            className="w-32 h-8"
          />
          <Input
            type="number"
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            className="w-16 h-8 text-center"
            min={1}
            max={5}
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
            {getPriorityBadge(todo.priority ?? 1)}
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
