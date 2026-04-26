'use client';

import type { QuoteItem } from './quote-view';

interface QuoteItemsCardsProps {
  items: QuoteItem[];
}

export function QuoteItemsCards({ items }: QuoteItemsCardsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-secondary py-12">
        <p>No Data Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* Quote Item Information - Two Column Layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Item</p>
              <p className="text-sm font-normal text-[#2C2C2C]">{item.item}</p>
            </div>

            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">List price</p>
              <p className="text-sm font-normal text-[#2C2C2C]">{item.listPrice}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Quantity</p>
              <p className="text-sm font-normal text-[#2C2C2C]">{item.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-[#6A7282] mb-1">Total</p>
              <p className="text-sm font-medium text-[#2C2C2C]">{item.total}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-normal text-[#6A7282] mb-1">Description</p>
              <p className="text-sm font-normal text-[#2C2C2C]">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
