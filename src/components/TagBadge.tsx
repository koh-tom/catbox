import { MdClose } from 'react-icons/md';
import { getTagColorStyles } from '@/lib/tag-utils';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/todo';

interface TagBadgeProps {
    tagName: string;
    tagColor?: string; // 保存されたタグ情報を元に親が渡す想定
    onDelete?: () => void;
    className?: string;
    showHash?: boolean;
}

export function TagBadge({
    tagName,
    tagColor,
    onDelete,
    className,
    showHash = true,
}: TagBadgeProps) {
    const { className: colorClass, style } = getTagColorStyles(tagColor);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors border border-transparent box-border',
                colorClass,
                className,
            )}
            style={style}
        >
            {showHash && '#'}
            {tagName}
            {onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // 親のクリックイベント発火防止
                        onDelete();
                    }}
                    className="hover:text-foreground/80 focus:outline-none ml-0.5"
                    style={{ color: 'inherit', opacity: 0.7 }}
                    aria-label={`${tagName}タグを削除`}
                >
                    <MdClose className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}
