"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PriceFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "ltr" | "rtl";
  locale: string;
  sliderMax: number;
  minSliderValue: number;
  maxSliderValue: number;
  priceMinDraft: string;
  priceMaxDraft: string;
  onMinSliderChange: (value: number) => void;
  onMaxSliderChange: (value: number) => void;
  onPriceMinDraftChange: (value: string) => void;
  onPriceMaxDraftChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
  labels: {
    title: string;
    priceRangeLabel: string;
    currency: string;
    minPriceLabel: string;
    maxPriceLabel: string;
    reset: string;
    search: string;
  };
}

export function PriceFilterDialog({
  open,
  onOpenChange,
  direction,
  locale,
  sliderMax,
  minSliderValue,
  maxSliderValue,
  priceMinDraft,
  priceMaxDraft,
  onMinSliderChange,
  onMaxSliderChange,
  onPriceMinDraftChange,
  onPriceMaxDraftChange,
  onReset,
  onSearch,
  labels,
}: PriceFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] !max-w-[calc(100%-2rem)] sm:!max-w-sm rounded-[24px] bg-white !px-6 !py-6 md:!px-8 md:!py-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        dir={direction}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center text-[#1f2937] mb-2">
            {labels.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-[11px] font-bold text-[#8a97ab] uppercase tracking-wider mb-1">
              {labels.priceRangeLabel}
            </p>
            <div className="flex items-baseline gap-1 text-primary">
              <span className="text-lg font-bold">
                {minSliderValue.toLocaleString(locale)}
              </span>
              <span className="text-sm font-semibold opacity-60">
                {" "}
                {labels.currency}
              </span>
              <span className="mx-2 text-[#d1d5db]">―</span>
              <span className="text-lg font-bold">
                {maxSliderValue.toLocaleString(locale)}
              </span>
              <span className="text-sm font-semibold opacity-60">
                {" "}
                {labels.currency}
              </span>
            </div>
          </div>

          <div className="relative h-10 mb-2 flex items-center">
            <Slider
              min={0}
              max={sliderMax}
              step={1}
              value={[minSliderValue, maxSliderValue]}
              onValueChange={([nextMinRaw, nextMaxRaw]) => {
                const nextMin = Math.min(
                  nextMinRaw ?? 0,
                  nextMaxRaw ?? sliderMax,
                );
                const nextMax = Math.max(
                  nextMaxRaw ?? sliderMax,
                  nextMinRaw ?? 0,
                );
                onMinSliderChange(nextMin);
                onMaxSliderChange(nextMax);
                onPriceMinDraftChange(String(nextMin));
                onPriceMaxDraftChange(String(nextMax));
              }}
              onValueCommit={([nextMinRaw, nextMaxRaw]) => {
                const nextMin = Math.min(
                  nextMinRaw ?? 0,
                  nextMaxRaw ?? sliderMax,
                );
                const nextMax = Math.max(
                  nextMaxRaw ?? sliderMax,
                  nextMinRaw ?? 0,
                );
                onMinSliderChange(nextMin);
                onMaxSliderChange(nextMax);
                onPriceMinDraftChange(String(nextMin));
                onPriceMaxDraftChange(String(nextMax));
              }}
              aria-label="Price range"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-start">
              <label className="text-[11px] font-bold text-[#8a97ab] uppercase ms-1">
                {labels.minPriceLabel}
              </label>
              <Input
                type="number"
                min="0"
                value={priceMinDraft}
                onChange={(e) => onPriceMinDraftChange(e.target.value)}
                placeholder="0"
                className="h-11 rounded-md border shadow-none border-gray-200 bg-transparent px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] "
              />
            </div>

            <div className="space-y-1.5 text-start">
              <label className="text-[11px] font-bold text-[#8a97ab] uppercase ms-1">
                {labels.maxPriceLabel}
              </label>
              <Input
                type="number"
                min="0"
                value={priceMaxDraft}
                onChange={(e) => onPriceMaxDraftChange(e.target.value)}
                placeholder={sliderMax.toString()}
                className="h-11 rounded-md border border-gray-200 bg-transparent shadow-none px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] "
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4 mt-6">
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-bold text-[#94a3b8] transition-colors hover:text-[#ef4444]"
            >
              {labels.reset}
            </button>

            <Button
              onClick={onSearch}
              className="h-11 rounded-lg bg-primary px-8 text-sm font-bold text-white hover:bg-primary/90 shadow-sm transition-all active:scale-95"
            >
              {labels.search}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
