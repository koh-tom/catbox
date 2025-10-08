import { useEffect, useState } from 'react';
import { FaRegStickyNote } from 'react-icons/fa';
import { MdCheck, MdTitle } from 'react-icons/md';
import { DatePicker } from '@/components/DatePicker';
import { StarRating } from '@/components/StarRating';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tag, Todo } from '@/types/todo';

interface TodoDetailModalProps {
    todo: Todo | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        id: string,
        title: string,
        deadlineDate?: string,
        priority?: number,
        tags?: string[],
        description?: string,
    ) => void;
    savedTags: Tag[];
}

export function TodoDetailModal({
    todo,
    isOpen,
    onClose,
    onSave,
    savedTags,
}: TodoDetailModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadlineDate, setDeadlineDate] = useState<string | undefined>(undefined);
    const [priority, setPriority] = useState(1);
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (todo) {
            setTitle(todo.title);
            setDescription(todo.description || '');
            setDeadlineDate(todo.deadlineDate);
            setPriority(todo.priority ?? 1);
            setTags(todo.tags || []);
        } else {
            setTitle('');
            setDescription('');
            setDeadlineDate(undefined);
            setPriority(1);
            setTags([]);
        }
    }, [todo, isOpen]);

    const handleSave = () => {
        if (title.trim()) {
            onSave(
                todo ? todo.id : '',
                title,
                deadlineDate,
                priority,
                tags,
                description,
            );
            onClose();
        }
    };

    const isSaveDisabled = !title.trim();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {todo ? '詳細編集' : '新規タスク作成'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MdTitle className="w-4 h-4" /> タイトル
                        </div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="タスクのタイトル"
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <FaRegStickyNote className="w-4 h-4" /> メモ
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="詳細やメモを入力..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-muted-foreground">期限</span>
                            <DatePicker
                                date={deadlineDate}
                                setDate={setDeadlineDate}
                                placeholder="期限なし"
                                className="w-full"
                            />
                        </div>
                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-muted-foreground">優先度</span>
                            <div className="pt-2">
                                <StarRating value={priority} onChange={setPriority} />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <span className="text-sm font-medium text-muted-foreground">タグ</span>
                        <TagSelector
                            savedTags={savedTags}
                            selectedTags={tags}
                            onChange={setTags}
                            className="w-full justify-between"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} type="button">
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} disabled={isSaveDisabled} type="button">
                        <MdCheck className="w-4 h-4 mr-2" />
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
