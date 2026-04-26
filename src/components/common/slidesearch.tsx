'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SlideSearch({ value, onChange, onSearch, placeholder = 'Search...' }: SlideSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Sliding input */}
      <div className={cn('overflow-hidden transition-all duration-300 ease-out', open ? 'w-[320px] opacity-100 mr-3' : 'w-0 opacity-0 mr-0')}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          className="
            w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
            bg-white
            focus:outline-none
            focus:border-primary
          "
        />
      </div>

      {/* Search button */}
      <Button size="icon" className="h-11 w-11 rounded-xl" onClick={() => (open ? onSearch() : setOpen(true))}>
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}
