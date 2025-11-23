import { useState } from 'react';
import { FaTag } from 'react-icons/fa';
import { MdAdd, MdClose, MdColorLens, MdDownload, MdSettings } from 'react-icons/md';
import { TagBadge } from '@/components/TagBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TAG_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/todo';

interface SettingsMenuProps {
  savedTags: Tag[];
  addSavedTag: (name: string, color: string) => void;
  deleteSavedTag: (id: string) => void;
  onExportTodos: () => void;
}

export function SettingsMenu({
  savedTags,
  addSavedTag,
  deleteSavedTag,
  onExportTodos,
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
              <div className="flex flex-wrap gap-1 items-center">
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

                <div
                  className={cn(
                    'relative w-5 h-5 rounded-full overflow-hidden transition-all flex items-center justify-center',
                    !selectedColor.startsWith('bg-')
                      ? 'ring-2 ring-primary ring-offset-1 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100 border border-transparent',
                  )}
                  title="カスタムカラー"
                >
                  {!selectedColor.startsWith('bg-') ? (
                    <div className="w-full h-full" style={{ backgroundColor: selectedColor }} />
                  ) : (
                    <MdColorLens className="w-full h-full text-muted-foreground bg-muted" />
                  )}

                  <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-0"
                    onChange={(e) => setSelectedColor(e.target.value)}
                    value={!selectedColor.startsWith('bg-') ? selectedColor : '#000000'}
                  />
                </div>
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

            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
              {savedTags.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  タグがありません
                </div>
              )}
              {savedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent/50 transition-colors group"
                >
                  <TagBadge tagName={tag.name} tagColor={tag.color} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        title="削除"
                      >
                        <MdClose className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>タグを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          「{tag.name}」を削除します。この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSavedTag(tag.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t space-y-3">
            <h5 className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
              データ管理
            </h5>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-dashed hover:border-solid hover:bg-accent"
              onClick={onExportTodos}
            >
              <MdDownload className="w-4 h-4" />
              JSONとしてエクスポート
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
