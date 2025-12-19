import { memo } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { MdDeleteForever, MdRestoreFromTrash } from 'react-icons/md';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types/todo';

interface TrashViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  trashedTodos: Todo[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyTrash: () => void;
  limit: number;
  storageSize: number;
}

const formatDeletedDate = (deletedAt?: number) => {
  if (!deletedAt) return '';
  const date = new Date(deletedAt);
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const TrashView = memo(function TrashView({
  isOpen,
  onClose,
  trashedTodos,
  onRestore,
  onPermanentlyDelete,
  onEmptyTrash,
  limit,
  storageSize,
}: TrashViewProps) {
  const content = (
    <div className="flex-1 flex flex-col min-h-0 bg-card/10 rounded-2xl border border-border/10 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/10 bg-background/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black flex items-center gap-2 text-primary">
            <MdDeleteForever className="w-6 h-6" />
            <span>ゴミ箱</span>
          </h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-2 h-9 px-4 rounded-xl font-bold"
                disabled={trashedTodos.length === 0}
              >
                <MdDeleteForever className="w-4 h-4" />
                空にする
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>ゴミ箱を空にしますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  すべてのタスクが完全に削除され、復元できなくなります。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onEmptyTrash}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                >
                  空にする
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          削除したタスクは復元または完全削除できます
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
            <span>ストレージ利用状況</span>
            <span>
              {storageSize.toFixed(1)} / {limit} KB
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                storageSize / limit > 0.8 ? 'bg-destructive' : 'bg-primary',
              )}
              style={{ width: `${Math.min((storageSize / limit) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 scrollbar-thin">
        {trashedTodos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mb-4">
              <FaTrashAlt className="w-8 h-8 opacity-20" />
            </div>
            <p className="font-bold">ゴミ箱は空です</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...trashedTodos]
              .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))
              .map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card/40 hover:bg-card/60 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{todo.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      削除日: {formatDeletedDate(todo.deletedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg"
                      onClick={() => onRestore(todo.id)}
                      title="復元"
                    >
                      <MdRestoreFromTrash className="w-5 h-5" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                          title="完全に削除"
                        >
                          <MdDeleteForever className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>タスクを完全に削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{todo.title}」を削除します。この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onPermanentlyDelete(todo.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden shadow-2xl">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
});
