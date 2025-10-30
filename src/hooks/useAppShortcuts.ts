import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseAppShortcutsProps {
  onOpenSearch: () => void;
  onOpenCreateModal: () => void;
}

export function useAppShortcuts({ onOpenSearch, onOpenCreateModal }: UseAppShortcutsProps) {
  useKeyboardShortcuts([
    {
      combo: 'meta+k',
      handler: (e) => {
        e.preventDefault();
        onOpenSearch();
      },
      preventDefault: true,
      allowInInput: true,
    },
    {
      combo: 'ctrl+k',
      handler: (e) => {
        e.preventDefault();
        onOpenSearch();
      },
      preventDefault: true,
      allowInInput: true,
    },
    {
      combo: 'c',
      handler: () => {
        onOpenCreateModal();
      },
    },
  ]);
}
