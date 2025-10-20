'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('gap-2 group/tabs flex flex-col', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'rounded-lg p-1 shadow-sm ring-1 ring-border/50 group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col backdrop-blur-sm transition-all',
  {
    variants: {
      variant: {
        default: 'bg-muted/80 dark:bg-muted/50',
        line: 'gap-2 bg-transparent shadow-none ring-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-all duration-300 ease-in-out',
        "[&_svg:not([class*='size-'])]:size-4",

        // デフォルトバリアント（背景あり）のスタイル
        'group-data-[variant=default]/tabs-list:shadow-none',
        'group-data-[variant=default]/tabs-list:hover:bg-background/50',
        'group-data-[variant=default]/tabs-list:hover:text-foreground',

        // アクティブ状態のスタイル強化
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-background',
        'group-data-[variant=default]/tabs-list:data-[state=active]:text-primary', // テキスト色をプライマリに
        'group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm',
        'group-data-[variant=default]/tabs-list:data-[state=active]:scale-[1.02]', // 僅かに拡大して強調

        // ラインバリアントのスタイル
        'group-data-[variant=line]/tabs-list:bg-transparent',
        'group-data-[variant=line]/tabs-list:shadow-none',
        'group-data-[variant=line]/tabs-list:hover:bg-accent/50',
        'group-data-[variant=line]/tabs-list:data-active:bg-transparent',

        // ベーステキストカラー
        'text-muted-foreground/70',

        // ダークモード調整
        'dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-background',
        'dark:group-data-[variant=default]/tabs-list:data-[state=active]:text-primary',

        // フォーカス
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',

        // レスポンシブ
        'relative inline-flex h-full flex-1 items-center justify-center whitespace-nowrap',
        'group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start',

        // 無効化
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',

        // アンダーラインエフェクト（ラインバリアント用）
        'after:absolute after:bottom-0 after:left-0 after:right-0',
        'after:h-0.5 after:rounded-full',
        'after:bg-primary after:opacity-0',
        'after:transition-all after:duration-300',
        'group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100',
        'after:scale-x-0 group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-x-100',

        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('text-sm flex-1 outline-none', 'animate-in fade-in-50 duration-200', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
