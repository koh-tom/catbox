import { FaTrashAlt } from 'react-icons/fa';
import { MdDeleteForever, MdRestoreFromTrash } from 'react-icons/md';
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
            <span>{trashedTodos.length} / {trashLimit} 件</span>
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
            <div className="text-center text-muted-foreground py-12">
              <FaTrashAlt className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">ゴミ箱は空です</p>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onPermanentlyDelete(todo.id)}
                    title="完全に削除する"
                  >
                    <MdDeleteForever className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {trashedTodos.length > 0 && (
          <div className="pt-3 border-t">
            <Button variant="destructive" size="sm" className="w-full" onClick={onEmptyTrash}>
              <MdDeleteForever className="w-4 h-4 mr-2" />
              ゴミ箱を空にする ({trashedTodos.length}件)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
