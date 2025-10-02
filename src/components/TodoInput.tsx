import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaTag, FaTimes } from 'react-icons/fa';

interface TodoInputProps {
  onAdd: (title: string, deadlineDate?: string, priority?: number, tags?: string[]) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
      setTagInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
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

        <div className="flex-1 min-w-[200px] flex items-center gap-2 border rounded-md px-3 h-10 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <FaTag className="text-muted-foreground w-4 h-4 shrink-0" />
          <input
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            placeholder="タグを追加 (Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-primary/60 hover:text-primary focus:outline-none"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  );
}
