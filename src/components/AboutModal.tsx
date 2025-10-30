import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { APP_NAME } from '@/lib/constants';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {APP_NAME} について
          </DialogTitle>
          <DialogDescription>シンプルで高機能なタスク管理アプリケーション</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="mb-2">
              直感的な操作と豊富な機能で、日々のタスク管理をサポートします。
              キーボードショートカットを活用して、より効率的に操作できます。
            </p>
          </div>

          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <p>Version 1.0.0</p>
            <p>© 2025 {APP_NAME}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
