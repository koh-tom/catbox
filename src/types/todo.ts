export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export type RecurrenceRule = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type CatBreed = 'classic' | 'scottish' | 'black' | 'white';
export type AppTab = 'todo' | 'calendar' | 'portal' | 'trash' | 'settings';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  deadlineDate?: string;
  priority?: number;
  tags?: string[];
  description?: string;
  completedAt?: number;
  subtasks?: SubTask[];
  deletedAt?: number;
  order: number;
  estimatedHours?: number;
  recurrenceRule?: RecurrenceRule;
}
