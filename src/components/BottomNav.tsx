import { motion } from 'framer-motion';
import { memo } from 'react';
import { FaPaw } from 'react-icons/fa';
import { MdDashboard, MdDelete, MdListAlt, MdSettings } from 'react-icons/md';
import { cn } from '@/lib/utils';
import type { AppTab } from '@/types/todo';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS = [
  { id: 'todo', label: 'Todo', icon: MdListAlt },
  { id: 'portal', label: 'Portal', icon: MdDashboard },
  { id: 'trash', label: 'Trash', icon: MdDelete },
  { id: 'settings', label: 'Settings', icon: MdSettings },
] as const;

export const BottomNav = memo(function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/80 backdrop-blur-md border-t border-border/40 pb-safe shadow-[0_-1px_10px_oklch(0_0_0/0.05)]">
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = currentTab === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => onTabChange(id as AppTab)}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full transition-all duration-300',
                isActive
                  ? 'text-primary active:scale-95'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-300',
                    isActive ? 'scale-110 -translate-y-1' : 'scale-100',
                  )}
                />
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
              <span
                className={cn(
                  'text-[10px] font-bold mt-1 tracking-wider transition-opacity duration-300 z-10',
                  isActive ? 'opacity-100' : 'opacity-60',
                )}
              >
                {label.toUpperCase()}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-x-2 inset-y-1 bg-primary/5 rounded-2xl -z-0"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute top-0 w-8 h-1 rounded-full bg-primary/20"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});
