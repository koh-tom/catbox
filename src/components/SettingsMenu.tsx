import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { FaTag } from 'react-icons/fa';
import { MdAdd, MdClose, MdSettings } from 'react-icons/md';

interface SettingsMenuProps {
    savedTags: string[];
    addSavedTag: (tag: string) => void;
    deleteSavedTag: (tag: string) => void;
}

export function SettingsMenu({
    savedTags,
    addSavedTag,
    deleteSavedTag,
}: SettingsMenuProps) {
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        if (newTag.trim()) {
            addSavedTag(newTag);
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
            <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                    <div className="pb-2 border-b">
                        <h4 className="font-medium leading-none mb-1">設定</h4>
                    </div>

                    <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-1">
                            <FaTag className="w-3 h-3" /> 保存済みタグ
                        </h5>

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

                        <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
                            {savedTags.length === 0 && (
                                <span className="text-xs text-muted-foreground">
                                    登録されたタグはありません
                                </span>
                            )}
                            {savedTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => deleteSavedTag(tag)}
                                        className="text-muted-foreground hover:text-foreground"
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
