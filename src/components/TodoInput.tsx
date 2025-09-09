import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TodoInputProps {
  onAdd: (title: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value);
      setValue('');
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
      <Button type="submit" disabled={!value.trim()}>
        追加
      </Button>
    </form>
  );
}
