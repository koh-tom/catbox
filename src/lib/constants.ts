export const APP_NAME = '😺📦 Catbox';

export const STORAGE_KEYS = {
  TODOS: 'catbox-todos',
  TAGS: 'catbox-tags-v2',
  TRASH: 'catbox-trash',
  THEME: 'vite-ui-theme',
} as const;

export const DEFAULT_PRIORITY = 1;

export const TRASH_LIMIT = 50; // trashの最大保存件数

export const TAG_COLORS = [
  { name: 'Red', value: 'bg-red-500 text-white' },
  { name: 'Orange', value: 'bg-orange-500 text-white' },
  { name: 'Yellow', value: 'bg-yellow-500 text-white' },
  { name: 'Green', value: 'bg-green-500 text-white' },
  { name: 'Teal', value: 'bg-teal-300 text-white' },
  { name: 'Blue', value: 'bg-blue-500 text-white' },
  { name: 'Indigo', value: 'bg-indigo-500 text-white' },
  { name: 'Purple', value: 'bg-purple-500 text-white' },
  { name: 'Pink', value: 'bg-pink-500 text-white' },
  { name: 'Slate', value: 'bg-slate-500 text-white' },
];
