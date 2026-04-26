/**
 * Responsive Breakpoints Configuration
 *
 * This file defines consistent breakpoints for the entire application
 * following mobile-first design principles with 4 main breakpoints:
 *
 * xs: 0px - 639px (Mobile phones)
 * sm: 640px - 767px (Large mobile phones / Small tablets)
 * md: 768px - 1023px (Tablets / Small laptops)
 * lg: 1024px - 1279px (Laptops / Small desktops)
 * xl: 1280px+ (Large desktops)
 */

export const BREAKPOINTS = {
  xs: '0px', // Mobile phones (default - mobile first)
  sm: '640px', // Large mobile phones / Small tablets
  md: '768px', // Tablets / Small laptops
  lg: '1024px', // Laptops / Small desktops
  xl: '1280px', // Large desktops
  '2xl': '1536px', // Extra large desktops
} as const;

/**
 * Common responsive classes for consistent usage across components
 */
export const RESPONSIVE_CLASSES = {
  // Container classes
  container: {
    base: 'w-full max-w-7xl mx-auto',
    padding: 'px-4 sm:px-6 lg:px-8',
    spacing: 'space-y-4 sm:space-y-6 lg:space-y-8',
  },

  // Grid classes for different layouts
  grid: {
    // Stats cards layout
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
    // Two column layout
    twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8',
    // Three column layout
    threeCol: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6',
    // Four column layout
    fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
    // Full width layout
    fullWidth: 'grid grid-cols-1 gap-4 sm:gap-6',
    // Responsive columns
    responsiveCols: (cols: number) => `grid grid-cols-${cols} gap-4 sm:gap-6 lg:gap-8`,
  },

  // Typography responsive classes
  typography: {
    // Headings with enhanced responsive scaling
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
    h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
    h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight',
    h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
    h5: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-normal',
    h6: 'text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-normal',

    // Subtitles
    subtitle1: 'text-base sm:text-lg font-medium leading-relaxed',
    subtitle2: 'text-sm sm:text-base font-medium leading-relaxed',

    // Body text variants
    body: 'text-sm sm:text-base leading-relaxed',
    bodyLg: 'text-base sm:text-lg lg:text-xl leading-relaxed',
    bodySm: 'text-xs sm:text-sm leading-relaxed',

    // Special text variants
    caption: 'text-xs sm:text-sm leading-normal font-medium',
    overline: 'text-xs tracking-widest uppercase font-medium leading-normal',

    // Legacy classes for backward compatibility
    small: 'text-xs sm:text-sm',
  },

  // Spacing classes
  spacing: {
    section: 'py-6 sm:py-8 lg:py-12',
    component: 'p-4 sm:p-6 lg:p-8',
    card: 'p-4 sm:p-6',
    tight: 'p-2 sm:p-3 lg:p-4',
  },

  // Flex layouts
  flex: {
    between: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
    center: 'flex flex-col sm:flex-row sm:items-center gap-4',
    wrap: 'flex flex-wrap gap-2 sm:gap-3 lg:gap-4',
  },

  // Button responsive classes
  button: {
    base: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    small: 'px-3 py-2 text-xs sm:text-sm',
    large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg',
  },
} as const;

/**
 * Responsive utilities for dynamic class generation
 */
export const responsive = {
  /**
   * Generate responsive padding classes
   */
  padding: (mobile = 4, tablet = 6, desktop = 8) => `p-${mobile} sm:p-${tablet} lg:p-${desktop}`,

  /**
   * Generate responsive margin classes
   */
  margin: (mobile = 4, tablet = 6, desktop = 8) => `m-${mobile} sm:m-${tablet} lg:m-${desktop}`,

  /**
   * Generate responsive gap classes
   */
  gap: (mobile = 4, tablet = 6, desktop = 8) => `gap-${mobile} sm:gap-${tablet} lg:gap-${desktop}`,

  /**
   * Generate responsive grid columns
   */
  gridCols: (mobile = 1, tablet = 2, desktop = 3, xl = 4) => `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${xl}`,

  /**
   * Generate responsive text sizes
   */
  text: (mobile = 'sm', tablet = 'base', desktop = 'lg') => `text-${mobile} sm:text-${tablet} lg:text-${desktop}`,
};

/**
 * Device detection utilities (for client-side usage)
 */
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 640) return 'mobile';
  if (width < 768) return 'tablet-small';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'laptop';
  return 'desktop';
};

/**
 * Hook for responsive behavior (client-side only)
 */
export const useResponsive = () => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop' as const,
    };
  }

  const width = window.innerWidth;

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    deviceType: getDeviceType(),
  };
};
