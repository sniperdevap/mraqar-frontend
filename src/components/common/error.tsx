import { cn } from '@/lib/utils';

interface ErrorSlotProps {
  message?: string;
  className?: string;
}

export function ErrorSlot({ message, className }: ErrorSlotProps) {
  return <div className={cn('min-h-[20px]', className)}>{message && <p className="text-sm text-red-500  text-destructive">{message}</p>}</div>;
}
