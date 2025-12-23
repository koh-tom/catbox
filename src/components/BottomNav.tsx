import { motion } from 'framer-motion';
import { memo } from 'react';
import { FaPaw } from 'react-icons/fa';
import { MdCalendarMonth, MdDashboard, MdDelete, MdListAlt, MdSettings } from 'react-icons/md';
import { cn } from '@/lib/utils';
import type { AppTab } from '@/types/todo';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS = [
  { id: 'todo', label: 'リスト', icon: MdListAlt },
  { id: 'calendar', label: '予定', icon: MdCalendarMonth },
  { id: 'portal', label: 'ポータル', icon: MdDashboard },
  { id: 'trash', label: 'ゴミ箱', icon: MdDelete },
  { id: 'settings', label: '設定', icon: MdSettings },
] as const;

export const BottomNav = memo(function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/80 backdrop-blur-lg border-t border-border/40 pb-safe shadow-[0_-5px_20px_oklch(0_0_0/0.08)]">
      <div className="flex items-end justify-around h-16 px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = currentTab === id;
          const isPortal = id === 'portal';

          if (isPortal) {
            return (
              <div key={id} className="relative flex flex-col items-center justify-end w-full h-full pb-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => onTabChange(id as AppTab)}
                  className={cn(
                    'absolute -top-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 border-background overflow-hidden',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
                  )}
                >
                  <Icon className="w-7 h-7" />
                  {isActive && (
                    <motion.div
                      layoutId="portal-sparkle"
                      className="absolute inset-0 bg-white/10 animate-pulse"
                    />
                  )}
                </motion.button>
                <span className={cn('text-[9px] font-bold mt-1 tracking-tighter opacity-70', isActive && 'text-primary opacity-100')}>
                  {label}
                </span>
              </div>
            );
          }

          return (
            <button
              type="button"
              key={id}
              onClick={() => onTabChange(id as AppTab)}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full pt-1 transition-all duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="relative z-10">
                <Icon className={cn('w-6 h-6 transition-transform duration-300', isActive ? 'scale-110' : 'scale-100')} />
                {isActive && (
                  <motion.div
                    layoutId="paw"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 text-primary"
                  >
                    <FaPaw />
                  </motion.div>
                )}
              </div>
              <span className={cn('text-[9px] font-bold mt-1 tracking-tighter transition-opacity duration-300 z-10', isActive ? 'opacity-100' : 'opacity-60')}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-x-1 inset-y-2 bg-primary/5 rounded-xl -z-0"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});
