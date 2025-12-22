import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
  onToggleSelect?: (id: string, shiftKey: boolean) => void;
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
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      ref={innerRef}
      {...draggableProps}
      style={draggableProps?.style}
      data-lasso-item
      data-todo-id={todo.id}
      className={cn(
        'group flex items-start gap-4 p-4 lg:p-5 rounded-lg border border-muted bg-card/60 transition-colors hover:bg-accent/40 hover:shadow-md h-full relative',
        todo.completed ? 'opacity-50 grayscale-[0.3]' : '',
        isSelected ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : '',
        isDragging && 'shadow-2xl ring-2 ring-primary/40 scale-[1.02] bg-card z-50',
      )}
    >
      <div className="flex items-center gap-2 pt-0.5 shrink-0">
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(todo.id, e.shiftKey);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleSelect(todo.id, e.shiftKey);
              }
            }}
            className="flex items-center justify-center p-1 -m-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded bg-transparent border-none"
            aria-label="選択"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {}} // 親のbuttonでイベントを拾う
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 pointer-events-none"
              aria-label="選択チェックボックス"
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0 h-full">
        <div className="flex items-start justify-between gap-2 w-full pr-24 lg:pr-0">
          <button
            type="button"
            onDoubleClick={() => onSelect?.(todo)}
            className={cn(
              'flex-1 text-sm font-medium text-left cursor-pointer select-none bg-transparent border-none p-0 break-words',
              todo.completed && 'line-through text-muted-foreground font-normal',
            )}
          >
            {todo.title}
          </button>

          {todo.subtasks && todo.subtasks.length > 0 && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
              <VscListSelection className="w-3 h-3" />
              <span>
                {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
              </span>
            </span>
          )}
        </div>

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

        <div className="flex gap-1.5 items-center flex-wrap shrink-0 mt-auto pt-1 w-full">
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
          <span className="text-[10px] text-muted-foreground px-1 py-0.5 rounded shrink-0 ml-auto leading-none">
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

      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-card/95 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none rounded-md lg:rounded-none shadow-sm lg:shadow-none border lg:border-none p-0.5 lg:p-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 text-muted-foreground hover:text-foreground',
            todo.completed && 'text-primary hover:text-primary',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
          aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
        >
          {todo.completed ? <MdUndo className="h-4 w-4" /> : <MdCheck className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(todo);
          }}
          aria-label="編集"
        >
          <MdEdit className="h-4 w-4" />
        </Button>
        {onDuplicate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(todo.id);
            }}
            aria-label="複製"
          >
            <MdContentCopy className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          aria-label="削除"
        >
          <MdClose className="h-4 w-4" />
        </Button>
      </div>
    </motion.li>
  );
}
