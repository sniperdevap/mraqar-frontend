import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MultiDateFieldProps {
  placeholder?: string;
  maxVisibleDates?: number;
  value?: Date[];
  onChange?: (dates: Date[]) => void;
  onBlur?: () => void;
}

const MultiDateField: React.FC<MultiDateFieldProps> = ({ placeholder, maxVisibleDates = 3, value = [], onChange, onBlur }) => {
  const [isMobile425, setIsMobile425] = useState(false);
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile425(window.innerWidth <= 425);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const selectedDates = Array.isArray(value) ? value : [];
  const formattedDates = selectedDates.map((date: Date) => format(date, 'dd/MM/yyyy'));
  const maxVisible = isMobile425 ? 2 : maxVisibleDates;
  const visibleDates = formattedDates.slice(0, maxVisible);
  const hiddenDates = formattedDates.slice(maxVisible);
  const showPlus = hiddenDates.length > 0;

  return (
    <>
      {!isMobile425 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className={`w-full justify-start text-left font-normal ${!formattedDates.length ? 'text-muted-foreground' : ''}`} onBlur={onBlur}>
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{formattedDates.length ? `${visibleDates.join(', ')}${hiddenDates.length ? ` +${hiddenDates.length} more` : ''}` : placeholder || 'Select dates'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="multiple" selected={selectedDates} onSelect={dates => onChange?.(dates ?? [])} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </TooltipTrigger>
          {formattedDates.length > 0 && <TooltipContent className="max-w-sm break-words">{formattedDates.join(', ')}</TooltipContent>}
        </Tooltip>
      ) : (
        // Mobile View (≤425px)
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" type="button" className={`w-full justify-start text-left font-normal ${!formattedDates.length ? 'text-muted-foreground' : ''}`} onBlur={onBlur}>
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {formattedDates.length ? (
                <div className="w-full flex justify-between items-center gap-2 truncate">
                  <span className="truncate">{visibleDates.join(', ')}</span>
                  {showPlus && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <span onClick={e => e.stopPropagation()} className="text-primary underline cursor-pointer text-sm shrink-0">
                          +{hiddenDates.length}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="max-w-sm text-sm break-words">{formattedDates.join(', ')}</PopoverContent>
                    </Popover>
                  )}
                </div>
              ) : (
                placeholder || 'Select dates'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="multiple" selected={selectedDates} onSelect={dates => onChange?.(dates ?? [])} initialFocus />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default MultiDateField;
