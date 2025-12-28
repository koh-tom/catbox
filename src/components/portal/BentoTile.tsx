import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type BentoSize =
  | '1x1'
  | '1x2'
  | '1x3'
  | '1x4'
  | '2x1'
  | '2x2'
  | '2x3'
  | '2x4'
  | '3x1'
  | '3x2'
  | '3x3'
  | '3x4'
  | '4x1'
  | '4x2'
  | '4x3'
  | '4x4';

interface BentoTileProps {
  size: BentoSize;
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'primary' | 'accent' | 'warm' | 'outline';
}

export function BentoTile({ size, children, className, variant = 'glass' }: BentoTileProps) {
  const sizeClasses: Record<BentoSize, string> = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '1x3': 'col-span-1 row-span-3',
    '1x4': 'col-span-1 row-span-4',
    '2x1': 'col-span-2 row-span-1',
    '2x2': 'col-span-2 row-span-2',
    '2x3': 'col-span-2 row-span-3',
    '2x4': 'col-span-2 row-span-4',
    '3x1': 'col-span-2 md:col-span-3 row-span-1',
    '3x2': 'col-span-2 md:col-span-3 row-span-2',
    '3x3': 'col-span-2 md:col-span-3 row-span-3',
    '3x4': 'col-span-2 md:col-span-3 row-span-4',
    '4x1': 'col-span-2 md:col-span-4 row-span-1',
    '4x2': 'col-span-2 md:col-span-4 row-span-2',
    '4x3': 'col-span-2 md:col-span-4 row-span-3',
    '4x4': 'col-span-2 md:col-span-4 row-span-4',
  };

  const variantClasses = {
    glass: 'bg-card/40 backdrop-blur-md border border-border/50',
    primary: 'bg-primary/10 backdrop-blur-md border border-primary/20',
    accent: 'bg-accent/10 backdrop-blur-md border border-accent/20',
    warm: 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-md border border-orange-500/20',
    outline: 'bg-transparent border-2 border-dashed border-muted/50 shadow-none',
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      className={cn(sizeClasses[size], 'group')}
    >
      <Card
        className={cn(
          'h-full border-none shadow-warm overflow-hidden relative',
          variantClasses[variant],
          className,
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}
