import { create } from 'zustand';
import { CAT_BREED_STORAGE_KEY } from '@/lib/constants';
import type { CatBreed } from '@/types/todo';

interface UIState {
  breed: CatBreed;
  searchQuery: string;
  isDetailOpen: boolean;
  isAboutOpen: boolean;
  editingTodoId: string | null;

  setBreed: (breed: CatBreed) => void;
  setSearchQuery: (query: string) => void;
  openCreateModal: () => void;
  openEditModal: (todoId: string) => void;
  closeDetailModal: () => void;
  setAboutOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  breed: (localStorage.getItem(CAT_BREED_STORAGE_KEY) as CatBreed) || 'classic',
  searchQuery: '',
  isDetailOpen: false,
  isAboutOpen: false,
  editingTodoId: null,

  setBreed: (breed) => {
    localStorage.setItem(CAT_BREED_STORAGE_KEY, breed);
    document.documentElement.setAttribute('data-breed', breed);
    set({ breed });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  openCreateModal: () => set({ isDetailOpen: true, editingTodoId: null }),

  openEditModal: (todoId) => set({ isDetailOpen: true, editingTodoId: todoId }),

  closeDetailModal: () => {
    set({ isDetailOpen: false });
    // Timeout needed to let the animation finish before clearing data
    setTimeout(() => set({ editingTodoId: null }), 300);
  },

  setAboutOpen: (isAboutOpen) => set({ isAboutOpen }),
}));
