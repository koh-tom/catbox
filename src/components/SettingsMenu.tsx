import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/todo';
import { FaTag } from 'react-icons/fa';
import { MdAdd, MdClose, MdSettings } from 'react-icons/md';

const TAG_COLORS = [
    { name: 'Red', value: 'bg-red-500 text-white' },
    { name: 'Orange', value: 'bg-orange-500 text-white' },
    { name: 'Amber', value: 'bg-amber-500 text-white' },
    { name: 'Green', value: 'bg-green-500 text-white' },
    { name: 'Teal', value: 'bg-teal-500 text-white' },
    { name: 'Blue', value: 'bg-blue-500 text-white' },
    { name: 'Indigo', value: 'bg-indigo-500 text-white' },
    { name: 'Purple', value: 'bg-purple-500 text-white' },
    { name: 'Pink', value: 'bg-pink-500 text-white' },
    { name: 'Slate', value: 'bg-slate-500 text-white' },
];

interface SettingsMenuProps {
    savedTags: Tag[];
    addSavedTag: (name: string, color: string) => void;
    deleteSavedTag: (id: string) => void;
}

export function SettingsMenu({
    savedTags,
    addSavedTag,
    deleteSavedTag,
}: SettingsMenuProps) {
    const [newTag, setNewTag] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

    const handleAddTag = () => {
        if (newTag.trim()) {
            addSavedTag(newTag, selectedColor);
            setNewTag('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="設定">
                    <MdSettings className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                    <div className="pb-2 border-b">
                        <h4 className="font-medium leading-none mb-1">設定</h4>
                    </div>

                    <div className="space-y-3">
                        <h5 className="text-sm font-medium flex items-center gap-1">
                            <FaTag className="w-3 h-3" /> 保存済みタグ
                        </h5>

                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        className={cn(
                                            'w-5 h-5 rounded-full border border-transparent transition-all',
                                            color.value,
                                            selectedColor === color.value
                                                ? 'ring-2 ring-primary ring-offset-1 scale-110'
                                                : 'hover:scale-105 opacity-80 hover:opacity-100',
                                        )}
                                        onClick={() => setSelectedColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="新しいタグ"
                                    className="h-8 text-sm"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0"
                                    onClick={handleAddTag}
                                >
                                    <MdAdd className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
                            {savedTags.length === 0 && (
                                <span className="text-xs text-muted-foreground">
                                    登録されたタグはありません
                                </span>
                            )}
                            {savedTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs box-border border-transparent',
                                        tag.color,
                                    )}
                                >
                                    #{tag.name}
                                    <button
                                        type="button"
                                        onClick={() => deleteSavedTag(tag.id)}
                                        className="hover:text-foreground/80 focus:outline-none"
                                        style={{ color: 'inherit', opacity: 0.7 }}
                                    >
                                        <MdClose className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
