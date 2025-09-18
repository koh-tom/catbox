import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/DatePicker';
import { Input } from '@/components/ui/input';

interface TodoInputProps {
  onAdd: (title: string, deadlineDate?: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');

  const isValidDeadline = (date: string) => /^\d+\/\d+$/.test(date.trim());
  const isFormValid = value.trim() && isValidDeadline(deadlineDate);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAdd(value, deadlineDate);
      setValue('');
      setDeadlineDate('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      if (isFormValid) {
        handleSubmit(e);
      }
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
      <DatePicker
        date={deadlineDate}
        setDate={setDeadlineDate}
        placeholder="期限を選択"
        className="w-40"
      />
      <Button
        type="submit"
        disabled={!isFormValid}
        className={
          isFormValid
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }
      >
        追加
      </Button>
    </form>
  );
}
