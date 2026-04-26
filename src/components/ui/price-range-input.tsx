'use client';

import * as React from 'react';
import { Input } from './input';
import { Icon } from './icon';
import { ASSETS } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface PriceRangeInputProps {
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function PriceRangeInput({ min = 0, max = 500, placeholder, className }: PriceRangeInputProps) {
  const displayValue = placeholder || `Price: $${min} - $${max}`;

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-5 lg:pl-2 flex items-center pointer-events-none z-10">
        <Icon src={ASSETS.images.icons.blackDollar} alt="Price" size="sm" className="text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={displayValue}
        className={cn('pl-14 lg:pl-10 pr-0  text-sm font-normal xl:w-40 border rounded-lg focus:outline-none focus:ring-none focus:border-gray-400', className)}
      />
    </div>
  );
}
