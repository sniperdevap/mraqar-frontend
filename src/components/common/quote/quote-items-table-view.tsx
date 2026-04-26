'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QuoteItem } from './quote-view';

interface QuoteItemsTableViewProps {
  items: QuoteItem[];
}

export function QuoteItemsTableView({ items }: QuoteItemsTableViewProps) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-sm pb-3">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="font-semibold text-base sm:text-lg text-primary h-16 sm:h-20 text-left px-3 sm:px-6 !border-b-0">Item</TableHead>
            <TableHead className="font-semibold text-base sm:text-lg text-primary h-16 sm:h-20 text-left px-3 sm:px-6 !border-b-0">Description</TableHead>
            <TableHead className="font-semibold text-base sm:text-lg text-primary h-16 sm:h-20 text-left px-3 sm:px-6 !border-b-0">List price</TableHead>
            <TableHead className="font-semibold text-base sm:text-lg text-primary h-16 sm:h-20 text-left px-3 sm:px-6 !border-b-0">Quantity</TableHead>
            <TableHead className="font-semibold text-base sm:text-lg text-primary h-16 sm:h-20 text-left px-3 sm:px-6 !border-b-0">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id} className="border-none">
              <TableCell className="text-secondary text-sm font-normal h-14 sm:h-16 px-3 sm:px-6 whitespace-nowrap !border-b-0">{item.item}</TableCell>
              <TableCell className="text-secondary text-sm font-normal h-14 sm:h-16 px-3 sm:px-6 !border-b-0">{item.description}</TableCell>
              <TableCell className="text-secondary text-sm font-normal h-14 sm:h-16 px-3 sm:px-6 whitespace-nowrap !border-b-0">{item.listPrice}</TableCell>
              <TableCell className="text-secondary text-sm font-normal h-14 sm:h-16 px-3 sm:px-6 whitespace-nowrap !border-b-0">{item.quantity}</TableCell>
              <TableCell className="text-secondary text-sm font-normal h-14 sm:h-16 px-3 sm:px-6 whitespace-nowrap !border-b-0">{item.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
