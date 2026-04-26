'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Typography variant types
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-lg' | 'body-sm' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export type TypographyColor = 'primary' | 'secondary' | 'accent' | 'muted' | 'error' | 'warning' | 'success' | 'body' | 'inherit';

export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  align?: TypographyAlign;
  color?: TypographyColor;
  weight?: TypographyWeight;
  as?: React.ElementType;
  noWrap?: boolean;
  gutterBottom?: boolean;
  responsive?: boolean;
}

// Typography variant configurations with responsive classes
const typographyVariants = {
  h1: {
    element: 'h1' as const,
    classes: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
  },
  h2: {
    element: 'h2' as const,
    classes: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
  },
  h3: {
    element: 'h3' as const,
    classes: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight',
  },
  h4: {
    element: 'h4' as const,
    classes: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  },
  h5: {
    element: 'h5' as const,
    classes: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-normal',
  },
  h6: {
    element: 'h6' as const,
    classes: 'text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-normal',
  },
  subtitle1: {
    element: 'h6' as const,
    classes: 'text-base sm:text-lg font-medium leading-relaxed',
  },
  subtitle2: {
    element: 'h6' as const,
    classes: 'text-sm sm:text-base font-medium leading-relaxed',
  },
  body: {
    element: 'p' as const,
    classes: 'text-sm sm:text-base leading-relaxed',
  },
  'body-lg': {
    element: 'p' as const,
    classes: 'text-base sm:text-lg lg:text-xl leading-relaxed',
  },
  'body-sm': {
    element: 'p' as const,
    classes: 'text-xs sm:text-sm leading-relaxed',
  },
  caption: {
    element: 'span' as const,
    classes: 'text-xs sm:text-sm leading-normal font-medium',
  },
  overline: {
    element: 'span' as const,
    classes: 'text-xs tracking-widest uppercase font-medium leading-normal',
  },
} as const;

// Color mappings
const colorVariants = {
  primary: 'text-primary-blue',
  secondary: 'text-primary-cyan',
  accent: 'text-primary-coral',
  muted: 'text-space',
  error: 'text-red-500',
  warning: 'text-amber-500',
  success: 'text-green-500',
  body: 'text-primary-body',
  inherit: 'text-inherit',
} as const;

// Weight mappings
const weightVariants = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
} as const;

// Alignment mappings
const alignVariants = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

export function Typography({ variant = 'body', children, className, align = 'left', color = 'body', weight, as, noWrap = false, gutterBottom = false, responsive = true, ...props }: TypographyProps) {
  const variantConfig = typographyVariants[variant];
  const Component = (as || variantConfig.element) as React.ElementType;

  // Build classes
  const classes = cn(
    // Base variant classes (includes responsive sizing if responsive is true)
    responsive
      ? variantConfig.classes
      : variantConfig.classes
          .split(' ')
          .filter(cls => !cls.includes('sm:') && !cls.includes('md:') && !cls.includes('lg:'))
          .join(' '),

    // Color
    colorVariants[color],

    // Weight override (if provided, it overrides the variant's default weight)
    weight && weightVariants[weight],

    // Alignment
    alignVariants[align],

    // Additional modifiers
    noWrap && 'whitespace-nowrap overflow-hidden text-ellipsis',
    gutterBottom && 'mb-4',

    // Custom className
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

// Convenience components for common use cases
export const Heading1 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h1" {...props} />;

export const Heading2 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h2" {...props} />;

export const Heading3 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h3" {...props} />;

export const Heading4 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h4" {...props} />;

export const Heading5 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h5" {...props} />;

export const Heading6 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h6" {...props} />;

export const BodyText = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="body" {...props} />;

export const BodyLarge = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="body-lg" {...props} />;

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="body-sm" {...props} />;

export const Caption = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="caption" {...props} />;

export const Subtitle1 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="subtitle1" {...props} />;

export const Subtitle2 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="subtitle2" {...props} />;

export const Overline = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="overline" {...props} />;

// Export the main component as default
export default Typography;
