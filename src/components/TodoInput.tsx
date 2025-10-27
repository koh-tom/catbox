import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { MdPlaylistAdd } from 'react-icons/md';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { TagBadge } from '@/components/TagBadge';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const isValidDeadline = (date: string) =>
    !date.trim() || /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || /^\d+\/\d+$/.test(date.trim());
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
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        // Ctrl+Enter or Cmd+Enter で送信
        handleSubmit(e);
      } else {
        // 通常のEnterでも送信 (変換確定時を除く)
        handleSubmit(e);
      }
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
          placeholder="新しいタスクを追加... (Enter または ⌘+Enter で追加)"
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
              <TagBadge
                key={tagName}
                tagName={tagName}
                tagColor={tagColor}
                onDelete={() => removeTag(tagName)}
              />
            );
          })}
        </div>
      )}
    </form>
  );
}
