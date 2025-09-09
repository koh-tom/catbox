import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
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
      />
      <label
        htmlFor={`todo-${todo.id}`}
        className={`flex-1 text-sm cursor-pointer select-none ${
          todo.completed ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {todo.title}
      </label>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(todo.id)}
        aria-label="削除"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}
