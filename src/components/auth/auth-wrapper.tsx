'use client';

import { ReactNode } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ASSETS } from '@/lib/assets';

interface AuthWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthWrapper({ children, title, subtitle }: AuthWrapperProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <OptimizedImage src={ASSETS.images.backgrounds.auth} alt="Authentication Background" fill className="object-cover" priority fallbackSrc="/images/placeholder.png" sizes="100vw" />
        </div>
        {/* CSS Fallback Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${ASSETS.images.backgrounds.auth}')`,
            zIndex: -1,
          }}
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-cyan-800/40 to-blue-900/60"></div>
      </div>

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

// Alternative simplified version for cases where you just need the background
export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <OptimizedImage src={ASSETS.images.backgrounds.auth} alt="Authentication Background" fill className="object-cover" priority fallbackSrc="/images/placeholder.png" sizes="100vw" />
        </div>
        {/* CSS Fallback Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${ASSETS.images.backgrounds.auth}')`,
            zIndex: -1,
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-cyan-800/40 to-blue-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
