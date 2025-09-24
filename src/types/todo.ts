export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  deadlineDate?: string;
  priority?: number;
}
