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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Todo } from '@/types/todo';

interface TrashViewProps {
  isOpen: boolean;
  onClose: () => void;
  trashedTodos: Todo[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyTrash: () => void;
  trashLimit: number;
  trashStorageSizeKB: number;
}

export function TrashView({
  isOpen,
  onClose,
  trashedTodos,
  onRestore,
  onPermanentlyDelete,
  onEmptyTrash,
  trashLimit,
  trashStorageSizeKB,
}: TrashViewProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FaTrashAlt className="w-4 h-4" /> ゴミ箱
          </DialogTitle>
          <DialogDescription>削除したタスクは復元または完全削除できます</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground px-1">
          <div className="flex justify-between">
            <span>
              {trashedTodos.length} / {trashLimit} 件
            </span>
            <span>{trashStorageSizeKB} KB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((trashedTodos.length / trashLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {trashedTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-in fade-in duration-700">
              <div className="text-5xl mb-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                🗑️🐈
              </div>
              <p className="text-sm font-medium">ゴミ箱は空です</p>
            </div>
          ) : (
            trashedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-3 rounded-lg border bg-card group"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${todo.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                  >
                    {todo.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    削除: {formatDeletedDate(todo.deletedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onRestore(todo.id)}
                    title="復元する"
                  >
                    <MdRestoreFromTrash className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="完全に削除する"
                      >
                        <MdDeleteForever className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>タスクを完全に削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          「{todo.title}
                          」を削除します。この操作は取り消せません。データベースからも完全に削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onPermanentlyDelete(todo.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>

        {trashedTodos.length > 0 && (
          <div className="pt-3 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  <MdDeleteForever className="w-4 h-4 mr-2" />
                  ゴミ箱を空にする ({trashedTodos.length}件)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ゴミ箱を空にしますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    ゴミ箱内のすべてのタスク（{trashedTodos.length}
                    件）を完全に削除します。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onEmptyTrash}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    一括削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
