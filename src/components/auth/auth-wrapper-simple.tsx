'use client';

import { ReactNode } from 'react';
import { ASSETS } from '@/lib/assets';

interface AuthWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthWrapperSimple({ children, title, subtitle }: AuthWrapperProps) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${ASSETS.images.backgrounds.auth}'), linear-gradient(135deg, #0891b2 0%, #0284c7 50%, #1d4ed8 100%)`,
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-cyan-800/40 to-blue-900/60 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Optional header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>}
            {subtitle && <p className="text-white/80 text-lg">{subtitle}</p>}
          </div>
        )}

        {/* Auth form content */}
        {children}
      </div>
    </div>
  );
}

// Alternative with pure CSS background (most reliable)
export function AuthWrapperCSS({ children, title, subtitle }: AuthWrapperProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background with CSS */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${ASSETS.images.backgrounds.auth}')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Optional header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>}
            {subtitle && <p className="text-white/80 text-lg">{subtitle}</p>}
          </div>
        )}

        {/* Auth form content */}
        {children}
      </div>
    </div>
  );
}
