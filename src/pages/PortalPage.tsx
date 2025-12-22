import { FaCat } from 'react-icons/fa';

export function PortalPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-accent/5">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
        <FaCat className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-3">ポータル（ダッシュボード）</h2>
      <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
        ここには、1日の概要、天気、習慣トラッカーなどが集約される予定です。
        <br />
        現在丹精込めて開発中... 🐾
      </p>
    </div>
  );
}
