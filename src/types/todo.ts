export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  deadlineDate?: string;
  priority?: number;
  tags?: string[];
}
