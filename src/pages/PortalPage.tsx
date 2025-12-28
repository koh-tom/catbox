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
import { CardContent } from '@/components/ui/card';

export function PortalPage() {
  const todos = useTodoStore((s) => s.todos);

  const completedTodayCount = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return todos.filter((t) => t.completed && t.completedAt && new Date(t.completedAt).setHours(0, 0, 0, 0) === today).length;
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
            value={completedTodayCount} 
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

        <BentoTile size="1x1" variant="outline">
          <CardContent className="p-4 flex items-center justify-center h-full">
            <div className="text-[10px] font-black text-muted-foreground">AD 🐾</div>
          </CardContent>
        </BentoTile>
      </motion.div>
    </div>
  );
}
