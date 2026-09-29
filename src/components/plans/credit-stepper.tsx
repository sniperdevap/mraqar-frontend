import { Minus, Plus } from "lucide-react";

export const MAX_CREDITS = 100;

export function CreditStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const set = (next: number) =>
    onChange(Math.min(MAX_CREDITS, Math.max(1, next)));

  return (
    <div
      className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= 1}
        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:text-gray-300 cursor-pointer disabled:cursor-default"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_CREDITS}
        value={value}
        onChange={(e) => set(Number(e.target.value) || 1)}
        className="w-12 h-9 text-center text-sm font-bold text-primary-dark border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= MAX_CREDITS}
        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:text-gray-300 cursor-pointer disabled:cursor-default"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
