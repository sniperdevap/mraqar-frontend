import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  preventAllSpaces?: boolean;
  preventLeadingSpace?: boolean;
  preventTrailingSpace?: boolean;
}

function Input({ className, type, preventAllSpaces = false, preventLeadingSpace = false, preventTrailingSpace = false, onChange, onKeyDown, ...props }: InputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent space key if all spaces are disabled
    if (preventAllSpaces && e.key === ' ') {
      e.preventDefault();
      return;
    }

    // Handle leading and trailing space prevention separately
    if ((preventLeadingSpace || preventTrailingSpace) && e.key === ' ') {
      const target = e.currentTarget;
      const cursorPosition = target.selectionStart || 0;
      const value = target.value;

      // Prevent space at the start (leading space)
      if (preventLeadingSpace && cursorPosition === 0) {
        e.preventDefault();
        return;
      }

      // Prevent space at the end (trailing space)
      if (preventTrailingSpace && cursorPosition === value.length) {
        e.preventDefault();
        return;
      }
    }

    onKeyDown?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove all spaces if preventAllSpaces is enabled
    if (preventAllSpaces) {
      value = value.replace(/\s/g, '');
    } else {
      // Remove leading spaces if preventLeadingSpace is enabled
      if (preventLeadingSpace) {
        value = value.replace(/^\s+/, '');
      }
      // Remove trailing spaces if preventTrailingSpace is enabled
      if (preventTrailingSpace) {
        value = value.replace(/\s+$/, '');
      }
    }

    // Create a new event with the modified value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange?.(syntheticEvent);
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground placeholder:font-normal placeholder:text-sm  selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-secondary  flex h-12 lg:h-13 w-full min-w-0 rounded-sm border bg-transparent px-3 py-1 lg:text-base text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export { Input };
