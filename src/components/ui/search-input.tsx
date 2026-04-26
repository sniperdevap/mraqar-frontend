'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface SearchInputProps extends React.ComponentProps<'input'> {
  containerClassName?: string;
}

export function SearchInput({ containerClassName, className, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative flex-1 md:w-auto w-full', containerClassName)}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Image src="/images/icons/search.svg" alt="Search" width={20} height={20} className="text-gray-400" />
      </div>
      <Input type="text" placeholder="Search" className={cn('pl-14 pr-4 text-base w-full border rounded-lg focus:outline-none focus:ring-none focus:border-gray-400', className)} {...props} />
    </div>
  );
}
