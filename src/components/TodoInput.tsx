import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TodoInputProps {
  onAdd: (title: string, deadlineDate?: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && deadlineDate.trim()) {
      onAdd(value, deadlineDate);
      setValue('');
      setDeadlineDate('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e);
    }
  };

  return (
    <form className="flex gap-3 mb-6" onSubmit={handleSubmit}>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="新しいタスクを追加..."
        className="flex-1"
        autoFocus
      />
      <Input
        type="text"
        value={deadlineDate}
        onChange={(e) => setDeadlineDate(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="期限 (例: 2/26)"
        className="w-32"
      />
      <Button
        type="submit"
        disabled={!value.trim() || !deadlineDate.trim()}
        className={
          value.trim() && deadlineDate.trim()
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }
      >
        追加
      </Button>
    </form>
  );
}
