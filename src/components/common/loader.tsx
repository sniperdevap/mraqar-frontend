"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "teal";
  fullPage?: boolean;
}

export function Loader({
  className,
  size = "md",
  variant = "primary",
  fullPage = false,
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const variantClasses = {
    primary: "border-primary/20 border-t-primary",
    white: "border-white/20 border-t-white",
    teal: "border-[#e11d1d]/20 border-t-[#e11d1d]",
  };

  const loader = (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {loader}
          <span className="text-gray-500 font-medium animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {loader}
    </div>
  );
}
