import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdPlaylistAdd } from 'react-icons/md';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/todo';

interface TodoInputProps {
  onAdd: (title: string, deadlineDate?: string, priority?: number, tags?: string[]) => void;
  savedTags?: Tag[];
  onOpenDetailAdd?: () => void;
}

export function TodoInput({ onAdd, savedTags = [], onOpenDetailAdd }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [tags, setTags] = useState<string[]>([]);

  const isValidDeadline = (date: string) => !date.trim() || /^\d+\/\d+$/.test(date.trim());
  const isFormValid = value.trim() && isValidDeadline(deadlineDate);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAdd(value, deadlineDate, priority, tags);
      setValue('');
      setDeadlineDate('');
      setPriority(1);
      setTags([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form className="mb-8 space-y-4" onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタスクを追加..."
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!isFormValid}
          className={
            isFormValid
              ? 'bg-green-500 hover:bg-green-600 text-white min-w-[80px]'
              : 'bg-gray-500 hover:bg-gray-600 text-white min-w-[80px]'
          }
        >
          追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenDetailAdd}
          title="詳細を入力して追加"
          className="shrink-0"
        >
          <MdPlaylistAdd className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <DatePicker
          date={deadlineDate}
          setDate={setDeadlineDate}
          placeholder="期限を選択"
          className="w-40"
        />
        <div className="flex items-center gap-2 border rounded-md px-3 h-10 bg-background hover:bg-accent/50 transition-colors">
          <span className="text-sm text-muted-foreground mr-1">優先度:</span>
          <StarRating value={priority} onChange={setPriority} />
        </div>

        <TagSelector
          savedTags={savedTags}
          selectedTags={tags}
          onChange={setTags}
          className="flex-1 min-w-[150px] justify-start"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {tags.map((tagName) => {
            const tagColor = savedTags.find((t) => t.name === tagName)?.color;
            return (
              <span
                key={tagName}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border border-transparent box-border',
                  tagColor || 'bg-primary/10 text-primary',
                )}
              >
                #{tagName}
                <button
                  type="button"
                  onClick={() => removeTag(tagName)}
                  className="hover:text-foreground/80 focus:outline-none"
                  style={{ color: 'inherit', opacity: 0.7 }}
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </form>
  );
}
