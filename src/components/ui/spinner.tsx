'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return <div className={cn('animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary', className)}></div>;
}
