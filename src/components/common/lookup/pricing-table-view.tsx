'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface PricingOption {
  id: string;
  name: string;
  cost: string;
  listPrice: string;
}

interface PricingTableViewProps {
  pricingOptions: PricingOption[];
  selectedPrices: Set<string>;
  onToggleSelection: (id: string) => void;
}

export function PricingTableView({ pricingOptions, selectedPrices, onToggleSelection }: PricingTableViewProps) {
  return (
    <div className="overflow-x-auto border-t border-gray-200 mt-8">
      <Table>
        <TableHeader className="border-x-0">
          <TableRow className="border-gray-200">
            <TableHead className="font-semibold text-base text-primary h-16 text-left px-0">Name</TableHead>
            <TableHead className="font-semibold text-base text-primary h-16">Cost</TableHead>
            <TableHead className="font-semibold text-base text-primary h-16">List Price</TableHead>
            <TableHead className="font-semibold text-base text-primary h-16">Check</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child_td]:border-b [&_tr:last-child_td]:border-gray-200">
          {pricingOptions.map(option => (
            <TableRow key={option.id} className="border-gray-200">
              <TableCell className="text-secondary text-sm h-16 text-left px-0">{option.name}</TableCell>
              <TableCell className="text-secondary text-sm h-16">{option.cost}</TableCell>
              <TableCell className="text-secondary text-sm h-16">{option.listPrice}</TableCell>
              <TableCell className="text-secondary text-sm h-16">
                <Checkbox
                  checked={selectedPrices.has(option.id)}
                  onCheckedChange={() => onToggleSelection(option.id)}
                  className="size-5 lg:size-6 rounded-sm border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
