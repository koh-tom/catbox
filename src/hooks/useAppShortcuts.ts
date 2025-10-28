import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseAppShortcutsProps {
  onOpenSearch: () => void;
}

export function useAppShortcuts({ onOpenSearch }: UseAppShortcutsProps) {
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
  ]);
}
