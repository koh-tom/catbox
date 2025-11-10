import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { FaRegClock } from 'react-icons/fa';
import { MdCheck, MdClose, MdContentCopy, MdDragIndicator, MdEdit, MdUndo } from 'react-icons/md';
import { VscListSelection } from 'react-icons/vsc';
import { StarRating } from '@/components/StarRating';
import { TagBadge } from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getDeadlineBadgeVariant, getRelativeDateLabel, parseTodoDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Tag, Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  savedTags?: Tag[];
  onSelect?: (todo: Todo) => void;
  innerRef?: (element?: HTMLElement | null) => void;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDraggable?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  savedTags = [],
  onSelect,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDraggable = false,
  isDragging = false,
  isSelected = false,
  onToggleSelect,
  onDuplicate,
}: TodoItemProps) {
  return (
    <li
      ref={innerRef}
      {...draggableProps}
      style={draggableProps?.style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:bg-accent/50',
        todo.completed ? 'opacity-60' : '',
        isSelected ? 'bg-primary/5 border-primary/30' : '',
        isDragging && 'shadow-xl ring-2 ring-primary/20 scale-[1.01] bg-accent z-50',
      )}
    >
      {isDraggable && (
        <div
          {...dragHandleProps}
          className={cn(
            'text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing p-1 -ml-2',
            isDragging && 'cursor-grabbing',
          )}
        >
          <MdDragIndicator className="w-5 h-5" />
        </div>
      )}

      {onToggleSelect && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(todo.id)}
          className="mr-1 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          aria-label="選択"
        />
      )}

      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          onDoubleClick={() => onSelect?.(todo)}
          className={cn(
            'flex-1 text-sm text-left cursor-pointer select-none bg-transparent border-none p-0',
            todo.completed && 'line-through text-muted-foreground',
          )}
        >
          {todo.title}
        </button>

        {todo.subtasks && todo.subtasks.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
            <VscListSelection className="w-3 h-3" />
            <span>
              {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
            </span>
          </span>
        )}

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
              期限: {(() => {
                const d = parseTodoDate(todo.deadlineDate);
                return d ? format(d, 'M/d') : todo.deadlineDate;
              })()}
              <span className="font-semibold">({getRelativeDateLabel(todo.deadlineDate)})</span>
            </span>
          )}
          <div className="px-1 scale-90 origin-left">
            <StarRating value={todo.priority ?? 1} readOnly />
          </div>
          {todo.estimatedHours !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 border border-muted">
              <FaRegClock className="w-3 h-3" />
              {todo.estimatedHours}h
            </span>
          )}
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
            {todo.completed && todo.completedAt ? (
              <span className="text-primary font-medium">
                完了:{' '}
                {new Date(todo.completedAt).toLocaleDateString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                })}
              </span>
            ) : (
              new Date(todo.createdAt).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
              })
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 text-muted-foreground hover:text-foreground',
            todo.completed && 'text-primary hover:text-primary',
          )}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
        >
          {todo.completed ? <MdUndo className="h-4 w-4" /> : <MdCheck className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onSelect?.(todo)}
          aria-label="編集"
        >
          <MdEdit className="h-4 w-4" />
        </Button>
        {onDuplicate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onDuplicate(todo.id)}
            aria-label="複製"
          >
            <MdContentCopy className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(todo.id)}
          aria-label="削除"
        >
          <MdClose className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
