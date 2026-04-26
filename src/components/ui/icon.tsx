'use client';

import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IconProps {
  icon?: LucideIcon;
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'outline' | 'filled' | 'ghost';
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
};

const pixelSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
};

const colorMap = {
  default: 'text-gray-600',
  primary: 'text-cyan-600',
  secondary: 'text-gray-500',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-primary-coral',
};

const variantMap = {
  default: '',
  outline: 'border border-current rounded p-1',
  filled: 'bg-current text-white rounded p-1',
  ghost: 'hover:bg-gray-100 rounded p-1 transition-colors',
};

export function Icon({ icon: IconComponent, src, alt = 'Icon', size = 'md', className, color = 'default', variant = 'default' }: IconProps) {
  const sizeClasses = sizeMap[size];
  const colorClasses = colorMap[color];
  const variantClasses = variantMap[variant];

  // If src is provided, render as image
  if (src) {
    return (
      <div className={cn(sizeClasses, variant !== 'default' ? variantClasses : '', className)}>
        <Image
          src={src}
          alt={alt}
          width={pixelSizeMap[size]}
          height={pixelSizeMap[size]}
          className={cn('w-full h-full object-contain', variant === 'filled' ? 'filter brightness-0 invert' : colorClasses)}
        />
      </div>
    );
  }

  // If icon component is provided, render as Lucide icon
  if (IconComponent) {
    return <IconComponent className={cn(sizeClasses, colorClasses, variantClasses, className)} />;
  }

  // Return null if neither src nor icon is provided
  return null;
}

// Preset icon variants for common use cases
export const IconVariants = {
  small: (icon: LucideIcon, className?: string) => <Icon icon={icon} size="sm" className={className} />,

  medium: (icon: LucideIcon, className?: string) => <Icon icon={icon} size="md" className={className} />,

  large: (icon: LucideIcon, className?: string) => <Icon icon={icon} size="lg" className={className} />,

  primary: (icon: LucideIcon, size: IconProps['size'] = 'md', className?: string) => <Icon icon={icon} size={size} color="primary" className={className} />,

  success: (icon: LucideIcon, size: IconProps['size'] = 'md', className?: string) => <Icon icon={icon} size={size} color="success" className={className} />,

  warning: (icon: LucideIcon, size: IconProps['size'] = 'md', className?: string) => <Icon icon={icon} size={size} color="warning" className={className} />,

  error: (icon: LucideIcon, size: IconProps['size'] = 'md', className?: string) => <Icon icon={icon} size={size} color="error" className={className} />,

  // New variants for image-based icons
  fromUrl: (src: string, alt?: string, size: IconProps['size'] = 'md', className?: string) => <Icon src={src} alt={alt} size={size} className={className} />,

  imageSmall: (src: string, alt?: string, className?: string) => <Icon src={src} alt={alt} size="sm" className={className} />,

  imageMedium: (src: string, alt?: string, className?: string) => <Icon src={src} alt={alt} size="md" className={className} />,

  imageLarge: (src: string, alt?: string, className?: string) => <Icon src={src} alt={alt} size="lg" className={className} />,
};
