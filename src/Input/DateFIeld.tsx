import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateFieldProps {
  placeholder?: string;
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
}

const DateField: React.FC<DateFieldProps> = ({ placeholder, value, onChange, onBlur }) => {
  const dateValue = value instanceof Date ? value : typeof value === 'string' ? parseISO(value) : null;
  const isValidDate = dateValue instanceof Date && isValid(dateValue);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`w-full justify-start text-left font-normal ${!isValidDate && 'text-muted-foreground'}`} onBlur={onBlur}>
          {isValidDate ? format(dateValue, 'PPP') : <span>{placeholder || 'Pick a date'}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={isValidDate ? dateValue : undefined} onSelect={date => onChange?.(date)} />
      </PopoverContent>
    </Popover>
  );
};

export default DateField;
