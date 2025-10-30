import { useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import { Button } from '@/components/ui/button';
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
  const [showShortcuts, setShowShortcuts] = useState(false);

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

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">🎹 キーボードショートカット</span>
              {showShortcuts ? (
                <MdKeyboardArrowDown className="h-4 w-4" />
              ) : (
                <MdKeyboardArrowRight className="h-4 w-4" />
              )}
            </Button>

            {showShortcuts && (
              <div className="mt-2 border rounded-lg p-4 bg-muted/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-[1fr,auto] gap-y-2 text-sm">
                  <span className="text-muted-foreground">新規タスク作成</span>
                  <div className="flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      C
                    </kbd>
                  </div>

                  <span className="text-muted-foreground">タスク検索</span>
                  <div className="flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>Ctrl
                    </kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      K
                    </kbd>
                  </div>

                  <span className="text-muted-foreground">タスク保存 (入力時)</span>
                  <div className="flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>Ctrl
                    </kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      Enter
                    </kbd>
                  </div>
                </div>
              </div>
            )}
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
