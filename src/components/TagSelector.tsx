import { FaCheck, FaTag } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/todo';

interface TagSelectorProps {
  savedTags: Tag[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagSelector({ savedTags, selectedTags, onChange, className }: TagSelectorProps) {
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex items-center gap-2 h-10 px-3 text-muted-foreground bg-background hover:bg-accent/50',
            selectedTags.length > 0 && 'text-primary border-primary/50 bg-primary/5',
            className,
          )}
          title="タグを選択"
        >
          <FaTag className="w-3.5 h-3.5" />
          <span className="text-xs">
            {selectedTags.length > 0 ? `${selectedTags.length}個選択中` : 'タグ'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1 border-b">
            タグを選択
          </h4>
          {savedTags.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2 text-center">
              設定メニューからタグを追加してください
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto space-y-0.5">
              {savedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-left',
                      isSelected && 'bg-accent/50 font-medium',
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', tag.color)} />
                      <span>#{tag.name}</span>
                    </div>
                    {isSelected && <FaCheck className="w-3 h-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
