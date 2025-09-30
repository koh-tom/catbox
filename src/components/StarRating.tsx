import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
}

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const displayValue = hoverValue ?? value;

    const getColorClass = (p: number) => {
        switch (p) {
            case 5: return 'text-red-500 drop-shadow-sm';
            case 4: return 'text-orange-500';
            case 3: return 'text-yellow-500';
            case 2: return 'text-blue-400';
            default: return 'text-sky-300';
        }
    };

    return (
        <div className="flex items-center gap-0.5" onMouseLeave={() => !readOnly && setHoverValue(null)}>
            {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= displayValue;
                const activeColor = getColorClass(displayValue);

                return (
                    <button
                        key={starValue}
                        type="button"
                        disabled={readOnly}
                        className={cn(
                            "transition-transform hover:scale-110 focus:outline-none",
                            readOnly ? "cursor-default hover:scale-100" : "cursor-pointer"
                        )}
                        onMouseEnter={() => !readOnly && setHoverValue(starValue)}
                        onClick={() => !readOnly && onChange?.(starValue)}
                        aria-label={`Set priority to ${starValue}`}
                    >
                        <FaStar
                            className={cn(
                                "w-4 h-4 transition-colors",
                                isFilled ? activeColor : "text-muted-foreground/20"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
