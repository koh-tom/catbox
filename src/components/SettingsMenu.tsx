import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { MdSettings } from 'react-icons/md';

export function SettingsMenu() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="設定">
                    <MdSettings className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none border-b pb-2 mb-2">設定</h4>
                    <p className="text-sm text-muted-foreground">
                        WIP🚧
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
