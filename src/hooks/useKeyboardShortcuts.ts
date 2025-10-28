import { useEffect, useRef } from 'react';

type KeyCombo = string;

interface ShortcutOption {
  combo: KeyCombo;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  allowInInput?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutOption[]) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 修飾キー単体のイベントは無視
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      // 入力中の発火制御チェック
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // 押されたキーの情報を正規化してコンボ文字列を作成
      const keys: string[] = [];
      if (e.metaKey) keys.push('meta');
      if (e.ctrlKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      keys.push(e.key.toLowerCase());

      const pressedCombo = keys.sort().join('+');

      // マッチするショートカットを探す
      // refから最新のshortcutsを参照
      const matched = shortcutsRef.current.find((s) => {
        const declaredCombo = s.combo.toLowerCase().split('+').sort().join('+');
        return declaredCombo === pressedCombo;
      });

      if (!matched) return;

      // 入力中の場合、allowInInputがtrueでなければ無視
      if (isInput && !matched.allowInInput) {
        return;
      }

      if (matched.preventDefault) {
        e.preventDefault();
      }

      matched.handler(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
