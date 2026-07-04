'use client';

import * as React from 'react';
import { X, ChevronDownIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
  value: string;
  label: string;
  governorate?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  enableGrouping?: boolean;
  maxCount?: number;
  dir?: 'ltr' | 'rtl';
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select items...', className, disabled, enableGrouping = false, maxCount, dir = 'ltr' }: MultiSelectProps) {
  // console.log(options);
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const selectedOptions = options.filter(option => value.includes(option.value));

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOptions = options.filter(option => !value.includes(option.value)).filter(option => option.label.toLowerCase().includes(normalizedSearchTerm));

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxCount === 1) {
        onChange([optionValue]);
      } else {
        onChange([...value, optionValue]);
      }
    }
    setOpen(false);
    setSearchTerm('');
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) {
      return;
    }

    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    // If we can scroll in the direction of the wheel, prevent page scroll
    if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
      e.stopPropagation();
    }
  };

  const groupedOptions = React.useMemo(() => {
    if (!enableGrouping) return { default: filteredOptions };

    const groups: Record<string, MultiSelectOption[]> = {};
    filteredOptions.forEach(option => {
      const g = option.governorate || '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(option);
    });
    return groups;
  }, [filteredOptions, enableGrouping]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        dir={dir}
        onClick={() => !disabled && setOpen(true)}
        className={cn(
          'border-secondary data-[placeholder]:text-muted-foreground flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-text overflow-hidden',
          className,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 items-center min-w-0 py-1 overflow-hidden justify-start">
          {' '}
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.map(option => (
                <div
                  key={option.value}
                  className="inline-flex items-center gap-1.5 ps-2.5 pe-1.5 py-1 bg-[#f7eff1] border border-[#f7eff1] rounded-md text-sm font-medium text-gray-700 transition-all hover:bg-[#efdee2] max-w-full min-w-0"
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    onClick={e => handleRemove(e, option.value)}
                    className="flex items-center justify-center size-4 rounded-full text-gray-500 hover:bg-[#9a090e]/10 hover:text-[#9a090e] transition-colors shrink-0"
                    aria-label={`Remove ${option.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {open && (
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Search..."
                  className={cn(
                    'border-none outline-none bg-transparent flex-1 text-[15px] font-medium text-gray-700 placeholder:text-gray-400',
                    'text-start'
                  )}
                  disabled={disabled}
                />
              )}
            </>
          ) : (
            <>
              {open && (
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder={placeholder}
                  className={cn(
                    'border-none outline-none bg-transparent flex-1 text-[15px] font-medium text-gray-700 placeholder:text-gray-400 min-w-[150px]',
                    'text-start'
                  )}
                  disabled={disabled}
                />
              )}
              {!open && (
                <span className={cn('text-gray-400 text-[15px] font-medium block w-full', 'text-start')}>
                  {placeholder}
                </span>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (!disabled) {
              if (open) setSearchTerm('');
              setOpen(!open);
            }
          }}
          disabled={disabled}
          aria-label={placeholder}
          aria-expanded={open}
          className="outline-none focus:outline-none flex-shrink-0"
        >
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              'size-4 text-gray-600 cursor-pointer transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-[150] w-full mt-1 bg-white shadow-xl rounded-lg" dir={dir}>
          <div ref={scrollContainerRef} className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar" onWheel={handleWheel}>
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {Object.entries(groupedOptions).map(([group, opts]) => (
                  <div key={group}>
                    {enableGrouping && group !== 'default' && (
                      <div className={cn('px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 top-0 z-10', 'text-start')}>{group}</div>
                    )}
                    <div className="space-y-0.5">
                      {opts.map(option => (
                        <div
                          key={option.value}
                          onClick={() => handleToggle(option.value)}
                          className={cn('flex items-center gap-2 px-4 py-3 text-sm cursor-pointer transition-all hover:bg-primary/10', 'text-start')}
                        >
                          <span className={cn('flex-1', 'text-start')}>{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground italic">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
