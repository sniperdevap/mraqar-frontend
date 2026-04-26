'use client';

import { cn } from '@/lib/utils';
import { OptimizedImage } from './optimized-image';
import { ASSETS } from '@/lib/assets';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
  showFallback?: boolean;
}

const sizeMap = {
  xs: { container: 'h-6 w-6', text: 'text-xs' },
  sm: { container: 'h-8 w-8', text: 'text-sm' },
  md: { container: 'h-10 w-10', text: 'text-base' },
  lg: { container: 'h-12 w-12', text: 'text-lg' },
  xl: { container: 'h-16 w-16', text: 'text-xl' },
  '2xl': { container: 'h-20 w-20', text: 'text-2xl' },
};

export function Avatar({ src, alt = 'Avatar', size = 'md', fallback, className, showFallback = true }: AvatarProps) {
  const sizeClasses = sizeMap[size];
  const imageSrc = src || ASSETS.images.default;

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center', sizeClasses.container, className)}>
      {imageSrc ? (
        <OptimizedImage src={imageSrc} alt={alt} fill className="object-cover" fallbackSrc={ASSETS.images.default} />
      ) : showFallback ? (
        <div className={cn('flex items-center justify-center bg-cyan-100 text-cyan-600 font-medium', sizeClasses.container, sizeClasses.text)}>
          {fallback ? <span>{fallback.charAt(0).toUpperCase()}</span> : <User className="h-1/2 w-1/2" />}
        </div>
      ) : null}
    </div>
  );
}

// Preset avatar variants
export const AvatarVariants = {
  small: (props: Omit<AvatarProps, 'size'>) => <Avatar {...props} size="sm" />,

  medium: (props: Omit<AvatarProps, 'size'>) => <Avatar {...props} size="md" />,

  large: (props: Omit<AvatarProps, 'size'>) => <Avatar {...props} size="lg" />,

  user: (name?: string, src?: string, size: AvatarProps['size'] = 'md') => <Avatar src={src} fallback={name} alt={name || 'User'} size={size} />,
};
