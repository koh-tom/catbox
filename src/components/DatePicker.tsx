import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FaRegCalendarCheck } from "react-icons/fa6";
import { useEffect, useState } from 'react';

interface DatePickerProps {
    date?: string;
    setDate: (date: string) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({
    date,
    setDate,
    className,
    placeholder = '期限',
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (date) {
            const parts = date.split('/');
            if (parts.length === 2) {
                const month = Number.parseInt(parts[0], 10);
                const day = Number.parseInt(parts[1], 10);
                const year = new Date().getFullYear();
                setSelectedDate(new Date(year, month - 1, day));
            }
        } else {
            setSelectedDate(undefined);
        }
    }, [date]);

    const handleSelect = (d: Date | undefined) => {
        setSelectedDate(d);
        if (d) {
            setDate(format(d, 'M/d'));
            setIsOpen(false);
        } else {
            setDate('');
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className,
                    )}
                >
                    <FaRegCalendarCheck className="mr-2 h-4 w-4" />
                    {date ? date : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    locale={ja}
                />
            </PopoverContent>
        </Popover>
    );
}
