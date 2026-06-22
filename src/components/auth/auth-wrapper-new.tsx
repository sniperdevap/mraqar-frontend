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
          backgroundImage: `url('/images/auth/auth-bg.svg')`,
        }}
      />
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex justify-start mb-2">
            <OptimizedImage
              src="/images/aqar-new-logo.png"
              alt="Mr aqar Logo"
              width={140}
              height={32}
              fallbackSrc="/images/aqar-new-logo.png"
              className="h-auto"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
