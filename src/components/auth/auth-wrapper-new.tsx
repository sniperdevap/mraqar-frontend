"use client";

import { ReactNode } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface AuthWrapperNewProps {
  children: ReactNode;
}

export function AuthWrapperNew({ children }: AuthWrapperNewProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/auth/auth-bg.png')`,
        }}
      />
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex justify-start mb-2">
            <OptimizedImage
              src="/images/main-Mr aqar-logo.png"
              alt="Nutrition Logo"
              width={140}
              height={32}
              fallbackSrc="/images/placeholder-logo.svg"
              className="h-auto"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
