'use client';

import { Button } from '@/components/ui/button';

interface QuoteSummaryProps {
  subtotal: string;
  tax: string;
  total: string;
  onSaveQuote: () => void;
  onSendQuote: () => void;
  isSendQuoteDisabled?: boolean;
}

export function QuoteSummary({ subtotal, tax, total, onSaveQuote, onSendQuote, isSendQuoteDisabled = false }: QuoteSummaryProps) {
  return (
    <div className="space-y-16">
      {/* Summary */}
      <div className="flex flex-col md:items-end">
        <div className="flex flex-col space-y-5 w-full md:max-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-base text-left font-normal text-secondary">Subtotal:</span>
            <span className="text-base text-primary font-semibold text-right">{subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-left font-normal text-secondary">Tax:</span>
            <span className="text-base text-primary font-semibold text-right">{tax}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t-[0.8px] border-[#E2E2E2]">
            <span className="text-xl text-left text-primary font-semibold">Total:</span>
            <span className="text-xl text-primary font-bold text-right">{total}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button
          onClick={onSaveQuote}
          variant="outline"
          className="border-secondary text-secondary hover:bg-gray-50 px-4 xl:w-36 xl:px-8 h-12 lg:h-13 rounded-lg  text-base font-semibold order-2 sm:order-1"
        >
          Save Quote
        </Button>
        <Button
          onClick={onSendQuote}
          className="bg-blue-primary hover:bg-blue-primary/90 text-white px-4 xl:px-8 xl:w-36 h-12 lg:h-13 rounded-lg font-semibold text-base disabled:!bg-[#A3A3A3] disabled:!cursor-not-allowed disabled:hover:!bg-gray-300 disabled:!opacity-100 order-1 sm:order-2"
        >
          Send Quote
        </Button>
      </div>
    </div>
  );
}
