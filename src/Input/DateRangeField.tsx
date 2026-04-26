'use client';

import type React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateRangeFieldProps {
  placeholder?: string;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  onBlur?: () => void;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({ placeholder, value, onChange, onBlur }) => {
  const selectedRange: DateRange = {
    from: value?.from instanceof Date ? value.from : undefined,
    to: value?.to instanceof Date ? value.to : undefined,
  };

  const formatted =
    selectedRange.from && selectedRange.to
      ? `${format(selectedRange.from, 'LLL dd, yyyy')} - ${format(selectedRange.to, 'LLL dd, yyyy')}`
      : selectedRange.from
        ? format(selectedRange.from, 'LLL dd, yyyy')
        : placeholder || 'Pick a date range';

  const handleClear = () => {
    onChange?.(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !selectedRange.from && !selectedRange.to && 'text-muted-foreground')} onBlur={onBlur}>
          {formatted}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto z-50" side="bottom" align="start" sideOffset={2} avoidCollisions={false}>
        <Calendar mode="range" selected={selectedRange} onSelect={onChange} numberOfMonths={2} showOutsideDays={false} />
        {(selectedRange.from || selectedRange.to) && (
          <div className="p-2 border-t flex justify-end">
            <Button variant="ghost" onClick={handleClear} className="text-red-500 hover:bg-red-50 hover:text-red-600 underline p-0 h-auto">
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeField;
