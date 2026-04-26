'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortKey?: string;
  currentSortKey?: string | null;
  sortDirection?: SortDirection;
  onSort?: (sortKey: string, direction: SortDirection) => void;
  children: React.ReactNode;
}

export const SortableTableHead = React.forwardRef<HTMLTableCellElement, SortableTableHeadProps>(({ className, sortKey, currentSortKey, sortDirection, onSort, children, ...props }, ref) => {
  const isSortable = sortKey !== undefined && onSort !== undefined;
  const isActive = currentSortKey === sortKey;

  const handleClick = () => {
    if (!isSortable) return;

    let newDirection: SortDirection = 'asc';
    if (isActive) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    onSort(sortKey!, newDirection);
  };

  return (
    <th
      ref={ref}
      className={cn(
        'h-24 px-4 text-left align-middle whitespace-nowrap text-table-header-gray border-b border-gray-200 font-medium text-table-gray [&:has([role=checkbox])]:pr-0',
        isSortable && 'cursor-pointer select-none hover:bg-gray-50 transition-colors',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {isSortable && (
          <span className="flex items-center">
            {!isActive ? (
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            ) : sortDirection === 'asc' ? (
              <ArrowUp className="h-4 w-4 text-primary" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="h-4 w-4 text-primary" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            )}
          </span>
        )}
      </div>
    </th>
  );
});

SortableTableHead.displayName = 'SortableTableHead';
