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
        <div className={cn('flex flex-wrap gap-2 flex-1 items-center min-w-0 py-1 overflow-hidden')}>
          {' '}
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.map(option => (
                <div
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-secondary rounded-full text-xs text-primary transition-all hover:border-primary/30 max-w-full min-w-0"
                >
                  <span className="truncate">{option.label}</span>
                  <button onClick={e => handleRemove(e, option.value)} className="hover:bg-gray-100 rounded-full p-0.5 transition-colors" aria-label={`Remove ${option.label}`}>
                    <X className="w-3.5 h-3.5" />
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
                  className={cn('border-none outline-none bg-transparent flex-1 text-sm', dir === 'rtl' ? 'text-left' : 'text-left')}
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
                  className="border-none outline-none bg-transparent flex-1 text-sm min-w-[150px]"
                  disabled={disabled}
                />
              )}
              {!open && <span className={cn('text-muted-foreground text-sm', dir === 'rtl' ? 'text-left w-full' : 'text-left w-full')}>{placeholder}</span>}
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
          className="outline-none focus:outline-none"
        >
          <ChevronDownIcon className="size-4 opacity-50 flex-shrink-0 cursor-pointer" />
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
                      <div className={`px-4  py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 top-0 z-10 ${dir === 'rtl' ? 'text-left' : 'text-left'}`}>{group}</div>
                    )}
                    <div className="space-y-0.5">
                      {opts.map(option => (
                        <div
                          key={option.value}
                          onClick={() => handleToggle(option.value)}
                          className={cn('flex items-center gap-2 px-4 py-3 text-sm cursor-pointer  transition-all hover:bg-primary/10 ', dir === 'rtl' ? 'text-left' : 'text-left')}
                        >
                          <span className={`flex-1 ${dir === 'rtl' ? 'text-left' : 'text-left'}`}>{option.label}</span>
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
