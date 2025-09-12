import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { MdClose, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(todo.title);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(todo.id, editValue);
    } else {
      setEditValue(todo.title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    setIsEditing(false);
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
      className={`group flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors hover:bg-accent/50 ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        disabled={isEditing}
      />

      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 h-8"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={handleEdit}
          className={`flex-1 text-sm text-left cursor-pointer select-none bg-transparent border-none p-0 ${
            todo.completed ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {todo.title}
        </button>
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
