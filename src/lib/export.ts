import { toast } from 'sonner';
import type { Todo } from '@/types/todo';

export const exportTodos = (todos: Todo[], format: 'json' | 'csv') => {
  try {
    let dataStr = '';
    let mimeType = '';
    let ext = '';

    if (format === 'json') {
      dataStr = JSON.stringify(todos, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else {
      // CSVのヘッダー
      const headers = [
        'ID',
        'タイトル',
        '完了',
        '作成日',
        '完了日',
        '期限日',
        '優先度',
        '見積もり時間(h)',
        '繰り返し',
        'サブタスク完了枠',
        'タグ',
        'メモ',
      ];
      const csvRows = [headers.join(',')];
      todos.forEach((todo) => {
        const values = [
          todo.id,
          `"${(todo.title || '').replace(/"/g, '""')}"`,
          todo.completed ? '完了' : '未完了',
          todo.createdAt ? new Date(todo.createdAt).toLocaleDateString('ja-JP') : '',
          todo.completedAt ? new Date(todo.completedAt).toLocaleDateString('ja-JP') : '',
          todo.deadlineDate || '',
          todo.priority || 1,
          todo.estimatedHours || '',
          todo.recurrenceRule || '',
          todo.subtasks?.length
            ? `${todo.subtasks.filter((s) => s.completed).length}/${todo.subtasks.length}`
            : '',
          `"${(todo.tags || []).join(' ')}"`,
          `"${(todo.description || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(values.join(','));
      });
      const csvContent = csvRows.join('\n');
      // Excelで文字化けしないようにUTF-8のBOMを付与
      dataStr = `\uFEFF${csvContent}`;
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catbox-todos-${new Date().toISOString().split('T')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${ext.toUpperCase()}でエクスポートしました`);
  } catch {
    toast.error('エクスポートに失敗しました');
  }
};
