import { MdClose, MdEdit } from 'react-icons/md';
import { StarRating } from '@/components/StarRating';
import { TagBadge } from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getDeadlineBadgeVariant, getRelativeDateLabel } from '@/lib/date-utils';
import { getTagColorStyles } from '@/lib/tag-utils';
import { cn } from '@/lib/utils';
import type { Tag, Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  savedTags?: Tag[];
  onSelect?: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggle, onDelete, savedTags = [], onSelect }: TodoItemProps) {
  return (
    <li
      className={`group flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors hover:bg-accent/50 ${todo.completed ? 'opacity-60' : ''
        }`}
    >
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />

      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          onDoubleClick={() => onSelect?.(todo)}
          className={`flex-1 text-sm text-left cursor-pointer select-none bg-transparent border-none p-0 ${todo.completed ? 'line-through text-muted-foreground' : ''
            }`}
        >
          {todo.title}
        </button>

        {todo.tags && todo.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap items-center">
            {todo.tags.map((tagName) => {
              const tagColor = savedTags.find((t) => t.name === tagName)?.color;
              return (
                <TagBadge
                  key={tagName}
                  tagName={tagName}
                  tagColor={tagColor}
                  className="text-[10px] px-1.5"
                />
              );
            })}
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

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={() => onSelect?.(todo)}
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
    </li>
  );
}
