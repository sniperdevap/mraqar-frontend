'use client';

import React, { useState, useEffect, type FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { Button } from './button';
import type { DateRange } from 'react-day-picker';
import { Icon } from './icon';
import { ASSETS } from '@/lib/assets';

export interface DateRangePickerProps {
  onChange?: (range: DateRange | undefined) => void;
  initialFrom?: Date;
  initialTo?: Date;
  align?: 'start' | 'center' | 'end';
  locale?: string;
}

const formatDate = (date: Date | undefined, locale: string = 'en-US'): string => {
  if (!date) return '';
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const DateRangePicker: FC<DateRangePickerProps> = ({ onChange, initialFrom, initialTo, align = 'end', locale = 'en-US' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (initialFrom || initialTo) {
      return {
        from: initialFrom,
        to: initialTo,
      };
    }
    return undefined;
  });

  useEffect(() => {
    if (initialFrom || initialTo) {
      setRange({
        from: initialFrom,
        to: initialTo,
      });
    } else {
      setRange(undefined);
    }
  }, [initialFrom, initialTo]);

  const handleSelect = (value: DateRange | undefined) => {
    if (!value || !value.from) {
      setRange(undefined);
      onChange?.(undefined);
      return;
    }

    const clickedDate = new Date(value.from);
    clickedDate.setHours(0, 0, 0, 0);

    // Handle case where react-day-picker sets both from and to (check this first)
    if (value.from && value.to) {
      const fromDate = new Date(value.from);
      const toDate = new Date(value.to);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      // If both dates are the same (first click), treat it as just setting from date
      if (fromDate.getTime() === toDate.getTime()) {
        // If we already have a from date, this is the second click - set as to date
        if (range?.from && !range?.to) {
          const existingFrom = new Date(range.from);
          existingFrom.setHours(0, 0, 0, 0);

          // If clicked date is before from date, reset and make it the new from date
          if (clickedDate < existingFrom) {
            const newRange: DateRange = {
              from: value.from,
              to: undefined,
            };
            setRange(newRange);
            onChange?.(undefined);
            return;
          }

          // If clicked date is same or after from date, set it as to date
          const newRange: DateRange = {
            from: range.from,
            to: value.from,
          };
          setRange(newRange);
          // Now both dates are set, apply the filter
          onChange?.(newRange);
          setIsOpen(false); // Close calendar when both dates are selected
          return;
        }

        // If no from date exists, this is the first click - set only from date
        const newRange: DateRange = {
          from: value.from,
          to: undefined,
        };
        setRange(newRange);
        // Don't call onChange yet - wait for both dates
        onChange?.(undefined);
        return;
      }

      // If dates are different, both are set, apply the filter
      setRange(value);
      onChange?.(value);
      setIsOpen(false); // Close calendar when both dates are selected
      return;
    }

    // If no from date exists (first click), set only from date
    if (!range?.from) {
      const newRange: DateRange = {
        from: value.from,
        to: undefined,
      };
      setRange(newRange);
      // Don't call onChange yet - wait for both dates
      onChange?.(undefined);
      return;
    }

    // If we have a from date but no to date (second click scenario)
    if (range.from && !range.to) {
      const fromDate = new Date(range.from);
      fromDate.setHours(0, 0, 0, 0);

      // If clicked date is before from date, reset and make it the new from date
      if (clickedDate < fromDate) {
        const newRange: DateRange = {
          from: value.from,
          to: undefined,
        };
        setRange(newRange);
        // Don't call onChange yet - wait for both dates
        onChange?.(undefined);
        return;
      }

      // If clicked date is same or after from date, set it as to date
      if (clickedDate >= fromDate) {
        const newRange: DateRange = {
          from: range.from,
          to: value.from,
        };
        setRange(newRange);
        // Now both dates are set, apply the filter
        onChange?.(newRange);
        setIsOpen(false); // Close calendar when both dates are selected
        return;
      }
    }

    // If both dates are already set and user clicks again, reset to new from date
    if (range.from && range.to) {
      const newRange: DateRange = {
        from: value.from,
        to: undefined,
      };
      setRange(newRange);
      // Don't call onChange yet - wait for both dates
      onChange?.(undefined);
      return;
    }

    // Fallback: update range but only call onChange if both dates are set
    setRange(value);
    if (value.from && value.to) {
      onChange?.(value);
      setIsOpen(false); // Close calendar when both dates are selected
    } else {
      // If only one date is set, don't apply filter yet
      onChange?.(undefined);
    }
  };

  const handleClear = () => {
    setRange(undefined);
    onChange?.(undefined);
  };

  const displayText = () => {
    if (range?.from && range?.to) {
      return `${formatDate(range.from, locale)} - ${formatDate(range.to, locale)}`;
    }
    if (range?.from) {
      return `${formatDate(range.from, locale)} - Select end date`;
    }
    return 'Select date range';
  };
  const getDefaultMonth = () => {
    if (range?.to && range?.from) {
      if (range.from.getMonth() === range.to.getMonth()) {
        return range.from;
      }
      const adjusted = new Date(range.to);
      adjusted.setMonth(adjusted.getMonth() - 1);
      return adjusted;
    }

    if (range?.from) return range.from;
    return new Date();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="lg" variant="table" className="rounded-lg cursor-pointer py-0 pl-5 lg:px-3 flex items-center gap-4 w-full h-12 lg:h-13 bg-white border-secondary border overflow-hidden">
          <div className="flex-shrink-0">
            <Icon src={ASSETS.images.icons.tableCalendar} size="sm" />
          </div>
          <div className="text-left text-[#A3A3A3] font-normal text-sm pl-1 truncate min-w-0 flex-1">Date: &nbsp;{displayText()}</div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-auto bg-white p-0 md:p-0 shadow-lg border-secondary border ">
        <Calendar
          mode="range"
          selected={range}
          numberOfMonths={1}
          onSelect={handleSelect}
          showOutsideDays={false}
          defaultMonth={getDefaultMonth()}
          disabled={date => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const compareDate = new Date(date);
            compareDate.setHours(0, 0, 0, 0);
            return compareDate > today;
          }}
          modifiersClassNames={{ today: '' }}
          modifiersStyles={{
            today: {
              backgroundColor: 'transparent',
              color: 'inherit',
              fontWeight: 'normal',
            },
          }}
        />
        {(range?.from || range?.to) && (
          <div className="p-2 md:p-3 border-t border-secondary flex justify-end">
            <Button variant="outline" onClick={handleClear} className="border-[#E2E2E2] text-secondary hover:bg-gray-50 px-3 md:px-4 rounded-lg font-normal text-xs md:text-sm h-7 md:h-9">
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
