import type { CSSProperties } from 'react';

/**
 * 簡易的な輝度判定を行い、背景色に対する適切な文字色(黒/白)を返す
 */
export function getContrastColor(hexColor: string): string {
  // hexColorが #RRGGBB 形式であることを期待（短い #RGB は未対応だが入力input[type=color]は6桁返す）
  if (!hexColor.startsWith('#') || hexColor.length < 7) {
    return '#ffffff';
  }

  const r = Number.parseInt(hexColor.substring(1, 3), 16);
  const g = Number.parseInt(hexColor.substring(3, 5), 16);
  const b = Number.parseInt(hexColor.substring(5, 7), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#000000' : '#ffffff'; // 128だと少し暗い色でも黒文字になって見づらいことがあるので閾値を調整
}

/**
 * タグの色文字列（Tailwindクラス または Hexコード）を受け取り、
 * 適用すべき className と style オブジェクトを返す
 */
export function getTagColorStyles(color?: string): { className?: string; style?: CSSProperties } {
  // デフォルト
  if (!color) {
    return { className: 'bg-primary/10 text-primary' };
  }

  // Tailwindクラスの場合 (bg- で始まると仮定)
  if (color.startsWith('bg-')) {
    return { className: color };
  }

  // Hexコードなど、任意のカラーコードの場合
  return {
    className: 'border-transparent',
    style: {
      backgroundColor: color,
      color: getContrastColor(color),
    },
  };
}
