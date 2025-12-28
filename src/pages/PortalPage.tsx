import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FaFire, FaRegCalendarCheck, FaCheckCircle } from 'react-icons/fa';
import { useTodoStore } from '@/store/useTodoStore';
import { BentoTile } from '@/components/portal/BentoTile';
import { GreetingTile } from '@/components/portal/GreetingTile';
import { StatTile } from '@/components/portal/StatTile';
import { WeatherTile } from '@/components/portal/WeatherTile';
import { FocusTile } from '@/components/portal/FocusTile';
import { UpcomingTile } from '@/components/portal/UpcomingTile';
import { HabitTile } from '@/components/portal/HabitTile';
import { HighscoreTile } from '@/components/portal/HighscoreTile';
import { CardContent } from '@/components/ui/card';

export function PortalPage() {
  const todos = useTodoStore((s) => s.todos);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 7 * 86400000;
    const last30Days = today - 30 * 86400000;

    const completedTodos = todos.filter((t) => t.completed && t.completedAt);
    
    // Group by date string to count daily completions
    const dailyCounts: Record<string, number> = {};
    completedTodos.forEach(t => {
      const dateStr = new Date(t.completedAt!).toISOString().split('T')[0];
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });

    const countsArray = Object.entries(dailyCounts).map(([date, count]) => ({
      timestamp: new Date(date).getTime(),
      count
    }));

    const todayCount = completedTodos.filter(t => new Date(t.completedAt!).setHours(0,0,0,0) === today).length;
    const yesterdayCount = completedTodos.filter(t => new Date(t.completedAt!).setHours(0,0,0,0) === yesterday).length;
    
    const weeklyHigh = Math.max(0, ...countsArray.filter(c => c.timestamp >= last7Days).map(c => c.count));
    const monthlyHigh = Math.max(0, ...countsArray.filter(c => c.timestamp >= last30Days).map(c => c.count));

    return { todayCount, yesterdayCount, weeklyHigh, monthlyHigh };
  }, [todos]);

  const activeTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);
  const activeCount = activeTodos.length;

  return (
    <div className="flex-1 overflow-auto bg-background/30 p-4 sm:p-6 scrollbar-thin">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
        className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]"
      >
        <BentoTile size="2x2" variant="primary">
          <GreetingTile activeCount={activeCount} />
        </BentoTile>

        <BentoTile size="1x1">
          <StatTile 
            icon={FaRegCalendarCheck} 
            value={activeCount} 
            label="Active" 
          />
        </BentoTile>

        <BentoTile size="1x1" variant="warm">
          <WeatherTile />
        </BentoTile>

        <BentoTile size="2x1" variant="accent">
          <StatTile 
            icon={FaCheckCircle} 
            value={stats.todayCount} 
            label="Completed Today" 
            iconColorClass="text-green-500"
            iconBgClass="bg-green-500/10"
          />
        </BentoTile>

        <BentoTile size="2x1">
          <FocusTile title={activeTodos[0]?.title} />
        </BentoTile>

        <BentoTile size="1x2" className="bg-card/80">
          <UpcomingTile todos={activeTodos.slice(1)} />
        </BentoTile>

        <BentoTile size="3x1">
          <HabitTile streak={4} />
        </BentoTile>

        <BentoTile size="1x2" variant="outline">
          <HighscoreTile 
            yesterday={stats.yesterdayCount}
            weeklyHigh={stats.weeklyHigh}
            monthlyHigh={stats.monthlyHigh}
          />
        </BentoTile>
      </motion.div>
    </div>
  );
}
