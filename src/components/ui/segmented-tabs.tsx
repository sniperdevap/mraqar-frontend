'use client';

import { ReactNode } from 'react';

export type SegmentedTabItem<Key extends string = string> = {
  key: Key;
  label: ReactNode;
};

interface SegmentedTabsProps<Key extends string = string> {
  items: SegmentedTabItem<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  className?: string;
}

export function SegmentedTabs<Key extends string = string>({ items, activeKey, onChange, className }: SegmentedTabsProps<Key>) {
  return (
    <div className={`flex flex-col sm:flex-row sm:flex-nowrap rounded-lg sm:overflow-x-auto p-1 gap-1 sm:gap-0 ${className ?? ''}`}>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`cursor-pointer w-full sm:w-auto sm:flex-1 whitespace-nowrap px-6 py-4 lg:py-1 font-normal transition-all sm:min-w-fit ${activeKey === item.key ? 'bg-white text-primary font-semibold rounded-lg border-b-3 border-primary ' : 'text-primary bg-transparent '}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
