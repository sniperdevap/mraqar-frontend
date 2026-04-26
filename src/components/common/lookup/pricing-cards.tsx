'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface PricingOption {
  id: string;
  name: string;
  cost: string;
  listPrice: string;
}

interface PricingCardsProps {
  pricingOptions: PricingOption[];
  selectedPrices: Set<string>;
  onToggleSelection: (id: string) => void;
}

export function PricingCards({ pricingOptions, selectedPrices, onToggleSelection }: PricingCardsProps) {
  if (pricingOptions.length === 0) {
    return (
      <div className="text-center text-secondary py-12">
        <p>No Data Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pricingOptions.map(option => {
        const isSelected = selectedPrices.has(option.id);
        return (
          <div key={option.id} className={`bg-white rounded-lg border p-4 shadow-sm relative ${isSelected ? 'border-2 border-primary' : 'border-gray-200'}`}>
            {/* Pricing Information - Two Column Layout */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-normal text-[#6A7282] mb-1">Name</p>
                <p className="text-sm font-normal text-[#2C2C2C]">{option.name}</p>
              </div>
              <div>
                <p className="text-xs font-normal text-[#6A7282] mb-1">Cost</p>
                <p className="text-sm font-normal text-[#2C2C2C]">{option.cost}</p>
              </div>
              <div>
                <p className="text-xs font-normal text-[#6A7282] mb-1">List Price</p>
                <p className="text-sm font-normal text-[#2C2C2C]">{option.listPrice}</p>
              </div>
            </div>

            {/* Checkbox */}
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedPrices.has(option.id)}
                  onCheckedChange={() => onToggleSelection(option.id)}
                  className="size-4 lg:size-6 md:rounded-sm rounded-lg border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
