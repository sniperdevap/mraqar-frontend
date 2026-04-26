'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center gap-x-2">
            {!isFirst && (
              <span className="text-secondary">
                <Image src="/images/icons/arrow-forward.svg" alt="Chevron Right" width={18} height={18} className="h-3 w-3" />
              </span>
            )}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-[#A3A3A3] hover:text-gray-400 transition-colors font-normal text-base sm:text-lg">
                {item.label}
              </Link>
            ) : (
              <span className={`${isLast ? 'text-[#14150D] font-semibold' : 'text-[#A3A3A3] font-normal'} text-base sm:text-lg`}>{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
